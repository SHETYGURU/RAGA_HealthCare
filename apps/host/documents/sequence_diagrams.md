# Sequence Diagrams - RAGA HealthCare

Visual representations of critical workflows in the system.

## 1. Automated Password Reset Flow

Describes the secure dual-notification process when a user loses access.

```mermaid
sequenceDiagram
    participant User
    participant Login as Login Page
    participant Auth as Firebase Auth
    participant Mail as EmailJS
    participant Inbox as User Email

    User->>Login: Clicks "Forgot Password"
    User->>Login: Enters Email & Submits
    Login->>Auth: sendPasswordResetEmail(email)
    Auth->>Inbox: Sends Official Secure Link
    Login->>Mail: send(template_3larvgd)
    Mail->>Inbox: Sends Branded Reset Notification
    Login->>User: Displays "Reset Link Sent"
```

## 2. Patient Registration Flow

Describes the interaction between the Admin and the Backend when registering a new patient.

```mermaid
sequenceDiagram
    participant Admin
    participant UI as PatientModule
    participant Service as patientService
    participant DB as Firestore

    Admin->>UI: Clicks "Add Patient"
    UI->>Admin: Displays Form
    Admin->>UI: Fills details & Clicks "Save"
    UI->>Service: addPatient(formData)
    Service->>DB: collection("patients").add(data)
    DB-->>UI: Success
    UI->>Admin: Show "Success" & Refresh Grid
```

## 3. Bulk Status Update Flow

How multiple patient records are updated in a single transaction-like batch.

```mermaid
sequenceDiagram
    participant User
    participant UI as PatientModule
    participant Service as patientService
    participant DB as Firestore

    User->>UI: Selects multiple patients
    User->>UI: Selects Status from Batch Toolbar
    UI->>Service: updatePatientStatus(ids, status)
    Note over Service, DB: Uses writeBatch(db) for atomicity
    Service->>DB: batch.commit()
    DB-->>UI: Success
    UI->>User: Clear selection & Update local state
```

---

© 2026 RAGA HealthCare Systems. All rights reserved.
