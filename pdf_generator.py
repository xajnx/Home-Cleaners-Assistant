from fpdf import FPDF
import os

def generate_contract_pdf(business, client, bid, quote, cleaning_frequency, pdf_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Header
    pdf.cell(200, 10, txt=f"{business.business_name}", ln=True, align="C")
    pdf.cell(200, 10, txt="Service Agreement", ln=True, align="C")
    pdf.ln(10)

    # Client Info
    pdf.cell(200, 10, txt=f"Client: {client.name}", ln=True)
    pdf.cell(200, 10, txt=f"Service Address: {bid.bid_address}", ln=True)
    pdf.cell(200, 10, txt=f"Contact: {client.contact_email} | {client.contact_number}", ln=True)
    pdf.cell(200, 10, txt=f"Cleaning Frequency: {cleaning_frequency.capitalize()}", ln=True)
    pdf.ln(5)

    # Notes
    pdf.multi_cell(0, 10, txt=f"Service Notes:\n{bid.notes}")
    pdf.ln(5)

    # Quote Summary
    pdf.cell(200, 10, txt="Pricing Summary", ln=True)
    pdf.cell(200, 10, txt=f"One-Time / Deep Clean: ${quote['total']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Bi-Weekly: ${quote['bi_week']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Weekly: ${quote['week']:.2f}", ln=True)
    pdf.ln(10)

    # Terms
    pdf.multi_cell(0, 10, txt=(
        "Terms:\n"
        "This agreement includes cleaning services based on the frequency listed. "
        "Payment is due upon completion unless otherwise stated in writing. "
        "Cancellations require 24 hours' notice or may incur a service fee. "
        "Client agrees to provide access and ensure safety for cleaning personnel."
    ))

    # Footer
    pdf.ln(15)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(90, 10, txt="Client Signature:", ln=False)
    pdf.cell(90, 10, txt="Cleaner Signature:", ln=True)

    # Embed signature if exists
    if bid.signed_contract and os.path.exists(bid.signed_contract.get("signature_path", "")):
        y_before = pdf.get_y()
        pdf.image(bid.signed_contract["signature_path"], x=10, y=y_before + 5, w=60)
        pdf.set_y(y_before + 30)
        pdf.set_font("Arial", "", 10)
        pdf.cell(90, 8, txt=f"{bid.signed_contract.get('name', 'Signed')}", ln=False)
        pdf.cell(90, 8, txt="______________________________", ln=True)
        pdf.cell(90, 8, txt=f"Date: {bid.signed_contract.get('timestamp', '')}", ln=False)
        pdf.cell(90, 8, txt="Date: ____________________", ln=True)
    else:
        pdf.set_font("Arial", "", 12)
        pdf.cell(90, 10, txt="______________________________", ln=False)
        pdf.cell(90, 10, txt="______________________________", ln=True)
        pdf.ln(5)
        pdf.cell(90, 10, txt="Date: ____________________", ln=False)
        pdf.cell(90, 10, txt="Date: ____________________", ln=True)

    # Output
    pdf.output(pdf_path)

def generate_estimate_pdf(business, quote, pdf_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt=f"{business.business_name}", ln=True, align="C")
    pdf.cell(200, 10, txt="Estimate Summary", ln=True, align="C")
    pdf.ln(10)

    pdf.cell(200, 10, txt=f"Contact: {business.contact_email} | {business.contact_number}", ln=True)
    pdf.cell(200, 10, txt=f"Address: {business.business_address}", ln=True)
    pdf.ln(5)

    pdf.cell(200, 10, txt=f"Base Rate: ${quote['base_rate']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Pet Fee: ${quote['pet_fee']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Floor Fee: ${quote['floor_fee']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Window Fee: ${quote['window_fee']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Knickknack Fee: ${quote['knickknack_fee']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Travel Fee: ${quote['travel_fee']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Cleanliness Multiplier: x{quote['cleanliness_multiplier']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Tax: ${quote['tax']:.2f}", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(200, 10, txt=f"TOTAL: ${quote['total']:.2f}", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.cell(200, 10, txt=f"Bi-Weekly: ${quote['bi_week']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"Weekly: ${quote['week']:.2f}", ln=True)

    pdf.output(pdf_path)