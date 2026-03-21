# TEST_MATRIX.md — SalonDossier

## Current implementation

| Risk | Protection | Test | Expected |
|---|---|---|---|
| Customer accesses another salon's customer record | Object-level auth + salon scoping | Change customer ID to one from another salon | 403/404 |
| Staff accesses another salon's appointment or treatment | Object-level auth + salon scoping | Change appointment/treatment ID in request | 403/404 |
| Staff escalates a user to owner without owner rights | Server-side role enforcement | Submit owner role change as admin or medewerker | 403/rejected |
| Staff disables or deletes the last owner | Server-side business rules | Demote, disable, or delete the final owner | Rejected |
| Mass assignment on medewerker update | Strict DTO allowlist | Send hidden fields like salonId/isPlatformAdmin | Rejected |
| Brute force login | Rate limit | Repeated failed logins | Limited/blocked |
| Sensitive admin mutation flood | Action rate limit | Repeated rapid team/settings/platform writes | Limited/blocked |
| Password change abuse | Sensitive action rate limit + password verify | Repeated failed password change attempts | Limited/blocked |
| Password reset token replay | Single-use token + expiry | Reuse reset token after completion | Rejected |
| Mass assignment on appointment update | Allowlist DTO | Send hidden fields like employee_id/payment_status | Rejected |
| Overbooking bypass | Business rule validation | Create conflicting appointments manually | Rejected |
| Export customer list without permission | Permission + audit | Staff without export rights calls export endpoint | 403/no export |
| Sensitive data in logs | Redaction | Inspect logs around auth/payment failures | No secrets/full PII |
| Query abuse | Validation/caps | Excessive limit or unsafe sort field | Rejected/capped |
| Delete history without audit | Audit logging | Destructive action on appointment/customer | Logged |
| Cross-salon attachment access | Object-level auth | Open uploaded file from another salon record | Rejected |
