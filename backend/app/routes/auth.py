from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.responses import JSONResponse
import logging
from app.core.db import get_db
from datetime import timedelta
from sqlalchemy.orm import Session
from app.core.config import settings as config
from app.models.api_error import ErrorResponse
from app.schemas.user_schema import UserCreate, UserLogin
from app.services.password_utils import verify_password
from app.services.auth_service import create_access_token, invalidate_token
from app.models.otp.otp_request import OTPRequest
from app.models.otp.otp_response import OTPResponse
from fastapi import APIRouter, HTTPException, Depends, Security
from app.services.otp_service import send_otp, verify_otp
from app.models.otp.verify_otp_request import VerifyOTPRequest
from app.models.change_password_request import ChangePasswordRequest
from app.models.update_password_request import update_password_request
from app.repositories.user_repo import (
    create_user,
    update_user_password,
    verifyOldPassword,
    get_user,
)
from fastapi_icontract import require

app = APIRouter(prefix="/vbook/v1")
logger = logging.getLogger(__name__)

security = HTTPBearer()


@app.post("/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info("Attempting login for email: %s", user.email)

    try:
        db_user = get_user(user.email)
        if not db_user:
            logger.error("User not found: %s", user.email)
            raise HTTPException(status_code=404, detail="User not found")

        logger.info("Stored password hash: %s", db_user.password)
        if not verify_password(user.password, db_user.password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        access_token_expires = timedelta(minutes=config.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": db_user.email, "role": db_user.role},
            expires_delta=access_token_expires,
        )
        return {
            "user_id": db_user.user_id,
            "user_name": db_user.name,
            "user_email": db_user.email,
            "access_token": access_token,
            "token_type": "bearer",
            "role": db_user.role,
        }
    except HTTPException as he:
        logger.error(f"HTTPException during login: {he}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@app.post("/auth/register")
async def signup(user: UserCreate):
    new_user = create_user(user)

    if not new_user:
        raise HTTPException(
            status_code=500, detail="Email or Employee ID already registered"
        )

    return {"message": "User created successfully"}


@app.post(
    "/auth/verify-email",
    response_model=OTPResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@require(
    lambda otp_request: str(otp_request.email).endswith("@yash.com"),
    description="Email should be of yash.com domain only",
)
async def verifyemail(otp_request: OTPRequest):
    try:
        send_otp(otp_request.email, subject="vBook- OTP For Registration")

        return {
            "status": "success",
            "message": f"OTP sent successfully to {otp_request.email}.",
        }

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while sending the OTP. Please try again later.",
        )


@app.post(
    "/auth/forget-password",
    response_model=OTPResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@require(
    lambda otp_request: str(otp_request.email).endswith("@yash.com"),
    description="Email should be of yash.com domain only",
)
async def forget_password(otp_request: OTPRequest):
    try:
        user_verified = get_user(otp_request.email)
        if user_verified:
            send_otp(
                otp_request.email, subject="vBook- OTP For Forgot Password Verification"
            )

            return {
                "status": "success",
                "message": "OTP sent successfully to the registered email address.",
            }
        return {
            "status": "failure",
            "message": "User not found.",
        }

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while sending the OTP. Please try again later.",
        )


@app.post(
    "/auth/verify-otp",
    response_model=OTPResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@require(
    lambda verify_otp_request: len(verify_otp_request.otp) == 6,
    description="OTP length should be exactly 6 digits",
)
@require(
    lambda verify_otp_request: str(verify_otp_request.email).endswith("@yash.com"),
    description="Email should be of yash.com domain only",
)
async def verifyotp(verify_otp_request: VerifyOTPRequest):
    try:
        fetched_otp = str(verify_otp(verify_otp_request.email))
        if fetched_otp == verify_otp_request.otp:
            response_data = {
                "status": "success",
                "message": "OTP verified successfully.",
            }
            return JSONResponse(content=response_data, status_code=200)
        response_data = {"status": "failure", "message": "OTP is incorrect."}
        return JSONResponse(content=response_data, status_code=404)

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while matching the OTP. Please try again later.",
        )


@app.post(
    "/auth/update-password",
    response_model=OTPResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@require(
    lambda update_password_request: str(update_password_request.email).endswith(
        "@yash.com"
    ),
    description="Email should be of yash.com domain only",
)
async def update_password(update_password_request: update_password_request):
    try:
        update_user_password(
            update_password_request.email, update_password_request.password
        )
        return {"status": "success", "message": "Password updated successfully."}
    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while sending the OTP. Please try again later.",
        )


@app.post("/auth/change-password")
@require(
    lambda change_password_request: str(change_password_request.email).endswith(
        "@yash.com"
    ),
    description="Email should be of yash.com domain only",
)
@require(
    lambda change_password_request: len(change_password_request.oldpassword) >= 8,
    description="Old Password length should be greater or equal to 8",
)
@require(
    lambda change_password_request: len(change_password_request.newpassword) >= 8,
    description="New Password length should be greater or equal to 8",
)
async def change_password(change_password_request: ChangePasswordRequest):
    """
    Change password endpoint that checks the old password and updates the new one
    if the old one is correct.

    Args:
        change_password_request (ChangePasswordRequest): Request containing the
            email, old password and new password.

    Returns:
        JSONResponse: A JSON response with status and message.
    """

    try:
        old_password_matched = verifyOldPassword(
            change_password_request.email, change_password_request.oldpassword
        )
        if old_password_matched:
            update_user_password(
                change_password_request.email, change_password_request.newpassword
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while updating the password. Please try again later.",
        )


@app.delete("/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Logout endpoint that invalidates the current token.
    Frontend should clear the token from localStorage.

    Args:
        credentials (HTTPAuthorizationCredentials): The Authorization header
            containing the current token.

    Returns:
        JSONResponse: A JSON response with status and message.
    """
    try:
        token = credentials.credentials
        invalidate_token(token)
        logger.info("User successfully logged out")
        return {"status": "success", "message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while logging out"
        )
