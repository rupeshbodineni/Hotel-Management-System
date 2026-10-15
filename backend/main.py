from contextlib import asynccontextmanager
from datetime import date, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, SessionLocal, engine
from app.routers import (
    analytics,
    auth,
    bookings,
    chatbot,
    payments,
    restaurant,
    reviews,
    rooms,
    services,
    settings,
    staff,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Luxury Hotel Management System API",
    description="Complete REST API for The Royal Oasis Hotel Management System",
    version="2.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://hotel-management-system-self-tau.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Luxury Hotel Management System API Working",
        "documentation": "/docs",
        "version": "2.0.0",
    }


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(restaurant.router)
app.include_router(services.router)
app.include_router(staff.router)
app.include_router(settings.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)


def seed_database(db):
    from app.models.coupon import Coupon
    from app.models.room import Room
    from app.models.service import Service
    from app.models.staff import Staff
    from app.models.user import User
    from app.utils.password import hash_password

    users_data = [
        {"name": "Royal Admin", "email": "admin@hotel.com", "password": "admin123", "role": "admin"},
        {"name": "Sarah Receptionist", "email": "receptionist@hotel.com", "password": "receptionist123", "role": "receptionist"},
        {"name": "Marc Manager", "email": "manager@hotel.com", "password": "manager123", "role": "manager"},
        {"name": "Helena Housekeeping", "email": "housekeeping@hotel.com", "password": "housekeeping123", "role": "housekeeping"},
        {"name": "Valued Customer", "email": "customer@hotel.com", "password": "customer123", "role": "customer"},
    ]

    for user_data in users_data:
        if db.query(User).filter(User.email == user_data["email"]).first():
            continue

        user = User(
            name=user_data["name"],
            email=user_data["email"],
            hashed_password=hash_password(user_data["password"]),
            role=user_data["role"],
            phone="+91 9988776655",
            address="123 Luxury Boulevard, Palace District",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if user_data["role"] in ["receptionist", "housekeeping", "manager"]:
            dept_map = {
                "receptionist": "Front Office",
                "housekeeping": "Housekeeping",
                "manager": "General Management",
            }
            salary_map = {
                "receptionist": 45000.0,
                "housekeeping": 30000.0,
                "manager": 95000.0,
            }

            db.add(
                Staff(
                    user_id=user.id,
                    department=dept_map[user_data["role"]],
                    salary=salary_map[user_data["role"]],
                    shift="morning",
                    attendance="[]",
                    performance="Excellent record. High reliability.",
                )
            )
            db.commit()

    if db.query(Room).count() == 0:
        rooms_data = [
            {
                "room_number": "101",
                "room_type": "Deluxe Room",
                "price": 4500.0,
                "capacity": 2,
                "floor_number": 1,
                "discount": 10.0,
                "is_featured": 1,
                "description": "Elegant luxury room with a king-size bed, workstation, smart TV, and city panoramic view.",
                "amenities": "WiFi, AC, Smart TV, Mini Bar, Kettle, Shower",
                "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                "status": "available",
            },
            {
                "room_number": "102",
                "room_type": "Deluxe Room",
                "price": 4500.0,
                "capacity": 2,
                "floor_number": 1,
                "discount": 0.0,
                "is_featured": 0,
                "description": "Comfortable room featuring gold decor, en-suite bathroom, high-speed WiFi, and study area.",
                "amenities": "WiFi, AC, Smart TV, Kettle, Shower",
                "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                "status": "available",
            },
            {
                "room_number": "201",
                "room_type": "Premium Suite",
                "price": 9500.0,
                "capacity": 3,
                "floor_number": 2,
                "discount": 15.0,
                "is_featured": 1,
                "description": "Large premium suite with separate living room, plush velvet sofas, private balcony, and ocean panorama.",
                "amenities": "WiFi, AC, Smart TV, Mini Bar, Bath Tub, Coffee Machine, Balcony",
                "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                "status": "available",
            },
            {
                "room_number": "301",
                "room_type": "Presidential Penthouse",
                "price": 25000.0,
                "capacity": 4,
                "floor_number": 3,
                "discount": 0.0,
                "is_featured": 1,
                "description": "The peak of luxury. Fully private top-floor penthouse with private jacuzzi, bar counter, and 360 view of the hills.",
                "amenities": "WiFi, AC, Smart TV, Bar Counter, Jacuzzi, Bath Tub, Butler Service, Terrace",
                "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                "status": "available",
            },
            {
                "room_number": "202",
                "room_type": "Honeymoon Suite",
                "price": 12000.0,
                "capacity": 2,
                "floor_number": 2,
                "discount": 5.0,
                "is_featured": 1,
                "description": "Specially decorated romantic suite with a private hot tub, champagne chiller, and custom mood lighting.",
                "amenities": "WiFi, AC, Smart TV, Hot Tub, Champagne Chiller, Room Service, Mood Lighting",
                "image_url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                "status": "available",
            },
        ]

        for room in rooms_data:
            db.add(Room(**room))
        db.commit()

    if db.query(Service).count() == 0:
        services_data = [
            {"name": "Luxury Imperial Spa Therapy", "service_type": "spa", "price": 2500.0, "description": "Relaxing 90-minute full body massage with Swedish oils and hot basalt stones."},
            {"name": "Personal Fitness Training", "service_type": "gym", "price": 1200.0, "description": "1-on-1 coaching session with a certified elite trainer in our high-end gymnasium."},
            {"name": "Express Valet Laundry Service", "service_type": "laundry", "price": 500.0, "description": "Same-day washing, dry cleaning, steam pressing, and delivery directly to your room wardrobe."},
            {"name": "Elite Airport Shuttle Transfer", "service_type": "pickup", "price": 1800.0, "description": "Luxury chauffeured pickup or drop-off in a premium Mercedes-Benz E-Class sedan."},
            {"name": "Grand Wedding Hall Reservation", "service_type": "event", "price": 85000.0, "description": "Full-day booking of our spectacular imperial ballroom, including audio, lighting, and luxury seating setup."},
        ]

        for service in services_data:
            db.add(Service(**service))
        db.commit()

    if db.query(Coupon).count() == 0:
        coupons_data = [
            {"code": "WELCOME10", "discount_percent": 10.0, "valid_until": date.today() + timedelta(days=365), "is_active": True},
            {"code": "ROYAL20", "discount_percent": 20.0, "valid_until": date.today() + timedelta(days=90), "is_active": True},
            {"code": "FESTIVE30", "discount_percent": 30.0, "valid_until": date.today() + timedelta(days=30), "is_active": True},
        ]

        for coupon in coupons_data:
            db.add(Coupon(**coupon))
        db.commit()
