import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Home() {
  const navigate = useNavigate();
  
  // Search widget state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  
  // Featured rooms state
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      const res = await API.get("/rooms?is_featured=1");
      setFeaturedRooms(res.data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching featured rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const faqs = [
    { q: "What are the standard Check-in and Check-out times?", a: "Standard check-in is at 2:00 PM and check-out is at 12:00 PM. Early check-in or late check-out is subject to availability and might incur additional fees." },
    { q: "Is breakfast included in the booking rate?", a: "Yes, all our luxury room bookings include a complimentary royal buffet breakfast at our signature restaurant." },
    { q: "Do you offer airport transfer services?", a: "Absolutely. We provide luxury chauffeured private transfers in high-end sedans. You can reserve this service via the services module or contact the front desk." },
    { q: "What is your cancellation policy?", a: "Bookings can be cancelled free of charge up to 48 hours prior to arrival. Cancellations made within 48 hours are subject to a one-night room charge penalty." }
  ];

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent} className="animate-fade-in">
          <span style={styles.heroSub}>EXPERIENCE TRANQUIL LUXURY</span>
          <h1 style={styles.heroTitle}>A Sanctuary of Elegance & Comfort</h1>
          <p style={styles.heroText}>Immerse yourself in world-class service, gourmet fine dining, and breathtaking vistas at our royal oasis.</p>
          
          {/* Quick Search Widget */}
          <form onSubmit={handleSearch} className="glass-panel" style={styles.searchWidget}>
            <div style={styles.searchFields}>
              <div style={styles.fieldGroup}>
                <label style={styles.searchLabel}>CHECK-IN DATE</label>
                <input
                  type="date"
                  style={styles.searchInput}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.searchLabel}>CHECK-OUT DATE</label>
                <input
                  type="date"
                  style={styles.searchInput}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.searchLabel}>GUESTS</label>
                <select
                  style={styles.searchSelect}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              <button type="submit" className="gold-btn" style={styles.searchBtn}>
                Search Suites
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features & Facilities */}
      <section className="container">
        <h2 className="section-title">Royal <span>Privileges</span> & Amenities</h2>
        <p className="section-subtitle">We offer bespoke comforts and stellar facilities to elevate your accommodation experience.</p>
        
        <div className="grid-3">
          <div className="luxury-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>🍽️</div>
            <h3 style={styles.featureTitle}>Fine Culinary Dining</h3>
            <p style={styles.featureText}>Indulge in exquisite gourmet creations crafted by Michelin-starred culinary professionals.</p>
          </div>
          <div className="luxury-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>💆‍♀️</div>
            <h3 style={styles.featureTitle}>Imperial Wellness Spa</h3>
            <p style={styles.featureText}>Rejuvenate your senses with holistic massage therapies and signature herbal skincare rituals.</p>
          </div>
          <div className="luxury-card" style={styles.featureCard}>
            <div style={styles.featureIcon}>🏊‍♂️</div>
            <h3 style={styles.featureTitle}>Infinity Sky Pool</h3>
            <p style={styles.featureText}>Swim with endless horizons in our temperature-controlled rooftop swimming pool.</p>
          </div>
        </div>
      </section>

      {/* Popular Rooms Showcase */}
      <section style={styles.darkSection}>
        <div className="container">
          <h2 className="section-title">Our Featured <span>Signature Suites</span></h2>
          <p className="section-subtitle">Explore our highly requested rooms offering peerless luxury and amenities.</p>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div className="skeleton" style={{width: "100%", height: "350px", borderRadius: "12px"}}></div>
              <div className="skeleton" style={{width: "100%", height: "350px", borderRadius: "12px"}}></div>
              <div className="skeleton" style={{width: "100%", height: "350px", borderRadius: "12px"}}></div>
            </div>
          ) : (
            <div className="grid-3">
              {featuredRooms.map((room) => (
                <div key={room.id} className="luxury-card" style={styles.suiteCard}>
                  <img src={room.image_url} alt={room.room_type} style={styles.suiteImg} />
                  <div style={styles.suiteInfo}>
                    <h3 style={styles.suiteType}>{room.room_type}</h3>
                    <p style={styles.suiteDesc}>{room.description?.slice(0, 80)}...</p>
                    <div style={styles.suiteFooter}>
                      <span style={styles.suitePrice}>₹{room.price}/Night</span>
                      <button onClick={() => navigate(`/booking/${room.id}`)} className="gold-btn" style={styles.suiteBtn}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hotel Modules Showcase Panel */}
      <section className="container" style={styles.splitShowcase}>
        <div style={styles.showcaseContent}>
          <span style={styles.showcaseSub}>BESPOKE LIVING</span>
          <h2 style={styles.showcaseTitle}>Premium Services Designed for You</h2>
          <p style={styles.showcaseText}>Whether reserving a banquet for your dream wedding, booking a relaxing facial massage, or ordering gourmet local recipes directly to your bed, our platform handles it seamlessly.</p>
          <div style={styles.showcaseButtons}>
            <button onClick={() => navigate("/restaurant")} className="gold-btn">Order Food</button>
            <button onClick={() => navigate("/services")} className="outline-btn">Explore Services</button>
          </div>
        </div>
        <div style={styles.showcaseImgWrapper}>
          <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600" alt="Spa and Wellness" style={styles.showcaseImg} />
        </div>
      </section>

      {/* Guest Testimonials */}
      <section style={styles.darkSection}>
        <div className="container">
          <h2 className="section-title">Whispers of <span>Satisfaction</span></h2>
          <p className="section-subtitle">Read what our distinguished guests write about their royal stays.</p>

          <div className="grid-3">
            <div className="glass-panel" style={styles.reviewCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.reviewText}>"An absolute masterpiece of hospitality. The Presidential Penthouse was breathtaking, and the 24/7 butler service was prompt. I will return next winter."</p>
              <h4 style={styles.reviewAuthor}>- Lord Evelyn Sterling</h4>
            </div>
            <div className="glass-panel" style={styles.reviewCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.reviewText}>"The Imperial Spa stone therapy helped me dissolve months of stress. Dining at the restaurant was a culinary delight. Highly recommended."</p>
              <h4 style={styles.reviewAuthor}>- Dr. Natasha Romanoff</h4>
            </div>
            <div className="glass-panel" style={styles.reviewCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.reviewText}>"Smooth booking workflow, immaculate room cleaning status, and exceptionally professional front office desk desk desk desk receptionist. 10/10."</p>
              <h4 style={styles.reviewAuthor}>- Marcus Aurelius</h4>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container" style={{maxWidth: "800px"}}>
        <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
        <p style={{textAlign: "center", color: "#a0aec0", marginBottom: "30px"}}>Have questions? Find quick answers right here.</p>

        <div style={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem} className="glass-panel">
              <div style={styles.faqQuestion} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                <h4>{faq.q}</h4>
                <span style={styles.faqToggle}>{activeFaq === index ? "−" : "+"}</span>
              </div>
              {activeFaq === index && (
                <div style={styles.faqAnswer}>
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={styles.newsletterSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.newsletterContent}>
          <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: "32px", marginBottom: "10px"}}>Subscribe to Royal Offers</h2>
          <p style={{color: "#cbd5e0", fontSize: "15px", marginBottom: "24px"}}>Receive seasonal packages, new suite opening notices, and chef specials directly in your inbox.</p>
          
          {subscribed ? (
            <div style={styles.successMessage}>
              Thank you! You have been successfully added to our royal guest list.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email address"
                style={styles.newsInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="gold-btn" style={styles.newsBtn}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="container">
        <h2 className="section-title">Contact <span>Our Sanctuary</span></h2>
        <p className="section-subtitle">Reach out to plan your bespoke luxury stay or reserve a private event hall.</p>
        
        <div className="grid-2">
          <div className="luxury-card" style={styles.contactDetails}>
            <h3 style={{color: "#fff", marginBottom: "20px"}}>Reach Us</h3>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📍</span>
              <div>
                <h4>Address</h4>
                <p style={{color: "#a0aec0"}}>123 Luxury Boulevard, Palace District, Udaipur, India</p>
              </div>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📞</span>
              <div>
                <h4>Phone</h4>
                <p style={{color: "#a0aec0"}}>+91 294 88776655 / +91 9988776655</p>
              </div>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>✉️</span>
              <div>
                <h4>Email</h4>
                <p style={{color: "#a0aec0"}}>reservations@theroyaloasis.com</p>
              </div>
            </div>
          </div>
          
          <div className="luxury-card">
            <h3 style={{color: "#fff", marginBottom: "20px"}}>Send Enquiry</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert("Enquiry Sent! Our concierge team will reach out within 2 hours."); e.target.reset(); }} className="luxury-form">
              <div className="luxury-input-group">
                <label>YOUR NAME</label>
                <input placeholder="Jane Doe" className="luxury-input" required />
              </div>
              <div className="luxury-input-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" placeholder="jane@example.com" className="luxury-input" required />
              </div>
              <div className="luxury-input-group">
                <label>MESSAGE / ENQUIRY</label>
                <textarea rows="4" placeholder="How can our concierge assist you?" className="luxury-textarea" required></textarea>
              </div>
              <button type="submit" className="gold-btn">Submit Enquiry</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#0b0f19",
  },
  hero: {
    height: "90vh",
    position: "relative",
    background: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600') center/cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(to bottom, rgba(11, 15, 25, 0.4) 0%, rgba(11, 15, 25, 0.95) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 5,
    maxWidth: "850px",
    padding: "20px",
  },
  heroSub: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#c5a880",
    letterSpacing: "3px",
    display: "block",
    marginBottom: "16px",
  },
  heroTitle: {
    fontSize: "52px",
    color: "#fff",
    marginBottom: "16px",
    lineHeight: "1.2",
  },
  heroText: {
    fontSize: "17px",
    color: "#cbd5e0",
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  searchWidget: {
    padding: "24px 30px",
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "rgba(11, 15, 25, 0.9)",
    border: "1px solid rgba(197, 168, 128, 0.3)",
  },
  searchFields: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    alignItems: "flex-end",
  },
  fieldGroup: {
    flex: 1,
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "6px",
  },
  searchLabel: {
    fontSize: "11px",
    color: "#c5a880",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  searchInput: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "10px",
    color: "#fff",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
  },
  searchSelect: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "10px",
    color: "#fff",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#141a2b"
  },
  searchBtn: {
    padding: "12px 28px",
    fontSize: "14px",
  },
  featureCard: {
    textAlign: "center",
    padding: "36px 24px",
  },
  featureIcon: {
    fontSize: "36px",
    marginBottom: "16px",
  },
  featureTitle: {
    fontSize: "20px",
    color: "#fff",
    marginBottom: "10px",
  },
  featureText: {
    color: "#a0aec0",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  darkSection: {
    backgroundColor: "#080c14",
    padding: "80px 0",
    borderTop: "1px solid rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  loadingContainer: {
    display: "flex",
    gap: "20px",
  },
  suiteCard: {
    padding: 0,
    overflow: "hidden",
  },
  suiteImg: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },
  suiteInfo: {
    padding: "20px",
  },
  suiteType: {
    color: "#fff",
    fontSize: "20px",
    marginBottom: "8px",
  },
  suiteDesc: {
    color: "#a0aec0",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  suiteFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "12px",
  },
  suitePrice: {
    color: "#10b981",
    fontSize: "18px",
    fontWeight: "700",
  },
  suiteBtn: {
    padding: "8px 16px",
    fontSize: "13px",
  },
  splitShowcase: {
    display: "flex",
    flexWrap: "wrap",
    gap: "40px",
    alignItems: "center",
    padding: "80px 0",
  },
  showcaseContent: {
    flex: 1,
    minWidth: "300px",
  },
  showcaseSub: {
    color: "#c5a880",
    fontWeight: "600",
    letterSpacing: "2px",
    fontSize: "13px",
    display: "block",
    marginBottom: "10px",
  },
  showcaseTitle: {
    fontSize: "36px",
    color: "#fff",
    marginBottom: "16px",
  },
  showcaseText: {
    color: "#a0aec0",
    lineHeight: "1.6",
    fontSize: "15px",
    marginBottom: "28px",
  },
  showcaseButtons: {
    display: "flex",
    gap: "16px",
  },
  showcaseImgWrapper: {
    flex: 1,
    minWidth: "300px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
    border: "1px solid rgba(197, 168, 128, 0.2)",
  },
  showcaseImg: {
    width: "100%",
    height: "380px",
    objectFit: "cover",
  },
  reviewCard: {
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  stars: {
    color: "#f59e0b",
    marginBottom: "16px",
  },
  reviewText: {
    fontStyle: "italic",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#cbd5e0",
    marginBottom: "16px",
  },
  reviewAuthor: {
    color: "#c5a880",
    fontSize: "13px",
    letterSpacing: "1px",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  faqItem: {
    padding: "16px 24px",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "8px",
  },
  faqQuestion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  faqToggle: {
    fontSize: "20px",
    color: "#c5a880",
    fontWeight: "700",
  },
  faqAnswer: {
    marginTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "12px",
    color: "#a0aec0",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  newsletterSection: {
    position: "relative",
    padding: "80px 0",
    background: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600') center/cover",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
  },
  newsletterContent: {
    position: "relative",
    zIndex: 5,
    maxWidth: "600px",
    padding: "0 20px",
  },
  newsletterForm: {
    display: "flex",
    gap: "10px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  newsInput: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(11, 15, 25, 0.8)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  newsBtn: {
    padding: "0 24px",
  },
  successMessage: {
    padding: "12px",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid #10b981",
    color: "#10b981",
    borderRadius: "6px",
    fontWeight: "600",
  },
  contactDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  contactItem: {
    display: "flex",
    gap: "16px",
  },
  contactIcon: {
    fontSize: "24px",
  },
};

export default Home;