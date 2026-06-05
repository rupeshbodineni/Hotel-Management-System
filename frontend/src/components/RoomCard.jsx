import { Link } from "react-router-dom";

function RoomCard({ room }) {
  return (
    <div className="room-card">
      <img
        src={room.image}
        alt={room.name}
      />

      <div className="room-card-content">
        <h3>{room.name}</h3>

        <p>{room.description}</p>

        <div className="room-price">
          ₹{room.price}/Night
        </div>

        <Link to={`/booking/${room.id}`}>
          <button>Book Now</button>
        </Link>
      </div>
    </div>
  );
}

export default RoomCard;