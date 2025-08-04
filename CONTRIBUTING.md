# Contributing to Pine Ridge Hot Springs Resort

Thank you for your interest in contributing to Pine Ridge Hot Springs Resort! We welcome contributions from the community and are grateful for your help in making this project better.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Use welcoming and constructive language
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and Node.js

### Setting Up Development Environment

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Install dependencies**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pine-ridge-hot-springs.git
   cd pine-ridge-hot-springs
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   npm run db:seed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 🛠️ Development Guidelines

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use the existing type definitions in `src/types/`

### Commit Messages

Use conventional commit format:

```
type(scope): description

feat(booking): add date validation
fix(api): resolve reservation creation bug
docs(readme): update installation instructions
style(ui): improve mobile responsive layout
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Branch Naming

Use descriptive branch names:
- `feat/add-payment-integration`
- `fix/booking-form-validation`
- `docs/api-documentation`
- `refactor/database-models`

## 📝 Contribution Process

### 1. Find or Create an Issue

- Check existing issues for bugs or feature requests
- For new features, create an issue to discuss the proposal
- For bugs, provide reproduction steps and environment details

### 2. Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing patterns and conventions
   - Add comments for complex logic

3. **Test your changes**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feat/your-feature-name
   ```

### 3. Pull Request Guidelines

When creating a PR:

- **Title**: Use conventional commit format
- **Description**: Clearly explain what changes you made and why
- **Link issues**: Reference any related issues (#123)
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Passes linting
- [ ] Builds successfully

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

## 🏗️ Project Structure

### Frontend (`src/`)
- `components/` - Reusable UI components
- `pages/` - Route-level components
- `contexts/` - React context providers
- `utils/` - Utility functions
- `types/` - TypeScript type definitions

### Backend (`server/`)
- `routes/` - Express route handlers
- `models/` - Database models and schemas
- `utils/` - Server utility functions
- `scripts/` - Database and maintenance scripts

### Key Files
- `package.json` - Dependencies and scripts
- `netlify.toml` - Netlify deployment configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment**
   - OS and version
   - Node.js version
   - Browser (if frontend issue)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots/videos if helpful

3. **Error Messages**
   - Full error messages
   - Console logs
   - Stack traces

## 💡 Suggesting Features

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** your feature would solve
3. **Propose a solution** with implementation details
4. **Consider alternatives** and trade-offs
5. **Provide mockups** for UI changes

## 🔍 Code Review Process

All submissions require review:

1. **Automated checks** must pass (linting, type checking, build)
2. **Manual review** by maintainers
3. **Address feedback** promptly and respectfully
4. **Maintainer approval** required before merge

### Review Criteria

- Code quality and consistency
- Performance implications
- Security considerations
- Documentation completeness
- Test coverage (when applicable)

## 📚 Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Project-Specific
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 🆘 Getting Help

- **Discord/Slack**: Join our community chat (link)
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: maintainers@pineridgehotsprings.com

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Hall of Fame for outstanding contributions

Thank you for contributing to Pine Ridge Hot Springs Resort! 🏔️