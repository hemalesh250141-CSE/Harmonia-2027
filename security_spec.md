# HARMONIA 2027 Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity Integrity**: A participant profile at `/participants/{uid}` may only be created, read, or updated by the verified authenticated owner (`request.auth.uid == uid`) or an authenticated verified Admin (`isAdmin()`).
2. **Registration Ownership & Initial State**: A team creating `/registrations/{regId}` must set `leaderUid == request.auth.uid`, `status == 'Submitted'`, `paymentStatus == 'PENDING'`, and a valid `registrationFee` matching `[150, 300, 450, 500]` for `memberCount` in `[1, 2, 3, 4]`.
3. **Immutable Audit Fields**: After creation, `leaderUid`, `createdAt`, `id`, and `registrationFee` cannot be altered by participants.
4. **PII Isolation & Query Enforcement**: `allow list` on `/registrations/{regId}` and `/participants/{uid}` strictly checks `isAdmin() || resource.data.leaderUid == request.auth.uid` so non-admins cannot scrape other teams' phone numbers or emails.
5. **Payment & Review Privilege Separation**: Only Admins (`isAdmin()`) may set `paymentStatus` to `VERIFIED` or `REJECTED` or transition `status` (`Submitted` -> `Under Review` -> `Shortlisted` -> `Finalist` -> `Rejected`). Participants can only re-upload `paymentScreenshotUrl` while `paymentStatus != 'VERIFIED'`.
6. **Public Payment QR Integrity**: Only `payment_config/active_qr` is readable by `get`; updates require `isAdmin()` and strict size limits (`<= 220000` bytes).

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated read of `/registrations/HAR-2027-K9M4P` (PII leak).
2. Unauthenticated `list` query on `/registrations` (bulk scraping).
3. Authenticated non-admin reading another user's `/participants/{otherUid}`.
4. Creating a registration with `leaderUid` spoofed to another UID.
5. Creating a registration with `paymentStatus: 'VERIFIED'` or `status: 'Finalist'` directly from client.
6. Creating a registration with mismatched fee (`memberCount: 4, registrationFee: 150`).
7. Updating a registration with an injected shadow field (`isAdmin: true` or `bypassFee: true`).
8. Participant attempting to update `paymentStatus: 'VERIFIED'` on their own registration.
9. Participant attempting to re-upload screenshot after `paymentStatus == 'VERIFIED'` (terminal lock).
10. Injecting a 1MB oversized string into `paymentScreenshotUrl` or `abstract` (Denial of Wallet).
11. Spoofing document ID `/registrations/invalid$$$id` (Path Variable Poisoning).
12. Non-admin attempting to overwrite `/payment_config/active_qr` with a malicious UPI QR.
