# Hotel Ticket Hub - Frontend

React + Vite frontend application for the Hotel Ticket Hub system.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will start on `http://localhost:5173`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# View coverage report
open coverage/lcov-report/index.html
```

## 🔧 CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs:

- **Linting**: ESLint + TypeScript type checking
- **Testing**: Jest + Coverage
- **Build**: Vite production build
- **SonarQube**: Code quality analysis

## 📝 Code Quality

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Jest**: Unit testing with coverage (minimum 50%)
- **SonarQube**: Quality gate

## 🔍 SonarQube Local

To run SonarQube locally:

```bash
docker-compose -f docker-compose.sonarqube.yml up -d
```

Access SonarQube at `http://localhost:9001` (admin/admin)

**Note**: Uses port 9001 to avoid conflict with backend SonarQube instance.

## 📋 Features

- **Authentication**: Login and registration
- **Dashboard**: Role-specific dashboards (SuperAdmin, Admin, Technician, Client)
- **Ticket Management**: Create, view, track, and manage tickets
- **Technician Management**: CRUD operations for technicians (Admin only)
- **Payment Management**: Stripe integration for subscriptions
- **Reporting**: PDF and CSV export with statistics
- **Comments**: Add comments to tickets
- **Notifications**: Real-time notifications system
- **Responsive Design**: Mobile-friendly UI

## 🛠️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is part of an academic assignment.

## 👥 Authors

Hotel Ticket Hub Development Team

