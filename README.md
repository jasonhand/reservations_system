# Pine Ridge Hot Springs Resort - Reservation System

🏔️ A complete web application for a mountain hot springs resort featuring campsites, cabins, and premium accommodations.

## 🌟 Live Demo

**Frontend:** [https://pineridgehotsprings.netlify.app](https://pineridgehotsprings.netlify.app)  
**Admin Panel:** [https://pineridgehotsprings.netlify.app/admin](https://pineridgehotsprings.netlify.app/admin)

### Demo Credentials
- **Admin Login:** admin@pineridgehotsprings.com / admin123

## ✨ Features

### Guest Features
- 🏠 Browse 10 unique sites (campsites, cabins, premium accommodations)
- 📅 Real-time availability checking
- 📧 Email-based reservation system (no registration required)
- 📱 Fully responsive design
- 🔍 Advanced filtering and search
- ♨️ Natural hot springs access included

### Admin Features  
- 📊 Comprehensive dashboard with analytics
- 📋 Reservation management system
- 📈 Revenue and occupancy tracking
- 🎯 Real-time booking status updates
- 📅 Calendar view of site availability

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **Date-fns** for date manipulation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **SQLite** database
- **Nodemailer** for email services
- **Joi** for validation
- **UUID** for unique identifiers

### Deployment
- **Netlify** for frontend hosting
- **Netlify Functions** for serverless backend
- **GitHub** for version control and CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pine-ridge-hot-springs.git
   cd pine-ridge-hot-springs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both frontend (http://localhost:3000) and backend (http://localhost:3001)

### Environment Variables

See `.env.example` for all required variables:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_PATH=./database/reservations.db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin
ADMIN_EMAIL=admin@pineridgehotsprings.com
ADMIN_PASSWORD=secure_admin_password
```

## 📁 Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── models/            # Database models
│   ├── utils/             # Server utilities
│   └── scripts/           # Database scripts
├── netlify/               # Netlify Functions
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build production frontend
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and reseed database

### Database Management

The application uses SQLite for data persistence:

- **Development:** Database stored in `server/database/reservations.db`
- **Production:** Managed by Netlify Functions

#### Schema Overview
- `sites` - Campsite and cabin information
- `reservations` - Guest booking records
- `site_availability` - Availability tracking

### API Documentation

See [API.md](./API.md) for complete API documentation.

#### Key Endpoints
- `GET /api/sites` - List all sites
- `POST /api/reservations` - Create new reservation
- `GET /api/admin/stats` - Admin dashboard statistics

## 🌐 Deployment

### Netlify Deployment

1. **Connect to GitHub**
   - Link your repository to Netlify
   - Enable automatic deployments

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   Functions directory: netlify/functions
   ```

3. **Set Environment Variables**
   Configure all variables from `.env.example` in Netlify dashboard

4. **Deploy**
   Push to main branch to trigger automatic deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🎨 Design System

### Color Palette
- **Primary:** Mountain blues (#0ea5e9)
- **Secondary:** Warm golds (#eab308) 
- **Accent:** Nature greens (#84cc16)
- **Neutral:** Elegant grays

### Typography
- **Headings:** Poppins
- **Body:** Inter

### Components
Built with reusable Tailwind CSS components for consistency.

## 🧪 Testing

The project includes:
- TypeScript for type safety
- ESLint for code quality
- Form validation with Joi
- Error boundaries for resilience

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check our [docs](./docs/) folder
- **Issues:** [GitHub Issues](https://github.com/yourusername/pine-ridge-hot-springs/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/pine-ridge-hot-springs/discussions)

## 🙏 Acknowledgments

- Mountain imagery from Unsplash
- Icons by Lucide
- Inspiration from real hot springs resorts

---

**Built with ❤️ for mountain adventurers**
