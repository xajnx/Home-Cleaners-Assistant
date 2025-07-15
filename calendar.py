from icalendar import Calendar, Event
from datetime import datetime, timedelta
import uuid

def generate_ics(client_name, address, start_date, phone, email, pdf_path):
    cal = Calendar()
    event = Event()

    event.add("summary", f"Cleaning Service for {client_name}")
    event.add("dstart", start_date)
    event.add("dtend", start_date + timedelta(hours=3)) # default 3 hour block
    event.add("location", address)
    event.add("phone", phone)
    event.add("email", email)
    event.add("description", "Convirmed via Home Cleaner's Assistant")
    event["uid"] = str(uuid.uuid4)

    cal.add_component(event)
    with open(pdf_path, "wb") as f:
        f.write(cal.to_ical())
