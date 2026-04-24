# 🚚 NexusChain — Delhi NCR Logistics Route Optimizer

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18.0+-61DAFB)
![ML](https://img.shields.io/badge/ML-RandomForest-orange)

## 🚀 Live Demo
👉 [Click here to view the live app](https://nexuschain-frontend.vercel.app)

**API Backend:** https://nexuschain-api.onrender.com/docs

---

## 📌 About
NexusChain is an intelligent logistics route optimization system for the Delhi NCR region. It uses Machine Learning to predict delivery risks, optimize routes, and minimize delays across 8 major cities in Delhi NCR.

---

## 🌟 Features
- 🗺️ **Smart Route Optimization** — Dijkstra algorithm with ML-based risk penalty scoring
- 🤖 **ML Risk Prediction** — Random Forest models trained on 7000 real logistics records
- 📊 **Delay Probability** — Predicts delivery delay probability and estimated time delay
- 🌦️ **Weather & Traffic Aware** — Considers weather, traffic levels, peak hours
- 🏙️ **8 Cities Covered** — Delhi, Noida, Gurugram, Faridabad, Ghaziabad, Meerut, Sonipat, Mathura
- 📈 **Real-time Analytics** — Live shipment stats and feature importance
- 🚗 **Multi-vehicle Support** — Van, Truck, Bike and more

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API framework |
| Scikit-learn | ML models (Random Forest) |
| Pandas & NumPy | Data processing |
| Pydantic | Request validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI framework |
| JavaScript | Frontend logic |
| CSS | Styling |

---

## 🤖 ML Models
- **RandomForestClassifier** — Predicts risk level (High/Medium/Low)
- **RandomForestRegressor (x2)** — Predicts delay probability and time delay
- **Training Data** — 7000 Delhi NCR logistics records
- **Features Used:**
  - Distance (km)
  - Congestion index
  - Hour of day
  - Peak hour flag
  - Load weight
  - Route type
  - Traffic level
  - Weather condition
  - Day of week
  - Vehicle type

---

## 🏙️ Cities Network
Delhi - Noida - Ghaziabad - Meerut - Sonipat
Delhi - Gurugram - Faridabad - Mathura
Noida - Faridabad - Ghaziabad

---

## 📁 Project Structure

delhi-ncr-route-optimizer/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── api.py
├── route_optimizer.py
├── delhi_ncr_logistics_7000.csv
├── requirements.txt
├── package.json
└── README.md

---

## ▶️ How to Run

### Backend
pip install -r requirements.txt
uvicorn api:app --reload
API will run at: http://localhost:8000

### Frontend
npm install
npm start
App will run at: http://localhost:3000

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | API status |
| POST | /optimize | Optimize route |
| GET | /stats | Dataset statistics |
| GET | /shipments | View shipments |
| GET | /city-risk | City risk scores |
| GET | /health | Health check |

---

## 📊 Dataset
- **Records:** 7,000 logistics entries
- **Region:** Delhi NCR, India
- **Features:** Distance, traffic, weather, vehicle type, load weight, delay probability, risk level

---

## 👨‍💻 Author
**shadow12546-sketch**
- GitHub: [@shadow12546-sketch](https://github.com/shadow12546-sketch)

---

## 📄 License
This project is licensed under the MIT License.
