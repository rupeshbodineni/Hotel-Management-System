import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1>Luxury Hotel Booking</h1>
          <p>
            Find and book your perfect stay
          </p>

          <button>Explore Rooms</button>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;