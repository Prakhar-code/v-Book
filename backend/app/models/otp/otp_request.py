from pydantic import BaseModel, constr


class OTPRequest(BaseModel):
    email: constr(
        pattern=r"^[a-zA-Z0-9._%+-]+@yash\.com$", max_length=100
    )  # type: ignore
