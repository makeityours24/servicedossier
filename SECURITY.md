# SECURITY.md — SalonDossier

## Security principles
- Never trust the client.
- All authorization is server-side.
- Least privilege by default.
- Customer data is sensitive.
- Audit all high-risk actions.
- Secrets are never stored in source code or exposed to the client.

## Core roles
- Owner
- Manager
- Employee / Stylist
- Reception
- Customer
- Accountant / Read-only reporting (optional)

## Mandatory controls

### Authentication
- Secure session or signed token implementation only.
- Passwords hashed using a strong modern password hashing algorithm.
- Rate limit login, signup, invitation, and reset flows.
- Password reset tokens must be short-lived and single-use.
- Session invalidation after password reset and major credential changes.

### Authorization
- Server-side enforcement for every dashboard, API route, and mutation.
- Employees may only access customers, appointments, notes, and schedules allowed by their branch/shop scope.
- Customers may only access their own bookings and profile.
- Owner-only actions must be explicit and auditable.
- Never trust client-provided branch_id, employee_id, role, discount, payment status, or pricing override.

### Privacy-sensitive data
Sensitive categories include:
- customer names and contact details
- appointment history
- stylist notes
- no-show/cancellation history
- optional image uploads
- invoices/payment history if present

These must be access-controlled and minimally exposed.

### Input validation
- Validate all request inputs.
- Reject unexpected fields.
- Prevent mass assignment.
- Strict validation for prices, durations, discounts, notes, uploaded files, and status transitions.

### Business-logic protection
- Prevent unauthorized discount manipulation.
- Prevent unauthorized appointment reassignment.
- Prevent editing historical invoices/payments without proper permissions.
- Prevent overbooking if business rules disallow it.
- Prevent fake no-show / attendance manipulation by low-privilege users.

### Logging and audit
Audit log required for:
- login success/failure
- password reset request/completion
- role changes
- customer data export
- appointment status changes
- payment status changes
- discount overrides
- destructive actions
- employee permission changes

Audit logs must not store secrets, raw reset tokens, or full payment instrument data.

### API security
- Rate limit auth and sensitive write endpoints.
- Object-level authorization on appointments, customers, notes, invoices, reports.
- Validate all filters, sorting, and pagination.
- Use idempotency or duplicate-submission protection for booking/payment-sensitive flows where relevant.

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
