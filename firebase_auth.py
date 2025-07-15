import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException

cred = credentials.Certificate("firebase-creds.json")  # Download from Firebase Console
firebase_admin.initialize_app(cred)

def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")