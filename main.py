from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json

app = FastAPI()

# Define the data model using Pydantic
class Contractor(BaseModel):
    contractor: str
    location: str
    equipment: str
    workers: int

# In-memory database (this could be a real database in a production app)
contractors_db = []

@app.post("/contractors")
async def add_contractor(contractor: Contractor):
    # Add contractor data to the in-memory "database"
    contractors_db.append(contractor)

    # Log the data (you can save this to a real database if needed)
    print(f"Contractor added: {contractor}")

    # You can modify this to save the data into a real database (e.g., SQLite, PostgreSQL)
    return {"message": "Contractor added successfully", "data": contractor}

@app.get("/contractors")
async def get_contractors():
    return contractors_db

# To run the app, use the command:
# uvicorn contractors:app --reload --host 0.0.0.0 --port 8000
