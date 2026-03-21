# ARCHITECTURE.md — SalonDossier

## System boundaries
- Frontend: customer booking UI + staff/admin dashboard
- Backend/API: auth, authz, pricing rules, scheduling logic, validation, reporting
- Database: customers, appointments, staff, services, notes, billing
- Email/SMS provider: reminders and confirmations
- Optional payments/invoicing provider

## Trust boundaries
1. Customer browser/app -> public booking/API
2. Staff/admin dashboard -> privileged API
3. API -> database
4. API -> notification/payment providers

## Multi-branch model
Primary scope may be:
- salon_id
- branch_id

Every branch-bound resource must be server-scoped.

## Suggested entities
- users
- salons
- branches
- employees
- customers
- services
- appointments
- appointment_notes
- schedules
- availability_rules
- invoices
- payments
- audit_logs

## Auth model
- Central user identity
- Role and branch membership resolved server-side
- Customer accounts separated logically from staff permissions
- Middleware can authenticate, but authorization must also happen in route/service layer

## Authorization model
Examples:
- Customer: own bookings/profile only
- Employee: own agenda and assigned customer data within branch scope
- Reception: branch scheduling/customer access as configured
- Manager: branch-wide operational access
- Owner: full salon access, heavily logged for sensitive actions

## Critical abuse surfaces
- appointment creation/update/cancel
- pricing or discount overrides
- employee schedule changes
- customer notes
- customer export
- invoice/payment status changes
- role and branch permission changes

## Validation boundaries
Validation required at:
- request schema layer
- service/business rules
- DB constraints

## Logging model
- Audit log for privileged actions and customer-data-sensitive operations
- Standard logs separate from audit logs
- redact tokens and sensitive financial/customer details where needed

## Deployment assumptions
- Vercel or equivalent frontend/server hosting
- protected server routes
- secure headers configured centrally
- env vars per environment
