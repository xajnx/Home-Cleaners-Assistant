import logging
import os

# Ensure logs folder exists
os.makedirs("logs", exist_ok=True)

# Configure global logging
logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def log_event(message: str, level: str = "info", user_id: str = None, error: Exception = None):
    """Flexible logging function with optional user and error context"""
    prefix = f"[UID: {user_id}] " if user_id else ""
    content = f"{prefix}{message}"

    if error:
        content += f" | Exception: {str(error)}"

    {
        "info": logging.info,
        "warning": logging.warning,
        "error": logging.error,
        "debug": logging.debug,
        "critical": logging.critical,
    }.get(level, logging.info)(content)