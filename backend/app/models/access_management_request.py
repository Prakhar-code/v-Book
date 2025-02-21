from pydantic import BaseModel


class AccessManagementRequest(BaseModel):
    role: str
    employee_id: int
