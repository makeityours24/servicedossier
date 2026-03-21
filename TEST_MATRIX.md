# TEST_MATRIX.md — SalonDossier

| Risk | Protection | Test | Expected |
|---|---|---|---|
| Customer accesses another customer's booking | Object-level auth | Change booking ID in request | 403/404 |
| Employee accesses another branch's customers | Branch scoping | Employee from branch A requests branch B customer | 403 |
| Reception escalates role | Server-side role enforcement | Submit role change as reception | 403 |
| Client manipulates service price/discount | Server-side pricing rules | Modify payload price/discount in devtools | Ignored/rejected |
| Unauthorized invoice/payment edit | Permission check + audit | Employee edits paid invoice without rights | 403 |
| Notes leakage | Object-level auth | Request notes for unrelated customer | 403 |
| Brute force login | Rate limit | Repeated failed logins | Limited/blocked |
| Reset token replay | Single-use token | Reuse password reset token | Rejected |
| Mass assignment on appointment update | Allowlist DTO | Send hidden fields like employee_id/branch_id/payment_status | Rejected |
| Overbooking bypass | Business rule validation | Create conflicting appointments manually | Rejected |
| Export customer list without permission | Permission + audit | Staff without export rights calls export endpoint | 403 |
| Sensitive data in logs | Redaction | Inspect logs around auth/payment failures | No secrets/full PII |
| Query abuse | Validation/caps | Excessive limit or unsafe sort field | Rejected/capped |
| Delete history without audit | Audit logging | Destructive action on appointment/customer | Logged |
| Cross-user attachment access | Object-level auth | Open uploaded file from another customer record | Rejected |
