import smtplib
import os
from email.message import EmailMessage

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_APP_PASS")

def send_email_with_attachment(to: str, subject: str, body: str, attachment_path: str):
    msg = EmailMessage()
    msg["From"] = GMAIL_USER
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    with open(attachment_path, "rb") as f:
        data = f.read()
        filename = os.path.basename(attachment_path)
    msg.add_attachment(data, maintype="application", subtype="pdf", filename=filename)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(GMAIL_USER, GMAIL_PASS)
        smtp.send_message(msg)