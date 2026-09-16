# Security Specification & Threat Model - M1 Serviços Firestore

## 1. Data Invariants
- **Service Ownership**: A service order (`/services/{serviceId}`) must be authored by a valid client (`clientId`) and can only be updated by the client, the assigned provider, or an administrator.
- **Chat Access Isolation**:
  - **Fase 1 (Aguardando Aprovação)**: Access to the chat messages for a service is strictly restricted to the client and administrators. The provider is blocked from reading or writing messages.
  - **Fase 2 (Serviço Aprovado / Atendimento)**: If `providerChatReleased` is `true`, both client and provider can communicate. The admin can listen/monitor and interject.
- **Message Integrity**: A message cannot spoof its `senderRole` (e.g. a client cannot post a message as `admin` or `provider`).
- **Immutable Fields**: `createdAt`, `serviceId`, and `senderId` are immutable once created.

---

## 2. The "Dirty Dozen" Payloads (Exploit Scenarios)
These payloads represent attempts to bypass authorization, pollute the database, or escalate privileges:

1. **Self-Elevating Admin Profile**: A non-admin client attempts to create an admin entry in `/users/{userId}` with `role: "admin"`.
2. **Orphaned Message**: A user attempts to create a message in `/chatMessages/{msgId}` without any linked `serviceId`.
3. **Chat Spoofing (Client as Admin)**: A client sends a message to `/chatMessages/{msgId}` setting `senderRole: "admin"` to issue system commands or spoof the admin.
4. **Unreleased Provider Intrusion**: A provider attempts to read messages of a service where `providerChatReleased` is `false`.
5. **Junk String ID Poisoning**: An attacker tries to write a service document with a 1.5MB garbage string as the `serviceId` to exhaust memory or crash indexing.
6. **Bypassing Transition Steps**: A provider attempts to forcefully change the status of a service to `concluido_pago` without going through `em_atendimento`.
7. **Cross-User Message Deletion**: A client attempts to delete a message sent by the admin or another user.
8. **Malicious Timestamp Inversion**: A client attempts to set `createdAt` in the future or backdate a message to fake urgency.
9. **Volumetric Denial of Wallet**: An attacker attempts to write a message with `text` size exceeding 5,000 characters to bloat database memory.
10. **Hijacking Service Assignments**: A provider tries to update a service to assign themselves (`providerId`) without the admin's dispatch.
11. **Client Spoofing Client**: Client A attempts to read/write messages belonging to a service requested by Client B.
12. **Self-Releasing Chat**: A provider attempts to write `providerChatReleased: true` on a service document directly.

---

## 3. Recommended Rules Verification
These exploits will be blocked and return `PERMISSION_DENIED` at the Firestore boundary.
