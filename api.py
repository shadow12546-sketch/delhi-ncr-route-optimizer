from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
import heapq
from collections import defaultdict
from typing import Optional
import time

app = FastAPI(title="NexusChain Supply Intelligence API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load & Train ──────────────────────────────────────────────────────────────
print("🚀 NexusChain API starting — training ML models...")
t0 = time.time()

df = pd.read_csv("delhi_ncr_logistics_7000.csv")

encoders = {}
for col in ["route_type","traffic_level","weather","day_of_week","vehicle_type","risk_level"]:
    le = LabelEncoder()
    df[f"{col}_enc"] = le.fit_transform(df[col])
    encoders[col] = le

FEATURES = [
    "distance_km","congestion_index","hour","is_peak_hour","load_weight",
    "route_type_enc","traffic_level_enc","weather_enc","day_of_week_enc","vehicle_type_enc"
]
X = df[FEATURES]

clf       = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
reg_prob  = RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)
reg_delay = RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)

clf.fit(X, df["risk_level_enc"])
reg_prob.fit(X, df["delay_prob"])
reg_delay.fit(X, df["time_delay"])

# Feature importance
feature_importance = dict(zip(FEATURES, clf.feature_importances_.tolist()))

print(f"✅ Models trained in {time.time()-t0:.1f}s")

# ── City Network ──────────────────────────────────────────────────────────────
CITIES = ["Delhi","Noida","Gurugram","Faridabad","Ghaziabad","Meerut","Sonipat","Mathura"]

CITY_COORDS = {
    "Delhi":     [28.6139, 77.2090],
    "Noida":     [28.5355, 77.3910],
    "Gurugram":  [28.4595, 77.0266],
    "Faridabad": [28.4089, 77.3178],
    "Ghaziabad": [28.6692, 77.4538],
    "Meerut":    [28.9845, 77.7064],
    "Sonipat":   [28.9931, 77.0151],
    "Mathura":   [27.4924, 77.6737],
}

EDGES = [
    ("Delhi","Faridabad",20),    ("Delhi","Ghaziabad",20),   ("Delhi","Gurugram",22),
    ("Delhi","Mathura",145),     ("Delhi","Meerut",70),      ("Delhi","Noida",25),
    ("Delhi","Sonipat",44),      ("Faridabad","Ghaziabad",32),("Faridabad","Gurugram",32),
    ("Faridabad","Mathura",85),  ("Faridabad","Noida",28),   ("Faridabad","Sonipat",55),
    ("Ghaziabad","Meerut",55),   ("Ghaziabad","Noida",18),   ("Gurugram","Noida",40),
    ("Mathura","Noida",150),     ("Meerut","Noida",75),      ("Meerut","Sonipat",85),
    ("Noida","Sonipat",55),
]

def build_graph():
    g = defaultdict(list)
    for u, v, t in EDGES:
        g[u].append((v, t))
        g[v].append((u, t))
    return g

def get_dist(a, b):
    return next((t for u, v, t in EDGES if (u == a and v == b) or (v == a and u == b)), 30)

def dijkstra(graph, risk_scores, source, dest, penalty=20):
    pq = [(0, source)]
    dist = defaultdict(lambda: float("inf"))
    parent = {}
    dist[source] = 0
    while pq:
        curr, node = heapq.heappop(pq)
        for nb, time in graph[node]:
            nc = curr + time + risk_scores.get(nb, 0.3) * penalty
            if nc < dist[nb]:
                dist[nb] = nc
                parent[nb] = node
                heapq.heappush(pq, (nc, nb))
    path, node = [], dest
    if node not in parent and node != source:
        return [], float("inf")
    while node in parent:
        path.append(node)
        node = parent[node]
    path.append(source)
    path.reverse()
    return path, dist[dest]

def safe_enc(col, val):
    le = encoders[col]
    return int(le.transform([val])[0]) if val in le.classes_ else 0

def make_feats(dist_km, cong, hour, peak, weight, rtype, traffic, weather, day, vehicle):
    return [[
        dist_km, cong, hour, peak, weight,
        safe_enc("route_type", rtype),
        safe_enc("traffic_level", traffic),
        safe_enc("weather", weather),
        safe_enc("day_of_week", day),
        safe_enc("vehicle_type", vehicle),
    ]]

# ── Schema ────────────────────────────────────────────────────────────────────
class OptimizeRequest(BaseModel):
    source:        str = "Delhi"
    destination:   str = "Noida"
    vehicle_type:  str = "Van"
    traffic_level: str = "Medium"
    weather:       str = "Clear"
    hour:          int = 10
    day_of_week:   str = "Monday"
    load_weight:   int = 500
    route_type:    str = "highway"

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "online", "name": "NexusChain API", "version": "2.0", "cities": len(CITIES), "records": len(df)}

@app.post("/optimize")
def optimize(req: OptimizeRequest):
    src  = next((c for c in CITIES if req.source.lower() in c.lower()), "Delhi")
    dest = next((c for c in CITIES if req.destination.lower() in c.lower()), "Noida")

    is_peak = 1 if req.hour in list(range(8, 10)) + list(range(17, 20)) else 0
    cong = min(1.0,
        {"Low": 0.25, "Medium": 0.50, "High": 0.80}.get(req.traffic_level, 0.5) +
        {"Clear": 0.0, "Rain": 0.10, "Storm": 0.20}.get(req.weather, 0.0)
    )

    graph = build_graph()

    # Predict risk score for every city
    city_risk = {}
    for city in CITIES:
        d = get_dist(src, city) if city != src else 25.0
        feats = make_feats(float(d), cong, req.hour, is_peak, req.load_weight,
                           req.route_type, req.traffic_level, req.weather,
                           req.day_of_week, req.vehicle_type)
        city_risk[city] = round(float(reg_prob.predict(feats)[0]), 3)

    normal_path, normal_cost = dijkstra(graph, {}, src, dest, 0)
    opt_path, opt_cost       = dijkstra(graph, city_risk, src, dest, 20)

    total_dist = sum(
        get_dist(opt_path[i], opt_path[i+1])
        for i in range(len(opt_path) - 1)
    ) if len(opt_path) > 1 else 25

    feats      = make_feats(float(total_dist), cong, req.hour, is_peak, req.load_weight,
                            req.route_type, req.traffic_level, req.weather,
                            req.day_of_week, req.vehicle_type)
    risk_enc   = clf.predict(feats)[0]
    risk_probs = clf.predict_proba(feats)[0]
    risk_label = encoders["risk_level"].inverse_transform([risk_enc])[0]
    delay_prob = float(reg_prob.predict(feats)[0])
    time_delay = float(reg_delay.predict(feats)[0])

    return {
        "source_city":      src,
        "destination_city": dest,
        "normal_path":      normal_path,
        "optimized_path":   opt_path,
        "normal_coords":    [CITY_COORDS[c] for c in normal_path if c in CITY_COORDS],
        "optimized_coords": [CITY_COORDS[c] for c in opt_path if c in CITY_COORDS],
        "normal_cost":      round(normal_cost, 1),
        "optimized_cost":   round(opt_cost, 1),
        "cost_saving":      round(normal_cost - opt_cost, 1),
        "distance_km":      total_dist,
        "risk":             risk_label,
        "delay_prob":       round(delay_prob, 3),
        "time_delay":       round(time_delay, 1),
        "confidence":       round(float(max(risk_probs)) * 100, 1),
        "cost":             round(total_dist * 4.5, 0),
        "city_risk":        city_risk,
        "avoided_cities":   [c for c in normal_path if c not in opt_path],
        "is_peak_hour":     bool(is_peak),
        "congestion_index": round(cong, 2),
        "risk_breakdown":   dict(zip(encoders["risk_level"].classes_, [round(p*100,1) for p in risk_probs])),
    }

@app.get("/stats")
def stats():
    risk_counts = df["risk_level"].value_counts().to_dict()
    return {
        "total_records":     len(df),
        "high_risk_count":   int(risk_counts.get("High", 0)),
        "medium_risk_count": int(risk_counts.get("Medium", 0)),
        "low_risk_count":    int(risk_counts.get("Low", 0)),
        "avg_delay_prob":    round(float(df["delay_prob"].mean()), 3),
        "avg_time_delay":    round(float(df["time_delay"].mean()), 1),
        "max_time_delay":    round(float(df["time_delay"].max()), 1),
        "cities":            CITIES,
        "city_coords":       CITY_COORDS,
        "feature_importance": {k: round(v, 4) for k, v in feature_importance.items()},
        "vehicle_types":     df["vehicle_type"].value_counts().to_dict(),
        "weather_types":     df["weather"].value_counts().to_dict(),
        "traffic_levels":    df["traffic_level"].value_counts().to_dict(),
        "route_types":       df["route_type"].value_counts().to_dict(),
        "peak_hour_risk":    round(float(df[df["is_peak_hour"]==1]["delay_prob"].mean()), 3),
        "offpeak_hour_risk": round(float(df[df["is_peak_hour"]==0]["delay_prob"].mean()), 3),
    }

@app.get("/shipments")
def shipments(
    limit: int = Query(50, le=500),
    risk: Optional[str] = None,
    vehicle: Optional[str] = None,
    weather: Optional[str] = None,
):
    data = df.copy()
    if risk:    data = data[data["risk_level"] == risk]
    if vehicle: data = data[data["vehicle_type"] == vehicle]
    if weather: data = data[data["weather"] == weather]

    cols = ["distance_km","route_type","traffic_level","weather",
            "hour","vehicle_type","load_weight","delay_prob","time_delay","risk_level"]
    return data.head(limit)[cols].round(3).to_dict(orient="records")

@app.get("/city-risk")
def city_risk(
    hour: int = 10,
    traffic_level: str = "Medium",
    weather: str = "Clear",
    vehicle_type: str = "Van",
    load_weight: int = 500,
    route_type: str = "highway",
):
    is_peak = 1 if hour in list(range(8,10)) + list(range(17,20)) else 0
    cong = min(1.0,
        {"Low":0.25,"Medium":0.50,"High":0.80}.get(traffic_level, 0.5) +
        {"Clear":0.0,"Rain":0.10,"Storm":0.20}.get(weather, 0.0)
    )
    result = {}
    for city in CITIES:
        feats = make_feats(25.0, cong, hour, is_peak, load_weight,
                           route_type, traffic_level, weather, "Monday", vehicle_type)
        result[city] = {
            "delay_prob": round(float(reg_prob.predict(feats)[0]), 3),
            "time_delay": round(float(reg_delay.predict(feats)[0]), 1),
            "coords": CITY_COORDS[city],
        }
    return result

@app.get("/health")
def health():
    return {"status": "healthy", "models": ["RandomForestClassifier","RandomForestRegressor x2"], "records": len(df)}
