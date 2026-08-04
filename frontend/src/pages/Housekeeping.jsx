import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer";

function Housekeeping() {
  const [rooms, setRooms] = useState([]);
  const [housekeepers, setHousekeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedRoomId, setAssignedRoomId] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [logHistory, setLogHistory] = useState([
    { id: 1, roomNo: "101", staff: "Helena Housekeeping", time: "Today, 10:00 AM", task: "Complete Sanitation" },
    { id: 2, roomNo: "102", staff: "Helena Housekeeping", time: "Yesterday, 04:00 PM", task: "Express Linen Refresh" }
  ]);

  useEffect(() => {
    fetchHousekeepingData();
  }, []);

  const fetchHousekeepingData = async () => {
    try {
      setLoading(true);
      const roomsRes = await API.get("/rooms");
      setRooms(roomsRes.data);

      const staffRes = await API.get("/staff");
      // Filter staff under Housekeeping department
      const hks = staffRes.data.filter(s => s.department === "Housekeeping");
      setHousekeepers(hks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      // Find room details to update status
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      await API.put(`/rooms/${roomId}`, {
        room_number: room.room_number,
        room_type: room.room_type,
        price: room.price,
        capacity: room.capacity,
        floor_number: room.floor_number,
        discount: room.discount,
        is_featured: room.is_featured,
        description: room.description,
        amenities: room.amenities,
        image_url: room.image_url,
        status: newStatus
      });

      // Log clean history if changing dirty -> available/clean
      if (room.status === "dirty" && newStatus === "available") {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newLog = {
          id: logHistory.length + 1,
          roomNo: room.room_number,
          staff: "Helena Housekeeping",
          time: `Today, ${timeStr}`,
          task: "Disinfected & Vacuumed"
        };
        setLogHistory([newLog, ...logHistory]);
      }

      fetchHousekeepingData();
    } catch (err) {
      alert("Failed to update room cleaning status.");
    }
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!assignedRoomId || !assignedStaffId) return;

    const r = rooms.find(rm => rm.id === parseInt(assignedRoomId));
    const s = housekeepers.find(st => st.id === parseInt(assignedStaffId));

    if (r && s) {
      alert(`Cleaning Task allocated! ${s.name} has been assigned to prepare Room ${r.room_number}.`);
      setAssignedRoomId("");
      setAssignedStaffId("");
    }
  };

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Royal <span>Housekeeping Desk</span></h2>
        <p className="section-subtitle">Monitor room cleanliness, allocate cleaning staff, and log sanitation history.</p>

        <div style={styles.housekeepingLayout}>
          {/* Left panel: status list */}
          <div className="glass-panel" style={{ ...styles.card, flex: 2 }}>
            <h3 style={styles.cardTitle}>Rooms Cleaning Status Board</h3>
            
            {loading ? (
              <div className="skeleton" style={{ height: "300px", width: "100%" }}></div>
            ) : (
              <div style={styles.roomsGrid}>
                {rooms.map((r) => (
                  <div key={r.id} style={styles.roomItem} className="luxury-card">
                    <div style={styles.roomHead}>
                      <span style={{ color: "#fff", fontWeight: "700" }}>Room {r.room_number}</span>
                      <span className={`badge ${r.status === "available" ? "badge-success" : r.status === "occupied" ? "badge-info" : r.status === "dirty" ? "badge-danger" : "badge-warning"}`}>
                        {r.status === "available" ? "clean" : r.status}
                      </span>
                    </div>
                    <p style={{ color: "#a0aec0", fontSize: "13px", marginTop: "4px" }}>{r.room_type} − Floor {r.floor_number}</p>
                    
                    <div style={styles.statusButtons}>
                      {r.status === "dirty" && (
                        <button onClick={() => handleUpdateStatus(r.id, "available")} className="gold-btn" style={styles.btnSmall}>
                          Mark Clean
                        </button>
                      )}
                      {r.status === "available" && (
                        <button onClick={() => handleUpdateStatus(r.id, "maintenance")} style={styles.btnWarningSmall}>
                          Send to Maintenance
                        </button>
                      )}
                      {r.status === "maintenance" && (
                        <button onClick={() => handleUpdateStatus(r.id, "available")} className="gold-btn" style={styles.btnSmall}>
                          Restore Available
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Assign Tasks & Logs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px", flex: 1.2 }}>
            {/* Task assignment */}
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}>Assign Sanitation Job</h3>
              <form onSubmit={handleAssignTask} className="luxury-form">
                <div className="luxury-input-group">
                  <label>SELECT ROOM</label>
                  <select className="luxury-select" value={assignedRoomId} onChange={(e) => setAssignedRoomId(e.target.value)} style={{ backgroundColor: "#141a2b" }} required>
                    <option value="">Choose room...</option>
                    {rooms.filter(r => r.status === "dirty").map(r => (
                      <option key={r.id} value={r.id}>Room {r.room_number} (Dirty)</option>
                    ))}
                  </select>
                </div>
                <div className="luxury-input-group">
                  <label>SELECT HOUSEKEEPER</label>
                  <select className="luxury-select" value={assignedStaffId} onChange={(e) => setAssignedStaffId(e.target.value)} style={{ backgroundColor: "#141a2b" }} required>
                    <option value="">Choose staff...</option>
                    {housekeepers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Shift: {s.shift})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="gold-btn" style={{ justifyContent: "center" }} disabled={housekeepers.length === 0}>
                  Allocate Cleaning Job
                </button>
              </form>
            </div>

            {/* Logs */}
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}>Sanitation History Logs</h3>
              <div style={styles.logList}>
                {logHistory.map((log) => (
                  <div key={log.id} style={styles.logItem} className="luxury-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#c5a880", fontWeight: "700" }}>Room {log.roomNo}</span>
                      <span style={{ color: "#a0aec0", fontSize: "11px" }}>{log.time}</span>
                    </div>
                    <p style={{ color: "#fff", fontSize: "13.5px", marginTop: "6px" }}>✔️ {log.task}</p>
                    <span style={{ color: "#718096", fontSize: "12px" }}>Assigned to: {log.staff}</span>
                  </div>
                ))}
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
  housekeepingLayout: {
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
  roomsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  roomItem: {
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  roomHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButtons: {
    marginTop: "16px",
    display: "flex",
    gap: "8px",
    flexDirection: "column"
  },
  btnSmall: {
    padding: "6px 12px",
    fontSize: "12px",
    width: "100%",
    justifyContent: "center"
  },
  btnWarningSmall: {
    backgroundColor: "transparent",
    color: "#f59e0b",
    border: "1.5px solid #f59e0b",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    width: "100%",
  },
  logList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logItem: {
    padding: "12px 16px",
  }
};

// Desktop layout adaptation
if (typeof window !== "undefined") {
  const matchMedia = window.matchMedia("(min-width: 992px)");
  const adjustLayout = (e) => {
    if (e.matches) {
      styles.housekeepingLayout.flexDirection = "row";
    } else {
      styles.housekeepingLayout.flexDirection = "column";
    }
  };
  matchMedia.addEventListener("change", adjustLayout);
  if (matchMedia.matches) {
    styles.housekeepingLayout.flexDirection = "row";
  }
}

export default Housekeeping;
