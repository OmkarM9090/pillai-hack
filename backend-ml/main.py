from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from dotenv import load_dotenv
import json
import re
import requests

load_dotenv()

app = FastAPI(title="Smart Resort 360 ML Core")
model_cache = {}

class SimulationRequest(BaseModel):
    occupancy: float
    weather: str
    inflation: float

class ReviewRequest(BaseModel):
    review_text: str

class PlanRequest(BaseModel):
    constraints: dict
    
class AssetData(BaseModel):
    asset_id: str
    temperature: float
    vibration: float
    usage_hours: float

@app.on_event("startup")
async def startup_event():
    print("Initializing ML Core with XGBoost and Isolation Forest...")
    if not os.path.exists("models"):
        os.makedirs("models")
    
    # 1. Train XGBoost Model for F&B/Occupancy Forecasting using realistic synthetic data
    model_path_occ = "models/xgboost_occupancy.joblib"
    if not os.path.exists(model_path_occ):
        print("Generating realistic historical dataset for training...")
        # Create a realistic dataset: 1000 days of history
        days = 1000
        # Features: Season (0-3), Marketing_Spend (1000-5000), Local_Event (0 or 1), Weather_Severity (0.0-1.0)
        season = np.random.randint(0, 4, size=days)
        marketing = np.random.uniform(1000, 5000, size=days)
        local_event = np.random.binomial(1, 0.15, size=days)
        weather_sev = np.random.beta(2, 5, size=days)
        
        # Target: Occupancy % (0-100)
        # Base occupancy 50 + season boost + marketing boost + event boost - weather penalty
        base_occ = 50 + (season * 5) + (marketing / 500) + (local_event * 15) - (weather_sev * 30)
        base_occ = np.clip(base_occ + np.random.normal(0, 2, size=days), 0, 100)
        
        X = pd.DataFrame({
            'season': season,
            'marketing': marketing,
            'local_event': local_event,
            'weather_severity': weather_sev
        })
        y_occ = base_occ
        
        print("Training XGBoost model on historical data...")
        xgb_model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=150, max_depth=4)
        xgb_model.fit(X, y_occ)
        joblib.dump(xgb_model, model_path_occ)
        
    model_cache['occupancy_model'] = joblib.load(model_path_occ)
    
    # 2. Train Isolation Forest for Predictive Maintenance on realistic sensor logs
    model_path_maint = "models/iso_forest_maint.joblib"
    if not os.path.exists(model_path_maint):
        print("Training Isolation Forest on historical sensor logs...")
        # Normal operations data: [temp (F), vibration (Hz), usage_hours]
        # Realistic ranges for HVAC
        temp_normal = np.random.normal(loc=72.0, scale=2.5, size=2000)
        vib_normal = np.random.normal(loc=15.0, scale=1.2, size=2000)
        hours_normal = np.random.uniform(100, 5000, size=2000)
        X_normal = np.column_stack((temp_normal, vib_normal, hours_normal))
        
        iso_forest = IsolationForest(contamination=0.03, random_state=42)
        iso_forest.fit(X_normal)
        joblib.dump(iso_forest, model_path_maint)
        
    model_cache['maintenance_model'] = joblib.load(model_path_maint)
    
    print("ML Core Initialized successfully.")

@app.post("/predict_forecast")
async def predict_forecast(days: int = 7, base_weather: float = 0.2, base_search: float = 0.8):
    # Predict using XGBoost
    model = model_cache.get('occupancy_model')
    projections = []
    
    future_X = np.array([
        [day_idx * 2, min(1.0, max(0.0, base_weather + np.sin(day_idx)*0.1)), max(0.1, base_search - (day_idx*0.05))]
        for day_idx in range(1, days + 1)
    ])
    
    if model:
        predictions = model.predict(future_X)
        for i in range(days):
            occ_pred = max(0, min(100, predictions[i]))
            labor_pred = occ_pred * 4.2
            projections.append({
                "day": i + 1,
                "occupancyVelocity": round(occ_pred, 1),
                "laborHours": round(labor_pred, 0)
            })
    return {"status": "success", "projections": projections}

@app.post("/predict_maintenance")
async def predict_maintenance(req: AssetData):
    # Predictive Maintenance using Isolation Forest
    model = model_cache.get('maintenance_model')
    if not model:
        return {"status": "Error", "message": "Model not loaded"}
        
    # Predict anomaly (-1 is anomaly, 1 is normal)
    data = np.array([[req.temperature, req.vibration, req.usage_hours]])
    prediction = model.predict(data)[0]
    
    is_anomaly = prediction == -1
    
    return {
        "asset_id": req.asset_id,
        "status": "Warning: High Failure Risk" if is_anomaly else "Normal",
        "anomaly_detected": bool(is_anomaly),
        "recommendation": "Dispatch technician for preventive check." if is_anomaly else "No action required."
    }

@app.post("/simulate_whatif")
async def simulate_whatif(req: SimulationRequest):
    base_goppar = 31200
    base_hk_delay = 0.5
    base_fb_wait = 6
    base_burnout = 40
    
    occ_diff = req.occupancy - 0.70
    weather_penalty = 1.3 if req.weather.lower() in ["stormy", "rain", "hurricane", "snow"] else 1.0
    
    goppar = base_goppar + (occ_diff * 100 * 480) - (req.inflation * 4000)
    hk_delay = base_hk_delay + (occ_diff * 100 * 0.035) * weather_penalty
    fb_wait = base_fb_wait + (occ_diff * 100 * 0.65)
    burnout_risk = base_burnout + (max(0, occ_diff) * 100 * 1.8) - (max(0, -occ_diff) * 100 * 0.5)
    
    status = "CRITICAL" if req.occupancy >= 0.90 or req.weather.lower() in ["hurricane"] else "NORMAL"
    if req.occupancy <= 0.40:
        status = "LOW_DEMAND"
    
    return {
        "goppar": max(0, round(goppar, 2)),
        "housekeepingDelay": max(0.1, round(hk_delay, 2)),
        "fbWaitTimes": max(1, round(fb_wait, 2)),
        "burnoutRisk": max(5, min(100, round(burnout_risk, 2))),
        "status": status
    }

@app.post("/parse_review")
async def parse_review(req: ReviewRequest):
    text = req.review_text
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": f'Analyze this hotel review: "{text}". Return ONLY a JSON object with these exact keys: "aspects" (List of strings e.g. "Comfort", "F&B", "Cleanliness", "Service", "Maintenance"), "sentiment" (String "Positive", "Negative", "Neutral"), "shap_keywords" (List of words directly causing negative sentiment if any).'}]
                }]
            }
            res = requests.post(url, json=payload)
            res_data = res.json()
            raw_text = res_data['candidates'][0]['content']['parts'][0]['text']
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            data = json.loads(json_match.group(0))
            
            aspects = data.get("aspects", [])
            sentiment = data.get("sentiment", "Neutral")
            keywords = data.get("shap_keywords", [])
            is_negative = sentiment.lower() == "negative"
            
            return {
                "aspects": aspects,
                "sentiment": sentiment,
                "ticket_routed": is_negative,
                "ticket_id": f"TKT-{np.random.randint(100, 999)}" if is_negative else None,
                "shap_highlights": keywords
            }
        except Exception as e:
            print("Gemini API failed, falling back to regex:", e)
    
    # Robust Fallback local regex
    aspects = []
    text_lower = text.lower()
        
    maint_words = ["leaking", "rattling", "ac", "broken", "dirty", "wifi", "internet", "power", "toilet"]
    fb_words = ["food", "salmon", "cold", "raw", "waiter", "restaurant", "menu", "taste", "stale"]
    service_words = ["rude", "late", "waiting", "manager", "staff", "unprofessional"]
    
    found_maint = [w for w in maint_words if w in text_lower]
    if found_maint: aspects.append("Maintenance")
        
    found_fb = [w for w in fb_words if w in text_lower]
    if found_fb: aspects.append("F&B")
        
    found_service = [w for w in service_words if w in text_lower]
    if found_service: aspects.append("Service")
    
    keywords = found_maint + found_fb + found_service
    sentiment = "Negative" if keywords else "Neutral"

    is_negative = sentiment.lower() == "negative"
    return {
        "aspects": aspects,
        "sentiment": sentiment,
        "ticket_routed": is_negative,
        "ticket_id": f"TKT-{np.random.randint(100, 999)}" if is_negative else None,
        "shap_highlights": keywords
    }

class OptimizeRequest(BaseModel):
    department: str
    pool: list

from ortools.linear_solver import pywraplp

@app.post("/optimize_roster")
async def optimize_roster(req: OptimizeRequest):
    department = req.department
    pool = req.pool
    
    if not pool:
        return {"department": department, "status": "Failed", "shifts": [], "error": "No available workers in DB pool."}
    
    required_staff = 3 if department == "Front Desk" else 2
    
    # Use OR-Tools Linear Solver
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        return {"status": "Error", "message": "OR-Tools solver not available"}

    # x[i] = 1 if worker i is assigned, 0 otherwise
    x = {}
    for i, p in enumerate(pool):
        x[i] = solver.IntVar(0, 1, f'worker_{i}')
        
    # Constraint 1: Assign exactly required_staff
    solver.Add(sum(x[i] for i in range(len(pool))) == required_staff)
    
    # Objective: Minimize cost, but heavily penalize workers who don't have the skill
    objective = solver.Objective()
    for i, p in enumerate(pool):
        skills = p.get('skills', [])
        cost = p.get('costPerHour', 15)
        # If they don't have the skill, add a huge penalty
        penalty = 0 if department in skills else 1000
        # If they have a cross-training skill that matches (e.g., Spa to Front Desk), reduce penalty
        if department == "Front Desk" and "Spa" in skills:
            penalty = 50
        elif department == "F&B" and "Housekeeping" in skills:
            penalty = 50
            
        objective.SetCoefficient(x[i], float(cost + penalty))
        
    objective.SetMinimization()
    status = solver.Solve()
    
    roster = []
    if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
        for i, p in enumerate(pool):
            if x[i].solution_value() > 0.5:
                skills = p.get('skills', [])
                worker_name = p.get('name', 'Unknown')
                
                role = department
                if department not in skills:
                    role = f"Cross-trained {skills[0]}" if skills else "Emergency Temp"
                
                roster.append({
                    "worker": worker_name, 
                    "role": role, 
                    "assigned_to": department, 
                    "hours": 8
                })
    
    if len(roster) < required_staff:
        roster.append({"worker": "Temp Agency (Auto-Requested)", "role": "Emergency Temp", "assigned_to": department, "hours": 8})
            
    return {
        "department": department,
        "status": "Optimized (OR-Tools)" if len(roster) >= required_staff else "Warning: Temp Staff Required",
        "shifts": roster
    }

@app.post("/generate_action_plan")
async def generate_action_plan(req: PlanRequest):
    # Generates Prescriptive Action Cards
    occ = float(req.constraints.get("occupancy", 0.70))
    fb_stock = float(req.constraints.get("salmon_stock", 50))
    weather = req.constraints.get("weather", "Clear").lower()
    
    actions = []
    badges = []
    
    # Handle Edge Case: Very Low Occupancy
    if occ <= 0.40:
        actions.append("Occupancy critically low. Send 2 housekeeping staff home early to reduce labor burn.")
        badges.append("Labor Savings")
    elif occ >= 0.90:
        actions.append("Deploy cross-trained Spa staff to Front Office to handle check-in surge.")
        badges.append("High Staffing Risk")
        
    if fb_stock <= 10.0:
        actions.append("Raise premium menu pricing by +$12 to slow F&B demand. Auto-draft emergency replenishment PO to OceanFresh Ltd.")
        badges.append("Supply Shortage")
        
    if "storm" in weather or "rain" in weather:
        actions.append("Weather alert detected. Move outdoor dining indoors and prep extra maintenance mats.")
        badges.append("Weather Risk")
        
    if not actions:
        actions.append("No critical actions needed. Operations normal and well within capacity limits.")
        badges.append("Operations Normal")
        
    return {
        "action_id": f"plan_{np.random.randint(1000, 9999)}",
        "recommendation": " ".join(actions),
        "badges": badges
    }
if __name__ == '__main__': 
    import uvicorn 
    uvicorn.run(app, host='0.0.0.0', port=8000)
