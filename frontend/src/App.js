import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import PlaceDetail from "@/pages/PlaceDetail";
import Analyze from "@/pages/Analyze";
import CityHub from "@/pages/CityHub";
import NavBar from "@/components/NavBar";

function App() {
  return (
    <div className="App min-h-screen bg-scout-bg text-scout-ink">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/city/:name" element={<CityHub />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
