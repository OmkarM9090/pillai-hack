@echo off
echo Starting FastAPI ML Core...
cd backend-ml
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
