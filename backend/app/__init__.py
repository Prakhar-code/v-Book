from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin_routes,auth, booking_routes,cabin_routes,user_routes


def create_app():
    app=FastAPI()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(admin_routes.app)
    app.include_router(auth.app)
    app.include_router(booking_routes.app)
    app.include_router(cabin_routes.app)
    app.include_router(user_routes.app)
    
    return app