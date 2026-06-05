import { useParams } from "react-router-dom";
import API from "../services/api";

function Booking() {
  const { id } = useParams();

  const bookRoom = async () => {
    await API.post("/bookings", {
      room_id: id,
    });

    alert("Room Booked Successfully");
  };

  return (
    <div>
      <h2>Booking Room #{id}</h2>

      <button onClick={bookRoom}>
        Confirm Booking
      </button>
    </div>
  );
}

export default Booking;