import string
import random
from fastapi import HTTPException
from app.repositories.otp_repo import get_otp, save_otp
from app.services.email_service import send_verification_email


def generate_verification_code(length=6):
    return "".join(random.choices(string.digits, k=length))


def send_otp(email: str, subject: str):
    try:
        otp = str(generate_verification_code(6))
        save_otp(email, otp)
        return send_verification_email(email, subject, otp)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while sending the OTP. Please try again later.",
        )


def verify_otp(email: str):
    try:
        otp = get_otp(email)
        return otp
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while matching the OTP. Please try again later.",
        )
