# 📜 Changelog

## v0.5.0 - Admin & Content Management

Status: Completed

### Added

- Protected administrator area under `/admin` with a dedicated layout and navigation.
- Admin-only route guard with loading, unauthenticated and unauthorized states.
- Administrator dashboard with legend and user totals, recent activity and time-based statistics.
- Administrative legend management with search, filters, sorting, pagination, preview, editing and deletion.
- Administrative user management with search, filters, sorting, pagination and per-user legend counts.
- User role management for `USER` and `ADMIN`.
- Account locking and unlocking with immediate rejection of blocked accounts during login and JWT validation.
- Safe user deletion with two content policies:
  - `ANONYMIZE` keeps legends and removes their author reference.
  - `DELETE` removes the user, their legends and associated image files.
- Protection against changing, locking or deleting the current administrator account.
- Protection against removing or locking the last active administrator.
- Media management page with image previews, disk usage statistics and legend references.
- Detection and removal of orphaned image files.
- Protection against deleting image files still used by legends.
- Administrative audit log with search, filters, pagination and chronological sorting.
- Audit events for legend updates and deletions, user role and lock changes, user deletion and media cleanup.
- Flyway migration for user account status fields and legend image URL schema synchronization.
- Flyway/JPA schema validation test.
- Backend tests for authentication, user flows, legend ownership and file uploads.
- Frontend tests for admin route protection, media URL resolution, permission helpers and auth storage handling.

### Changed

- CORS configuration is centralized in Spring Security.
- Allowed frontend origins are configured through `app.cors.allowed-origins` and the `APP_CORS_ALLOWED_ORIGINS` environment variable.
- Controller-level `@CrossOrigin` declarations and the duplicate MVC CORS configuration were removed.
- The base backend profile now requires `JWT_SECRET` instead of containing a development fallback.
- `spring.jpa.open-in-view` is disabled.
- Legend author data used by administrative lists is loaded with `@EntityGraph` to avoid lazy-loading and N+1 issues.
- Authentication storage access is centralized in `authSession.js`.
- A malformed `legends_user` local-storage entry is now safely discarded instead of crashing React during startup.
- A `401 Unauthorized` response now clears storage and immediately synchronizes the React authentication state.
- Administrator pages are loaded with route-level `React.lazy` imports.
- The Recharts-based statistics component is loaded as a separate lazy chunk.
- Administrative endpoints are protected by both URL rules and method-level authorization where appropriate.

### Fixed

- Duplicate and conflicting CORS definitions that could produce inconsistent preflight behavior.
- The duplicate `setAllowedMethods` configuration in `SecurityConfig`.
- Stale authenticated UI state after an API interceptor handled a `401` response.
- Application startup failure caused by invalid JSON stored in `localStorage`.
- Schema drift between Flyway migrations and JPA mappings for `enabled`, `locked` and `image_url`.
- Legend ownership/security test regressions after administrator functionality was introduced.
- Administrator routes being accessible without the intended route guard.
- Lazy author access in administrative legend responses.
- Large initial frontend bundle caused by eager imports of all administrator pages and charts.

### Security

- Backend authorization remains the source of truth for every administrative operation.
- Blocked or disabled accounts cannot authenticate and existing JWTs no longer grant access.
- Critical role, lock and deletion operations require confirmation in the UI and validation on the backend.
- User deletion cannot remove the current administrator or the final administrator account.
- Media deletion validates filenames, rejects traversal attempts and protects files referenced by legends.
- Audit entries preserve administrator and target snapshots without foreign keys, so historical records survive later deletions.
- Production CORS origins and JWT secrets are externalized through environment configuration.

### Performance

- Administrator pages are split into on-demand route chunks.
- Recharts is excluded from the initial application chunk and loaded only when legend statistics are rendered.
- Batch queries are used to obtain per-user legend counts.
- Entity graphs are used where author data is required by paged administrative results.

---

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
- Login errors use a generic message to avoid revealing whether the username or password was incorrect.
- Navbar replaces Login/Register with a welcome message and Logout after login.
- Latest Legends cards on the Home Page route correctly to legend details.
- Frontend forms and actions reflect backend authorization rules.
- Error handling avoids exposing technical details to users.
- Upload validation and multipart limits were tightened.

### Fixed

- Login/Register buttons remaining visible after successful login.
- User being able to log in as another user without first logging out.
- Persistent login success toast after logout.
- Unauthenticated users not being able to open latest legend cards from the Home Page.
- ESLint `rules-of-hooks` warning in `LegendsPage`.
- JSX structure issue in `LegendModal`.
- `GET /api/legends/` trailing slash returning an unexpected server error.
- Unauthorized and forbidden actions now produce clearer frontend messages.
- Token removal from local storage after a `401 Unauthorized` response.

### Security

- Passwords are stored as BCrypt hashes.
- Protected backend endpoints require a valid JWT.
- Backend enforces authorization independently from frontend UI.
- `USER` cannot modify legends owned by other users.
- `ADMIN` can manage all legends.
- Orphan image cleanup is restricted to `ADMIN`.
- Stack traces and internal exception details are not exposed to API consumers.
- File uploads are restricted by type and size.

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
