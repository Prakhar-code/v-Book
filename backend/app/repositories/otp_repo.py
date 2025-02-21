import re
from sqlalchemy import text
from app.core.db import engine


def is_valid_email(email: str) -> bool:
    """Validate the email format."""
    return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None


def is_valid_otp(otp: int) -> bool:
    """Validate the OTP format (assuming it should be a 6-digit number)."""
    return isinstance(otp, int) and 100000 <= otp <= 999999


def save_otp(email: str, otp: int):
    """Save the OTP to the database."""
    if not is_valid_email(email):
        raise ValueError("Invalid email format")

    # if not is_valid_otp(otp):
    #     raise ValueError("Invalid OTP format")

    try:
        with engine.connect() as connection:
            insert_otp = connection.execute(
                text(
                    "INSERT INTO otp_table (email, otp) VALUES (:email, :otp) ON DUPLICATE KEY UPDATE otp = VALUES(otp), "
                    "created_at = CURRENT_TIMESTAMP"
                ),
                {"email": email, "otp": otp},
            )
            connection.commit()
            print(insert_otp)
            print("✓ OTP saved successfully!")
            get_otp = connection.execute(
                text("Select * from otp_table"),
            )
            print(get_otp.fetchall())
    except Exception as e:
        raise Exception(f"Error saving OTP to the database: {str(e)}")


def get_otp(email: str):
    if not is_valid_email(email):
        raise ValueError("Invalid email format")
    try:
        with engine.connect() as connection:
            fetch_otp = connection.execute(
                text("SELECT * from otp_table where email=:email"), {"email": email}
            )
            result = fetch_otp.fetchall()
            print(result)
            if result:
                print("✓ OTP fetched successfully!")
                data = result[0]
                email, otp, timestamp = data
                return otp
            return 0
    except Exception as e:
        raise Exception(f"Error fetching OTP: {str(e)}")
