import AppRoutes from "./routes/AppRoutes";
import Navbar from "./Navbar/Navbar";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <Chatbot />
    </>
  );
}

export default App;