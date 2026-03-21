# SECURITY.md — SalonDossier

## Security principles
- Never trust the client.
- All authorization is server-side.
- Least privilege by default.
- Customer data is sensitive.
- Audit all high-risk actions.
- Secrets are never stored in source code or exposed to the client.

## Core roles
- Platform Admin
- Owner
- Admin / Manager
- Employee / Stylist

## Mandatory controls

### Authentication
- Secure session or signed token implementation only.
- Passwords hashed using a strong modern password hashing algorithm.
- Rate limit login and reset flows, plus other sensitive admin mutations.
- Password reset tokens must be short-lived and single-use.
- Session invalidation after password reset and major credential changes.

### Authorization
- Server-side enforcement for every dashboard, API route, and mutation.
- Staff may only access customers, appointments, notes, packages, uploads, and schedules within their own salon scope.
- Platform-only actions must be explicit and auditable.
- Owner-only actions must be explicit and auditable.
- Never trust client-provided salon_id, employee_id, role, package balance, appointment status, or ownership fields.

### Privacy-sensitive data
Sensitive categories include:
- customer names and contact details
- appointment history
- stylist notes
- no-show/cancellation history
- optional image uploads

These must be access-controlled and minimally exposed.

### Input validation
- Validate all request inputs.
- Reject unexpected fields.
- Prevent mass assignment.
- Strict validation for durations, notes, uploaded files, package corrections, and status transitions.

### Business-logic protection
- Prevent unauthorized appointment reassignment.
- Prevent overbooking if business rules disallow it.
- Prevent fake no-show / attendance manipulation by low-privilege users.
- Prevent silent package/stamp-card balance edits outside controlled correction flows.

### Logging and audit
Audit log required for:
- login success/failure
- password reset request/completion
- role changes
- salon settings changes
- appointment status changes
- package correction actions
- destructive actions
- employee permission changes

Audit logs must not store secrets or raw reset tokens.

### API security
- Rate limit auth and sensitive write endpoints.
- Object-level authorization on appointments, customers, treatments, package records, uploads, and reports.
- Validate all filters, sorting, and pagination.
- Use idempotency or duplicate-submission protection for booking-sensitive flows where relevant.

### Frontend security
- Frontend is not a trust boundary.
- Do not expose internal admin-only data to the client.
- Configure secure headers and secure cookies.
- Minimize sensitive data returned to browser.

### Infra and secrets
- Environment variables only.
- Separate dev/preview/prod secrets.
- Debug disabled in production.
- No secrets in logs.
- Production backups and exports must be access-controlled.

### Data retention
- Define retention for logs, deleted customers, old appointments, and exports.
- Ensure deletion/export actions are permission-checked and logged.
