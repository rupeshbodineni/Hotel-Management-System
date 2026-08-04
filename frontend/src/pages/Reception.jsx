import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Reception() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Walk-in booking state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [walkinMsg, setWalkinMsg] = useState("");

  // Print invoice modal state
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    fetchReceptionData();
  }, []);

  const fetchReceptionData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await API.get("/bookings");
      setBookings(bookingsRes.data);

      const roomsRes = await API.get("/rooms?status=available");
      setRooms(roomsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWalkin = async (e) => {
    e.preventDefault();
    if (!selectedRoomId || !checkIn || !checkOut) return;
    try {
      setWalkinMsg("");
      const roomObj = rooms.find(r => r.id === parseInt(selectedRoomId));
      if (!roomObj) return;

      const days = Math.max(Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)), 1);
      const totalAmount = roomObj.price * days;

      // 1. Create confirmed booking directly
      const bRes = await API.post("/bookings/", {
        room_id: parseInt(selectedRoomId),
        customer_name: customerName,
        customer_email: customerEmail,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
        total_amount: totalAmount
      });

      // Confirm status immediately
      const bookingId = bRes.data.id;
      await API.patch(`/bookings/${bookingId}/status?status=confirmed`);

      // 2. Add payment immediately
      await API.post("/payments/", {
        booking_id: bookingId,
        amount: totalAmount,
        payment_method: "cash"
      });

      setWalkinMsg("Walk-in booking logged and paid successfully!");
      setCustomerName("");
      setCustomerEmail("");
      setSelectedRoomId("");
      fetchReceptionData();
    } catch (err) {
      setWalkinMsg(err.response?.data?.detail || "Failed to log walk-in reservation.");
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await API.patch(`/bookings/${bookingId}/status?status=${status}`);
      fetchReceptionData();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleOpenInvoice = async (bookingId) => {
    try {
      const invoicesRes = await API.get("/payments/invoices/all");
      const matched = invoicesRes.data.find(inv => inv.booking_id === bookingId);
      if (matched) {
        setActiveInvoice(matched);
      } else {
        alert("No invoice found. Please make sure payment is processed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toString().includes(searchTerm)
  );

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Front Desk <span>Reception Desk</span></h2>
        <p className="section-subtitle">Assign rooms, record walk-in bookings, manage check-in/out registers, and print receipts.</p>

        <div style={styles.receptionLayout}>
          {/* Left Panel: Register Walk-in */}
          <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
            <h3 style={styles.cardTitle}>Walk-in Reservation</h3>
            {walkinMsg && <div style={{ ...styles.alert, color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>{walkinMsg}</div>}
            
            <form onSubmit={handleCreateWalkin} className="luxury-form">
              <div className="luxury-input-group">
                <label>GUEST NAME</label>
                <input placeholder="Walk-in Guest Name" className="luxury-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
              <div className="luxury-input-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" placeholder="guest@example.com" className="luxury-input" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
              </div>
              <div className="luxury-input-group">
                <label>ASSIGN VACANT SUITE</label>
                <select className="luxury-select" value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} style={{ backgroundColor: "#141a2b" }} required>
                  <option value="">Choose a room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.room_number} − {r.room_type} (₹{r.price}/N)</option>
                  ))}
                </select>
              </div>
              <div style={styles.formRow}>
                <div className="luxury-input-group" style={{ flex: 1 }}>
                  <label>CHECK-IN</label>
                  <input type="date" className="luxury-input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="luxury-input-group" style={{ flex: 1 }}>
                  <label>CHECK-OUT</label>
                  <input type="date" className="luxury-input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split("T")[0]} required />
                </div>
              </div>
              <div className="luxury-input-group">
                <label>GUEST COUNT</label>
                <select className="luxury-select" value={guests} onChange={(e) => setGuests(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
              <button type="submit" className="gold-btn" style={{ justifyContent: "center" }}>
                Confirm Walk-in & Pay Cash
              </button>
            </form>
          </div>

          {/* Right Panel: Guests Register list */}
          <div className="glass-panel" style={{ ...styles.card, flex: 2 }}>
            <div style={styles.searchBar}>
              <h3 style={{ color: "#fff", margin: 0 }}>Roster Register</h3>
              <input
                placeholder="Search guest by name/email/ID..."
                className="luxury-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "260px", marginBottom: 0 }}
              />
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: "300px", width: "100%" }}></div>
            ) : filteredBookings.length === 0 ? (
              <p style={{ color: "#a0aec0", marginTop: "20px" }}>No reservations found matching search term.</p>
            ) : (
              <div style={styles.registerList}>
                {filteredBookings.map((b) => (
                  <div key={b.id} style={styles.registerItem} className="luxury-card">
                    <div style={styles.registerHeader}>
                      <div>
                        <span style={styles.bookingId}>ID: #{b.id}</span>
                        <h4 style={{ color: "#fff" }}>{b.customer_name}</h4>
                        <p style={{ color: "#a0aec0", fontSize: "12px" }}>{b.customer_email} | Guests: {b.guests}</p>
                        <p style={{ color: "#c5a880", fontSize: "13px", marginTop: "4px" }}>Suite Room ID: {b.room_id} | Dates: {b.check_in} to {b.check_out}</p>
                      </div>
                      <span className={`badge ${b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                        {b.status}
                      </span>
                    </div>

                    <div style={styles.registerActions}>
                      {b.status === "confirmed" && (
                        <button onClick={() => handleStatusChange(b.id, "checked_in")} className="gold-btn" style={styles.btnSmall}>
                          Check In
                        </button>
                      )}
                      {b.status === "checked_in" && (
                        <button onClick={() => handleStatusChange(b.id, "checked_out")} className="gold-btn" style={styles.btnSmall}>
                          Check Out
                        </button>
                      )}
                      {(b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out") && (
                        <button onClick={() => handleOpenInvoice(b.id)} className="outline-btn" style={{ padding: "6px 12px", fontSize: "12px" }}>
                          🖨️ View Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Printable Dialog Modal Popup */}
      {activeInvoice && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={styles.modalHead}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#c5a880" }}>THE ROYAL OASIS − RECEIPT</h3>
              <button onClick={() => setActiveInvoice(null)} style={styles.closeBtn}>Close</button>
            </div>
            
            <div style={styles.invoicePrintArea}>
              <div style={styles.invoiceMeta}>
                <div>
                  <p><strong>Invoice Number:</strong> {activeInvoice.invoice_number}</p>
                  <p><strong>Date Generated:</strong> {new Date(activeInvoice.created_at).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p><strong>Booking Ref:</strong> #{activeInvoice.booking_id}</p>
                  <p><strong>Payment Status:</strong> PAID (CASH/CARD)</p>
                </div>
              </div>

              <div style={styles.invoiceItems}>
                <div style={styles.invoiceItemHeader}>
                  <span>Item Description</span>
                  <span>Total Amount (INR)</span>
                </div>
                <div style={styles.invoiceItemRow}>
                  <span>Luxury Accommodation & Royal Buffet Breakfast</span>
                  <span>₹{Math.round(activeInvoice.subtotal)}</span>
                </div>
                <div style={styles.invoiceItemRow}>
                  <span>Luxury Tax & Surcharges (12%)</span>
                  <span>₹{Math.round(activeInvoice.tax)}</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div style={styles.invoiceItemRow} className="badge-success">
                    <span>Campaign Coupon Promo Discount</span>
                    <span>−₹{Math.round(activeInvoice.discount)}</span>
                  </div>
                )}
                <div style={styles.invoiceTotalRow}>
                  <span>Total Bill Amount</span>
                  <span>₹{Math.round(activeInvoice.total)}</span>
                </div>
              </div>

              <p style={{ textAlign: "center", fontStyle: "italic", fontSize: "12px", color: "#a0aec0", marginTop: "30px" }}>
                Thank you for choosing The Royal Oasis. Have a pleasant journey.
              </p>
            </div>

            <button onClick={() => window.print()} className="gold-btn" style={{ marginTop: "20px", width: "100%", justifyContent: "center" }}>
              Print Receipt
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const styles = {
  receptionLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  card: {
    padding: "30px",
  },
  cardTitle: {
    fontSize: "20px",
    color: "#fff",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  searchBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  registerList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  registerItem: {
    padding: "20px",
  },
  registerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookingId: {
    fontSize: "11px",
    color: "#c5a880",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  registerActions: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  btnSmall: {
    padding: "6px 14px",
    fontSize: "12px",
  },
  alert: {
    padding: "12px",
    border: "1px solid",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "20px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    maxWidth: "500px",
    width: "90%",
    padding: "30px",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "14px",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "transparent",
    color: "#ef4444",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  invoicePrintArea: {
    backgroundColor: "#141a2b",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  invoiceMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#cbd5e0",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  invoiceItems: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  invoiceItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#c5a880",
    fontWeight: "700",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "6px",
  },
  invoiceItemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#cbd5e0",
  },
  invoiceTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    fontWeight: "700",
    color: "#10b981",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "10px",
    marginTop: "10px",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.receptionLayout.flexDirection = "row";
    } else {
      styles.receptionLayout.flexDirection = "column";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.receptionLayout.flexDirection = "row";
  }
}

export default Reception;
