from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import SecretStr
from config import MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_PORT, MAIL_SERVER, FRONTEND_URL

if not MAIL_USERNAME or not MAIL_PASSWORD or not MAIL_FROM:
    raise ValueError("Missing Email Configuration (MAIL_USERNAME, MAIL_PASSWORD, or MAIL_FROM)")

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=SecretStr(MAIL_PASSWORD), 
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    MAIL_FROM_NAME="Freelance Flow - Time Tracker",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,   
    TIMEOUT=30
)

async def send_otp_email(email_to: str, otp_code: str):
    """
    Sends a beautiful HTML email with the 6-digit OTP code.
    """
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Verify your email</h2>
        <p style="color: #555;">Welcome to TimeTracker! Please use the following code to verify your account:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 8px; color: #000;">{otp_code}</h1>
        </div>
        
        <p style="color: #777; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #777; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="Your Verification Code",
        recipients=[email_to],  # type: ignore 
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_password_reset_email(email_to: str, token: str):
    """
    Sends a password reset link.
    """
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}&email={email_to}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">You requested a password reset for TimeTracker.</p>
        <p style="color: #555;">Click the button below to choose a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p style="color: #777; font-size: 14px;">This link expires in 15 minutes.</p>
        <p style="color: #777; font-size: 14px;">If you didn't ask for this, you can safely ignore this email.</p>
    </div>
    """

    message = MessageSchema(
        subject="Reset Your Password",
        recipients=[email_to], # type: ignore
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)