# 📜 Changelog

## v0.4.0 - Authentication & User Experience

Status: Completed

### Added

- User registration endpoint.
- User login endpoint.
- JWT-based authentication flow.
- `GET /api/auth/me` endpoint for current authenticated user.
- `USER` and `ADMIN` role-based authorization.
- Legend ownership rules.
- Protected legend modification endpoints.
- Protected image upload endpoint.
- Admin-only orphan image cleanup.
- Centralized API error responses.
- Login page.
- Register page.
- AuthContext for frontend authentication state.
- Automatic `Authorization: Bearer <token>` header for authenticated requests.
- Logout flow.
- Dynamic navbar based on authentication state.
- Frontend permission helper for legend actions.
- UI support for hiding Edit/Delete actions when the user has no permission.
- Home Page CTA behavior based on authentication state.
- Redirect to login when an unauthenticated user wants to add a legend.
- Frontend token cleanup after unauthorized API responses.

### Changed

- Public users can read legends without authentication.
- Only authenticated users can create legends.
- Regular users can edit and delete only their own legends.
- Admin users can edit and delete all legends.
- Register endpoint returns a proper success response after account creation.
- Login errors now use a generic message to avoid revealing whether username or password was incorrect.
- Navbar now replaces Login/Register with a welcome message and Logout after login.
- Latest Legends cards on the Home Page now correctly route to legend details.
- Frontend forms and actions now better reflect backend authorization rules.
- Application error handling was improved to avoid exposing technical details to users.
- Upload validation and multipart limits were tightened.

### Fixed

- Login/Register buttons remaining visible after successful login.
- User being able to log in as another user without first logging out.
- Persistent login success toast after logout.
- Unauthenticated users not being able to open latest legend cards from the Home Page.
- ESLint `rules-of-hooks` warning in `LegendsPage`.
- JSX structure issue in `LegendModal`.
- `GET /api/legends/` trailing slash returning an unexpected server error.
- Unauthorized/forbidden actions now produce clearer frontend messages.
- Token is removed from local storage after a `401 Unauthorized` response.

### Security

- Passwords are stored as BCrypt hashes.
- Protected backend endpoints require a valid JWT.
- Backend enforces authorization independently from the frontend UI.
- `USER` cannot modify legends owned by other users.
- `ADMIN` can manage all legends.
- Orphan image cleanup is restricted to `ADMIN`.
- Stack traces and internal exception details are not exposed to API consumers.
- File uploads are restricted by type and size.
- JWT secret should be provided through environment configuration before production deployment.

---

## v0.3.0 - Foundation & Home

Status: Completed

### Added

- Spring Boot REST API.
- Legend CRUD.
- Flyway database migrations.
- Image upload support.
- Upload image cleanup.
- React Router.
- MainLayout.
- Home Page.
- Hero Section.
- Latest Legends section.
- Navbar.
- About Section.
- Footer.
- Home Stats Section.
- Public home statistics endpoint.

### Changed

- Refactored frontend architecture.
- Separated routing from `App.jsx`.
- Replaced detailed stats on Home Page with lightweight KPI cards.
- Improved backend structure for future security work.

### Fixed

- Image cleanup after deleting legends.
- Home Page structure and responsiveness.
