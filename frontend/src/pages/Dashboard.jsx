import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  const { user, setUser, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Profile edit fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");
  const [preferences, setPreferences] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");

  // Review fields
  const [reviewRoomId, setReviewRoomId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  // Support Tickets fields
  const [tickets, setTickets] = useState([
    { id: 1, subject: "WiFi speed in room 201", status: "resolved", reply: "Our staff has reset the router. Speed is restored." },
    { id: 2, subject: "Late checkout request", status: "pending", reply: null }
  ]);
  const [ticketSubject, setTicketSubject] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setPhoto(user.photo || "");
      setPreferences(user.preferences || "");
      
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await API.get("/bookings/my");
      setBookings(bookingsRes.data);

      const invoicesRes = await API.get("/payments/invoices/my");
      setInvoices(invoicesRes.data);

      const notifsRes = await API.get("/analytics/notifications");
      setNotifications(notifsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileMsg("");
      const res = await API.put("/users/profile", {
        name, phone, address, photo, preferences
      });
      setUser(res.data.user);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileMsg("Failed to update profile details.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      setPassMsg("");
      await API.put("/users/change-password", {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPassMsg("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPassMsg(err.response?.data?.detail || "Failed to update password.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await API.patch(`/bookings/${bookingId}/status?status=cancelled`);
      alert("Booking cancelled successfully.");
      fetchData();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await API.patch(`/analytics/notifications/${id}/read`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setReviewMsg("");
      await API.post("/reviews/", {
        room_id: parseInt(reviewRoomId),
        rating: parseInt(rating),
        comment
      });
      setReviewMsg("Review submitted for approval. Thank you!");
      setComment("");
      setTimeout(() => setReviewRoomId(null), 3000);
    } catch (err) {
      setReviewMsg("Failed to submit review.");
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject) return;
    const newT = {
      id: tickets.length + 1,
      subject: ticketSubject,
      status: "pending",
      reply: null
    };
    setTickets([newT, ...tickets]);
    setTicketSubject("");
    alert("Support ticket raised. Our concierge will review this shortly.");
  };

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Royal <span>Dashboard</span></h2>
        <p className="section-subtitle">Manage reservations, edit profile preferences, and view invoice bills.</p>

        <div style={styles.dashboardLayout}>
          {/* Sidebar Tabs */}
          <nav className="glass-panel" style={styles.tabNav}>
            <button onClick={() => setActiveTab("bookings")} style={styles.tabItem} className={activeTab === "bookings" ? "tab-btn active" : "tab-btn"}>
              📅 Reservations ({bookings.length})
            </button>
            <button onClick={() => setActiveTab("billing")} style={styles.tabItem} className={activeTab === "billing" ? "tab-btn active" : "tab-btn"}>
              💳 Invoice Receipts ({invoices.length})
            </button>
            <button onClick={() => setActiveTab("profile")} style={styles.tabItem} className={activeTab === "profile" ? "tab-btn active" : "tab-btn"}>
              👤 Guest Profile
            </button>
            <button onClick={() => setActiveTab("tickets")} style={styles.tabItem} className={activeTab === "tickets" ? "tab-btn active" : "tab-btn"}>
              🎟️ Support Desk
            </button>
            <button onClick={() => setActiveTab("notifications")} style={styles.tabItem} className={activeTab === "notifications" ? "tab-btn active" : "tab-btn"}>
              🔔 Notifications ({notifications.filter(n => !n.is_read).length})
            </button>
          </nav>

          {/* Main workspace */}
          <main style={styles.workspace}>
            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>My Suite Reservations</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: "#a0aec0" }}>You do not have any room bookings yet.</p>
                ) : (
                  <div style={styles.list}>
                    {bookings.map((b) => (
                      <div key={b.id} style={styles.listItem} className="luxury-card">
                        <div style={styles.listItemHeader}>
                          <div>
                            <span style={styles.bookingId}>Booking ID: #{b.id}</span>
                            <h4 style={{ color: "#fff", marginTop: "4px" }}>Dates: {b.check_in} to {b.check_out}</h4>
                          </div>
                          <span className={`badge ${b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                            {b.status}
                          </span>
                        </div>
                        <div style={styles.bookingRow}>
                          <span>Guests: {b.guests}</span>
                          <span>Total Paid: ₹{b.total_amount}</span>
                        </div>

                        <div style={styles.bookingActions}>
                          {b.status === "pending" && (
                            <button onClick={() => handleCancelBooking(b.id)} style={styles.cancelBtn}>
                              Cancel Reservation
                            </button>
                          )}
                          {b.status === "checked_out" && (
                            <button onClick={() => setReviewRoomId(b.room_id)} className="gold-btn" style={{ padding: "8px 16px", fontSize: "13px" }}>
                              Write Suite Review
                            </button>
                          )}
                        </div>

                        {/* Inline Review Panel */}
                        {reviewRoomId === b.room_id && (
                          <div style={styles.reviewPanel} className="glass-panel">
                            <h4 style={{ color: "#c5a880", marginBottom: "12px" }}>Share Your Experience</h4>
                            {reviewMsg && <p style={{ color: "#10b981", fontSize: "14px", marginBottom: "8px" }}>{reviewMsg}</p>}
                            <form onSubmit={handleSubmitReview} className="luxury-form">
                              <div className="luxury-input-group">
                                <label>RATING (1-5 STARS)</label>
                                <select className="luxury-select" value={rating} onChange={(e) => setRating(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                                  <option value="5">5 - Excellent</option>
                                  <option value="4">4 - Good</option>
                                  <option value="3">3 - Average</option>
                                  <option value="2">2 - Poor</option>
                                  <option value="1">1 - Terrible</option>
                                </select>
                              </div>
                              <div className="luxury-input-group">
                                <label>COMMENTS</label>
                                <textarea rows="3" placeholder="Write a review about the service, amenities, and room cleanliness..." className="luxury-textarea" value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
                              </div>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="gold-btn">Submit Review</button>
                                <button type="button" onClick={() => setReviewRoomId(null)} className="outline-btn">Cancel</button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>Invoices & Payment History</h3>
                {invoices.length === 0 ? (
                  <p style={{ color: "#a0aec0" }}>No bills available.</p>
                ) : (
                  <div style={styles.list}>
                    {invoices.map((inv) => (
                      <div key={inv.id} style={styles.listItem} className="luxury-card">
                        <div style={styles.listItemHeader}>
                          <div>
                            <span style={styles.bookingId}>{inv.invoice_number}</span>
                            <p style={{ color: "#a0aec0", fontSize: "13px", marginTop: "2px" }}>Date: {new Date(inv.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`badge ${inv.status === "paid" ? "badge-success" : "badge-danger"}`}>
                            {inv.status}
                          </span>
                        </div>
                        <div style={styles.billDetails}>
                          <div style={styles.billRow}>
                            <span>Subtotal:</span>
                            <span>₹{Math.round(inv.subtotal)}</span>
                          </div>
                          <div style={styles.billRow}>
                            <span>Luxury Tax (12%):</span>
                            <span>₹{Math.round(inv.tax)}</span>
                          </div>
                          {inv.discount > 0 && (
                            <div style={styles.billRow} className="badge-success">
                              <span>Promo Discount:</span>
                              <span>−₹{Math.round(inv.discount)}</span>
                            </div>
                          )}
                          <div style={styles.billDivider}></div>
                          <div style={{ ...styles.billRow, fontSize: "16px", fontWeight: "700", color: "#10b981" }}>
                            <span>Total Paid:</span>
                            <span>₹{Math.round(inv.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {/* Details edit */}
                <div className="glass-panel" style={styles.card}>
                  <h3 style={styles.cardTitle}>Edit Guest Profile</h3>
                  {profileMsg && <div style={{ ...styles.alert, color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>{profileMsg}</div>}
                  
                  <form onSubmit={handleUpdateProfile} className="luxury-form">
                    <div style={styles.formRow}>
                      <div className="luxury-input-group" style={{ flex: 1 }}>
                        <label>GUEST NAME</label>
                        <input className="luxury-input" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="luxury-input-group" style={{ flex: 1 }}>
                        <label>PHONE NUMBER</label>
                        <input className="luxury-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="luxury-input-group">
                      <label>AVATAR IMAGE URL</label>
                      <input className="luxury-input" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://unsplash.com/...avatar" />
                    </div>

                    <div className="luxury-input-group">
                      <label>RESIDENTIAL ADDRESS</label>
                      <input className="luxury-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Permanent home address" />
                    </div>

                    <div className="luxury-input-group">
                      <label>ROOM PREFERENCES & ALLERGIES</label>
                      <textarea rows="3" className="luxury-textarea" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. Feather pillow allergy, quiet floor, king bed preference" />
                    </div>

                    <button type="submit" className="gold-btn" style={{ width: "fit-content" }}>
                      Save Preferences
                    </button>
                  </form>
                </div>

                {/* Password change */}
                <div className="glass-panel" style={styles.card}>
                  <h3 style={styles.cardTitle}>Change Account Password</h3>
                  {passMsg && <div style={styles.alert}>{passMsg}</div>}
                  <form onSubmit={handleUpdatePassword} className="luxury-form">
                    <div className="luxury-input-group">
                      <label>CURRENT PASSWORD</label>
                      <input type="password" placeholder="••••••••" className="luxury-input" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                    </div>
                    <div className="luxury-input-group">
                      <label>NEW PASSWORD</label>
                      <input type="password" placeholder="••••••••" className="luxury-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="gold-btn" style={{ width: "fit-content" }}>
                      Change Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SUPPORT DESK TAB */}
            {activeTab === "tickets" && (
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>Help & Concierge Support</h3>
                
                <form onSubmit={handleCreateTicket} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                  <input
                    placeholder="How can our concierge assist you today?"
                    className="luxury-input"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    style={{ marginBottom: 0 }}
                    required
                  />
                  <button type="submit" className="gold-btn">Raise Ticket</button>
                </form>

                <div style={styles.list}>
                  {tickets.map((t) => (
                    <div key={t.id} style={styles.listItem} className="luxury-card">
                      <div style={styles.listItemHeader}>
                        <h4 style={{ color: "#fff" }}>{t.subject}</h4>
                        <span className={`badge ${t.status === "resolved" ? "badge-success" : "badge-warning"}`}>
                          {t.status}
                        </span>
                      </div>
                      {t.reply ? (
                        <p style={styles.ticketReply}>🔔 <strong>Concierge Reply:</strong> {t.reply}</p>
                      ) : (
                        <p style={{ color: "#a0aec0", fontSize: "14px", marginTop: "8px" }}>Concierge is reviewing your ticket. Average response time is 10 minutes.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>Notifications Inbox</h3>
                {notifications.length === 0 ? (
                  <p style={{ color: "#a0aec0" }}>Inbox is empty.</p>
                ) : (
                  <div style={styles.list}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{
                        ...styles.listItem,
                        opacity: n.is_read ? 0.7 : 1,
                        borderLeft: n.is_read ? "1px solid rgba(255,255,255,0.06)" : "4px solid var(--primary-gold)"
                      }} className="luxury-card">
                        <div style={styles.listItemHeader}>
                          <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.4" }}>{n.message}</p>
                          {!n.is_read && (
                            <button onClick={() => handleMarkNotifRead(n.id)} style={styles.markReadBtn}>Mark Read</button>
                          )}
                        </div>
                        <span style={{ fontSize: "12px", color: "#a0aec0", marginTop: "8px", display: "block" }}>
                          Received: {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  dashboardLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  tabNav: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    height: "fit-content",
  },
  tabItem: {
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    borderRadius: "6px",
  },
  workspace: {
    flexGrow: 1,
  },
  card: {
    padding: "30px",
  },
  cardTitle: {
    fontSize: "22px",
    color: "#fff",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  listItem: {
    padding: "20px",
  },
  listItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  bookingId: {
    fontSize: "12px",
    color: "#c5a880",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  bookingRow: {
    display: "flex",
    gap: "24px",
    fontSize: "14px",
    color: "#cbd5e0",
  },
  bookingActions: {
    marginTop: "16px",
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1.5px solid #ef4444",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
  },
  reviewPanel: {
    marginTop: "16px",
    padding: "20px",
    border: "1px solid rgba(197, 168, 128, 0.2)",
  },
  billDetails: {
    marginTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "12px",
  },
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#a0aec0",
    marginBottom: "8px",
  },
  billDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
    margin: "8px 0",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  alert: {
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "20px",
  },
  ticketReply: {
    fontSize: "14px",
    color: "#10b981",
    marginTop: "12px",
    padding: "10px",
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "6px",
  },
  markReadBtn: {
    background: "transparent",
    border: "none",
    color: "#c5a880",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  }
};

// Desktop adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.dashboardLayout.flexDirection = "row";
      styles.tabNav.width = "280px";
      styles.tabNav.flexShrink = 0;
    } else {
      styles.dashboardLayout.flexDirection = "column";
      styles.tabNav.width = "100%";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.dashboardLayout.flexDirection = "row";
    styles.tabNav.width = "280px";
    styles.tabNav.flexShrink = 0;
  }
}

export default Dashboard;