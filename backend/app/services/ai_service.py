"""
Hotel AI Chatbot Service
A rule-based FAQ chatbot for The Royal Oasis Hotel.
Handles common guest queries about rooms, bookings, dining, services, etc.
"""

import re
from typing import Optional

# FAQ Knowledge Base — keyword patterns mapped to responses
FAQ_RULES = [
    # Greetings
    {
        "patterns": [r"\bhello\b", r"\bhi\b", r"\bhey\b", r"\bgreetings\b", r"\bgood (morning|evening|afternoon)\b"],
        "response": "Welcome to **The Royal Oasis Hotel** 🏨 — where luxury meets elegance! I'm your virtual concierge. How may I assist you today? You can ask me about our rooms, bookings, restaurant, spa services, check-in/check-out, or anything else!"
    },
    # Check-in / Check-out
    {
        "patterns": [r"\bcheck.?in\b", r"\bcheckin\b"],
        "response": "**Check-In Information** 🔑\n\nOur standard check-in time is **2:00 PM**. Early check-in from 11:00 AM may be available upon request (subject to room availability). Our reception desk is staffed **24 hours**. Please bring a valid photo ID and your booking confirmation."
    },
    {
        "patterns": [r"\bcheck.?out\b", r"\bcheckout\b"],
        "response": "**Check-Out Information** 🛎️\n\nOur standard check-out time is **12:00 PM (Noon)**. Late check-out until 2:00 PM is available upon request for a small fee. Please inform our reception desk at least 2 hours prior if you need a late check-out."
    },
    # Rooms
    {
        "patterns": [r"\broom(s)?\b", r"\bsuite(s)?\b", r"\bpenthouse\b", r"\bdeluxe\b", r"\bhoneymoon\b"],
        "response": "**Our Luxury Rooms** 🛏️\n\nWe offer a curated selection of premium accommodations:\n\n• **Deluxe Room** — ₹4,500/night · City panoramic view, king-size bed, WiFi, Smart TV\n• **Premium Suite** — ₹9,500/night · Separate living room, private balcony, ocean view\n• **Honeymoon Suite** — ₹12,000/night · Private hot tub, champagne chiller, mood lighting\n• **Presidential Penthouse** — ₹25,000/night · Private jacuzzi, 360° hill views, butler service\n\nVisit our **Rooms** page to see photos and book directly!"
    },
    # Pricing
    {
        "patterns": [r"\bprice(s)?\b", r"\bcost\b", r"\brate(s)?\b", r"\btariff\b", r"\bcharge\b"],
        "response": "**Room Rates at The Royal Oasis** 💰\n\n• Deluxe Room: ₹4,500/night\n• Premium Suite: ₹9,500/night\n• Honeymoon Suite: ₹12,000/night\n• Presidential Penthouse: ₹25,000/night\n\nAll rates include complimentary breakfast, WiFi, and use of hotel facilities. A **12% luxury tax** applies. We offer various promotional coupons — ask our team for the latest discount codes!"
    },
    # Restaurant / Food
    {
        "patterns": [r"\brestaurant\b", r"\bdine\b", r"\bdining\b", r"\bfood\b", r"\bmenu\b", r"\blunch\b", r"\bdinner\b", r"\bbreakfast\b", r"\bmeal\b", r"\broom service\b"],
        "response": "**Royal Dining Experience** 🍽️\n\nOur fine-dining restaurant is open **7:00 AM – 11:00 PM** daily.\n\n**Specialties include:**\n• Pan-seared Atlantic Salmon — ₹1,200\n• Prime Filet Mignon — ₹1,800\n• Truffle Garlic Bread — ₹350\n• Classic Venetian Tiramisu — ₹450\n• Royal Gold Elixir Mocktail — ₹350\n\n**Room service** is available 24/7. Visit our **Restaurant** page to order or make a table reservation!"
    },
    # Spa
    {
        "patterns": [r"\bspa\b", r"\bmassage\b", r"\bwellness\b", r"\btherapy\b", r"\brelax\b"],
        "response": "**Royal Spa & Wellness** 💆\n\nIndulge in our world-class spa experience:\n\n• **Luxury Imperial Spa Therapy** — ₹2,500 (90-minute full body massage with Swedish oils & hot basalt stones)\n• Available daily from 9:00 AM – 9:00 PM\n• Advance booking is recommended\n\nVisit our **Services** page to book your treatment!"
    },
    # Gym / Fitness
    {
        "patterns": [r"\bgym\b", r"\bfitness\b", r"\bworkout\b", r"\bexercise\b", r"\btraining\b"],
        "response": "**Fitness Center** 🏋️\n\nOur premium fitness center is open **6:00 AM – 10:00 PM** daily and is complimentary for all guests.\n\nWe also offer **Personal Fitness Training** sessions at ₹1,200 per session with a certified elite trainer. Book through our **Services** page!"
    },
    # Laundry
    {
        "patterns": [r"\blaundry\b", r"\bwashing\b", r"\bclean(ing)? cloth\b", r"\bdry clean\b", r"\bironing\b"],
        "response": "**Express Laundry Service** 👔\n\nWe offer same-day **Express Valet Laundry** at ₹500:\n• Washing, dry cleaning, steam pressing\n• Delivery directly to your room wardrobe\n• Order before 10:00 AM for same-day return\n\nBook through the **Services** section!"
    },
    # Airport / Pickup
    {
        "patterns": [r"\bairport\b", r"\bpickup\b", r"\bdrop.?off\b", r"\btransport\b", r"\bshuttle\b", r"\bcab\b", r"\btaxi\b"],
        "response": "**Airport Transfer Service** 🚗\n\nWe offer luxury chauffeur service in a **Mercedes-Benz E-Class** sedan:\n\n• **Elite Airport Shuttle Transfer** — ₹1,800 (one way)\n• Available 24/7 with advance booking\n• Airport pickup and hotel drop-off available\n\nBook via the **Services** page or contact reception!"
    },
    # WiFi
    {
        "patterns": [r"\bwifi\b", r"\bwi.fi\b", r"\binternet\b", r"\bnetwork\b"],
        "response": "**WiFi Access** 📶\n\nComplimentary high-speed WiFi is available throughout the hotel — in all rooms, lobby, restaurant, and outdoor areas. Connect to the network **'TheRoyalOasis_Guest'** and use your room number as the password. For technical support, call extension 0."
    },
    # Booking
    {
        "patterns": [r"\bbook(ing)?\b", r"\breserv(e|ation)\b", r"\bstay\b"],
        "response": "**Making a Reservation** 📅\n\nYou can book a room in 3 easy steps:\n1. Browse our **Rooms** page to find your ideal suite\n2. Click **Book Now** and select your check-in / check-out dates\n3. Apply any coupon code and confirm your booking\n\nYou'll receive a confirmation notification immediately. For group bookings (5+ rooms), please contact reception directly."
    },
    # Cancellation / Refund
    {
        "patterns": [r"\bcancel\b", r"\bcancellation\b", r"\brefund\b"],
        "response": "**Cancellation Policy** ❌\n\n• Cancellations made **48+ hours** before check-in: Full refund\n• Cancellations within **24-48 hours**: 50% refund\n• **Same-day** cancellations: No refund\n\nTo cancel a booking, visit your **Dashboard** → My Reservations → Cancel. Refunds are processed within 3-5 business days."
    },
    # Coupon / Discount
    {
        "patterns": [r"\bcoupon\b", r"\bdiscount\b", r"\boffer\b", r"\bpromo\b", r"\bcode\b"],
        "response": "**Discount Coupons** 🎫\n\nWe offer several active promo codes:\n\n• **WELCOME10** — 10% off for new guests\n• **ROYAL20** — 20% off for loyalty members\n• **FESTIVE30** — 30% off seasonal special\n\nEnter the coupon code during the booking checkout to apply your discount!"
    },
    # Payment
    {
        "patterns": [r"\bpay(ment)?\b", r"\binvoice\b", r"\bbill\b", r"\btransaction\b", r"\bcredit card\b", r"\bupi\b"],
        "response": "**Payment & Billing** 💳\n\nWe accept:\n• Credit / Debit Cards (Visa, Mastercard, Amex)\n• UPI (GPay, PhonePe, Paytm)\n• Net Banking\n• Cash at reception\n\nAll invoices are generated automatically and available in your **Dashboard** → Invoice Receipts. A 12% luxury tax applies to all services."
    },
    # Events / Weddings
    {
        "patterns": [r"\bevent\b", r"\bwedding\b", r"\bballroom\b", r"\bconference\b", r"\bbanquet\b", r"\bparty\b", r"\bfunction\b"],
        "response": "**Event Spaces** 🎊\n\nOur **Grand Imperial Ballroom** is available for:\n• Weddings & Receptions\n• Corporate Conferences\n• Birthday & Anniversary Celebrations\n• Social Gatherings\n\n**Grand Wedding Hall Reservation** — ₹85,000/day (full audio, lighting, and luxury seating setup included). For event inquiries, contact our Events Coordinator via the **Services** page."
    },
    # Parking
    {
        "patterns": [r"\bpark(ing)?\b", r"\bcar\b", r"\bvehicle\b", r"\bvalet\b"],
        "response": "**Parking Facilities** 🚘\n\nThe Royal Oasis offers:\n• **Complimentary self-parking** for all hotel guests\n• **Valet parking** available at the main entrance (₹200/day)\n• Electric vehicle charging stations available on Level 1\n• Security monitored 24/7"
    },
    # Pool
    {
        "patterns": [r"\bpool\b", r"\bswimming\b", r"\bjacuzzi\b", r"\bhot tub\b"],
        "response": "**Aquatic Facilities** 🏊\n\n• **Infinity Pool** — Open 6:00 AM – 10:00 PM (complimentary for guests)\n• **Presidential Penthouse** includes a private jacuzzi on the terrace\n• **Honeymoon Suite** features a private hot tub\n• Pool towels provided at the pool deck"
    },
    # Contact / Phone
    {
        "patterns": [r"\bcontact\b", r"\bphone\b", r"\bcall\b", r"\breach\b", r"\bnumber\b", r"\bemail\b"],
        "response": "**Contact The Royal Oasis** 📞\n\n• **Front Desk (24/7):** +91 9800-ROYAL-1\n• **Email:** concierge@royaloasis.com\n• **Restaurant Reservations:** Ext. 201\n• **Spa Bookings:** Ext. 301\n• **Housekeeping:** Ext. 401\n• **Emergency:** Ext. 0\n\nYou can also raise a support ticket from your **Dashboard**!"
    },
    # Pets
    {
        "patterns": [r"\bpet(s)?\b", r"\bdog\b", r"\bcat\b", r"\banimal\b"],
        "response": "**Pet Policy** 🐾\n\nThe Royal Oasis is a **pet-friendly hotel**! We welcome small pets (under 10kg) in select rooms for an additional fee of ₹500/night. Please inform us at the time of booking. We provide pet beds, bowls, and complimentary treats!"
    },
    # Amenities
    {
        "patterns": [r"\bamen(it|i)?(ies|y)\b", r"\bfacilities\b", r"\bfeature\b", r"\binclude\b"],
        "response": "**Hotel Amenities** ✨\n\nAll rooms include:\n• High-speed WiFi • Smart TV • Air Conditioning • 24/7 Room Service\n\n**Hotel Facilities:**\n• Infinity Pool & Spa\n• State-of-the-art Fitness Center\n• Fine-dining Restaurant & Bar\n• Business Center & Meeting Rooms\n• Concierge & Valet Services\n• Grand Ballroom for Events\n• Children's Play Area\n• In-house Laundry & Dry Cleaning"
    },
    # Thank you
    {
        "patterns": [r"\bthank(s)?\b", r"\bthank you\b", r"\bgreat\b", r"\bperfect\b", r"\bwonderful\b", r"\bawesome\b"],
        "response": "You're most welcome! 🌟 It's our pleasure to serve you at **The Royal Oasis**. Is there anything else I can help you with? Have a magnificent stay!"
    },
    # Goodbye
    {
        "patterns": [r"\bbye\b", r"\bgoodbye\b", r"\bsee you\b", r"\btake care\b"],
        "response": "Thank you for choosing **The Royal Oasis Hotel**! 👑 We look forward to welcoming you. Have a wonderful day!"
    },
]

# Default fallback response
DEFAULT_RESPONSE = (
    "I'm sorry, I don't have specific information about that. "
    "Our concierge team is available 24/7 to assist you!\n\n"
    "You can ask me about:\n"
    "• 🛏️ Rooms & Suites\n"
    "• 📅 Bookings & Reservations\n"
    "• 🍽️ Restaurant & Dining\n"
    "• 💆 Spa & Wellness\n"
    "• 🏋️ Fitness & Pool\n"
    "• 🎟️ Coupons & Discounts\n"
    "• 🚗 Airport Transfers\n"
    "• 💳 Payment & Billing\n"
    "• 📞 Contact & Support"
)


def get_chatbot_response(message: str) -> str:
    """
    Process user message and return an appropriate hotel FAQ response.
    Uses rule-based pattern matching against predefined FAQ rules.
    """
    if not message or not message.strip():
        return "Please type a message so I can assist you!"

    msg_lower = message.lower().strip()

    # Match against FAQ rules
    for rule in FAQ_RULES:
        for pattern in rule["patterns"]:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                return rule["response"]

    return DEFAULT_RESPONSE
