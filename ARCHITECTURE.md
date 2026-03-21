# ARCHITECTURE.md — SalonDossier

## System boundaries
- Frontend: public marketing/login pages + staff/admin dashboard
- Backend/API: auth, authz, scheduling logic, package logic, validation, reporting
- Database: salons, users, customers, appointments, treatments, packages, notes, uploads, audit
- Email provider: password reset and reminder notifications if configured

## Trust boundaries
1. Browser -> public login/reset routes
2. Staff/admin dashboard -> privileged API
3. API -> database
4. API -> notification providers

## Tenant model
Primary scope:
- salon_id

Every tenant-bound resource must be server-scoped by salon_id.

## Suggested entities
- users
- salons
- customers
- appointments
- treatments
- recipe_templates
- package_types
- customer_packages
- customer_package_usages
- treatment_photos
- login_throttles
- action_throttles
- password_reset_tokens
- audit_logs

## Auth model
- Central user identity
- Role and salon membership resolved server-side
- Middleware can authenticate, but authorization must also happen in route/service layer

## Authorization model
Examples:
- Platform Admin: cross-salon platform access, heavily logged
- Owner: full salon access, heavily logged for sensitive actions
- Admin / Manager: salon operational access without owner-only privileges
- Employee / Stylist: assigned or salon-permitted customer and appointment access within salon scope

## Critical abuse surfaces
- appointment creation/update/cancel
- treatment creation/update/delete
- package corrections and deductions
- customer notes
- customer export
- role and salon permission changes
- photo upload and access
- password reset flows

## Validation boundaries
Validation required at:
- request schema layer
- service/business rules
- DB constraints

## Logging model
- Audit log for privileged actions and customer-data-sensitive operations
- Standard logs separate from audit logs
- redact tokens and sensitive customer details where needed

## Deployment assumptions
- Vercel or equivalent frontend/server hosting
- protected server routes
- secure headers configured centrally
- env vars per environment
