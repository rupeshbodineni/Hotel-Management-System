import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import RoomCard from "../components/RoomCard";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Rooms() {
  const [searchParams] = useSearchParams();
  const initialCheckIn = searchParams.get("check_in") || "";
  const initialCheckOut = searchParams.get("check_out") || "";
  const initialGuests = searchParams.get("guests") || "2";

  // Filter States
  const [rooms, setRooms] = useState([]);
  const [roomType, setRoomType] = useState("");
  const [capacity, setCapacity] = useState(initialGuests);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  // Amenity filters (WiFi, AC, Jacuzzi, Balcony, Bar)
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [jacuzzi, setJacuzzi] = useState(false);
  const [balcony, setBalcony] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [roomType, capacity, minPrice, maxPrice, wifi, ac, jacuzzi, balcony, sortBy]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      // Construct amenity string
      const selectedAmenities = [];
      if (wifi) selectedAmenities.push("WiFi");
      if (ac) selectedAmenities.push("AC");
      if (jacuzzi) selectedAmenities.push("Jacuzzi");
      if (balcony) selectedAmenities.push("Balcony");

      const params = {};
      if (roomType) params.room_type = roomType;
      if (capacity) params.capacity = capacity;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(",");
      if (sortBy) params.sort_by = sortBy;
      params.status = "available"; // Only show available rooms for customers

      const res = await API.get("/rooms", { params });
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setRoomType("");
    setCapacity("2");
    setMinPrice("");
    setMaxPrice("");
    setWifi(false);
    setAc(false);
    setJacuzzi(false);
    setBalcony(false);
    setSortBy("");
  };

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Explore <span>Our Rooms</span></h2>
        <p className="section-subtitle">Find the perfect luxury suite tailored for your ultimate relaxation.</p>

        <div style={styles.layout}>
          {/* Filters Sidebar */}
          <aside className="glass-panel" style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={{ color: "#fff", fontSize: "20px" }}>Filters</h3>
              <button onClick={handleClearFilters} style={styles.clearBtn}>Clear All</button>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>SORT BY PRICE</label>
              <select className="luxury-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
                <option value="">Default sorting</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>ROOM TYPE</label>
              <select className="luxury-select" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={styles.select}>
                <option value="">All Types</option>
                <option value="Deluxe Room">Deluxe Room</option>
                <option value="Premium Suite">Premium Suite</option>
                <option value="Presidential Penthouse">Presidential Penthouse</option>
                <option value="Honeymoon Suite">Honeymoon Suite</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>GUESTS (MIN CAPACITY)</label>
              <select className="luxury-select" value={capacity} onChange={(e) => setCapacity(e.target.value)} style={styles.select}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>PRICE RANGE (PER NIGHT)</label>
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  className="luxury-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ marginBottom: 0, width: "48%" }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="luxury-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ marginBottom: 0, width: "48%" }}
                />
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>AMENITIES</label>
              <div style={styles.checkboxes}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={wifi} onChange={() => setWifi(!wifi)} style={styles.checkbox} />
                  WiFi Internet
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={ac} onChange={() => setAc(!ac)} style={styles.checkbox} />
                  Air Conditioning
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={jacuzzi} onChange={() => setJacuzzi(!jacuzzi)} style={styles.checkbox} />
                  Terrace Jacuzzi
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={balcony} onChange={() => setBalcony(!balcony)} style={styles.checkbox} />
                  Private Balcony
                </label>
              </div>
            </div>
          </aside>

          {/* Rooms Grid */}
          <main style={styles.roomsMain}>
            {loading ? (
              <div style={styles.skeletonGrid}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="luxury-card" style={{ height: "400px", padding: 0 }}>
                    <div className="skeleton" style={{ height: "220px", width: "100%" }}></div>
                    <div style={{ padding: "20px" }}>
                      <div className="skeleton" style={{ height: "24px", width: "70%", marginBottom: "12px" }}></div>
                      <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "8px" }}></div>
                      <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "20px" }}></div>
                      <div className="skeleton" style={{ height: "36px", width: "100%" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="glass-panel" style={styles.emptyState}>
                <span style={{ fontSize: "48px" }}>🛏️</span>
                <h3>No Suites Available</h3>
                <p>No luxury rooms match your exact filter combination. Try adjusting price borders or removing amenity checks.</p>
                <button className="gold-btn" onClick={handleClearFilters}>Show All Rooms</button>
              </div>
            ) : (
              <div style={styles.grid}>
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
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
  layout: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  sidebar: {
    padding: "24px",
    height: "fit-content",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "12px",
  },
  clearBtn: {
    backgroundColor: "transparent",
    color: "#c5a880",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  filterGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    color: "#c5a880",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  select: {
    width: "100%",
    backgroundColor: "#141a2b",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  priceInputs: {
    display: "flex",
    justifyContent: "space-between",
  },
  checkboxes: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#cbd5e0",
    cursor: "pointer",
  },
  checkbox: {
    width: "auto",
    margin: 0,
    cursor: "pointer",
  },
  roomsMain: {
    flexGrow: 1,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
};

// Add desktop layout media queries support
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.layout.flexDirection = "row";
      styles.sidebar.width = "300px";
      styles.sidebar.flexShrink = 0;
    } else {
      styles.layout.flexDirection = "column";
      styles.sidebar.width = "100%";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  // Initial run
  if (matchMedia.matches) {
    styles.layout.flexDirection = "row";
    styles.sidebar.width = "300px";
    styles.sidebar.flexShrink = 0;
  }
}

export default Rooms;