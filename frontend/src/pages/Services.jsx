import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Services() {
  const { user } = useContext(AuthContext);

  const [services, setServices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServicesData();
  }, [user]);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      const servicesRes = await API.get("/services");
      setServices(servicesRes.data);

      if (user) {
        const historyRes = await API.get("/services/bookings/my");
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || !bookingDate) return;
    if (!user) {
      alert("Please login first to reserve hotel amenities.");
      return;
    }
    try {
      setSubmitting(true);
      
      await API.post("/services/book", {
        service_id: parseInt(selectedServiceId),
        booking_date: bookingDate
      });

      alert("Amenity reserved successfully! Enjoy your experience.");
      setSelectedServiceId("");
      setBookingDate("");
      setBookingTime("");
      fetchServicesData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceDetails = (serviceId) => {
    const s = services.find(srv => srv.id === serviceId);
    return s ? `${s.name} (₹${s.price})` : "Hotel Amenity";
  };

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Header */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <span style={styles.heroSub}>BESPOKE COMFORT</span>
          <h1 style={styles.heroTitle}>Royal Experiences & Amenities</h1>
          <p style={styles.heroText}>From soothing spa therapy to professional gym trainers, private airport transfers, and grand ballroom rentals.</p>
        </div>
      </section>

      <div className="container">
        <div style={styles.servicesLayout}>
          {/* Left panel: List services */}
          <div style={styles.servicesListColumn}>
            <h3 style={styles.sectionTitle}>Exclusive <span>Amenities</span></h3>
            
            {loading ? (
              <div className="skeleton" style={{ height: "400px", width: "100%" }}></div>
            ) : (
              <div style={styles.servicesGrid}>
                {services.map(s => (
                  <div key={s.id} className="luxury-card" style={styles.serviceCard}>
                    <div style={styles.serviceHead}>
                      <h4 style={{ color: "#fff", fontSize: "18px" }}>{s.name}</h4>
                      <span className="badge badge-info">{s.service_type.toUpperCase()}</span>
                    </div>
                    <p style={{ color: "#a0aec0", fontSize: "14px", margin: "10px 0", lineHeight: "1.4" }}>{s.description}</p>
                    <div style={styles.serviceFooter}>
                      <span style={{ color: "#10b981", fontWeight: "700", fontSize: "16px" }}>₹{s.price}</span>
                      <button onClick={() => setSelectedServiceId(s.id.toString())} className="gold-btn" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: reserve and history */}
          <div style={styles.sidebarColumn}>
            {/* Booking form */}
            <div className="glass-panel" style={{ ...styles.card, marginBottom: "30px" }}>
              <h3 style={styles.cardTitle}>Reserve Amenity</h3>
              <form onSubmit={handleBookService} className="luxury-form">
                <div className="luxury-input-group">
                  <label>SELECT AMENITY / SERVICE</label>
                  <select className="luxury-select" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} style={{ backgroundColor: "#141a2b" }} required>
                    <option value="">Select option...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                    ))}
                  </select>
                </div>

                <div className="luxury-input-group">
                  <label>RESERVATION DATE</label>
                  <input
                    type="date"
                    className="luxury-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="luxury-input-group">
                  <label>TIME SLOT</label>
                  <select className="luxury-select" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                    <option value="09:00">09:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                  </select>
                </div>

                <button type="submit" className="gold-btn" style={{ width: "100%", justifyContent: "center" }} disabled={submitting}>
                  {submitting ? "Booking..." : "Book Now"}
                </button>
              </form>
            </div>

            {/* Booked History */}
            {user && (
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>My Service Bookings</h3>
                {history.length === 0 ? (
                  <p style={{ color: "#a0aec0", fontSize: "14px" }}>No previous bookings.</p>
                ) : (
                  <div style={styles.historyList}>
                    {history.map(hb => (
                      <div key={hb.id} style={styles.historyItem} className="luxury-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h5 style={{ color: "#fff", fontSize: "14px" }}>{getServiceDetails(hb.service_id)}</h5>
                          <span className={`badge ${hb.status === "confirmed" ? "badge-success" : "badge-danger"}`}>{hb.status}</span>
                        </div>
                        <p style={{ color: "#cbd5e0", fontSize: "12px", marginTop: "4px" }}>Scheduled Date: {hb.booking_date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  hero: {
    height: "50vh",
    background: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600') center/cover",
    position: "relative",
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
    backgroundColor: "rgba(11, 15, 25, 0.75)",
  },
  heroContent: {
    position: "relative",
    zIndex: 5,
    maxWidth: "800px",
    padding: "0 20px",
  },
  heroSub: {
    color: "#c5a880",
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: "700",
    display: "block",
    marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "44px",
    color: "#fff",
    marginBottom: "14px",
  },
  heroText: {
    color: "#cbd5e0",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  servicesLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  servicesListColumn: {
    flexGrow: 2,
  },
  sectionTitle: {
    fontSize: "28px",
    marginBottom: "24px",
    color: "#fff",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  serviceCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  serviceHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },
  serviceFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "12px",
    marginTop: "12px",
  },
  sidebarColumn: {
    flexGrow: 1,
  },
  card: {
    padding: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    color: "#fff",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
    marginBottom: "16px",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyItem: {
    padding: "12px",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.servicesLayout.flexDirection = "row";
      styles.sidebarColumn.width = "380px";
      styles.sidebarColumn.flexShrink = 0;
    } else {
      styles.servicesLayout.flexDirection = "column";
      styles.sidebarColumn.width = "100%";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.servicesLayout.flexDirection = "row";
    styles.sidebarColumn.width = "380px";
    styles.sidebarColumn.flexShrink = 0;
  }
}

export default Services;
