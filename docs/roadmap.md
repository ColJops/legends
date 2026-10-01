# 🗺️ Legends Roadmap

## 🎯 Project Goal

Legends is a web application for discovering, adding and managing Polish legends, folk tales and local stories.

---

# v0.3 - Foundation & Home

Status: Completed

## Backend

- [x] Spring Boot REST API
- [x] Legend CRUD
- [x] Image upload
- [x] Flyway migrations
- [x] Basic project structure for future security work

## Frontend

- [x] React Router
- [x] MainLayout
- [x] Home Page
- [x] Hero Section
- [x] Latest Legends
- [x] Navbar
- [x] Footer
- [x] About Section
- [x] Home Stats Section
- [x] Responsive layout improvements

---

# v0.4 - Authentication & User Experience

Status: Completed

## Backend

- [x] User entity
- [x] Role enum: `USER`, `ADMIN`
- [x] Register and login endpoints
- [x] JWT generation and validation
- [x] `GET /api/auth/me`
- [x] BCrypt password hashing
- [x] Protected modification and upload endpoints
- [x] Legend ownership rules
- [x] Admin override for legend management
- [x] Centralized safe API error responses
- [x] Upload validation and limits

## Frontend

- [x] AuthContext
- [x] Login and registration pages
- [x] Logout and session restoration
- [x] Dynamic navbar
- [x] Token injection into API requests
- [x] Frontend permission helpers
- [x] Authentication-aware CTAs and redirects
- [x] Toast and error-message polish

---

# v0.5 - Admin & Content Management

Status: Completed

## Administration foundation

- [x] Protected `/admin` route
- [x] Dedicated admin layout and navigation
- [x] Admin-only navbar entry
- [x] Dashboard with summary statistics and recent activity

## Legend management

- [x] Administrative paged list
- [x] Search, filtering and sorting
- [x] Preview and edit any legend
- [x] Delete any legend with confirmation
- [x] Author loading optimized with `@EntityGraph`

## User management

- [x] Administrative paged list
- [x] Search, role/status filters and sorting
- [x] Per-user legend counts
- [x] Role changes
- [x] Account lock and unlock
- [x] Existing JWT rejection for blocked accounts
- [x] Safe user deletion with `ANONYMIZE` and `DELETE` policies
- [x] Current-admin and last-admin protections

## Media management

- [x] Image inventory and previews
- [x] File size and disk-usage statistics
- [x] Used/orphaned status
- [x] Links to legends using an image
- [x] Safe deletion of individual orphaned files
- [x] Bulk orphan cleanup
- [x] Traversal and referenced-file protection

## Audit and quality

- [x] Administrative audit-log entity and Flyway migration
- [x] Audit events for legends, users and media
- [x] Audit-log filters, search, sorting and pagination
- [x] Centralized environment-driven CORS configuration
- [x] Required production JWT secret
- [x] Disabled Open Session in View
- [x] React auth-state synchronization after `401`
- [x] Safe local-storage parsing
- [x] Lazy-loaded admin routes and statistics charts
- [x] Backend migration/schema and service tests
- [x] Frontend route, permissions, media and auth-storage tests

---

# v0.6 - Moderation & Community Foundation

Status: Planned

## Content moderation

- [ ] Legend publication status: `DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`, `ARCHIVED`
- [ ] Moderation queue
- [ ] Approve, reject and archive actions
- [ ] Rejection reason and moderation notes
- [ ] Report inappropriate content
- [ ] Audit events for moderation decisions

## User features

- [ ] User profile
- [ ] My legends
- [ ] Account settings
- [ ] Password reset
- [ ] Email verification

---

# v0.7 - Community

Status: Planned

- [ ] Comments
- [ ] Ratings
- [ ] Favorite legends
- [ ] Public author pages
- [ ] User activity overview
- [ ] Comment and report moderation

---

# v0.8 - Interactive Map

Status: Planned

- [ ] Map of Poland
- [ ] Legends by region
- [ ] Regional statistics
- [ ] Region detail pages
- [ ] Map filters

---

# v1.0 - Stable Release

Status: Future

Planned release criteria:

- [ ] Stable public browsing
- [ ] Stable authentication and account recovery
- [ ] Stable user-generated content flow
- [ ] Complete moderation workflow
- [ ] Production deployment configuration
- [ ] Production CORS and secret configuration
- [ ] Security headers and rate limiting
- [ ] Dependency and vulnerability review
- [ ] Final accessibility and responsive UI review
- [ ] Deployment, backup and recovery documentation
