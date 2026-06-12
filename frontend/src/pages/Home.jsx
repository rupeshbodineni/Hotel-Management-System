import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1>Luxury Hotel Booking</h1>
          <p>Find and book your perfect stay</p>

          <button onClick={() => navigate("/rooms")}>
            Explore Rooms
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;