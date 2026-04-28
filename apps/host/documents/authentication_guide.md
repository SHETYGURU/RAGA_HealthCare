# Authentication & Security Guide

This document explains how the RAGA HealthCare platform handles user authentication, session management, and automated notifications.

## 🔐 Overview

The platform uses **Firebase Authentication** as the primary identity provider and **Cloud Firestore** for storing extended user profiles (roles, specializations, etc.).

### Key Logic
- **Restricted Access**: Public registration (`createUserWithEmailAndPassword`) is currently disabled in the UI to ensure only authorized medical personnel can access the system.
- **Role-Based Routing**: After login, users are automatically routed based on their role stored in Firestore:
  - `admins` -> Full System Access.
  - `doctors` -> Doctor Dashboard & Patient Management.

---

## 📧 EmailJS Integration

We use EmailJS to send professionally styled HTML emails for critical security events.

### 1. Password Reset Flow
When a user clicks "Forgot Password" on the login screen:
1.  **Firebase Reset**: `sendPasswordResetEmail` is triggered. This sends the official Firebase secure link.
2.  **EmailJS Notification**: Simultaneously, a branded email (`[RESET_TEMPLATE_ID]`) is sent via EmailJS to notify the user that a reset was initiated.

### 2. New Account Provisioning
When an admin creates a new doctor or manager account:
- The `[DOCTOR_TEMPLATE_ID]` is used to send the user their **Temporary Password** and **Login URL**.

---

## 🛡️ Security Rules (Firestore)

To enable the "Demo Quick Access" and password reset verification features, the following Firestore rules must be active:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public reading of profiles for login verification
    match /doctors/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /admins/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Protect patient data (Requires Auth)
    match /{path=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🚀 Troubleshooting

### "Invalid Email or Password"
- Ensure the account exists in **both** Firestore (profile) and Firebase Auth (credentials).
- If you just seeded data, you may need to manually add the user to the Auth tab in Firebase Console using the seeded email and password.

### Emails Not Sending
- Verify the **Service ID** (`[YOUR_SERVICE_ID]`) and **Public Key** (`[YOUR_PUBLIC_KEY]`) in `Login.tsx`.
- Check the EmailJS dashboard for monthly quota limits.

---

© 2026 RAGA HealthCare Systems. All rights reserved.
