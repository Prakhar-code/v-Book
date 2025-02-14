import uvicorn
from app import create_app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("run:app", port=8000, log_level="info", workers=True, reload=True)
