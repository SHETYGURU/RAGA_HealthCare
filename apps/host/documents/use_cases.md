# Use Cases - RAGA HealthCare

This document outlines the primary use cases and user interactions within the RAGA HealthCare platform.

## 1. Authentication & Access

### UC-1.1: Quick Access Login
*   **Actor**: All Users
*   **Description**: Instantly log in using pre-configured demo accounts.

```mermaid
graph LR
    A[Login Page] --> B{Quick Access Button}
    B -- Admin --> C[Pre-fill admin@raga.ai]
    B -- Doctor --> D[Pre-fill koushi098@gmail.com]
    C --> E[Auto Submit]
    D --> E
    E --> F[Dashboard]
```

### UC-1.2: Password Recovery
*   **Actor**: All Users
*   **Description**: Recover access to a locked account via email.

---

## 2. Patient Management

### UC-2.1: Register New Patient
*   **Actor**: Admin
*   **Description**: Register a new patient into the system with demographic and clinical details.

```mermaid
stateDiagram-v2
    [*] --> PatientDirectory
    PatientDirectory --> FormEntry: Click Add Patient
    FormEntry --> Firestore: Submit Valid Data
    Firestore --> PatientDirectory: Refresh List
    Firestore --> [*]: Success
```

### UC-2.2: Bulk Status Update
*   **Actor**: Admin, Doctor
*   **Description**: Update the clinical status of multiple patients simultaneously.

```mermaid
graph TD
    A[Select Patients] --> B[Open Batch Menu]
    B --> C[Select New Status]
    C --> D[Confirm Action]
    D --> E[Firestore Batch Update]
    E --> F[Clear Selection]
```

---

## 3. Doctor & Scheduling

### UC-3.1: Manage Staff Profiles
*   **Actor**: Admin
*   **Description**: Seed or update doctor records and specializations.

### UC-3.2: Analytics Monitoring
*   **Actor**: Admin, Doctor
*   **Description**: Monitor patient flow trends and recovery rates.

```mermaid
graph LR
    A[Analytics Page] --> B[Fetch Data]
    B --> C[Aggregate Metrics]
    C --> D[Render Recharts]
    D --> E[User Interaction]
```

---

© 2026 RAGA HealthCare Systems. All rights reserved.
