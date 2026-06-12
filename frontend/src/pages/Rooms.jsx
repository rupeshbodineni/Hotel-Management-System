import { useEffect, useState } from "react";
import API from "../services/api";
import RoomCard from "../components/RoomCard";

function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await API.get("/rooms");
    setRooms(res.data);
  };

  return (
    <div>
      <h2 className="text-centre">Available Rooms</h2>

      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
        />
      ))}
    </div>
  );
}

export default Rooms;