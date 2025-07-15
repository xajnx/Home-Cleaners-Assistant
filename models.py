from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field

class CleaningFrequency(str, Enum):
    single = "single"
    bimonthly = "bimonthly"
    weekly = "weekly"

class Client(BaseModel):
    client_id: str
    owner_id: str
    name: str
    contact_email: str
    contact_number: str
    cleaning_frequency: CleaningFrequency

class Bid(BaseModel):
    bid_id: str
    owner_id: str
    client_id: str
    bid_address: str
    notes: str
    before_photos: List[str] = []
    after_photos: List[str] = []
    quote_data: Optional[Dict[str, Any]] = None

    @property
    def maps_link(self):
        return f"https://www.google.com/maps/search/?api=1&query={self.bid_address.replace(' ', '+')}"

class BusinessProfile(BaseModel):
    owner_id: str  # Firebase UID
    owner_name: Optional[str] = None
    business_name: str
    business_address: str
    contact_email: EmailStr
    contact_number: str
    logo_url: Optional[str] = None
    qr_venmo_url: Optional[str] = None
    qr_paypal_url: Optional[str] = None