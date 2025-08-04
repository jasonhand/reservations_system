import { useState, useEffect } from 'react';
import { AlertTriangle, X, Terminal } from 'lucide-react';

export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in development mode and show banner after a delay
    const timer = setTimeout(() => {
      if (window.location.hostname === 'localhost' && !isDismissed) {
        // Check if localStorage has dismissed banner
        const dismissed = localStorage.getItem('dev-banner-dismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('dev-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="container-width py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Development Mode:</span> 
              <span className="ml-2">
                Backend server not detected. Site browsing works with mock data, but reservations require the backend server.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center text-sm bg-black bg-opacity-20 px-3 py-1 rounded">
              <Terminal className="h-4 w-4 mr-2" />
              <code>npm run dev</code>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}