import httpx
import os
from config import MAIL_FROM  

# Get the API Key
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

async def send_email_via_api(to_email: str, subject: str, html_content: str):
    """
    Sends email using Brevo's HTTP API (Bypasses SMTP ports).
    """
    if not BREVO_API_KEY:
        print("❌ Error: BREVO_API_KEY is missing.")
        return

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "Freelance Flow",
            "email": MAIL_FROM 
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }

    async with httpx.AsyncClient() as client:
        response = None
        try:
            response = await client.post(BREVO_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            print(f"✅ Email sent to {to_email}")
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            if response is not None:
                 print(f"Brevo Response: {response.text}")
            raise e

# --- Wrapper functions to match your existing calls ---

async def send_otp_email(email_to: str, otp_code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Verify your email</h2>
        <p style="color: #555;">Welcome to Freelance Flow! Please use the following code to verify your account:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 8px; color: #000;">{otp_code}</h1>
        </div>
        
        <p style="color: #777; font-size: 14px;">This code will expire in 10 minutes.</p>
    </div>
    """
    await send_email_via_api(email_to, "Your Verification Code", html)

async def send_password_reset_email(email_to: str, token: str):
    from config import FRONTEND_URL 
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}&email={email_to}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">Click the button below to choose a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p style="color: #777; font-size: 14px;">This link expires in 15 minutes.</p>
    </div>
    """
    await send_email_via_api(email_to, "Reset Your Password", html)