from pydantic import BaseModel, constr

class update_password_request(BaseModel):
    email: str
    password:str 