from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pipelines.train import run_training
from services.query_router import execute_query

app = FastAPI(title="Bank360 AI Multi-Agent API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Query(BaseModel):
    query: str
    limit: int = 50

@app.get("/health")
def health(): return {"status": "ok"}
@app.post("/train")
def train(): return run_training()
@app.post("/query")
def query(request: Query):
    try: return execute_query(request.query, request.limit)
    except FileNotFoundError as error: raise HTTPException(status_code=409, detail=str(error))
