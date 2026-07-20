# Architecture Decision Records

---

# ADR-004: Application language

## Decision

The public application UI will initially be developed in Polish.

Project documentation, code, commit messages and technical files will be written in English.

## Reason

The first target audience is Polish-speaking users interested in Polish legends and local folklore.  
Adding full multilingual support at this stage would increase complexity, especially for user-generated legend content.

## Status

Accepted

---

# ADR-005: Authentication model

## Decision

The application uses JWT-based authentication with Spring Security on the backend and an AuthContext-based session state on the frontend.

The backend exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

The frontend stores the JWT in local storage for the current development stage and automatically sends it through the `Authorization: Bearer <token>` header.

## Reason

JWT authentication fits the current REST API architecture and keeps the frontend/backend integration simple during active development.

The local storage approach is acceptable for the current development stage, but it should be reviewed before production deployment. A future production-ready version may move authentication to a more secure cookie-based flow with HTTP-only cookies and refresh tokens.

## Consequences

- Authenticated API requests are easy to handle from React.
- The frontend can restore the logged-in state after page refresh.
- Token expiration and refresh token handling are not implemented yet.
- XSS protection becomes especially important while tokens are stored in local storage.

## Status

Accepted

---

# ADR-006: Authorization and legend ownership

## Decision

Legend modification is protected by both authentication and ownership rules.

Authorization model:

- Public users can read legends.
- Authenticated `USER` accounts can create legends.
- `USER` accounts can edit and delete only their own legends.
- `ADMIN` accounts can edit and delete all legends.
- Orphan image cleanup is restricted to `ADMIN`.

## Reason

The application contains user-generated content. A simple authenticated-only model would allow every logged-in user to modify all legends, which is not acceptable.

Ownership rules keep regular users limited to their own content, while admins retain moderation and maintenance capabilities.

## Consequences

- Legend responses include author information such as `authorId` and `authorUsername`.
- Backend authorization remains the source of truth.
- Frontend permissions only improve UX and do not replace backend security.
- Admin functionality can be expanded in a future sprint.

## Status

Accepted

---

# ADR-007: Public read access

## Decision

Legend reading remains public.

The following resources are available without authentication:

- `GET /api/legends`
- `GET /api/legends/{id}`
- public home statistics
- uploaded legend images

Creating, editing, deleting and uploading require authentication.

## Reason

The core purpose of the application is discovering Polish legends and local stories. Reading content should be frictionless for visitors, while content creation and modification should require an account.

## Consequences

- Visitors can browse and read legends without logging in.
- Login is required only when the user wants to contribute or modify content.
- Frontend CTA buttons guide unauthenticated users to login when needed.

## Status

Accepted

---

# ADR-008: Error handling and security cleanup

## Decision

The application uses centralized backend error handling and safe API responses.

Technical exception details, stack traces and internal class names are not exposed to frontend users.

## Reason

Raw backend errors can reveal implementation details such as package names, framework internals, endpoint mappings or database structure. This is risky from a security perspective and also creates poor UX.

## Consequences

- Business exceptions are mapped to safe API responses.
- Validation errors return controlled `400 Bad Request` responses.
- Authentication errors return `401 Unauthorized`.
- Authorization errors return `403 Forbidden`.
- Missing resources return `404 Not Found`.
- Unexpected errors return a generic `500 Internal Server Error`.
- Detailed errors remain available only in backend logs.

## Status

Accepted
