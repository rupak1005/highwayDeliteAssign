import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { healthService } from './services/api';
import toast from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ExperienceDetailsPage from './pages/ExperienceDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingResultPage from './pages/BookingResultPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthService.checkHealth();
        if (!response.success) {
          toast.error('Unable to connect to server');
        }
      } catch (error) {
        console.error('API check failed:', error);
        toast.error('Unable to connect to server');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/experience/:id" element={<ExperienceDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking/:reference" element={<BookingResultPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;

