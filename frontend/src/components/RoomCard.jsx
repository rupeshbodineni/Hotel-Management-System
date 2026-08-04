import { Link } from "react-router-dom";

function RoomCard({ room }) {
  // Calculate discount price if applicable
  const discountedPrice = room.discount > 0 ? room.price * (1 - room.discount / 100) : room.price;

  // Split amenities string
  const amenitiesList = room.amenities ? room.amenities.split(",").slice(0, 3) : [];

  return (
    <div className="luxury-card" style={styles.card}>
      {room.is_featured === 1 && (
        <span style={styles.featuredBadge}>FEATURED</span>
      )}
      <div style={styles.imageWrapper}>
        <img
          src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600"}
          alt={room.room_type}
          style={styles.image}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.type}>{room.room_type}</h3>
          <span style={styles.number}>Room {room.room_number}</span>
        </div>

        <p style={styles.desc}>{room.description || "Experience supreme comfort and premium services in our signature luxury suites."}</p>

        <div style={styles.specs}>
          <span style={styles.specItem}>👥 Max {room.capacity} Guests</span>
          <span style={styles.specItem}>🏢 Floor {room.floor_number}</span>
        </div>

        <div style={styles.amenities}>
          {amenitiesList.map((am, i) => (
            <span key={i} className="badge badge-info" style={styles.amenityBadge}>{am.trim()}</span>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={styles.priceContainer}>
            {room.discount > 0 ? (
              <>
                <span style={styles.oldPrice}>₹{room.price}</span>
                <span style={styles.currentPrice}>₹{Math.round(discountedPrice)}<span style={styles.night}>/Night</span></span>
              </>
            ) : (
              <span style={styles.currentPrice}>₹{room.price}<span style={styles.night}>/Night</span></span>
            )}
          </div>

          <Link to={`/booking/${room.id}`}>
            <button className="gold-btn" style={styles.bookBtn}>Book Suite</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: 0,
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: "16px",
    left: "16px",
    background: "#f59e0b",
    color: "#0b0f19",
    fontWeight: "700",
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "4px",
    letterSpacing: "1px",
    zIndex: 10,
  },
  imageWrapper: {
    width: "100%",
    height: "220px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s",
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  type: {
    fontSize: "20px",
    color: "#fff",
  },
  number: {
    fontSize: "13px",
    color: "#c5a880",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  desc: {
    fontSize: "14px",
    color: "#a0aec0",
    lineHeight: "1.5",
    marginBottom: "16px",
    flexGrow: 1,
  },
  specs: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    fontSize: "13px",
    color: "#cbd5e0",
  },
  specItem: {
    display: "flex",
    alignItems: "center",
  },
  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "20px",
  },
  amenityBadge: {
    fontSize: "11px",
    padding: "3px 8px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "16px",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
  },
  oldPrice: {
    fontSize: "13px",
    color: "#718096",
    textDecoration: "line-through",
    marginBottom: "2px",
  },
  currentPrice: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#10b981",
  },
  night: {
    fontSize: "12px",
    color: "#a0aec0",
    fontWeight: "400",
  },
  bookBtn: {
    padding: "10px 18px",
    fontSize: "14px",
  },
};

export default RoomCard;