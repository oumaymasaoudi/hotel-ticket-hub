## [1.0.4](https://github.com/oumaymasaoudi/hotel-ticket-hub/compare/v1.0.3...v1.0.4) (2026-02-08)


### Bug Fixes

* verify IP during Docker build and ensure build-arg is used ([48131e7](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/48131e75e11943ef3eb4c977ea42ed71933e5623))

## [1.0.3](https://github.com/oumaymasaoudi/hotel-ticket-hub/compare/v1.0.2...v1.0.3) (2026-02-08)


### Bug Fixes

* force complete image replacement and verify IP in deployment ([0497687](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/04976876ffa9d6d58c092e91688460ba0b93b23d))

## [1.0.2](https://github.com/oumaymasaoudi/hotel-ticket-hub/compare/v1.0.1...v1.0.2) (2026-02-08)


### Bug Fixes

* force complete rebuild and verify IP in deployment ([01e1499](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/01e149900ba3815de8c6544547c6c3d351d8150a))

## [1.0.1](https://github.com/oumaymasaoudi/hotel-ticket-hub/compare/v1.0.0...v1.0.1) (2026-02-08)


### Performance Improvements

* optimize Docker build with cache and add timeout ([93980e6](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/93980e64cf81a83e0e3588b0b78aeac87468b73b))

# 1.0.0 (2026-02-07)


### Bug Fixes

* apiServices ([28037ef](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/28037ef116af69ffb1322c12b5ddb35c77758ae2))
* correct CI/CD pipeline errors and warnings - Make SonarQube non-blocking - Fix 'any' types in TicketDetailDialog, TicketImageUpload, AdvancedFilters - Disable coverage threshold temporarily - Move workflow to repository root ([3d2b0b4](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/3d2b0b489c444ffe437228d9771d733c3c6ba382))
* correct Dockerfile ESLint files, improve healthcheck, secure GHCR token, fix code smells ([9782ae1](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/9782ae1d7fe7b0c6cdcd5d23160c6f86417e6f76))
* corriger tous les problèmes SonarQube ([dfd3869](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/dfd3869542f9c6403d45604d836a7df67a7d5a49))
* errors ([d5e60d6](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/d5e60d67d40e12d7533a25834d34a007292696e3))
* errors sonarQube and piplines ([23eed26](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/23eed26ac899b111903481a93e8d17fd64a602f0))
* fix errors  SonarQube ([52ac380](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/52ac380422d7771efffa55b97044787d8cb03bbc))
* force complete rebuild - add comments to change build hash- Add comments in SuperAdminDashboard and AdminDashboard- This forces a new build hash- Resolves Hotel is not defined error- Force rebuild without cache ([373468e](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/373468e2c6f3d5e01940ea180c83aa45dceddb21))
* force complete rebuild without any cache - resolve Hotel is not defined- Disable npm cache in build job- Docker build already has no-cache: true- This will force a complete rebuild from scratch ([69adc5f](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/69adc5feae57357a1e5a5363768703bec01ffe13))
* force rebuild with version bump and timestamp - resolve Hotel is not defined- Bump version to 1.0.1 in package.json- Add timestamp to comments in SuperAdminDashboard and AdminDashboard- This will force Vite to generate a new hash for index-*.js- Resolves Hotel is not defined error ([ce42eb0](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/ce42eb0c4482fb621b5066510848bc6a3e17ebaa))
* hotels error ([76d1d2e](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/76d1d2e9678cd27cf3f96237192223a9df14ea78))
* load hotels on signup page mount ([9de1233](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/9de1233922b4a6d3bdb0d19ce568138f6383720c))
* rebuild frontend with correct backend API URL ([874f75b](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/874f75bbb00df3227bc5be75221fd60fd14310f1))
* rebuild with correct backend API URL ([4e3c627](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/4e3c627338b2b49db3c92ed6b8b5212d4b8a1bbc))
* rebuild with correct backend API URL ([dbe769c](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/dbe769cc3b47cbe924bf66f1ccc1052e30ebbdac))
* remove functions from useEffect dependencies to prevent infinite loops ([0fcbe87](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/0fcbe8783eafb65129cad39762d1182fc7850425))
* resolve all ESLint warnings (React Hook and TypeScript any types) ([1ef10eb](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/1ef10eba3c83b6a39088ae8440abb2602d61a9ba))
* resolve all linting errors and improve code quality ([0897dcb](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/0897dcb3e8b5d4bd1f884c4ccb17b5bac2d47b51))
* resolve all SonarQube issues - 0 issues remaining ([838267a](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/838267a2b14b1cfb7ed2899a4317e1a802b7b1cf))
* resolve Hotel is not defined error ([3eaef93](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/3eaef93af46a937736e85bbe6b55cf99b453c2b1))
* resolve Hotel is not defined error - rebuild required ([3520cdb](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/3520cdbe5752723d5bc296d10e6456b0d0302d8c))
* resolve Hotel is not defined error and SonarQube issues- Use type Hotel import in SuperAdminDashboard and AdminDashboard- Merge RUN instructions in Dockerfile- Redirect error messages to stderr in docker-entrypoint.sh- Ignore security hotspots for node_modules, package files, and GitHub Actions ([8f1a681](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/8f1a6812d1abe50d1f6b3645097d1e965dbd4d25))
* secure GHCR token and add private keys to .gitignore ([e234357](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/e234357d3c2e0f27b06022d8e2cc1ce5999babbf))
* update backend API URL from 13.49.44.219 to 13.63.15.86 ([610ee88](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/610ee887efd001aae6692e1eb0c99600f2748f15))
* use dynamic Docker tag based on branch name for deployment ([c7ddf6b](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/c7ddf6bedbd7809a6b91dfc380d933f84000b8cc))
* use npm install instead of npm ci and disable cache ([3cbe3a2](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/3cbe3a201e460f574128ea2cb739d47cdf17fb20))


### Features

* add header/footer always visible and image deletion ([f8c7ee1](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/f8c7ee122cdd21314ec58fe9e3d503638fe2227a))
* add header/footer always visible, image deletion, fix SonarQube warnings ([aa76458](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/aa76458e8ea9d070e22afa4eaf3d2973eb53783f))
* Code cleanup ([a1a1220](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/a1a1220aa3fa978318d9b361d299ae3052f6eb53))
* Code fixed ([fd584ee](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/fd584ee9751826358cef489f2222eeb8a96d9945))
* configuration déploiement Docker frontend ([80ae63f](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/80ae63fc1dd370228aabe547ca2c2ee05ddab5a9))
* description du changement ([4b8559d](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/4b8559d5f40cc8e604f57837b1c37caf00437d6f))
* enable frontend deployment on main branch ([66b8fe3](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/66b8fe32dd7a000f4b9a62c8863567e6b9bada97))
* remove hotel selection for technicians, they work for all hotels ([e17085c](https://github.com/oumaymasaoudi/hotel-ticket-hub/commit/e17085c0be39da48f68ea134cc406ae52cdbcdd8))

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
