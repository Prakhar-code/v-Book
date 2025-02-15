from pydantic import BaseModel, field_validator, EmailStr
from typing import Optional
 
class UserCreate(BaseModel):
    employee_id: int
    email: EmailStr
    name: str
    password: str
    confirm_password: str
    user_id: Optional[int] = None
 
    # written by @Ishita.Porwal
    @field_validator('confirm_password')
    def validate_passwords(cls, value, info):
        password = info.data.get('password')
        if password is not None and value != password:
            raise ValueError('Passwords do not match')
        return value
 
    @field_validator('password')
    def validate_password_strength(cls, value):
        if len(value) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return value
    
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


  