from pydantic import BaseModel, constr

class VerifyOTPRequest(BaseModel):
    email: str
    otp:str