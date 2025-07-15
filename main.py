import os
import uuid
import shutil
import datetime
from typing import List, Optional

from fastapi import FastAPI, Header, UploadFile, File, Form, Request, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from firebase_auth import verify_firebase_token
from models import BusinessProfile, Client, Bid, CleaningFrequency
from database import db
from pdf_generator import generate_contract_pdf, generate_estimate_pdf
from quote_engine import calculate_quote
from square_footage_estimator import estimate_area_from_image
from auth_helpers import require_subscription
from utils.logger import log_event
from utils.emailer import send_email_with_attachment
from utils.calendar import generate_ics

app = FastAPI(
    docs_url=None,
    openapi_url="/openapi.json",
    openapi_version="3.0.3"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/docs")
async def custom_swagger_ui_html(request: Request):
    return templates.TemplateResponse("docs.html", {
        "request": request,
        "openapi_url": app.openapi_url,
        "title": "Home Cleaner's Assistant API Docs"
    })

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title="Home Cleaner's Assistant API",
        version="0.1.0",
        description="Complete backend with clients, bids, quotes, contracts, calendar and email",
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    schema["security"] = [{"BearerAuth": []}]
    schema["tags"] = [
        {"name": "Clients"},
        {"name": "Business Profile"},
        {"name": "Bids"},
        {"name": "Estimates"},
        {"name": "Contracts"},
        {"name": "Subscriptions"},
        {"name": "Email"},
        {"name": "Calendar"},
    ]
    schema["openapi"] = "3.0.3"
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

def get_uid_from_header(auth: Optional[str]) -> str:
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    return verify_firebase_token(auth)["uid"]

# --- CLIENTS ---
@app.post("/client", tags=["Clients"])
async def add_client(
    authorization: str = Header(...),
    name: str = Form(...),
    contact_email: str = Form(...),
    contact_number: str = Form(...),
    cleaning_frequency: CleaningFrequency = Form(...)
):
    uid = get_uid_from_header(authorization)
    client_id = str(uuid.uuid4())
    client = Client(
        client_id=client_id,
        owner_id=uid,
        name=name,
        contact_email=contact_email,
        contact_number=contact_number,
        cleaning_frequency=cleaning_frequency
    )
    db["clients"].setdefault(uid, []).append(client)
    log_event(f"Client created: {client_id}", user_id=uid)
    return {"status": "client added", "client": client.dict()}

@app.get("/clients", tags=["Clients"])
async def list_clients(authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    return [c.dict() for c in db["clients"].get(uid, [])]

@app.delete("/client/{client_id}", tags=["Clients"])
async def delete_client(client_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    db["clients"][uid] = [
        c for c in db["clients"].get(uid, [])
        if c.client_id != client_id
    ]
    log_event(f"Client deleted: {client_id}", user_id=uid)
    return {"status": "client deleted"}

# --- BUSINESS PROFILE ---
@app.post("/profile", tags=["Business Profile"])
async def save_profile(
    authorization: str = Header(...),
    owner_name: Optional[str] = Form(None),
    business_name: str = Form(...),
    business_address: str = Form(...),
    contact_email: str = Form(...),
    contact_number: str = Form(...),
    logo: UploadFile = File(None),
    qr_venmo: UploadFile = File(None),
    qr_paypal: UploadFile = File(None)
):
    uid = get_uid_from_header(authorization)
    def save_file(uploaded, prefix):
        if uploaded:
            path = f"uploads/{prefix}_{uuid.uuid4()}.png"
            with open(path, "wb") as f:
                shutil.copyfileobj(uploaded.file, f)
            return path
        return None

    profile = BusinessProfile(
        owner_id=uid,
        owner_name=owner_name,
        business_name=business_name,
        business_address=business_address,
        contact_email=contact_email,
        contact_number=contact_number,
        logo_url=save_file(logo, "logo"),
        qr_venmo_url=save_file(qr_venmo, "venmo"),
        qr_paypal_url=save_file(qr_paypal, "paypal"),
    )
    db["business_profiles"][uid] = profile
    log_event(f"Business profile saved", user_id=uid)
    return {"status": "saved", "profile": profile.dict()}

@app.get("/profile", tags=["Business Profile"])
async def get_profile(authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    profile = db["business_profiles"].get(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile.dict()

@app.put("/profile", tags=["Business Profile"])
async def update_profile(
    authorization: str = Header(...),
    business_name: str = Form(...),
    business_address: str = Form(...),
    contact_email: str = Form(...),
    contact_number: str = Form(...),
    logo: UploadFile = File(None),
    payment_qr: UploadFile = File(None),
):
    uid = get_uid_from_header(authorization)

    def save(uploaded, prefix: str):
        if not uploaded:
            return None
        path = f"uploads/{prefix}_{uuid.uuid4()}.png"
        with open(path, "wb") as f:
            shutil.copyfileobj(uploaded.file, f)
        return path

    profile = db["business_profiles"].get(uid) or {}
    updated = {
        "business_name": business_name,
        "business_address": business_address,
        "contact_email": contact_email,
        "contact_number": contact_number,
        "logo_url": save(logo, "logo") or profile.get("logo_url"),
        "payment_qr_url": save(payment_qr, "qr") or profile.get("payment_qr_url"),
    }
    profile.update(updated)
    db["business_profiles"][uid] = profile
    return {"status": "profile updated", "profile": profile}

# --- BIDS & ESTIMATES ---
@app.post("/bid", tags=["Bids"])
async def add_bid(
    authorization: str = Header(...),
    client_id: str = Form(...),
    bid_address: str = Form(...),
    notes: str = Form(...),
    total_sqft: float = Form(...),
    num_pets: int = Form(...),
    num_windows: int = Form(...),
    cleanliness: int = Form(...),
    travel_miles: float = Form(...),
    state: str = Form(...),
    before_photos: List[UploadFile] = File([]),
    after_photos: List[UploadFile] = File([])
):
    uid = get_uid_from_header(authorization)
    quote = calculate_quote(form_data := {
        "total_sqft": total_sqft,
        "num_pets": num_pets,
        "num_windows": num_windows,
        "cleanliness": cleanliness,
        "travel_miles": travel_miles,
        "state": state
    })
    bid_id = str(uuid.uuid4())

    def save_uploads(files, prefix):
        paths = []
        for f in files:
            p = f"uploads/{prefix}_{uuid.uuid4()}.png"
            with open(p, "wb") as out:
                shutil.copyfileobj(f.file, out)
            paths.append(p)
        return paths

    bid = Bid(
        bid_id=bid_id,
        owner_id=uid,
        client_id=client_id,
        bid_address=bid_address,
        notes=notes,
        before_photos=save_uploads(before_photos, "before"),
        after_photos=save_uploads(after_photos, "after"),
    )
    bid.quote_data = quote
    db["bids"].setdefault(uid, []).append(bid)
    log_event(f"Bid created: {bid_id}", user_id=uid)
    return {
        "status": "bid saved",
        "bid": bid.dict(),
        "maps_link": bid.maps_link
    }

@app.get("/bids", tags=["Bids"])
async def list_bids(
    authorization: str = Header(...),
    client: Optional[str] = None
):
    uid = get_uid_from_header(authorization)
    all_bids = db["bids"].get(uid, [])
    if client:
        all_bids = [b for b in all_bids if b.client_id == client]
    return [b.dict() for b in all_bids]

@app.get("/bids/{bid_id}", tags=["Bids"])
async def get_bid(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    bids = db["bids"].get(uid, [])
    bid = next((b for b in bids if b.bid_id == bid_id), None)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    return bid.dict()

# --- ESTIMATES ---
@app.post("/calculate-quote", tags=["Estimates"])
async def calculate_quote_route(
    authorization: str = Header(...),
    form_data: dict = Body(...)
):
    _ = get_uid_from_header(authorization)
    result = calculate_quote(form_data)
    return {"status": "ok", "quote": result}

@app.post("/generate-estimate", tags=["Estimates"])
async def generate_estimate_full(
    authorization: str = Header(...),
    form_data: dict = Body(...)
):
    uid = get_uid_from_header(authorization)
    business = db["business_profiles"].get(uid)
    if not business:
        raise HTTPException(status_code=400, detail="Business profile missing")
    quote = calculate_quote(form_data)
    pdf_path = f"uploads/estimate_{uuid.uuid4()}.pdf"
    generate_estimate_pdf(business, quote, pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename="estimate.pdf")

@app.post("/generate-estimate/{bid_id}", tags=["Estimates"])
async def generate_estimate_for_bid(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    business = db["business_profiles"].get(uid)
    bids = db["bids"].get(uid, [])
    bid = next((b for b in bids if b.bid_id == bid_id), None)
    if not bid or not business:
        raise HTTPException(status_code=400, detail="Bid or business not found")
    if not getattr(bid, "quote_data", None):
        raise HTTPException(status_code=400, detail="Quote missing")
    pdf_path = f"uploads/estimate_{uuid.uuid4()}.pdf"
    generate_estimate_pdf(business, bid.quote_data, pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename="estimate.pdf")

# --- CONTRACTS & SIGNATURE ---
@app.get("/generate-contract/{client_id}/{bid_id}", tags=["Contracts"])
async def generate_contract(
    client_id: str,
    bid_id: str,
    authorization: str = Header(...)
):
    uid = get_uid_from_header(authorization)
    clients = db["clients"].get(uid, [])
    bids = db["bids"].get(uid, [])
    business = db["business_profiles"].get(uid)
    client = next((c for c in clients if c.client_id == client_id), None)
    bid = next((b for b in bids if b.bid_id == bid_id), None)

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if not business:
        raise HTTPException(status_code=404, detail="Business profile missing")
    if not getattr(bid, "quote_data", None):
        raise HTTPException(status_code=400, detail="Quote missing")

    pdf_path = f"uploads/contract_{bid_id}.pdf"
    generate_contract_pdf(
        business=business,
        client=client,
        bid=bid,
        quote=bid.quote_data,
        cleaning_frequency=client.cleaning_frequency,
        pdf_path=pdf_path
    )
    return FileResponse(pdf_path, media_type="application/pdf", filename="contract.pdf")

@app.post("/sign-contract/{client_id}/{bid_id}", tags=["Contracts"])
async def sign_contract(
    client_id: str,
    bid_id: str,
    authorization: str = Header(...),
    name: str = Form(...),
    signature: UploadFile = File(...)
):
    uid = get_uid_from_header(authorization)
    bids = db["bids"].get(uid, [])
    bid = next((b for b in bids if b.bid_id == bid_id), None)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    sig_path = f"uploads/signed_{bid_id}.png"
    with open(sig_path, "wb") as f:
        shutil.copyfileobj(signature.file, f)

    bid.signed_contract = {
        "name": name,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "signature_path": sig_path
    }
    log_event(f"Contract signed for bid {bid_id}", user_id=uid)
    return {"status": "signed"}

# --- SUBSCRIPTIONS ---
@app.post("/set-subscription", tags=["Subscriptions"])
async def set_subscription(level: str = Form(...), authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    if level not in ["free", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid level")
    db["subscriptions"][uid] = level
    return {"status": "subscription updated", "level": level}

@app.get("/subscriptions", tags=["Subscriptions"])
async def get_subscription(authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    level = db["subscriptions"].get(uid, "free")
    return {"subscription": level}

# --- EMAIL ---
@app.post("/email-estimate/{bid_id}", tags=["Email"])
async def email_estimate(bid_id: str, authorization: str = Header(...), to: str = Form(...)):
    uid = get_uid_from_header(authorization)
    bid = next((b for b in db["bids"].get(uid, []) if b.bid_id == bid_id), None)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    business = db["business_profiles"].get(uid)
    pdf_path = f"uploads/estimate_{bid_id}.pdf"
    generate_estimate_pdf(business, bid.quote_data, pdf_path)
    send_email_with_attachment(to, "Your Estimate", "Here is your cleaning estimate.", pdf_path)
    db["email_log"].setdefault((uid, bid_id), []).append({
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "to": to,
        "attachment": "estimate"
    })
    return {"status": "estimate emailed"}

@app.post("/email-contract/{client_id}/{bid_id}", tags=["Email"])
async def email_contract(client_id: str, bid_id: str, authorization: str = Header(...), to: str = Form(...)):
    uid = get_uid_from_header(authorization)
    bid = next((b for b in db["bids"].get(uid, []) if b.bid_id == bid_id), None)
    client = next((c for c in db["clients"].get(uid, []) if c.client_id == client_id), None)
    business = db["business_profiles"].get(uid)
    if not bid or not client:
        raise HTTPException(status_code=404, detail="Bid or client not found")

    pdf_path = f"uploads/contract_{bid_id}.pdf"
    generate_contract_pdf(business, client, bid, bid.quote_data, client.cleaning_frequency, pdf_path)
    send_email_with_attachment(to, "Your Contract", "Please review and sign.", pdf_path)
    db["email_log"].setdefault((uid, bid_id), []).append({
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "to": to,
        "attachment": "contract"
    })
    return {"status": "contract emailed"}

@app.get("/bids/{bid_id}/messages", tags=["Email"])
async def get_bid_messages(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    return {"messages": db["email_log"].get((uid, bid_id), [])}

# --- CALENDAR ---
@app.get("/calendar/contract/{client_id}/{bid_id}", tags=["Calendar"])
async def export_contract_ics(client_id: str, bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    bid = next((b for b in db["bids"].get(uid, []) if b.bid_id == bid_id), None)
    client = next((c for c in db["clients"].get(uid, []) if c.client_id == client_id), None)
    business = db["business_profiles"].get(uid)
    if not bid or not client or not business:
        raise HTTPException(status_code=404, detail="Missing data")

    ics_content = generate_ics(
        business, client, bid,  bid.quote_data, email=client.contact_email, pdf_path=f"uploads/contract/{bid_id}.pdf"
    )
    return FileResponse(ics_content, media_type="text/calendar", filename="contract_event.ics")

# --- AREA ESTIMATOR ---
@app.post("/estimate-area", tags=["Estimates"])
@require_subscription("pro")
async def estimate_area(request: Request, photo: UploadFile = File(...)):
    uid = request.state.uid
    filepath = f"uploads/area_{uuid.uuid4()}.jpg"
    with open(filepath, "wb") as f:
        shutil.copyfileobj(photo.file, f)
    area = estimate_area_from_image(filepath)
    return {"estimated_area_sqft": area, "plan": request.state.subscription_level}

# --- DELETE ROUTES ---
@app.delete("/bid/{bid_id}", tags=["Bids"])
async def delete_bid(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    db["bids"][uid] = [b for b in db["bids"].get(uid, []) if b.bid_id != bid_id]
    return {"status": "bid deleted"}

@app.delete("/estimate/{bid_id}", tags=["Estimates"])
async def delete_estimate(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    return {"status": "estimate deleted"}

@app.delete("/contract/{bid_id}", tags=["Contracts"])
async def delete_contract(bid_id: str, authorization: str = Header(...)):
    uid = get_uid_from_header(authorization)
    return {"status": "contract deleted"}