import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReservationProvider } from './contexts/ReservationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DevelopmentBanner from './components/common/DevelopmentBanner';
import HomePage from './pages/HomePage';
import SitesPage from './pages/SitesPage';
import SiteDetailPage from './pages/SiteDetailPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ReservationProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <DevelopmentBanner />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/:siteId" element={<SiteDetailPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/confirmation/:reservationId" element={<ConfirmationPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ReservationProvider>
  );
}

export default App;