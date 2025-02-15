from pydantic import BaseModel

class ChangePasswordRequest(BaseModel):
    email: str
    oldpassword:str
    newpassword:str