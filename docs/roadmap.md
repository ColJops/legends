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
- [x] Register endpoint
- [x] Login endpoint
- [x] JWT generation and validation
- [x] `GET /api/auth/me`
- [x] Password hashing with BCrypt
- [x] Protected legend modification endpoints
- [x] Protected upload endpoint
- [x] Legend ownership rules
- [x] Admin override for legend management
- [x] Admin-only orphan image cleanup
- [x] Centralized error handling
- [x] Safe `400`, `401`, `403`, `404` and `500` responses
- [x] Upload validation and file size limits
- [x] Security cleanup for production readiness

## Frontend

- [x] `authApi.js`
- [x] `AuthContext`
- [x] Login Page
- [x] Register Page
- [x] Logout
- [x] Dynamic Navbar
- [x] Token injection into API requests
- [x] Token cleanup after unauthorized responses
- [x] Frontend permissions for legend actions
- [x] Hide Add/Edit/Delete actions when unavailable
- [x] Home Page CTA based on authentication state
- [x] Redirect to login when contribution requires authentication
- [x] Latest Legends detail routing
- [x] Toast and error message polish

---

# v0.5 - Admin & Content Management

Status: Planned

- [ ] Admin dashboard
- [ ] User management
- [ ] Role management
- [ ] Legend moderation
- [ ] Legend status: `pending`, `approved`, `rejected`
- [ ] Report inappropriate content
- [ ] Improved statistics dashboard
- [ ] Admin-only maintenance actions UI
- [ ] Audit/history concept for moderation actions

---

# v0.6 - Community

Status: Planned

- [ ] User profile
- [ ] My legends
- [ ] Comments
- [ ] Ratings
- [ ] Favorite legends
- [ ] Public author pages
- [ ] User activity overview

---

# v0.7 - Interactive Map

Status: Planned

- [ ] Map of Poland
- [ ] Legends by region
- [ ] Regional statistics
- [ ] Region detail pages
- [ ] Map filters

---

# v1.0 - Release

Status: Future

First stable version of the application.

Planned release criteria:

- [ ] Stable public browsing
- [ ] Stable authentication
- [ ] Stable user-generated content flow
- [ ] Admin moderation workflow
- [ ] Production deployment configuration
- [ ] Basic security review
- [ ] Final UI polish
