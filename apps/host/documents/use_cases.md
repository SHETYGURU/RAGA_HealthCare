# Use Cases - RAGA HealthCare

This document outlines the primary use cases and user interactions within the RAGA HealthCare platform.

## 1. Authentication & Access

### UC-1.1: Quick Access Login
*   **Actor**: All Users
*   **Description**: Instantly log in using pre-configured demo accounts.
*   **Flow**:
    1. User navigates to the **Login Page**.
    2. Clicks **"Admin Portal"** or **"Doctor Portal"** buttons.
    3. System automatically fills credentials and submits the form.
    4. User is redirected to the Dashboard.

### UC-1.2: Password Recovery
*   **Actor**: All Users
*   **Description**: Recover access to a locked account via email.
*   **Flow**:
    1. User clicks **"Forgot Password?"**.
    2. Enters their registered email address.
    3. Clicks **"Send Reset Link"**.
    4. System triggers a Firebase reset link and sends a branded EmailJS notification.
    5. User resets their password via the link received in their inbox.

---

## 2. Patient Management

### UC-2.1: Register New Patient
*   **Actor**: Admin
*   **Description**: Register a new patient into the system with demographic and clinical details.
*   **Flow**:
    1. Admin navigates to **Patient Directory**.
    2. Clicks **Add Patient** and fills in details.
    3. Clicks **Save Patient**.

### UC-2.2: Bulk Status Update
*   **Actor**: Admin, Doctor
*   **Description**: Update the clinical status of multiple patients simultaneously.
*   **Flow**:
    1. User selects multiple patients in the directory.
    2. Selects a new status (e.g., "Critical") from the **Batch Action Toolbar**.
    3. System performs a batch update in Firestore.

---

## 3. Doctor & Scheduling

### UC-3.1: Manage Staff Profiles
*   **Actor**: Admin
*   **Description**: Seed or update doctor records and specializations.
*   **Flow**:
    1. Admin navigates to **Settings > Admin Utilities**.
    2. Clicks **Execute Seed**.
    3. System populates the database with doctors, admins, and ensures data integrity (Specializations/Passwords).

### UC-3.2: Analytics Monitoring
*   **Actor**: Admin, Doctor
*   **Description**: Monitor patient flow trends and recovery rates.
*   **Flow**:
    1. User navigates to **Analytics**.
    2. System aggregates real-time data from Firestore and displays interactive Recharts visualizations.

---

© 2026 RAGA HealthCare Systems. All rights reserved.
