import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Admin() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rooms CRUD states
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoomNo, setNewRoomNo] = useState("");
  const [newRoomType, setNewRoomType] = useState("Deluxe Room");
  const [newPrice, setNewPrice] = useState("");
  const [newCapacity, setNewCapacity] = useState("2");
  const [newFloor, setNewFloor] = useState("1");
  const [newDiscount, setNewDiscount] = useState("0");
  const [newFeatured, setNewFeatured] = useState("0");
  const [newDesc, setNewDesc] = useState("");
  const [newAmenities, setNewAmenities] = useState("WiFi, AC, TV");
  const [newImage, setNewImage] = useState("");

  // Reservations states
  const [bookings, setBookings] = useState([]);

  // Reviews states
  const [pendingReviews, setPendingReviews] = useState([]);

  // Staff states
  const [staff, setStaff] = useState([]);
  const [newStaffUser, setNewStaffUser] = useState("");
  const [newStaffDept, setNewStaffDept] = useState("Housekeeping");
  const [newStaffSalary, setNewStaffSalary] = useState("25000");
  const [newStaffShift, setNewStaffShift] = useState("morning");
  
  // Coupons states
  const [coupons, setCoupons] = useState([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPct, setNewCouponPct] = useState("10");
  const [newCouponDate, setNewCouponDate] = useState("");

  useEffect(() => {
    // Role-based protection: if not admin or manager, redirect
    if (!authLoading) {
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        navigate("/login");
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (activeTab === "analytics") {
        const res = await API.get("/analytics/dashboard");
        setStats(res.data.stats);
        setActivities(res.data.activities);
        setCharts(res.data.charts);
      } else if (activeTab === "rooms") {
        const res = await API.get("/rooms");
        setRooms(res.data);
      } else if (activeTab === "reservations") {
        const res = await API.get("/bookings");
        setBookings(res.data);
      } else if (activeTab === "reviews") {
        const res = await API.get("/reviews/pending");
        setPendingReviews(res.data);
      } else if (activeTab === "staff") {
        const res = await API.get("/staff");
        setStaff(res.data);
      } else if (activeTab === "settings") {
        const res = await API.get("/settings/coupons");
        setCoupons(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Rooms operations
  const handleCreateOrUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        room_number: newRoomNo,
        room_type: newRoomType,
        price: parseFloat(newPrice),
        capacity: parseInt(newCapacity),
        floor_number: parseInt(newFloor),
        discount: parseFloat(newDiscount),
        is_featured: parseInt(newFeatured),
        description: newDesc,
        amenities: newAmenities,
        image_url: newImage
      };

      if (editingRoom) {
        await API.put(`/rooms/${editingRoom.id}`, payload);
        alert("Room updated successfully.");
      } else {
        await API.post("/rooms/", payload);
        alert("Room created successfully.");
      }

      setEditingRoom(null);
      clearRoomForm();
      fetchAdminData();
    } catch (err) {
      alert("Failed to save room details.");
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setNewRoomNo(room.room_number);
    setNewRoomType(room.room_type);
    setNewPrice(room.price.toString());
    setNewCapacity(room.capacity.toString());
    setNewFloor(room.floor_number.toString());
    setNewDiscount(room.discount.toString());
    setNewFeatured(room.is_featured.toString());
    setNewDesc(room.description || "");
    setNewAmenities(room.amenities || "");
    setNewImage(room.image_url || "");
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await API.delete(`/rooms/${roomId}`);
      fetchAdminData();
    } catch (err) {
      alert("Error deleting room.");
    }
  };

  const clearRoomForm = () => {
    setNewRoomNo("");
    setNewPrice("");
    setNewDesc("");
    setNewImage("");
    setNewAmenities("WiFi, AC, TV");
  };

  // Booking actions
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await API.patch(`/bookings/${bookingId}/status?status=${status}`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Reviews actions
  const handleApproveReview = async (reviewId) => {
    try {
      await API.put(`/reviews/${reviewId}/approve`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to approve review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  // Staff operations
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      // Find user id by listing users or take a input
      await API.post("/staff/", {
        user_id: parseInt(newStaffUser),
        department: newStaffDept,
        salary: parseFloat(newStaffSalary),
        shift: newStaffShift
      });
      alert("Staff profile added.");
      setNewStaffUser("");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add staff record.");
    }
  };

  const handleUpdateStaffShift = async (staffId, shift) => {
    try {
      await API.patch(`/staff/${staffId}/shift`, { shift });
      fetchAdminData();
    } catch (err) {
      alert("Error updating shift.");
    }
  };

  // Coupon operations
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post("/settings/coupons", {
        code: newCouponCode,
        discount_percent: parseFloat(newCouponPct),
        valid_until: newCouponDate
      });
      alert("Coupon added successfully.");
      setNewCouponCode("");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add coupon.");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await API.delete(`/settings/coupons/${couponId}`);
      fetchAdminData();
    } catch (err) {
      alert("Error removing coupon.");
    }
  };

  if (authLoading) {
    return <div style={{ color: "#fff", textAlign: "center", padding: "100px 0" }}>Loading session...</div>;
  }

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Imperial <span>Management Desk</span></h2>
        <p className="section-subtitle">Hotel analytics and inventory control desk.</p>

        <div style={styles.adminLayout}>
          {/* Admin Navigation */}
          <nav className="glass-panel" style={styles.tabNav}>
            <button onClick={() => setActiveTab("analytics")} style={styles.tabItem} className={activeTab === "analytics" ? "tab-btn active" : "tab-btn"}>
              📊 Hotel Analytics
            </button>
            <button onClick={() => setActiveTab("rooms")} style={styles.tabItem} className={activeTab === "rooms" ? "tab-btn active" : "tab-btn"}>
              🏨 Rooms Management
            </button>
            <button onClick={() => setActiveTab("reservations")} style={styles.tabItem} className={activeTab === "reservations" ? "tab-btn active" : "tab-btn"}>
              📅 Bookings Review
            </button>
            <button onClick={() => setActiveTab("staff")} style={styles.tabItem} className={activeTab === "staff" ? "tab-btn active" : "tab-btn"}>
              👥 Staff Roster
            </button>
            <button onClick={() => setActiveTab("reviews")} style={styles.tabItem} className={activeTab === "reviews" ? "tab-btn active" : "tab-btn"}>
              ⭐ Review Moderation
            </button>
            <button onClick={() => setActiveTab("settings")} style={styles.tabItem} className={activeTab === "settings" ? "tab-btn active" : "tab-btn"}>
              ⚙️ Hotel Settings & Coupons
            </button>
          </nav>

          {/* Admin Workspace */}
          <main style={styles.workspace}>
            {loading ? (
              <div className="skeleton" style={{ height: "450px", width: "100%", borderRadius: "12px" }}></div>
            ) : (
              <>
                {/* ANALYTICS TAB */}
                {activeTab === "analytics" && stats && (
                  <div style={styles.analyticsPane}>
                    {/* Cards */}
                    <div style={styles.statCards}>
                      <div className="luxury-card" style={styles.statCard}>
                        <h4 style={{ color: "#a0aec0" }}>TOTAL REVENUE</h4>
                        <p style={{ ...styles.statVal, color: "#10b981" }}>₹{Math.round(stats.totalRevenue)}</p>
                      </div>
                      <div className="luxury-card" style={styles.statCard}>
                        <h4 style={{ color: "#a0aec0" }}>TODAY'S SALES</h4>
                        <p style={{ ...styles.statVal, color: "#10b981" }}>₹{Math.round(stats.todayRevenue)}</p>
                      </div>
                      <div className="luxury-card" style={styles.statCard}>
                        <h4 style={{ color: "#a0aec0" }}>OCCUPIED ROOMS</h4>
                        <p style={{ ...styles.statVal, color: "#c5a880" }}>{stats.roomsOccupied} / {stats.roomsAvailable + stats.roomsOccupied}</p>
                      </div>
                      <div className="luxury-card" style={styles.statCard}>
                        <h4 style={{ color: "#a0aec0" }}>PENDING BOOKINGS</h4>
                        <p style={{ ...styles.statVal, color: "#f59e0b" }}>{stats.pendingBookings}</p>
                      </div>
                    </div>

                    {/* Chart & Activities */}
                    <div style={styles.splitRow}>
                      {/* Simple Responsive SVG/CSS Chart */}
                      {charts && (
                        <div className="glass-panel" style={{ ...styles.chartCard, flex: 2 }}>
                          <h3 style={{ color: "#fff", marginBottom: "20px" }}>Revenue History (Last 7 Days)</h3>
                          <div style={styles.chartArea}>
                            {charts.revenue.map((c, idx) => (
                              <div key={idx} style={styles.chartCol}>
                                <div style={{
                                  ...styles.chartBar,
                                  height: `${Math.min((c.value / (Math.max(...charts.revenue.map(r => r.value)) || 1)) * 150, 150)}px`
                                }}></div>
                                <span style={styles.chartLabel}>₹{Math.round(c.value)}</span>
                                <span style={styles.chartLabelName}>{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Activities */}
                      <div className="glass-panel" style={{ ...styles.activitiesCard, flex: 1.2 }}>
                        <h3 style={{ color: "#fff", marginBottom: "20px" }}>Recent Logs</h3>
                        <div style={styles.activitiesList}>
                          {activities.map((act, i) => (
                            <div key={i} style={styles.activityItem}>
                              <div style={styles.actDot}></div>
                              <div>
                                <p style={{ color: "#fff", fontSize: "14px" }}>{act.message}</p>
                                <span style={{ color: "#a0aec0", fontSize: "11px" }}>{act.time} ({act.status})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROOMS TAB */}
                {activeTab === "rooms" && (
                  <div style={styles.splitRow}>
                    {/* Form panel */}
                    <div className="glass-panel" style={{ ...styles.formCard, flex: 1 }}>
                      <h3 style={styles.cardTitle}>{editingRoom ? "Edit Room Details" : "Register New Room"}</h3>
                      <form onSubmit={handleCreateOrUpdateRoom} className="luxury-form">
                        <div style={styles.formRow}>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>ROOM NUMBER</label>
                            <input className="luxury-input" value={newRoomNo} onChange={(e) => setNewRoomNo(e.target.value)} required />
                          </div>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>ROOM TYPE</label>
                            <select className="luxury-select" value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                              <option value="Deluxe Room">Deluxe Room</option>
                              <option value="Premium Suite">Premium Suite</option>
                              <option value="Presidential Penthouse">Presidential Penthouse</option>
                              <option value="Honeymoon Suite">Honeymoon Suite</option>
                            </select>
                          </div>
                        </div>

                        <div style={styles.formRow}>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>PRICE (INR)</label>
                            <input type="number" className="luxury-input" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
                          </div>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>DISCOUNT (%)</label>
                            <input type="number" className="luxury-input" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} />
                          </div>
                        </div>

                        <div style={styles.formRow}>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>CAPACITY</label>
                            <input type="number" className="luxury-input" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} required />
                          </div>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>FLOOR</label>
                            <input type="number" className="luxury-input" value={newFloor} onChange={(e) => setNewFloor(e.target.value)} required />
                          </div>
                        </div>

                        <div style={styles.formRow}>
                          <div className="luxury-input-group" style={{ flex: 1 }}>
                            <label>FEATURED SUITE</label>
                            <select className="luxury-select" value={newFeatured} onChange={(e) => setNewFeatured(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                              <option value="0">Standard Room</option>
                              <option value="1">Featured suite</option>
                            </select>
                          </div>
                        </div>

                        <div className="luxury-input-group">
                          <label>AMENITIES (COMMA SEPARATED)</label>
                          <input className="luxury-input" value={newAmenities} onChange={(e) => setNewAmenities(e.target.value)} placeholder="WiFi, AC, Jacuzzi, Balcony" />
                        </div>

                        <div className="luxury-input-group">
                          <label>ROOM IMAGE URL</label>
                          <input className="luxury-input" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://unsplash.com/...room" />
                        </div>

                        <div className="luxury-input-group">
                          <label>DESCRIPTION</label>
                          <textarea rows="2" className="luxury-textarea" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button type="submit" className="gold-btn">{editingRoom ? "Save Suite" : "Register Suite"}</button>
                          {editingRoom && (
                            <button type="button" onClick={() => { setEditingRoom(null); clearRoomForm(); }} className="outline-btn">Cancel</button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Rooms listing */}
                    <div className="glass-panel" style={{ ...styles.listCard, flex: 1.5 }}>
                      <h3 style={styles.cardTitle}>Suites Registry ({rooms.length})</h3>
                      <div style={styles.adminList}>
                        {rooms.map((r) => (
                          <div key={r.id} style={styles.adminListItem} className="luxury-card">
                            <div style={styles.adminItemHead}>
                              <div>
                                <span style={{ color: "#c5a880", fontWeight: "700" }}>Room {r.room_number}</span>
                                <h4 style={{ color: "#fff" }}>{r.room_type}</h4>
                              </div>
                              <span className={`badge ${r.status === "available" ? "badge-success" : "badge-danger"}`}>{r.status}</span>
                            </div>
                            <p style={{ fontSize: "14px", color: "#a0aec0", margin: "10px 0" }}>Price: ₹{r.price} | Discount: {r.discount}% | Cap: {r.capacity}</p>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => handleEditRoom(r)} className="outline-btn" style={{ padding: "6px 12px", fontSize: "12px" }}>Edit</button>
                              <button onClick={() => handleDeleteRoom(r.id)} style={{ ...styles.deleteBtnBtn, padding: "6px 12px", fontSize: "12px" }}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* RESERVATIONS TAB */}
                {activeTab === "reservations" && (
                  <div className="glass-panel" style={styles.card}>
                    <h3 style={styles.cardTitle}>Suites Reservation log</h3>
                    <div style={styles.adminListVertical}>
                      {bookings.map((b) => (
                        <div key={b.id} style={styles.listItem} className="luxury-card">
                          <div style={styles.listItemHeader}>
                            <div>
                              <span style={styles.bookingId}>Booking ID: #{b.id}</span>
                              <h4 style={{ color: "#fff", marginTop: "2px" }}>Guest: {b.customer_name} ({b.customer_email})</h4>
                              <p style={{ color: "#cbd5e0", fontSize: "13px", marginTop: "4px" }}>Dates: {b.check_in} to {b.check_out}</p>
                            </div>
                            <span className={`badge ${b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                              {b.status}
                            </span>
                          </div>
                          
                          <div style={styles.bookingActions}>
                            {b.status === "pending" && (
                              <>
                                <button onClick={() => handleUpdateBookingStatus(b.id, "confirmed")} className="gold-btn" style={styles.btnSmall}>Approve</button>
                                <button onClick={() => handleUpdateBookingStatus(b.id, "rejected")} style={styles.btnDangerSmall}>Reject</button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button onClick={() => handleUpdateBookingStatus(b.id, "checked_in")} className="gold-btn" style={styles.btnSmall}>Check In Guest</button>
                            )}
                            {b.status === "checked_in" && (
                              <button onClick={() => handleUpdateBookingStatus(b.id, "checked_out")} className="gold-btn" style={styles.btnSmall}>Check Out Guest</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAFF ROSTER TAB */}
                {activeTab === "staff" && (
                  <div style={styles.splitRow}>
                    {/* Add Staff form */}
                    <div className="glass-panel" style={{ ...styles.formCard, flex: 1 }}>
                      <h3 style={styles.cardTitle}>Hire / Register Staff</h3>
                      <form onSubmit={handleAddStaff} className="luxury-form">
                        <div className="luxury-input-group">
                          <label>USER ACCOUNT ID</label>
                          <input type="number" placeholder="Enter User ID (registered account)" className="luxury-input" value={newStaffUser} onChange={(e) => setNewStaffUser(e.target.value)} required />
                        </div>
                        <div className="luxury-input-group">
                          <label>DEPARTMENT</label>
                          <select className="luxury-select" value={newStaffDept} onChange={(e) => setNewStaffDept(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                            <option value="Front Office">Front Office (Reception)</option>
                            <option value="Housekeeping">Housekeeping</option>
                            <option value="Kitchen / Dining">Kitchen / Dining</option>
                            <option value="General Management">General Management</option>
                          </select>
                        </div>
                        <div className="luxury-input-group">
                          <label>SALARY (INR / MONTH)</label>
                          <input type="number" className="luxury-input" value={newStaffSalary} onChange={(e) => setNewStaffSalary(e.target.value)} required />
                        </div>
                        <div className="luxury-input-group">
                          <label>WORK SHIFT</label>
                          <select className="luxury-select" value={newStaffShift} onChange={(e) => setNewStaffShift(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                            <option value="morning">Morning Shift</option>
                            <option value="evening">Evening Shift</option>
                            <option value="night">Night Shift</option>
                          </select>
                        </div>
                        <button type="submit" className="gold-btn">Log Staff Profile</button>
                      </form>
                    </div>

                    {/* Staff roster grid */}
                    <div className="glass-panel" style={{ ...styles.listCard, flex: 1.5 }}>
                      <h3 style={styles.cardTitle}>Staff Attendance & Shift Roster</h3>
                      <div style={styles.adminList}>
                        {staff.map((s) => (
                          <div key={s.id} style={styles.adminListItem} className="luxury-card">
                            <h4 style={{ color: "#fff" }}>{s.name}</h4>
                            <p style={{ color: "#c5a880", fontSize: "12px" }}>ID: {s.id} | User ID: {s.user_id}</p>
                            <p style={{ fontSize: "14px", color: "#a0aec0", margin: "10px 0" }}>Dept: {s.department} | Salary: ₹{s.salary}</p>
                            <div style={styles.shiftSelector}>
                              <span style={{ fontSize: "13px", color: "#cbd5e0" }}>Shift: </span>
                              <select
                                className="luxury-select"
                                value={s.shift}
                                onChange={(e) => handleUpdateStaffShift(s.id, e.target.value)}
                                style={{ width: "120px", display: "inline-block", padding: "4px 8px", fontSize: "12px", height: "auto", margin: 0, backgroundColor: "#141a2b" }}
                              >
                                <option value="morning">Morning</option>
                                <option value="evening">Evening</option>
                                <option value="night">Night</option>
                              </select>
                            </div>
                            <span style={{ fontSize: "12px", color: "#10b981", display: "block", marginTop: "10px" }}>
                              ✔️ Days Attended: {s.attendance.length} days
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === "reviews" && (
                  <div className="glass-panel" style={styles.card}>
                    <h3 style={styles.cardTitle}>Moderate Guest Reviews</h3>
                    {pendingReviews.length === 0 ? (
                      <p style={{ color: "#a0aec0" }}>No reviews pending approval.</p>
                    ) : (
                      <div style={styles.adminListVertical}>
                        {pendingReviews.map((r) => (
                          <div key={r.id} style={styles.listItem} className="luxury-card">
                            <div style={styles.listItemHeader}>
                              <div>
                                <span style={{ color: "#f59e0b" }}>{"⭐".repeat(r.rating)}</span>
                                <h4 style={{ color: "#fff", marginTop: "4px" }}>Guest: {r.user_name || "Anonymous"}</h4>
                                <p style={{ color: "#cbd5e0", fontSize: "14px", fontStyle: "italic", marginTop: "8px" }}>"{r.comment}"</p>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                              <button onClick={() => handleApproveReview(r.id)} className="gold-btn" style={styles.btnSmall}>Approve Review</button>
                              <button onClick={() => handleDeleteReview(r.id)} style={styles.btnDangerSmall}>Reject / Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SETTINGS & COUPONS TAB */}
                {activeTab === "settings" && (
                  <div style={styles.splitRow}>
                    {/* Add coupon */}
                    <div className="glass-panel" style={{ ...styles.formCard, flex: 1 }}>
                      <h3 style={styles.cardTitle}>Issue Coupon Code</h3>
                      <form onSubmit={handleCreateCoupon} className="luxury-form">
                        <div className="luxury-input-group">
                          <label>COUPON CODE (UPPERCASE)</label>
                          <input placeholder="e.g. SPECIAL30" className="luxury-input" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} required />
                        </div>
                        <div className="luxury-input-group">
                          <label>DISCOUNT PERCENTAGE (%)</label>
                          <input type="number" className="luxury-input" value={newCouponPct} onChange={(e) => setNewCouponPct(e.target.value)} required />
                        </div>
                        <div className="luxury-input-group">
                          <label>VALID UNTIL</label>
                          <input type="date" className="luxury-input" value={newCouponDate} onChange={(e) => setNewCouponDate(e.target.value)} required />
                        </div>
                        <button type="submit" className="gold-btn">Activate Coupon</button>
                      </form>
                    </div>

                    {/* Coupons list */}
                    <div className="glass-panel" style={{ ...styles.listCard, flex: 1.5 }}>
                      <h3 style={styles.cardTitle}>Active Coupons</h3>
                      <div style={styles.adminList}>
                        {coupons.map((c) => (
                          <div key={c.id} style={styles.adminListItem} className="luxury-card">
                            <div style={styles.adminItemHead}>
                              <h4 style={{ color: "#10b981", fontSize: "18px" }}>{c.code}</h4>
                              <span className={`badge ${c.is_active ? "badge-success" : "badge-danger"}`}>{c.is_active ? "Active" : "Expired"}</span>
                            </div>
                            <p style={{ fontSize: "14px", color: "#cbd5e0", margin: "8px 0" }}>Discount: {c.discount_percent}% off | Valid Until: {c.valid_until}</p>
                            <button onClick={() => handleDeleteCoupon(c.id)} style={{ ...styles.deleteBtnBtn, padding: "5px 10px", fontSize: "11px" }}>Remove Code</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  adminLayout: {
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
  analyticsPane: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  statCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  statCard: {
    padding: "20px",
  },
  statVal: {
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "8px",
  },
  splitRow: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  chartCard: {
    padding: "24px",
  },
  chartArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "220px",
    padding: "20px 10px 10px",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  chartCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "12%",
  },
  chartBar: {
    background: "linear-gradient(to top, #c5a880, #e0c8a5)",
    width: "100%",
    borderRadius: "4px 4px 0 0",
    transition: "height 0.5s",
  },
  chartLabel: {
    fontSize: "10px",
    color: "#cbd5e0",
    marginTop: "4px",
  },
  chartLabelName: {
    fontSize: "11px",
    color: "#a0aec0",
    marginTop: "2px",
  },
  activitiesCard: {
    padding: "24px",
  },
  activitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  activityItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  actDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#c5a880",
    marginTop: "6px",
    flexShrink: 0,
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
  formCard: {
    padding: "24px",
    height: "fit-content",
  },
  listCard: {
    padding: "24px",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  adminList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  adminListItem: {
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  adminItemHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  deleteBtnBtn: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1.5px solid #ef4444",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  adminListVertical: {
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
  bookingActions: {
    marginTop: "12px",
    display: "flex",
    gap: "10px",
  },
  btnSmall: {
    padding: "6px 14px",
    fontSize: "12px",
  },
  btnDangerSmall: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1.5px solid #ef4444",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  shiftSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.adminLayout.flexDirection = "row";
      styles.tabNav.width = "280px";
      styles.tabNav.flexShrink = 0;
      styles.splitRow.flexDirection = "row";
    } else {
      styles.adminLayout.flexDirection = "column";
      styles.tabNav.width = "100%";
      styles.splitRow.flexDirection = "column";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.adminLayout.flexDirection = "row";
    styles.tabNav.width = "280px";
    styles.tabNav.flexShrink = 0;
    styles.splitRow.flexDirection = "row";
  }
}

export default Admin;