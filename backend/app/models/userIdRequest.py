from pydantic import BaseModel


class UserIdRequest(BaseModel):
    user_id: int
