# ✅ TODO

## Current Sprint

### v0.5 - Admin & Content Management

- [x] Define administrator dashboard scope
- [x] Create protected admin routing
- [x] Create Admin Layout and navigation
- [x] Add admin navigation entry visible only to `ADMIN`
- [x] Implement dashboard backend and frontend
- [x] Implement legend list, filters, sorting and pagination
- [x] Implement administrator legend editing
- [x] Implement administrator legend deletion
- [x] Implement user list, filters, sorting and pagination
- [x] Add role management
- [x] Add account lock and unlock
- [x] Reject existing JWT access for blocked users
- [x] Add safe user deletion policies
- [x] Protect current and final administrator accounts
- [x] Add media inventory and preview UI
- [x] Add orphan detection and safe cleanup
- [x] Add administrative audit log
- [x] Add Flyway/JPA schema validation test
- [x] Update auth and ownership tests
- [x] Require `JWT_SECRET` in the base profile
- [x] Disable `spring.jpa.open-in-view`
- [x] Add migration V5 for account status and image URL schema
- [x] Centralize CORS configuration
- [x] Externalize allowed CORS origins
- [x] Safely parse authentication data from local storage
- [x] Synchronize React auth state after `401 Unauthorized`
- [x] Lazy-load administrator pages
- [x] Lazy-load statistics charts
- [x] Update documentation

## Release Checklist

- [ ] Run the complete backend test suite from the full repository
- [ ] Run the complete frontend test suite from the full repository
- [ ] Run the production frontend build and verify final chunk sizes
- [ ] Test CORS with `APP_CORS_ALLOWED_ORIGINS` set to the production frontend URL
- [ ] Test backend startup without `JWT_SECRET` and with a valid production secret
- [ ] Smoke-test login, admin routes, legend editing, user locking, media cleanup and audit logs
- [ ] Review `git diff`
- [ ] Create the v0.5 commit
- [ ] Push the branch and optionally create tag `v0.5.0`

---

## Next Sprint

### v0.6 - Moderation & Community Foundation

- [ ] Add `LegendStatus`
- [ ] Add moderation queue
- [ ] Add approve/reject/archive actions
- [ ] Store moderation notes and rejection reasons
- [ ] Add inappropriate-content reports
- [ ] Add user profile
- [ ] Add My Legends page
- [ ] Add account settings
- [ ] Add password reset
- [ ] Add email verification

---

## Backend Backlog

- [ ] Refresh tokens
- [ ] Consider HTTP-only cookie authentication before production
- [ ] Rate limiting for login and registration
- [ ] Login attempt throttling
- [ ] Security headers review
- [ ] Dependency vulnerability scanning
- [ ] Integration tests for CORS preflight behavior
- [ ] Integration tests for administrative authorization
- [ ] Integration tests for user deletion policies
- [ ] Database backup and restore procedure
- [ ] Structured application logging

---

## Frontend Backlog

- [ ] Custom route-level error boundary
- [ ] Dedicated 404 page
- [ ] Unauthorized Page polish
- [ ] Improve mobile admin navigation
- [ ] Refactor large admin pages into smaller components
- [ ] Add accessible modal focus trapping and Escape handling
- [ ] Add bundle analysis command
- [ ] Monitor route chunk sizes after future dependencies are added
- [ ] Improve form validation messages
- [ ] Add profile menu

---

## Future

- [ ] Comments
- [ ] Ratings
- [ ] Favorites
- [ ] Public author pages
- [ ] Interactive map
- [ ] Region pages
