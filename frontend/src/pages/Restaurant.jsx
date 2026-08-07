import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Restaurant() {
  const { user } = useContext(AuthContext);

  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState({});
  const [roomNo, setRoomNo] = useState("");
  const [ordering, setOrdering] = useState(false);

  // Table reservation state
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [reserveGuests, setReserveGuests] = useState(2);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await API.get("/restaurant/menu");
      setMenu(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    const qty = cart[item.id] ? cart[item.id].qty + 1 : 1;
    setCart({
      ...cart,
      [item.id]: { item, qty }
    });
  };

  const handleRemoveFromCart = (itemId) => {
    if (!cart[itemId]) return;
    const newCart = { ...cart };
    if (newCart[itemId].qty > 1) {
      newCart[itemId].qty -= 1;
    } else {
      delete newCart[itemId];
    }
    setCart(newCart);
  };

  const cartTotal = Object.values(cart).reduce((sum, entry) => sum + (entry.item.price * entry.qty), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return;
    try {
      setOrdering(true);
      
      const itemsList = Object.values(cart).map(entry => `${entry.item.name} x${entry.qty}`);
      
      await API.post("/restaurant/order", {
        room_number: roomNo || "Walk-in Diner",
        items: JSON.stringify(itemsList),
        total_amount: cartTotal,
        order_type: "room_service"
      });

      alert("Food order placed successfully! Kitchen will deliver to your room in 20 minutes.");
      setCart({});
      setRoomNo("");
    } catch (err) {
      console.error(err);
      alert("Failed to place food order.");
    } finally {
      setOrdering(false);
    }
  };

  const handleTableReservation = async (e) => {
    e.preventDefault();
    if (!reserveDate || !reserveTime) return;
    try {
      setReserving(true);
      
      await API.post("/restaurant/order", {
        room_number: "Table reservation",
        items: `Table for ${reserveGuests} guests`,
        total_amount: 0.0,
        order_type: "table_reservation",
        reservation_date: reserveDate,
        reservation_time: reserveTime
      });

      alert("Table reserved successfully! A royal window-side dining table is confirmed for you.");
      setReserveDate("");
      setReserveTime("");
    } catch (err) {
      console.error(err);
      alert("Failed to reserve table.");
    } finally {
      setReserving(false);
    }
  };

  const categories = ["All", "Appetizers", "Main Course", "Desserts", "Drinks"];
  const filteredMenu = activeCategory === "All" ? menu : menu.filter(item => item.category === activeCategory);

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Header */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <span style={styles.heroSub}>SIGNATURE CULINARY ART</span>
          <h1 style={styles.heroTitle}>The Imperial Dining Hall</h1>
          <p style={styles.heroText}>Savor royal gastronomy, handcrafted cocktails, and delicate desserts prepared by Michelin-starred culinary masters.</p>
        </div>
      </section>

      <div className="container" style={styles.mainContainer}>
        {/* Layout split: Menu & Cart/Reservation */}
        <div style={styles.restaurantLayout}>
          {/* Menu column */}
          <div style={styles.menuColumn}>
            <h3 style={styles.sectionTitle}>Savor Our <span>Menu</span></h3>
            
            {/* Category tabs */}
            <div className="tabs-header" style={{ marginBottom: "30px" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? "tab-btn active" : "tab-btn"}
                  style={{ fontSize: "16px" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: "400px", width: "100%" }}></div>
            ) : (
              <div style={styles.menuGrid}>
                {filteredMenu.map(item => (
                  <div key={item.id} className="luxury-card" style={styles.menuCard}>
                    <img src={item.image} alt={item.name} style={styles.menuImg} />
                    <div style={styles.menuInfo}>
                      <h4 style={{ color: "#fff", fontSize: "17px" }}>{item.name}</h4>
                      <p style={{ color: "#c5a880", fontWeight: "600", fontSize: "15px", marginTop: "4px" }}>₹{item.price}</p>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="gold-btn"
                        style={{ padding: "6px 14px", fontSize: "12px", marginTop: "12px", width: "100%", justifyContent: "center" }}
                      >
                        ➕ Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart & Reservation Sidebar Column */}
          <div style={styles.sidebarColumn}>
            {/* Food Order Cart */}
            <div className="glass-panel" style={{ ...styles.card, marginBottom: "30px" }}>
              <h3 style={styles.cardTitle}>🍳 Room Service Cart</h3>
              {Object.keys(cart).length === 0 ? (
                <p style={{ color: "#a0aec0", fontSize: "14px" }}>Your food cart is empty. Add culinary items to begin ordering.</p>
              ) : (
                <form onSubmit={handlePlaceOrder} className="luxury-form">
                  <div style={styles.cartItems}>
                    {Object.values(cart).map(entry => (
                      <div key={entry.item.id} style={styles.cartItem}>
                        <div>
                          <p style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>{entry.item.name}</p>
                          <span style={{ color: "#c5a880", fontSize: "13px" }}>₹{entry.item.price} x {entry.qty}</span>
                        </div>
                        <div style={styles.cartItemControls}>
                          <button type="button" onClick={() => handleRemoveFromCart(entry.item.id)} style={styles.cartQtyBtn}>−</button>
                          <span style={{ color: "#fff" }}>{entry.qty}</span>
                          <button type="button" onClick={() => handleAddToCart(entry.item)} style={styles.cartQtyBtn}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.cartDivider}></div>

                  <div style={styles.cartTotalRow}>
                    <span>Order Total:</span>
                    <span style={{ color: "#10b981", fontWeight: "700" }}>₹{cartTotal}</span>
                  </div>

                  <div className="luxury-input-group" style={{ marginTop: "10px" }}>
                    <label>ROOM NUMBER FOR BILLING</label>
                    <input
                      placeholder="e.g. 201"
                      className="luxury-input"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="gold-btn" style={{ width: "100%", justifyContent: "center" }} disabled={ordering}>
                    {ordering ? "Placing Order..." : "Confirm Room Service Order"}
                  </button>
                </form>
              )}
            </div>

            {/* Table Reservation */}
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}>🍷 Table Reservation</h3>
              <form onSubmit={handleTableReservation} className="luxury-form">
                <div className="luxury-input-group">
                  <label>DINING DATE</label>
                  <input
                    type="date"
                    className="luxury-input"
                    value={reserveDate}
                    onChange={(e) => setReserveDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="luxury-input-group">
                  <label>RESERVATION TIME</label>
                  <select className="luxury-select" value={reserveTime} onChange={(e) => setReserveTime(e.target.value)} style={{ backgroundColor: "#141a2b" }} required>
                    <option value="">Choose slot...</option>
                    <option value="19:00">07:00 PM</option>
                    <option value="19:30">07:30 PM</option>
                    <option value="20:00">08:00 PM</option>
                    <option value="20:30">08:30 PM</option>
                    <option value="21:00">09:00 PM</option>
                    <option value="21:30">09:30 PM</option>
                    <option value="22:00">10:00 PM</option>
                  </select>
                </div>
                <div className="luxury-input-group">
                  <label>GUESTS</label>
                  <select className="luxury-select" value={reserveGuests} onChange={(e) => setReserveGuests(e.target.value)} style={{ backgroundColor: "#141a2b" }}>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6+ Guests (Banquet)</option>
                  </select>
                </div>
                <button type="submit" className="gold-btn" style={{ width: "100%", justifyContent: "center" }} disabled={reserving}>
                  {reserving ? "Processing..." : "Reserve Dining Table"}
                </button>
              </form>
            </div>
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
    background: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600') center/cover",
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
  mainContainer: {
    padding: "60px 0",
  },
  restaurantLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  menuColumn: {
    flexGrow: 2,
  },
  sectionTitle: {
    fontSize: "28px",
    marginBottom: "24px",
    color: "#fff",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuImg: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  menuInfo: {
    padding: "16px",
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
  cartItems: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartItemControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cartQtyBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#c5a880",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  cartDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
    margin: "14px 0",
  },
  cartTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
    fontWeight: "600",
    color: "#cbd5e0",
    marginBottom: "14px",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.restaurantLayout.flexDirection = "row";
      styles.sidebarColumn.width = "380px";
      styles.sidebarColumn.flexShrink = 0;
    } else {
      styles.restaurantLayout.flexDirection = "column";
      styles.sidebarColumn.width = "100%";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.restaurantLayout.flexDirection = "row";
    styles.sidebarColumn.width = "380px";
    styles.sidebarColumn.flexShrink = 0;
  }
}

export default Restaurant;
