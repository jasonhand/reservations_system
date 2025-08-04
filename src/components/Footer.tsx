import { Link } from 'react-router-dom';
import { Mountain, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-200">
      <div className="container-width py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Mountain className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-heading font-bold">
                Pine Ridge Hot Springs
              </span>
            </Link>
            <p className="text-neutral-400 mb-4 max-w-md">
              Experience the ultimate mountain retreat with luxury camping and cabin rentals, 
              featuring natural hot springs access in a breathtaking wilderness setting.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:info@pineridgehotsprings.com"
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="tel:+1-555-SPRINGS"
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Call us"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sites" className="text-neutral-400 hover:text-primary-400 transition-colors">
                  Sites & Cabins
                </Link>
              </li>
              <li>
                <a href="#amenities" className="text-neutral-400 hover:text-primary-400 transition-colors">
                  Amenities
                </a>
              </li>
              <li>
                <a href="#contact" className="text-neutral-400 hover:text-primary-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-neutral-400">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 text-primary-400" />
                <div>
                  <p>123 Mountain Ridge Road</p>
                  <p>Alpine Valley, CO 80424</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary-400" />
                <a href="tel:+1-555-SPRINGS" className="hover:text-primary-400 transition-colors">
                  (555) SPRINGS
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary-400" />
                <a href="mailto:info@pineridgehotsprings.com" className="hover:text-primary-400 transition-colors">
                  info@pineridgehotsprings.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2024 Pine Ridge Hot Springs Resort. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Designed for relaxation, built for memories.
          </p>
        </div>
      </div>
    </footer>
  );
}