from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# In-memory storage for contractor data
contractor_data: Dict[str, Dict] = {}

class Contractor(BaseModel):
    company_name: str
    location: str
    num_people: int
    exact_position: str  # Can be coordinates or description

@app.post("/update_contractor")
async def update_contractor(contractor: Contractor):
    contractor_data[contractor.location] = {
        "company_name": contractor.company_name,
        "num_people": contractor.num_people,
        "exact_position": contractor.exact_position
    }
    return {"message": "Contractor data updated successfully"}

@app.get("/get_contractors")
async def get_contractors():
    return contractor_data
