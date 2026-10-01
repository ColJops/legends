# Architecture Decision Records

---

# ADR-004: Application language

## Decision

The public application UI will initially be developed in Polish.

Project documentation, code, commit messages and technical files will be written in English.

## Reason

The first target audience is Polish-speaking users interested in Polish legends and local folklore. Adding full multilingual support at this stage would increase complexity, especially for user-generated legend content.

## Status

Accepted

---

# ADR-005: Authentication model

## Decision

The application uses JWT-based authentication with Spring Security on the backend and an AuthContext-based session state on the frontend.

The frontend stores the JWT in local storage during the current development stage and sends it through the `Authorization: Bearer <token>` header.

## Reason

JWT authentication fits the REST API architecture and keeps frontend/backend integration simple during active development.

The local-storage approach must be reviewed before production. A later release may move authentication to HTTP-only cookies and refresh tokens.

## Consequences

- Authenticated API requests are straightforward.
- The frontend can restore a session after page refresh.
- XSS protection remains especially important.
- Refresh-token handling is not yet implemented.

## Status

Accepted

---

# ADR-006: Authorization and legend ownership

## Decision

Legend modification is protected by authentication and ownership rules.

- Public users can read legends.
- Authenticated `USER` accounts can create legends.
- `USER` accounts can edit and delete only their own legends.
- `ADMIN` accounts can edit and delete all legends.
- Administrative and maintenance operations are restricted to `ADMIN`.

## Reason

User-generated content must not be modifiable by unrelated users. Administrators need an override for moderation and maintenance.

## Consequences

- Backend authorization is the source of truth.
- Frontend permission checks improve UX but do not replace backend security.
- Legend responses contain author identifiers needed for ownership-aware UI.

## Status

Accepted

---

# ADR-007: Public read access

## Decision

Legend reading, public home statistics and uploaded legend images remain available without authentication.

Creating, editing, deleting and uploading require authentication.

## Reason

Discovering legends is the core public use case. Requiring an account only for contribution reduces friction for visitors.

## Status

Accepted

---

# ADR-008: Error handling and safe API responses

## Decision

The backend uses centralized exception handling and does not expose stack traces, internal class names or database details to API clients.

## Consequences

- Validation and business failures return controlled status codes.
- Detailed diagnostics remain in backend logs.
- Frontend users receive stable, human-readable messages.

## Status

Accepted

---

# ADR-009: Dedicated administrator area and layered authorization

## Decision

Administrative functionality is exposed through a dedicated `/admin` frontend area and `/api/admin/**` backend namespace.

Frontend routes are guarded by `AdminRoute`. Backend routes are protected by Spring Security URL rules and, for sensitive controllers, method-level `@PreAuthorize` checks.

## Reason

The admin UI must not be discoverable as a normal user workflow, but hiding UI is not a security boundary. Layered backend checks reduce the impact of future routing or configuration regressions.

## Consequences

- Administrator pages use a separate layout and navigation.
- Ordinary users are redirected to an unauthorized page.
- Direct API calls remain protected independently from React.

## Status

Accepted

---

# ADR-010: User deletion and retained content

## Decision

Administrators choose one of two explicit policies when deleting an account:

- `ANONYMIZE`: delete the account and retain legends with a `null` author.
- `DELETE`: delete the account, authored legends and associated image files.

The current administrator and the final administrator account cannot be deleted.

## Reason

Account removal and content removal are different business decisions. Automatic cascading deletion could destroy valuable public content, while forced retention may conflict with an intended full cleanup.

## Consequences

- The database permits `Legend.author` to be `null`.
- Public UI must support an unknown or removed author.
- Image deletion is performed only after the database transaction commits.

## Status

Accepted

---

# ADR-011: Filesystem media management and orphan safety

## Decision

Legend images remain stored in the configured filesystem upload directory. The administrator panel inventories files, maps them to legends and permits deletion only when a file is orphaned.

Filenames are generated as UUIDs, extensions are allow-listed and paths are normalized before deletion.

## Reason

The current project scale does not require object storage, but filesystem maintenance must still prevent traversal, accidental removal of referenced files and silent disk growth.

## Consequences

- `app.upload.dir` controls the physical storage location.
- Used files cannot be deleted through the media endpoint.
- Bulk cleanup compares disk files against image URLs stored in the database.

## Status

Accepted

---

# ADR-012: Administrative audit log uses immutable snapshots

## Decision

Administrative actions are recorded in `admin_audit_logs` with administrator and target snapshots rather than foreign-key relationships.

Recorded fields include administrator ID and username, action, target type, target ID, target label, details and timestamp.

## Reason

Audit history must remain readable after a user, legend or file has been deleted. Foreign keys to mutable or removable domain records would weaken that guarantee.

## Consequences

- Audit rows are append-only application records.
- Historical labels may differ from the current object name after later edits.
- Sensitive data must not be placed in the free-text details field.

## Status

Accepted

---

# ADR-013: Centralized environment-driven CORS policy

## Decision

CORS is configured only through the `CorsConfigurationSource` used by Spring Security.

Allowed origins are supplied as a comma-separated value through:

```properties
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

Controller-level `@CrossOrigin` declarations and separate MVC CORS configuration are not used.

## Reason

Multiple CORS layers can disagree on origins, methods or preflight handling. A single policy is easier to test and safer to deploy.

## Consequences

- Production deployments must set `APP_CORS_ALLOWED_ORIGINS`.
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE` and `OPTIONS` are explicitly allowed.
- Bearer-token authentication does not require credentialed CORS requests.

## Status

Accepted

---

# ADR-014: Frontend auth synchronization and route-level code splitting

## Decision

Authentication storage operations are centralized in `authSession.js`.

Malformed stored user JSON is discarded safely. When the Axios interceptor receives `401 Unauthorized`, it clears storage and dispatches an application event consumed by `AuthContext`, which immediately clears React state.

Administrator pages and the Recharts statistics component are loaded with `React.lazy` and `Suspense`.

## Reason

Storage and React state must not diverge after an expired token. Large administrator modules and charting dependencies are not needed for the initial public route and should not increase the first-load bundle.

## Consequences

- UI authentication state updates immediately after `401`.
- Startup is resilient to corrupted local storage.
- Admin pages are downloaded only after an authorized user opens them.
- Charting code is downloaded separately when statistics are rendered.

## Status

Accepted
