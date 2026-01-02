# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.1] - 2026-01-02

### Fixed
- Fix: Hotel icon import missing in DashboardLayout.tsx causing "Hotel is not defined" error
- Fix: Remove functions from useEffect dependencies in AdminDashboard.tsx to prevent infinite request loops (429 errors)
- Fix: Include technicians with NULL hotel_id in getTechniciansByHotel endpoint (technicians work for all hotels)
- Fix: Add missing Hotel icon import in DashboardLayout component
- Fix: Change Hotel interface to type in apiService.ts to prevent runtime reference errors

### Changed
- Changed: Hotel type from interface to type export in apiService.ts
- Changed: Improved error messages in CreateTicket.tsx when categories are missing
- Changed: Improved error messages in Signup.tsx when categories are missing

### Added
- Added: Comprehensive deployment guide (DEPLOYMENT_GUIDE.md)
- Added: Project documentation (DOCUMENTATION_PROJET.md)
- Added: Solution guides for common issues

## [1.0.0] - 2026-01-01

### Added
- Initial release of Hotel Ticket Hub application
- Frontend application with React + TypeScript + Vite
- Backend API with Spring Boot + PostgreSQL
- Complete CI/CD pipeline with GitHub Actions
- SonarQube integration for code quality
- Docker containerization and deployment
- Automated testing with Jest (frontend) and JUnit (backend)
- Code coverage reporting with Codecov
- Staging deployment automation
- User authentication and authorization (JWT)
- Role-based access control (Client, Technician, Admin, SuperAdmin)
- Ticket management system
- Category management
- Hotel management
- Technician assignment
- Payment and subscription management
- Email notifications
- File upload for ticket images
- Responsive UI with modern design
- Dark/Light theme support

### Infrastructure
- AWS EC2 VMs for staging environment
- PostgreSQL database on separate VM
- Docker Compose for container orchestration
- GitHub Container Registry (GHCR) for Docker images
- Nginx reverse proxy for frontend

### CI/CD Features
- Automated linting (ESLint, Checkstyle, SpotBugs)
- Automated testing (Jest, JUnit)
- Code coverage analysis (JaCoCo, LCOV)
- SonarQube quality gate
- Automated Docker build and push
- Automated staging deployment
- Health checks and monitoring


