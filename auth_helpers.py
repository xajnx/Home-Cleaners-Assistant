from fastapi import HTTPException, Request
from functools import wraps
from firebase_auth import verify_firebase_token
from database import db

def require_pro(func):
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        auth_header = request.headers.get("authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization Header")
        
        user = verify_firebase_token(auth_header)
        uid = user["uid"]

        if db["subscriptions"].get(uid) != "pro":
            raise HTTPException(status_code=403, detail="Pro feature")
        
        # Add UID to request.state if needed later
        request.state.uid = uid
        return await func(request, *args, **kwargs)

    return wrapper
    
def require_subscription(minimum: str = "pro"):
    levels = ["free", "pro", "enterprise"]

    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            auth_header = request.headers.get("authorization")
            if not auth_header:
                raise HTTPException(status_code=401, detail="Missing Authorization Header")

            user = verify_firebase_token(auth_header)
            uid = user["uid"]

            user_level = db["subscriptions"].get(uid, "free")
            if levels.index(user_level) < levels.index(minimum):
                raise HTTPException(status_code=403, detail=f"{minimum.capitalize()} plan required")

            request.state.uid = uid
            request.state.subscription_level = user_level
            return await func(request, *args, **kwargs)

        return wrapper
    return decorator