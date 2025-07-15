from pydantic import BaseModel, Field
from typing import Dict, Optional, List

class ClientData(BaseModel):
    client_id: str = Field(..., example="8f43f55e-1234-4baf-aaa1-abcdef123456")
    owner_id: str = Field(..., example="firebase-uid-123")
    name: str = Field(..., example="John Doe")
    contact_email: str = Field(..., example="john@example.com")
    contact_number: str = Field(..., example="555-1234")
    cleaning_frequency: str = Field(..., example="weekly")

class ClientResponse(BaseModel):
    status: str = Field(..., example="client added")
    client: ClientData

class BidData(BaseModel):
    bid_id: str = Field(..., example="d74f8f7a-1234-4baf-aaa1-abcdef789012")
    owner_id: str = Field(..., example="firebase-uid-123")
    client_id: str = Field(..., example="8f43f55e-1234-4baf-aaa1-abcdef123456")
    bid_address: str = Field(..., example="123 Main St, Anytown, USA")
    notes: str = Field(..., example="Deep clean requested for kitchen and bathrooms")
    before_photos: List[str] = Field(..., example=["uploads/before1.png"])
    after_photos: List[str] = Field(..., example=["uploads/after1.png"])
    maps_link: str = Field(..., example="https://maps.google.com/?q=123+Main+St")

class BidResponse(BaseModel):
    status: str = Field(..., example="bid saved")
    bid: BidData
    maps_link: str

class ProfileResponse(BaseModel):
    status: str = Field(..., example="saved")
    profile: Dict

class GenericResponse(BaseModel):
    status: str = Field(..., example="ok")
    quote: Optional[Dict] = None
    level: Optional[str] = None
    estimated_area_sqft: Optional[float] = None
    plan: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str = Field(..., example="Business profile missing")