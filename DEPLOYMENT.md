# Deployment Guide

This guide will help you deploy the Pine Ridge Hot Springs Resort reservation system to GitHub and Netlify.

## 🚀 Prerequisites

- GitHub account
- Netlify account
- Node.js 18+ installed locally
- Git installed locally

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Create `.env.example` file (already done)
- [ ] Ensure no sensitive data is committed to Git
- [ ] Test local build: `npm run build`

### 2. Database Setup
- [ ] Database will be automatically initialized on first Netlify function call
- [ ] No manual database setup required for production

### 3. Email Configuration
- [ ] Set up SMTP credentials in Netlify environment variables
- [ ] Test email functionality in development

## 🔧 GitHub Setup

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Pine Ridge Hot Springs Resort"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `pine-ridge-hot-springs`
3. Make it public or private (your choice)
4. Don't initialize with README (we already have one)

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/pine-ridge-hot-springs.git
git branch -M main
git push -u origin main
```

## 🌐 Netlify Deployment

### 1. Connect to GitHub
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your `pine-ridge-hot-springs` repository
5. Click "Deploy site"

### 2. Configure Build Settings
Netlify should automatically detect the settings from `netlify.toml`, but verify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

### 3. Set Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```env
# Application
NODE_ENV=production
FRONTEND_URL=https://your-site-name.netlify.app

# Database (Netlify Functions will handle this)
DATABASE_PATH=/tmp/reservations.db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Configuration
ADMIN_EMAIL=admin@pineridgehotsprings.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 4. Configure Domain (Optional)
1. Go to Site settings > Domain management
2. Add your custom domain if desired
3. Update `FRONTEND_URL` environment variable

## 🔄 Continuous Deployment

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Preview deployments are created for pull requests

### Manual Deployments
```bash
# Trigger a new deployment
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 🧪 Testing Deployment

### 1. Frontend Testing
- [ ] Visit your Netlify URL
- [ ] Test site browsing functionality
- [ ] Test reservation form
- [ ] Test responsive design

### 2. Backend Testing
- [ ] Test API endpoints via browser dev tools
- [ ] Test email functionality
- [ ] Test admin login
- [ ] Test reservation creation

### 3. Admin Panel Testing
- [ ] Login with admin credentials
- [ ] Test dashboard functionality
- [ ] Test reservation management
- [ ] Test analytics

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build locally first
npm run build

# Check for TypeScript errors
npm run typecheck

# Check for linting errors
npm run lint
```

#### Environment Variables
- Ensure all required variables are set in Netlify
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding new variables

#### Database Issues
- Netlify Functions have a read-only filesystem except `/tmp`
- Database is automatically created on first function call
- Check function logs in Netlify dashboard

#### Email Issues
- Verify SMTP credentials
- Check if your email provider allows app passwords
- Test email configuration locally first

### Debugging
1. Check Netlify function logs in dashboard
2. Use browser dev tools to inspect API calls
3. Test endpoints directly via tools like Postman
4. Check environment variables in Netlify dashboard

## 📊 Monitoring

### Netlify Analytics
- Monitor site performance in Netlify dashboard
- Check function execution times
- Monitor error rates

### Custom Monitoring
- Set up error tracking (optional)
- Monitor email delivery rates
- Track reservation conversion rates

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use strong passwords for admin accounts
- Rotate SMTP credentials regularly

### API Security
- Admin endpoints require authentication
- CORS is configured for production
- Input validation is implemented

### Database Security
- SQLite database is file-based and secure
- No external database connections required
- Data is isolated per deployment

## 📈 Scaling Considerations

### Current Architecture
- Serverless functions handle backend
- Static frontend served by CDN
- SQLite database for data persistence

### Future Scaling Options
- Migrate to PostgreSQL for larger datasets
- Add Redis for caching
- Implement CDN for images
- Add monitoring and alerting

## 🆘 Support

### Documentation
- [API Documentation](./API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Development Guide](./DEVELOPMENT.md)

### Resources
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages](https://pages.github.com)
- [Vite Documentation](https://vitejs.dev)

---

**Happy Deploying! 🚀** 