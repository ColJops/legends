# TODO

## Completed releases

### v0.4 - Authentication & User Experience

Status: Completed

- [x] Registration, login, JWT authentication and logout
- [x] Auth context, protected endpoints and ownership rules
- [x] Frontend permission handling and authenticated navigation
- [x] Authentication UX and security cleanup

### v0.5 - Admin & Content Management

Status: Completed

- [x] Administrator layout, dashboard and protected routes
- [x] Administrative legend and user management
- [x] Role changes, account locking and safe account deletion
- [x] Media management and orphan cleanup
- [x] Administrative audit log
- [x] Environment-driven JWT secret and CORS configuration
- [x] Security headers and schema validation

### v0.6 - Moderation & Community Foundation

Status: Completed

- [x] Account settings and password change
- [x] My Legends with USER ownership; ADMIN uses the admin area
- [x] User Profile with recent contributions
- [x] Email verification and password reset
- [x] Legend publication lifecycle: `DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`, `ARCHIVED`
- [x] Moderation queue with approve, reject, archive and restore workflows
- [x] Rejection reasons, moderator notes and moderation audit events
- [x] User reports, duplicate-open-report protection and report moderation
- [x] Admin task counts and full image previews in moderation queues

### v0.7 - Community

Status: Completed

- [x] Comments, ratings, favorites, public author pages and user activity overview

### v0.8 - Interactive Map

Status: Completed

- [x] Interactive Poland map, regional statistics and region pages
- [x] Map category filter and searchable region list
- [x] Teryt24 postal-code lookup with manual fallback and no postal-code storage

## Next planned sprint

### v1.0 - Stable Release Preparation

Status: Planned

- [ ] Review dependencies and security; complete authentication and upload integration coverage
- [ ] Review accessibility and responsive layouts
- [ ] Prepare production deployment, CORS and secret configuration
- [ ] Document deployment, backup and recovery

## Remaining backlog

### Backend and security

- [ ] Refresh tokens
- [ ] Rate limiting for login and registration
- [ ] Login attempt throttling

### Frontend polish

- [ ] Loading skeletons and improved empty states
- [ ] Error and 404 page polish
- [ ] Improve mobile navigation
- [ ] Improve form validation messages
- [ ] Refactor HomePage, Navbar and cards
