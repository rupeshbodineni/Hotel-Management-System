import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Calculations & States
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [bookingStep, setBookingStep] = useState(1); // 1 = Form, 2 = Payment portal popup
  const [submitting, setSubmitting] = useState(false);
  const [couponError, setCouponError] = useState("");
  
  // Checkout simulation
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [razorMobile, setRazorMobile] = useState("");

  useEffect(() => {
    fetchRoomDetails();
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
    }
  }, [id, user]);

  const fetchRoomDetails = async () => {
    try {
      const res = await API.get(`/rooms/${id}`);
      setRoom(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load room details.");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  // Compute pricing
  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights = checkInDate && checkOutDate && checkOutDate > checkInDate
    ? Math.max(Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)), 1)
    : 0;

  const roomPrice = room ? room.price : 0;
  const roomDiscountPercent = room ? room.discount : 0;
  
  // Base cost (price * nights)
  const baseCost = roomPrice * nights;
  
  // Cost after room specific discount
  const costAfterRoomDiscount = roomDiscountPercent > 0 
    ? baseCost * (1 - roomDiscountPercent / 100) 
    : baseCost;
  
  // Cost after coupon discount
  const couponDiscountAmount = appliedCoupon 
    ? costAfterRoomDiscount * (appliedCoupon.discount_percent / 100)
    : 0;
  
  const totalBeforeTax = Math.max(costAfterRoomDiscount - couponDiscountAmount, 0);
  const luxuryTax = totalBeforeTax * 0.12; // 12% luxury tax
  const grandTotal = totalBeforeTax + luxuryTax;

  const handleVerifyAvailability = async () => {
    if (!checkIn || !checkOut) {
      setAvailabilityMessage("Please specify check-in and check-out dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setAvailabilityMessage("Check-out must be after check-in.");
      return;
    }
    try {
      const res = await API.post(`/bookings/check-availability?room_id=${id}&check_in=${checkIn}&check_out=${checkOut}`);
      setIsAvailable(res.data.available);
      if (res.data.available) {
        setAvailabilityMessage("Excellent! Room is available for these dates.");
      } else {
        setAvailabilityMessage("Apologies. This room is reserved during your selected dates.");
      }
    } catch (err) {
      console.error(err);
      setAvailabilityMessage("Error checking availability.");
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      setCouponError("");
      const res = await API.get("/settings/coupons");
      const matched = res.data.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.is_active);
      if (matched) {
        setAppliedCoupon(matched);
      } else {
        setCouponError("Invalid, expired, or inactive coupon code.");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Error checking coupon.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleProceedToPayment = () => {
    if (!isAvailable) {
      alert("Please confirm room availability first.");
      return;
    }
    setBookingStep(2); // Proceed to payment page
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // 1. Create booking
      const bookingRes = await API.post("/bookings", {
        room_id: parseInt(id),
        customer_name: customerName,
        customer_email: customerEmail,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        total_amount: grandTotal
      });

      const bookingId = bookingRes.data.id;

      // 2. Process simulated payment
      await API.post("/payments", {
        booking_id: bookingId,
        amount: grandTotal,
        payment_method: paymentMethod
      });

      alert("Suite reserved successfully! Payment completed and Invoice generated.");
      
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
        <Navbar />
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="skeleton" style={{ width: "300px", height: "40px", margin: "0 auto 20px" }}></div>
          <div className="skeleton" style={{ width: "100%", height: "400px", borderRadius: "12px" }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Reserve <span>Your Stay</span></h2>
        <p className="section-subtitle">Reserve your sanctuary. Secure payment and instant invoice receipt.</p>

        <div style={styles.bookingLayout}>
          {/* Left panel: booking form */}
          <div style={styles.formPanel}>
            {bookingStep === 1 ? (
              <div className="glass-panel" style={styles.panelCard}>
                <h3 style={styles.panelTitle}>Reservation Details</h3>
                <div className="luxury-form">
                  <div className="luxury-input-group">
                    <label>CUSTOMER NAME</label>
                    <input
                      placeholder="Jane Doe"
                      className="luxury-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="luxury-input-group">
                    <label>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      className="luxury-input"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div className="luxury-input-group" style={{ flex: 1 }}>
                      <label>CHECK-IN</label>
                      <input
                        type="date"
                        className="luxury-input"
                        value={checkIn}
                        onChange={(e) => { setCheckIn(e.target.value); setIsAvailable(null); }}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="luxury-input-group" style={{ flex: 1 }}>
                      <label>CHECK-OUT</label>
                      <input
                        type="date"
                        className="luxury-input"
                        value={checkOut}
                        onChange={(e) => { setCheckOut(e.target.value); setIsAvailable(null); }}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <div className="luxury-input-group" style={{ flex: 1 }}>
                      <label>GUESTS</label>
                      <select className="luxury-select" value={guests} onChange={(e) => setGuests(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                      </select>
                    </div>
                    <button type="button" onClick={handleVerifyAvailability} className="outline-btn" style={{ padding: "12px 20px" }}>
                      Check Availability
                    </button>
                  </div>

                  {availabilityMessage && (
                    <div style={{
                      ...styles.msg,
                      color: isAvailable ? "#10b981" : "#ef4444",
                      borderColor: isAvailable ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
                      background: isAvailable ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)"
                    }}>
                      {availabilityMessage}
                    </div>
                  )}

                  {/* Coupon Application */}
                  {nights > 0 && (
                    <div style={styles.couponSection}>
                      <label style={styles.label}>PROMO / COUPON CODE</label>
                      {appliedCoupon ? (
                        <div style={styles.appliedCouponBox}>
                          <span>Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discount_percent}% off)</span>
                          <button type="button" onClick={handleRemoveCoupon} style={styles.removeCouponBtn}>Remove</button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                          <input
                            placeholder="e.g. WELCOME10"
                            className="luxury-input"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            style={{ marginBottom: 0 }}
                          />
                          <button type="submit" className="outline-btn">Apply</button>
                        </form>
                      )}
                      {couponError && <p style={styles.errText}>{couponError}</p>}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="gold-btn"
                    style={{ width: "100%", justifyContent: "center", marginTop: "20px" }}
                    disabled={!isAvailable}
                  >
                    Confirm Booking dates
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Payment Portal */
              <div className="glass-panel" style={styles.panelCard}>
                <div style={styles.portalHeader}>
                  <button onClick={() => setBookingStep(1)} style={styles.backBtn}>← Back</button>
                  <h3 style={styles.portalTitle}>Bespoke Payment Portal</h3>
                </div>

                <form onSubmit={handleConfirmBooking} className="luxury-form">
                  <div className="luxury-input-group">
                    <label>PAYMENT METHOD</label>
                    <select
                      className="luxury-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ backgroundColor: "#141a2b" }}
                    >
                      <option value="cash">Pay at Reception Desk (Cash/Card)</option>
                      <option value="stripe">Stripe Checkout Gateway</option>
                      <option value="razorpay">Razorpay Secured Portal</option>
                    </select>
                  </div>

                  {paymentMethod === "stripe" && (
                    <div style={styles.gatewayPanel} className="glass-panel">
                      <h4 style={{ color: "#c5a880", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>🔒 STRIPE SECURED PAYMENT</h4>
                      <div className="luxury-input-group">
                        <label>CARD NUMBER</label>
                        <input
                          placeholder="4242 •••• •••• 4242"
                          maxLength="16"
                          className="luxury-input"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div className="luxury-input-group" style={{ flex: 1 }}>
                          <label>EXPIRY DATE</label>
                          <input placeholder="MM/YY" maxLength="5" className="luxury-input" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                        </div>
                        <div className="luxury-input-group" style={{ flex: 1 }}>
                          <label>CVV / CVC</label>
                          <input placeholder="123" maxLength="3" className="luxury-input" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "razorpay" && (
                    <div style={styles.gatewayPanel} className="glass-panel">
                      <h4 style={{ color: "#3b82f6", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>💳 RAZORPAY SECURED PORTAL</h4>
                      <div className="luxury-input-group">
                        <label>MOBILE NUMBER FOR UPI/CARD LINK</label>
                        <input
                          placeholder="+91 9988776655"
                          className="luxury-input"
                          value={razorMobile}
                          onChange={(e) => setRazorMobile(e.target.value)}
                          required
                        />
                      </div>
                      <p style={{ fontSize: "12px", color: "#a0aec0" }}>UPI, NetBanking, and Card details options will be simulated on checkout confirmation.</p>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div style={styles.gatewayPanel} className="glass-panel">
                      <h4 style={{ color: "#10b981", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>🏨 PAY AT DESK</h4>
                      <p style={{ fontSize: "14px", color: "#cbd5e0", lineHeight: "1.5" }}>
                        Your reservation will be held in pending check-in status. You can pay with cash or card directly to our front desk receptionist upon arrival.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="gold-btn"
                    style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                    disabled={submitting}
                  >
                    {submitting ? "Processing Reservation..." : `Authorize Payment: ₹${Math.round(grandTotal)}`}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right panel: Summary */}
          <div style={styles.summaryPanel} className="luxury-card">
            <h3 style={styles.summaryTitle}>Suite Bill Summary</h3>
            <div style={styles.roomSummaryHead}>
              <img
                src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600"}
                alt={room.room_type}
                style={styles.roomSummaryImg}
              />
              <div>
                <h4 style={{ color: "#fff" }}>{room.room_type}</h4>
                <p style={{ color: "#c5a880", fontSize: "13px" }}>Room Number: {room.room_number}</p>
              </div>
            </div>

            <div style={styles.calcList}>
              <div style={styles.calcRow}>
                <span>Price per night</span>
                <span>₹{room.price}</span>
              </div>
              <div style={styles.calcRow}>
                <span>Selected nights</span>
                <span>{nights} Nights</span>
              </div>
              
              {room.discount > 0 && (
                <div style={styles.calcRow} className="badge-success">
                  <span>Room Discount ({room.discount}%)</span>
                  <span>−₹{Math.round(baseCost * (room.discount / 100))}</span>
                </div>
              )}

              {appliedCoupon && (
                <div style={styles.calcRow} className="badge-success">
                  <span>Coupon Discount ({appliedCoupon.discount_percent}%)</span>
                  <span>−₹{Math.round(couponDiscountAmount)}</span>
                </div>
              )}

              <div style={styles.divider}></div>

              <div style={styles.calcRow}>
                <span>Subtotal</span>
                <span>₹{Math.round(totalBeforeTax)}</span>
              </div>
              <div style={styles.calcRow}>
                <span>Luxury Tax (12%)</span>
                <span>₹{Math.round(luxuryTax)}</span>
              </div>

              <div style={styles.divider}></div>

              <div style={{ ...styles.calcRow, fontSize: "20px", fontWeight: "700", color: "#10b981" }}>
                <span>Grand Total</span>
                <span>₹{Math.round(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  bookingLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  formPanel: {
    flexGrow: 2,
  },
  panelCard: {
    padding: "30px",
  },
  panelTitle: {
    fontSize: "24px",
    color: "#fff",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  msg: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "14px",
    marginTop: "16px",
  },
  label: {
    fontSize: "11px",
    color: "#c5a880",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "8px",
    display: "block",
  },
  couponSection: {
    marginTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "16px",
  },
  appliedCouponBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#10b981",
  },
  removeCouponBtn: {
    background: "transparent",
    color: "#ef4444",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  errText: {
    color: "#ef4444",
    fontSize: "13px",
    marginTop: "4px",
  },
  summaryPanel: {
    height: "fit-content",
  },
  summaryTitle: {
    fontSize: "22px",
    color: "#fff",
    marginBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
  },
  roomSummaryHead: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },
  roomSummaryImg: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  calcList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    color: "#cbd5e0",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
    margin: "8px 0",
  },
  portalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
  },
  backBtn: {
    background: "transparent",
    color: "#c5a880",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  portalTitle: {
    fontSize: "24px",
    color: "#fff",
  },
  gatewayPanel: {
    padding: "20px",
    backgroundColor: "rgba(11, 15, 25, 0.4)",
    border: "1px solid rgba(255,255,255,0.05)",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.bookingLayout.flexDirection = "row";
      styles.summaryPanel.width = "380px";
      styles.summaryPanel.flexShrink = 0;
    } else {
      styles.bookingLayout.flexDirection = "column";
      styles.summaryPanel.width = "100%";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.bookingLayout.flexDirection = "row";
    styles.summaryPanel.width = "380px";
    styles.summaryPanel.flexShrink = 0;
  }
}

export default Booking;