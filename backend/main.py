from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta

from app.database.connection import engine, Base, SessionLocal
from app.routers import users, rooms, bookings, payments, auth, reviews, restaurant, services, staff, settings, analytics

app = FastAPI(title="Luxury Hotel Management System API")

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database with default records for immediate usability
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@app.get("/")
def home():
    return {
        "message": "Luxury Hotel Management System API Working",
        "documentation": "/docs"
    }

# Include routers
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


def seed_database(db):
    from app.models.user import User
    from app.models.room import Room
    from app.models.service import Service
    from app.models.coupon import Coupon
    from app.models.staff import Staff
    from app.utils.password import hash_password
    import json

    # 1. Seed default accounts if empty
    users_data = [
        {"name": "Royal Admin", "email": "admin@hotel.com", "password": "admin123", "role": "admin"},
        {"name": "Sarah Receptionist", "email": "receptionist@hotel.com", "password": "receptionist123", "role": "receptionist"},
        {"name": "Marc Manager", "email": "manager@hotel.com", "password": "manager123", "role": "manager"},
        {"name": "Helena Housekeeping", "email": "housekeeping@hotel.com", "password": "housekeeping123", "role": "housekeeping"},
        {"name": "Valued Customer", "email": "customer@hotel.com", "password": "customer123", "role": "customer"}
    ]

    for ud in users_data:
        existing = db.query(User).filter(User.email == ud["email"]).first()
        if not existing:
            new_u = User(
                name=ud["name"],
                email=ud["email"],
                hashed_password=hash_password(ud["password"]),
                role=ud["role"],
                phone="+91 9988776655",
                address="123 Luxury Boulevard, Palace District"
            )
            db.add(new_u)
            db.commit()
            db.refresh(new_u)

            # If staff roles, create staff profile entries as well
            if ud["role"] in ["receptionist", "housekeeping", "manager"]:
                dept_map = {
                    "receptionist": "Front Office",
                    "housekeeping": "Housekeeping",
                    "manager": "General Management"
                }
                salary_map = {
                    "receptionist": 45000.0,
                    "housekeeping": 30000.0,
                    "manager": 95000.0
                }
                new_staff = Staff(
                    user_id=new_u.id,
                    department=dept_map[ud["role"]],
                    salary=salary_map[ud["role"]],
                    shift="morning",
                    attendance="[]",
                    performance="Excellent record. High reliability."
                )
                db.add(new_staff)
                db.commit()

    # 2. Seed rooms if empty
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
                "status": "available"
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
                "status": "available"
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
                "status": "available"
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
                "status": "available"
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
                "status": "available"
            }
        ]
        for rd in rooms_data:
            new_r = Room(**rd)
            db.add(new_r)
            db.commit()

    # 3. Seed services if empty
    if db.query(Service).count() == 0:
        services_data = [
            {"name": "Luxury Imperial Spa Therapy", "service_type": "spa", "price": 2500.0, "description": "Relaxing 90-minute full body massage with Swedish oils and hot basalt stones."},
            {"name": "Personal Fitness Training", "service_type": "gym", "price": 1200.0, "description": "1-on-1 coaching session with a certified elite trainer in our high-end gymnasium."},
            {"name": "Express Valet Laundry Service", "service_type": "laundry", "price": 500.0, "description": "Same-day washing, dry cleaning, steam pressing, and delivery directly to your room wardrobe."},
            {"name": "Elite Airport Shuttle Transfer", "service_type": "pickup", "price": 1800.0, "description": "Luxury chauffeured pickup or drop-off in a premium Mercedes-Benz E-Class sedan."},
            {"name": "Grand Wedding Hall Reservation", "service_type": "event", "price": 85000.0, "description": "Full-day booking of our spectacular imperial ballroom, including audio, lighting, and luxury seating setup."}
        ]
        for sd in services_data:
            new_s = Service(**sd)
            db.add(new_s)
            db.commit()

    # 4. Seed coupons if empty
    if db.query(Coupon).count() == 0:
        coupons_data = [
            {"code": "WELCOME10", "discount_percent": 10.0, "valid_until": date.today() + timedelta(days=365), "is_active": True},
            {"code": "ROYAL20", "discount_percent": 20.0, "valid_until": date.today() + timedelta(days=90), "is_active": True},
            {"code": "FESTIVE30", "discount_percent": 30.0, "valid_until": date.today() + timedelta(days=30), "is_active": True}
        ]
        for cd in coupons_data:
            new_c = Coupon(**cd)
            db.add(new_c)
            db.commit()
