
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Gallery from './pages/Gallery/Gallery';
import MapPage from './pages/Map/Map';
import Admin from './pages/Admin/Admin';
import { ApartmentProvider } from './context/ApartmentContext';
import './App.css';

function App() {
  return (
    <ApartmentProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Gallery />} />
              <Route path="/map" element={<MapPage />} />
              {import.meta.env.DEV && <Route path="/admin" element={<Admin />} />}
            </Routes>
          </main>
        </div>
      </Router>
    </ApartmentProvider>
  );
}

export default App;
