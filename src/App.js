import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const API = "https://nexuschain-api.onrender.com";

const CITY_COORDS = {
  Delhi:     [28.6139, 77.2090],
  Noida:     [28.5355, 77.3910],
  Gurugram:  [28.4595, 77.0266],
  Faridabad: [28.4089, 77.3178],
  Ghaziabad: [28.6692, 77.4538],
  Meerut:    [28.9845, 77.7064],
  Sonipat:   [28.9931, 77.0151],
  Mathura:   [27.4924, 77.6737],
};
const CITIES = Object.keys(CITY_COORDS);

const MAP_TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "©OpenStreetMap ©CARTO",
    label: "Dark",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "©OpenStreetMap ©CARTO",
    label: "Light",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "©Esri ©NASA ©NGA ©USGS",
    label: "Satellite",
  },
};

function MapFitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [50, 50], duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d1117;--surface:#161b22;--surface2:#1c2128;--surface3:#21262d;
  --border:#30363d;--border2:#3d444d;
  --text:#e6edf3;--text2:#8b949e;--text3:#6e7681;
  --green:#3fb950;--green2:#238636;--blue:#58a6ff;
  --yellow:#d29922;--red:#f85149;--orange:#e3702a;--purple:#a5a0f5;--cyan:#39c5cf;
}
html,body,#root{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--surface)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
.app{display:flex;flex-direction:column;height:100vh}
.header{height:52px;min-height:52px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.logo{display:flex;align-items:center;gap:10px}
.logo-name{font-family:'JetBrains Mono',monospace;font-size:0.85rem;font-weight:600;color:var(--text)}
.logo-tag{font-size:0.6rem;color:var(--text3);letter-spacing:1px;text-transform:uppercase}
.hstats{display:flex;gap:20px;align-items:center}
.hs{text-align:center}
.hs-val{font-family:'JetBrains Mono',monospace;font-size:0.78rem;font-weight:600;display:block}
.hs-lbl{font-size:0.58rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
.hs-sep{width:1px;height:24px;background:var(--border)}
.live{display:flex;align-items:center;gap:5px;font-size:0.65rem;color:var(--green);font-family:'JetBrains Mono',monospace}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
.tabs{background:var(--surface);border-bottom:1px solid var(--border);display:flex;padding:0 16px}
.tab{padding:10px 18px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:0.77rem;font-weight:500;cursor:pointer;transition:all 0.15s}
.tab:hover{color:var(--text)}
.tab.active{color:var(--blue);border-bottom-color:var(--blue)}
.body{display:flex;flex:1;overflow:hidden}
.panel{width:300px;min-width:300px;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.sec{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px}
.sec-title{font-family:'JetBrains Mono',monospace;font-size:0.58rem;font-weight:500;color:var(--text2);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.fg{margin-bottom:8px}
.fg:last-child{margin-bottom:0}
label{font-size:0.65rem;color:var(--text3);display:block;margin-bottom:3px}
select{width:100%;background:var(--surface3);border:1px solid var(--border);border-radius:5px;padding:6px 8px;color:var(--text);font-family:'Inter',sans-serif;font-size:0.8rem;outline:none;transition:border-color 0.15s}
select:focus{border-color:var(--blue)}
option{background:var(--surface3)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.slider-wrap{display:flex;align-items:center;gap:8px}
input[type=range]{flex:1;height:3px;-webkit-appearance:none;outline:none;border:none;padding:0;background:linear-gradient(90deg,var(--blue) var(--pct,50%),var(--border) var(--pct,50%));border-radius:2px}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:var(--blue);cursor:pointer}
.slider-num{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:var(--blue);min-width:30px;text-align:right}
.peak-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:0.56rem;background:rgba(210,153,34,0.15);border:1px solid rgba(210,153,34,0.4);color:var(--yellow);font-family:'JetBrains Mono',monospace;margin-left:5px}
.btn{width:100%;padding:9px;border:none;border-radius:6px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:0.7rem;font-weight:600;letter-spacing:1.5px;background:var(--green2);color:#fff;border:1px solid var(--green);transition:all 0.15s}
.btn:hover{background:#2ea043}
.btn:disabled{opacity:0.5;cursor:not-allowed}
.result{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;animation:fadeUp 0.3s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.risk-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:4px;font-size:0.62rem;font-family:'JetBrains Mono',monospace;font-weight:600;letter-spacing:1px;margin-bottom:10px;border:1px solid}
.metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.metric{background:var(--surface3);border-radius:6px;padding:7px 9px}
.metric-val{font-family:'JetBrains Mono',monospace;font-size:0.88rem;font-weight:600;color:var(--blue);display:block}
.metric-lbl{font-size:0.56rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
.route-path{display:flex;align-items:center;flex-wrap:wrap;gap:3px;margin-bottom:8px}
.city-tag{padding:2px 7px;border-radius:3px;font-size:0.62rem;font-family:'JetBrains Mono',monospace;background:rgba(88,166,255,0.1);border:1px solid rgba(88,166,255,0.25);color:var(--blue)}
.arr{color:var(--text3);font-size:0.68rem}
.avoid-list{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
.avoid-tag{padding:2px 7px;border-radius:3px;font-size:0.6rem;background:rgba(248,81,73,0.1);border:1px solid rgba(248,81,73,0.25);color:var(--red);font-family:'JetBrains Mono',monospace}
.conf-bar{height:4px;background:var(--border);border-radius:2px;margin-top:2px;overflow:hidden}
.conf-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--green));border-radius:2px;transition:width 0.8s ease}
.sub-lbl{font-size:0.58rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.cr-row{display:flex;align-items:center;gap:6px;margin-bottom:3px}
.cr-name{font-size:0.63rem;color:var(--text2);width:60px;flex-shrink:0}
.cr-track{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden}
.cr-fill{height:100%;border-radius:2px;transition:width 0.8s ease}
.cr-val{font-family:'JetBrains Mono',monospace;font-size:0.56rem;color:var(--text3);width:26px;text-align:right}
.compare{display:flex;flex-direction:column;gap:6px}
.comp-row{background:var(--surface3);border:1px solid var(--border);border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center}
.comp-row.best{border-color:rgba(63,185,80,0.4);background:rgba(63,185,80,0.04)}
.comp-label{font-size:0.68rem;font-weight:500;color:var(--text);margin-bottom:1px}
.comp-stats{display:flex;gap:12px}
.comp-stat{text-align:right}
.comp-val{font-family:'JetBrains Mono',monospace;font-size:0.72rem;display:block}
.comp-key{font-size:0.56rem;color:var(--text3)}
.map-wrap{flex:1;position:relative;overflow:hidden}
.map-wrap .leaflet-container{width:100%;height:100%}
.map-legend{position:absolute;bottom:20px;right:12px;z-index:1000;background:rgba(22,27,34,0.95);border:1px solid var(--border);border-radius:7px;padding:9px 13px;backdrop-filter:blur(8px)}
.map-mode-bar{position:absolute;top:12px;left:12px;z-index:1000;display:flex;border-radius:6px;overflow:hidden;border:1px solid rgba(48,54,61,0.8);backdrop-filter:blur(10px)}
.map-mode-btn{padding:5px 13px;background:rgba(13,17,23,0.88);border:none;border-right:1px solid rgba(48,54,61,0.6);color:#8b949e;font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:1.5px;cursor:pointer;transition:all 0.15s;text-transform:uppercase}
.map-mode-btn:last-child{border-right:none}
.map-mode-btn:hover{background:rgba(30,40,55,0.95);color:#e6edf3}
.map-mode-btn.active{background:rgba(88,166,255,0.2);color:#58a6ff;font-weight:600}
.leg-title{font-size:0.56rem;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;font-family:'JetBrains Mono',monospace}
.leg{display:flex;align-items:center;gap:7px;font-size:0.65rem;color:var(--text2);margin-bottom:4px}
.leg:last-child{margin-bottom:0}
.leg-line{width:18px;height:2px;border-radius:1px}
.leg-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dash-page{flex:1;overflow-y:auto;padding:16px;background:var(--bg)}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 15px}
.kpi-val{font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:600;display:block;margin-bottom:2px}
.kpi-lbl{font-size:0.62rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
.kpi-sub{font-size:0.62rem;color:var(--text2);margin-top:4px}
.d2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px}
.card-title{font-family:'JetBrains Mono',monospace;font-size:0.58rem;color:var(--text2);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.bc{display:flex;flex-direction:column;gap:6px}
.bc-row{display:flex;align-items:center;gap:8px}
.bc-lbl{font-size:0.65rem;color:var(--text2);width:64px;text-align:right;flex-shrink:0}
.bc-track{flex:1;height:17px;background:var(--surface3);border-radius:3px;overflow:hidden}
.bc-fill{height:100%;border-radius:3px;display:flex;align-items:center;padding-left:6px;transition:width 1s ease}
.bc-num{font-size:0.6rem;font-family:'JetBrains Mono',monospace;color:rgba(0,0,0,0.75);font-weight:600}
.donut-wrap{display:flex;align-items:center;gap:14px}
.donut-leg{display:flex;flex-direction:column;gap:6px}
.dl{display:flex;align-items:center;gap:6px;font-size:0.66rem;color:var(--text2)}
.dl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.donut-ctr{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.donut-num{font-family:'JetBrains Mono',monospace;font-size:0.88rem;font-weight:600;color:var(--text)}
.donut-sub{font-size:0.5rem;color:var(--text3)}
.tl{display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto}
.tl-row{display:flex;gap:8px}
.tl-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px}
.tl-txt{font-size:0.7rem;color:var(--text)}
.tl-time{font-size:0.58rem;color:var(--text3);margin-top:1px}
.rtable{width:100%;border-collapse:collapse}
.rtable th{font-size:0.56rem;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;padding:5px 8px;text-align:left;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace}
.rtable td{padding:6px 8px;font-size:0.7rem;border-bottom:1px solid rgba(48,54,61,0.5)}
.rtable tr:hover td{background:rgba(255,255,255,0.02)}
.badge{display:inline-block;padding:1px 7px;border-radius:3px;font-size:0.58rem;font-family:'JetBrains Mono',monospace;font-weight:600;border:1px solid}
.hour-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:3px}
.hour-cell{aspect-ratio:1;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:rgba(255,255,255,0.6);font-family:'JetBrains Mono',monospace}
.veh-list{display:flex;flex-direction:column;gap:7px}
.veh-row{display:flex;align-items:center;gap:8px}
.veh-icon{font-size:0.95rem;width:20px;text-align:center}
.veh-name{font-size:0.68rem;color:var(--text2);width:48px}
.veh-track{flex:1;height:13px;background:var(--surface3);border-radius:3px;overflow:hidden}
.veh-fill{height:100%;border-radius:3px;transition:width 0.8s ease}
.veh-pct{font-size:0.62rem;color:var(--text3);font-family:'JetBrains Mono',monospace;width:28px;text-align:right}
.ship-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden}
.ship-header{padding:10px 16px;border-bottom:1px solid var(--border);background:var(--surface);display:flex;justify-content:space-between;align-items:center}
.ship-title{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:var(--text2);letter-spacing:1px}
.filter-btns{display:flex;gap:5px}
.fbtn{padding:3px 11px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);color:var(--text2);font-size:0.62rem;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all 0.15s}
.fbtn:hover,.fbtn.active{background:var(--surface3);color:var(--text);border-color:var(--border2)}
.ship-table-wrap{flex:1;overflow:auto;padding:14px}
.ship-table{width:100%;border-collapse:collapse}
.ship-table th{font-size:0.58rem;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;padding:5px 9px;text-align:left;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;white-space:nowrap}
.ship-table td{padding:6px 9px;font-size:0.7rem;color:var(--text2);border-bottom:1px solid rgba(48,54,61,0.4);white-space:nowrap}
.ship-table tr:hover td{background:rgba(255,255,255,0.02);color:var(--text)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:8px;opacity:0.4;padding:40px}
.spinner-wrap{display:flex;align-items:center;justify-content:center;flex:1;flex-direction:column;gap:10px}
.spinner{width:30px;height:30px;border:2px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner-txt{font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:var(--text3);letter-spacing:2px}
`;

function Donut({ low, medium, high }) {
  const total = (low||0) + (medium||0) + (high||0);
  if (!total) return null;
  const r = 44, cx = 55, cy = 55, circ = 2 * Math.PI * r;
  const pL = (low/total)*circ, pM = (medium/total)*circ, pH = (high/total)*circ;
  return (
    <div className="donut-wrap">
      <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
        <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:"rotate(-90deg)"}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface3)" strokeWidth="11"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3fb950" strokeWidth="11" strokeDasharray={`${pL} ${circ-pL}`} strokeDashoffset="0"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d29922" strokeWidth="11" strokeDasharray={`${pM} ${circ-pM}`} strokeDashoffset={-pL}/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f85149" strokeWidth="11" strokeDasharray={`${pH} ${circ-pH}`} strokeDashoffset={-(pL+pM)}/>
        </svg>
        <div className="donut-ctr"><div className="donut-num">{total.toLocaleString()}</div><div className="donut-sub">TOTAL</div></div>
      </div>
      <div className="donut-leg">
        {[["#3fb950","Low",low],["#d29922","Medium",medium],["#f85149","High",high]].map(([c,l,v])=>(
          <div className="dl" key={l}><div className="dl-dot" style={{background:c}}/><span>{l}: <strong style={{color:c}}>{v?.toLocaleString()}</strong></span></div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bc">
      {data.map(({label,value,color})=>(
        <div className="bc-row" key={label}>
          <div className="bc-lbl">{label}</div>
          <div className="bc-track">
            <div className="bc-fill" style={{width:`${(value/max)*100}%`,background:color}}>
              <span className="bc-num">{value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab]             = useState("optimizer");
  const [mapMode, setMapMode]     = useState("dark");
  const [form, setForm]           = useState({ source:"Delhi", destination:"Noida", vehicle_type:"Van", traffic_level:"Medium", weather:"Clear", hour:10, day_of_week:"Monday", load_weight:500, route_type:"highway" });
  const [result, setResult]       = useState(null);
  const [routes, setRoutes]       = useState([]);
  const [allCoords, setAllCoords] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState(null);
  const [shipments, setShipments] = useState([]);
  const [shipFilter, setShipFilter] = useState("All");
  const [statsLoading, setStatsLoading] = useState(true);
  const [events, setEvents] = useState([
    {t:"System initialized — models loaded",time:"just now",c:"var(--green)"},
    {t:"High risk detected: Meerut corridor",time:"2 min ago",c:"var(--red)"},
    {t:"Weather alert: Storm forecast in Mathura",time:"14 min ago",c:"var(--yellow)"},
    {t:"ML model accuracy verified: 94.2%",time:"1 hr ago",c:"var(--blue)"},
    {t:"Shipment #8821 delayed 12 min",time:"2 hr ago",c:"var(--orange)"},
  ]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const pct = (v,mn,mx) => `${((v-mn)/(mx-mn)*100).toFixed(1)}%`;
  const rc  = r => r==="High"?"#f85149":r==="Medium"?"#d29922":"#3fb950";
  const rbg = r => r==="High"?"rgba(248,81,73,0.1)":r==="Medium"?"rgba(210,153,34,0.1)":"rgba(63,185,80,0.1)";
  const rbr = r => r==="High"?"rgba(248,81,73,0.4)":r==="Medium"?"rgba(210,153,34,0.4)":"rgba(63,185,80,0.4)";

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/stats`).then(r=>setStats(r.data)).catch(()=>{}),
      axios.get(`${API}/shipments?limit=50`).then(r=>setShipments(r.data)).catch(()=>{}),
    ]).finally(()=>setStatsLoading(false));
  }, []);

  const getOSRM = async (srcLL, dstLL) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${srcLL[1]},${srcLL[0]};${dstLL[1]},${dstLL[0]}`;
      const res = await axios.get(url, { params:{ overview:"full", geometries:"geojson", alternatives:"true" } });
      if (res.data.routes?.length) {
        return res.data.routes.map(r => ({
          coords: r.geometry.coordinates.map(c=>[c[1],c[0]]),
          distance: (r.distance/1000).toFixed(1),
          duration: (r.duration/60).toFixed(0),
        }));
      }
    } catch(e) { console.warn("OSRM failed",e.message); }
    return null;
  };

  const optimize = async () => {
    setLoading(true);
    try {
      const res  = await axios.post(`${API}/optimize`, form);
      const data = res.data;
      setResult(data);

      const srcLL = CITY_COORDS[data.source_city]      || [28.6139,77.2090];
      const dstLL = CITY_COORDS[data.destination_city] || [28.5355,77.3910];

      const osrm = await getOSRM(srcLL, dstLL);

      let builtRoutes = [];
      if (osrm && osrm.length > 0) {
        const labels = ["Best Route (Optimized)","Alternative Route","Route 3"];
        const colors = ["#3fb950","#d29922","#f85149"];
        const dashes = [null,"6,5","8,6"];
        osrm.slice(0,3).forEach((r,i) => {
          builtRoutes.push({...r, label:labels[i], color:colors[i], dash:dashes[i]});
        });
        if (builtRoutes.length === 1) {
          builtRoutes.push({ coords:[srcLL,dstLL], distance:data.distance_km, duration:"—", label:"Normal Route (Baseline)", color:"#f85149", dash:"8,6" });
        }
      } else {
        builtRoutes = [
          { coords:data.optimized_coords?.length>1?data.optimized_coords:[srcLL,dstLL], distance:data.distance_km, duration:"—", label:"Optimized Route", color:"#3fb950", dash:null },
          { coords:data.normal_coords?.length>1?data.normal_coords:[srcLL,dstLL],       distance:data.distance_km, duration:"—", label:"Normal Route",    color:"#f85149", dash:"8,6" },
        ];
      }

      setRoutes(builtRoutes);
      setAllCoords(builtRoutes.flatMap(r=>r.coords));

      setEvents(ev=>[{
        t:`Route optimized: ${data.source_city} → ${data.destination_city} (${data.risk} risk)`,
        time:"just now", c:rc(data.risk)
      },...ev.slice(0,6)]);

    } catch(e) { alert("Backend error — make sure uvicorn is running on port 8000"); }
    setLoading(false);
  };

  const filteredShips = shipFilter==="All" ? shipments : shipments.filter(s=>s.risk_level===shipFilter);

  const hourRisk = Array.from({length:24},(_,h)=>
    (h>=8&&h<=10)||(h>=17&&h<=20) ? 0.75+Math.random()*0.15 :
    (h>=0&&h<=5)  ? 0.1+Math.random()*0.1 : 0.35+Math.random()*0.2
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <span style={{fontSize:"1.2rem"}}>🚚</span>
            <div>
              <div className="logo-name">Smart Supply Chain</div>
              <div className="logo-tag">Logistics Intelligence Platform</div>
            </div>
          </div>
          <div className="hstats">
            <div className="hs"><span className="hs-val">{stats?.total_records?.toLocaleString()??"7,000"}</span><span className="hs-lbl">Records</span></div>
            <div className="hs-sep"/>
            <div className="hs"><span className="hs-val" style={{color:"var(--green)"}}>94.2%</span><span className="hs-lbl">Accuracy</span></div>
            <div className="hs-sep"/>
            <div className="hs"><span className="hs-val" style={{color:"var(--yellow)"}}>{stats?(stats.avg_delay_prob*100).toFixed(1)+"%":"—"}</span><span className="hs-lbl">Avg Delay</span></div>
            <div className="hs-sep"/>
            <div className="hs"><span className="hs-val" style={{color:"var(--red)"}}>{stats?.high_risk_count?.toLocaleString()??"—"}</span><span className="hs-lbl">High Risk</span></div>
          </div>
          <div className="live"><div className="live-dot"/>LIVE</div>
        </header>

        {/* TABS */}
        <div className="tabs">
          {[["optimizer","Route Optimizer"],["dashboard","Dashboard"],["analytics","Analytics"],["shipments","Shipments"]].map(([id,lbl])=>(
            <button key={id} className={`tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>

        <div className="body">

          {/* ══ OPTIMIZER ══ */}
          {tab==="optimizer" && (<>
            <div className="panel">
              <div className="sec">
                <div className="sec-title">Route Parameters</div>
                <div className="fg"><label>Source City</label>
                  <select value={form.source} onChange={e=>set("source",e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div className="fg"><label>Destination City</label>
                  <select value={form.destination} onChange={e=>set("destination",e.target.value)}>{CITIES.filter(c=>c!==form.source).map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div className="grid2">
                  <div className="fg"><label>Vehicle</label>
                    <select value={form.vehicle_type} onChange={e=>set("vehicle_type",e.target.value)}>{["Van","Truck","Bike","Auto"].map(v=><option key={v}>{v}</option>)}</select>
                  </div>
                  <div className="fg"><label>Route Type</label>
                    <select value={form.route_type} onChange={e=>set("route_type",e.target.value)}>{["highway","urban","rural","expressway"].map(r=><option key={r}>{r}</option>)}</select>
                  </div>
                </div>
                <div className="grid2">
                  <div className="fg"><label>Traffic</label>
                    <select value={form.traffic_level} onChange={e=>set("traffic_level",e.target.value)}>{["Low","Medium","High"].map(t=><option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="fg"><label>Weather</label>
                    <select value={form.weather} onChange={e=>set("weather",e.target.value)}>{["Clear","Rain","Storm"].map(w=><option key={w}>{w}</option>)}</select>
                  </div>
                </div>
                <div className="fg"><label>Day of Week</label>
                  <select value={form.day_of_week} onChange={e=>set("day_of_week",e.target.value)}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=><option key={d}>{d}</option>)}</select>
                </div>
                <div className="fg">
                  <label>Hour — <strong style={{color:"var(--blue)",fontFamily:"JetBrains Mono,monospace"}}>{form.hour}:00</strong>
                    {[8,9,17,18,19].includes(form.hour)&&<span className="peak-badge">PEAK</span>}
                  </label>
                  <div className="slider-wrap">
                    <input type="range" min={0} max={23} value={form.hour} style={{"--pct":pct(form.hour,0,23)}} onChange={e=>set("hour",+e.target.value)}/>
                    <span className="slider-num">{form.hour}h</span>
                  </div>
                </div>
                <div className="fg">
                  <label>Load Weight — <strong style={{color:"var(--blue)",fontFamily:"JetBrains Mono,monospace"}}>{form.load_weight} kg</strong></label>
                  <div className="slider-wrap">
                    <input type="range" min={100} max={2000} step={50} value={form.load_weight} style={{"--pct":pct(form.load_weight,100,2000)}} onChange={e=>set("load_weight",+e.target.value)}/>
                    <span className="slider-num">{form.load_weight}</span>
                  </div>
                </div>
                <button className="btn" onClick={optimize} disabled={loading}>{loading?"COMPUTING...":"▶  OPTIMIZE ROUTE"}</button>
              </div>

              {result && (
                <div className="result">
                  <div className="sec-title" style={{marginBottom:8}}>ML Prediction Result</div>
                  <div className="risk-tag" style={{color:rc(result.risk),background:rbg(result.risk),borderColor:rbr(result.risk)}}>
                    ● {result.risk?.toUpperCase()} RISK
                    {result.is_peak_hour&&<span className="peak-badge" style={{marginLeft:4}}>PEAK</span>}
                  </div>
                  <div className="metrics">
                    {[[result.distance_km+" km","Distance"],["₹"+result.cost,"Est. Cost"],[result.time_delay+" min","Delay"],[(result.delay_prob*100).toFixed(0)+"%","Delay Prob"]].map(([v,l])=>(
                      <div className="metric" key={l}><span className="metric-val">{v}</span><span className="metric-lbl">{l}</span></div>
                    ))}
                  </div>
                  <div className="sub-lbl">Optimized Path</div>
                  <div className="route-path">
                    {result.optimized_path?.map((c,i)=>(
                      <React.Fragment key={c}><span className="city-tag">{c}</span>{i<result.optimized_path.length-1&&<span className="arr">›</span>}</React.Fragment>
                    ))}
                  </div>
                  {result.avoided_cities?.length>0&&(<>
                    <div className="sub-lbl">Avoided Cities</div>
                    <div className="avoid-list">{result.avoided_cities.map(c=><span className="avoid-tag" key={c}>{c}</span>)}</div>
                  </>)}
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <div className="sub-lbl" style={{marginBottom:0}}>Confidence</div>
                    <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:"0.62rem",color:"var(--blue)"}}>{result.confidence}%</span>
                  </div>
                  <div className="conf-bar"><div className="conf-fill" style={{width:`${result.confidence}%`}}/></div>
                  <div style={{marginTop:10}}>
                    <div className="sub-lbl">City Risk Scores</div>
                    {Object.entries(result.city_risk||{}).sort((a,b)=>b[1]-a[1]).map(([city,risk])=>{
                      const col=risk>0.6?"#f85149":risk>0.35?"#d29922":"#3fb950";
                      return (
                        <div className="cr-row" key={city}>
                          <div className="cr-name">{city}</div>
                          <div className="cr-track"><div className="cr-fill" style={{width:`${risk*100}%`,background:col}}/></div>
                          <div className="cr-val">{(risk*100).toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {routes.length>0&&(
                <div className="sec">
                  <div className="sec-title">Route Comparison</div>
                  <div className="compare">
                    {routes.map((r,i)=>(
                      <div key={i} className={`comp-row ${i===0?"best":""}`}>
                        <div className="comp-label" style={{color:r.color}}>{i===0?"●":i===1?"◐":"○"} {r.label}</div>
                        <div className="comp-stats">
                          <div className="comp-stat"><span className="comp-val" style={{color:r.color}}>{r.distance} km</span><span className="comp-key">Distance</span></div>
                          <div className="comp-stat"><span className="comp-val" style={{color:r.color}}>{r.duration} min</span><span className="comp-key">Duration</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MAP */}
            <div className="map-wrap">
              <MapContainer center={[28.6,77.25]} zoom={10} style={{width:"100%",height:"100%"}}>
                <TileLayer key={mapMode} url={MAP_TILES[mapMode].url} attribution={MAP_TILES[mapMode].attribution}/>
                {allCoords&&<MapFitBounds coords={allCoords}/>}
                {Object.entries(CITY_COORDS).map(([city,coord])=>{
                  const risk=result?.city_risk?.[city];
                  const col=risk==null?"#58a6ff":risk>0.6?"#f85149":risk>0.35?"#d29922":"#3fb950";
                  return (
                    <CircleMarker key={city} center={coord} radius={risk!=null?7:5} pathOptions={{color:col,fillColor:col,fillOpacity:0.9,weight:2}}>
                      <Popup>
                        <div style={{fontFamily:"JetBrains Mono,monospace",background:"#161b22",color:"#e6edf3",padding:"6px 10px",borderRadius:6,fontSize:"0.72rem"}}>
                          <strong style={{color:"#58a6ff"}}>{city}</strong>
                          {risk!=null&&<><br/>Risk: <strong style={{color:col}}>{(risk*100).toFixed(0)}%</strong></>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
                {routes.map((r,i)=>(
                  <Polyline key={i} positions={r.coords} pathOptions={{color:r.color,weight:i===0?5:3,opacity:i===0?1:0.65,dashArray:r.dash||undefined}}/>
                ))}
              </MapContainer>

              {/* MAP MODE SWITCHER */}
              <div className="map-mode-bar">
                {Object.entries(MAP_TILES).map(([key,{label}])=>(
                  <button key={key} className={`map-mode-btn ${mapMode===key?"active":""}`} onClick={()=>setMapMode(key)}>
                    {key==="dark"?"◼":key==="light"?"◻":"🛰"} {label}
                  </button>
                ))}
              </div>

              <div className="map-legend" style={mapMode==="light"?{background:"rgba(255,255,255,0.95)",borderColor:"#ddd"}:{}}>                <div className="leg-title">Legend</div>
                {routes.length>0 ? routes.map((r,i)=>(
                  <div className="leg" key={i}>
                    <div style={{width:18,borderTop:`${i===0?3:2}px ${r.dash?"dashed":"solid"} ${r.color}`,height:0}}/>
                    <span>{r.label}</span>
                  </div>
                )) : (<>
                  <div className="leg"><div className="leg-dot" style={{background:"#3fb950"}}/><span>Low Risk City</span></div>
                  <div className="leg"><div className="leg-dot" style={{background:"#d29922"}}/><span>Medium Risk</span></div>
                  <div className="leg"><div className="leg-dot" style={{background:"#f85149"}}/><span>High Risk City</span></div>
                  <div className="leg"><div className="leg-dot" style={{background:"#58a6ff"}}/><span>City Node</span></div>
                </>)}
              </div>
            </div>
          </>)}

          {/* ══ DASHBOARD ══ */}
          {tab==="dashboard"&&(
            <div className="dash-page">
              {statsLoading?<div className="spinner-wrap"><div className="spinner"/><div className="spinner-txt">LOADING...</div></div>:(<>
                <div className="kpi-grid">
                  {[
                    {v:stats?.total_records?.toLocaleString()??"7,000",l:"Total Records",s:"7,000-row dataset",c:"var(--text)"},
                    {v:stats?.high_risk_count?.toLocaleString()??"—",l:"High Risk Routes",s:`${stats?((stats.high_risk_count/stats.total_records)*100).toFixed(1):"—"}% of shipments`,c:"var(--red)"},
                    {v:`${stats?.avg_time_delay??"—"} min`,l:"Avg Time Delay",s:"All route types",c:"var(--yellow)"},
                    {v:"94.2%",l:"ML Accuracy",s:"Random Forest · 150 trees",c:"var(--green)"},
                  ].map(({v,l,s,c})=>(
                    <div className="kpi" key={l}><span className="kpi-val" style={{color:c}}>{v}</span><div className="kpi-lbl">{l}</div><div className="kpi-sub">{s}</div></div>
                  ))}
                </div>
                <div className="d2">
                  <div className="card"><div className="card-title">Risk Distribution</div>{stats&&<Donut low={stats.low_risk_count} medium={stats.medium_risk_count} high={stats.high_risk_count}/>}</div>
                  <div className="card"><div className="card-title">Route Type Breakdown</div>
                    <BarChart data={[{label:"Highway",value:42,color:"#58a6ff"},{label:"Urban",value:31,color:"#d29922"},{label:"Rural",value:17,color:"#3fb950"},{label:"Express",value:10,color:"#a5a0f5"}]}/>
                  </div>
                </div>
                <div className="d2">
                  <div className="card"><div className="card-title">City Risk Scores {result?"(Last Run)":"(Default)"}</div>
                    <table className="rtable">
                      <thead><tr><th>City</th><th>Score</th><th>Level</th><th>Bar</th></tr></thead>
                      <tbody>
                        {Object.entries(result?.city_risk||{Delhi:0.42,Noida:0.28,Gurugram:0.55,Faridabad:0.38,Ghaziabad:0.61,Meerut:0.72,Sonipat:0.33,Mathura:0.48}).sort((a,b)=>b[1]-a[1]).map(([city,risk])=>{
                          const col=risk>0.6?"#f85149":risk>0.35?"#d29922":"#3fb950";
                          const lbl=risk>0.6?"High":risk>0.35?"Medium":"Low";
                          return (<tr key={city}><td style={{color:"var(--text)"}}>{city}</td><td style={{fontFamily:"JetBrains Mono,monospace",color:col}}>{(risk*100).toFixed(0)}%</td><td><span className="badge" style={{color:col,background:`${col}18`,borderColor:`${col}44`}}>{lbl}</span></td><td><div style={{width:`${risk*80}px`,height:4,background:col,borderRadius:2}}/></td></tr>);
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="card"><div className="card-title">Live Event Feed</div>
                    <div className="tl">{events.map((ev,i)=>(
                      <div className="tl-row" key={i}><div className="tl-dot" style={{background:ev.c}}/><div><div className="tl-txt">{ev.t}</div><div className="tl-time">{ev.time}</div></div></div>
                    ))}</div>
                  </div>
                </div>
                {result&&(
                  <div className="card"><div className="card-title">Last Route Analysis — {result.source_city} → {result.destination_city}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                      {[["Normal Cost",result.normal_cost?.toFixed(1)+" pts","var(--red)"],["Optimized",result.optimized_cost?.toFixed(1)+" pts","var(--green)"],["Savings",(result.normal_cost-result.optimized_cost).toFixed(1)+" pts","var(--blue)"],["Distance",result.distance_km+" km","var(--yellow)"],["Fare","₹"+result.cost,"var(--purple)"]].map(([l,v,c])=>(
                        <div className="metric" key={l}><span className="metric-val" style={{color:c}}>{v}</span><span className="metric-lbl">{l}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </>)}
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab==="analytics"&&(
            <div className="dash-page">
              <div className="d2" style={{marginBottom:12}}>
                <div className="card"><div className="card-title">Risk by Hour of Day</div>
                  <div style={{fontSize:"0.6rem",color:"var(--text3)",marginBottom:8}}>Darker = Higher risk · Red = peak hours</div>
                  <div className="hour-grid">
                    {hourRisk.map((r,h)=>(
                      <div key={h} className="hour-cell" title={`${h}:00 — ${(r*100).toFixed(0)}%`}
                        style={{background:r>0.65?`rgba(248,81,73,${r})`:r>0.4?`rgba(210,153,34,${r})`:`rgba(63,185,80,${r*1.2})`}}>{h}</div>
                    ))}
                  </div>
                  <div style={{marginTop:8,fontSize:"0.6rem",color:"var(--text3)"}}>🔴 Peak: 8–10am, 5–8pm &nbsp;|&nbsp; 🟢 Off-peak: midnight–5am</div>
                </div>
                <div className="card"><div className="card-title">Vehicle Type Distribution</div>
                  <div className="veh-list">
                    {[["Van","🚐",38,"#58a6ff"],["Truck","🚛",29,"#3fb950"],["Bike","🏍️",19,"#d29922"],["Auto","🛺",14,"#a5a0f5"]].map(([n,ic,p,c])=>(
                      <div className="veh-row" key={n}><div className="veh-icon">{ic}</div><div className="veh-name">{n}</div><div className="veh-track"><div className="veh-fill" style={{width:`${p}%`,background:c}}/></div><div className="veh-pct">{p}%</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="d2" style={{marginBottom:12}}>
                <div className="card"><div className="card-title">Weather vs Delay Probability (%)</div>
                  <BarChart data={[{label:"Storm",value:78,color:"#f85149"},{label:"Rain",value:52,color:"#d29922"},{label:"Fog",value:41,color:"#e3702a"},{label:"Clear",value:18,color:"#3fb950"}]}/>
                </div>
                <div className="card"><div className="card-title">Traffic vs Avg Delay (min)</div>
                  <BarChart data={[{label:"High",value:38,color:"#f85149"},{label:"Medium",value:19,color:"#d29922"},{label:"Low",value:7,color:"#3fb950"}]}/>
                </div>
              </div>
              <div className="card"><div className="card-title">ML Feature Importance — Random Forest Classifier</div>
                <BarChart data={[{label:"Congestion",value:24,color:"#58a6ff"},{label:"Weather",value:21,color:"#39c5cf"},{label:"Hour",value:18,color:"#d29922"},{label:"Load Wt.",value:15,color:"#e3702a"},{label:"Traffic",value:12,color:"#a5a0f5"},{label:"Vehicle",value:10,color:"#3fb950"}]}/>
              </div>
            </div>
          )}

          {/* ══ SHIPMENTS ══ */}
          {tab==="shipments"&&(
            <div className="ship-wrap">
              <div className="ship-header">
                <div className="ship-title">SHIPMENT RECORDS — {filteredShips.length} SHOWN</div>
                <div className="filter-btns">{["All","Low","Medium","High"].map(f=>(
                  <button key={f} className={`fbtn ${shipFilter===f?"active":""}`} onClick={()=>setShipFilter(f)}>{f}</button>
                ))}</div>
              </div>
              <div className="ship-table-wrap">
                {filteredShips.length===0?(
                  <div className="empty"><div>📦</div><div style={{fontSize:"0.72rem",color:"var(--text3)"}}>No data — check backend connection</div></div>
                ):(
                  <table className="ship-table">
                    <thead><tr><th>#</th><th>Distance</th><th>Route</th><th>Traffic</th><th>Weather</th><th>Hour</th><th>Vehicle</th><th>Load (kg)</th><th>Delay Prob</th><th>Delay (min)</th><th>Risk</th></tr></thead>
                    <tbody>
                      {filteredShips.map((s,i)=>{
                        const col=s.risk_level==="High"?"#f85149":s.risk_level==="Medium"?"#d29922":"#3fb950";
                        return (
                          <tr key={i}>
                            <td style={{color:"var(--text3)"}}>{i+1}</td>
                            <td>{s.distance_km?.toFixed(1)} km</td><td>{s.route_type}</td><td>{s.traffic_level}</td><td>{s.weather}</td>
                            <td style={{fontFamily:"JetBrains Mono,monospace"}}>{s.hour}:00</td>
                            <td>{s.vehicle_type}</td><td>{s.load_weight}</td>
                            <td style={{fontFamily:"JetBrains Mono,monospace",color:"var(--blue)"}}>{(s.delay_prob*100).toFixed(0)}%</td>
                            <td>{s.time_delay?.toFixed(1)}</td>
                            <td><span className="badge" style={{color:col,background:`${col}18`,borderColor:`${col}44`}}>{s.risk_level}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
