# RAGA HealthCare Platform

Welcome to the **RAGA HealthCare** platform, a premium, high-performance hospital management system built with React, TypeScript, and Firebase. This platform is designed for state-of-the-art medical facility management.

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🔐 Demo Access

The platform includes a **"Quick Access"** demo system. On the Login screen, you will find dedicated buttons for the **Admin Portal** and **Doctor Portal**. 

Clicking these buttons will automatically pre-fill the demo credentials and sign you in instantly.

---

## 📧 Email & Notifications

The platform is integrated with **EmailJS** for branded communications:
- **Service ID**: `service_raga`
- **Password Reset Template**: `template_3larvgd`
- **Account Creation Template**: `template_dsbh4kf`

---

## 📚 Documentation Suite

For deep technical insights, explore our documentation directory:

*   **[Architecture Overview](./documents/architecture.md)**: Tech stack, component structure, and design system.
*   **[Authentication Guide](./documents/authentication_guide.md)**: Deep dive into the Login flow, EmailJS integration, and Firebase Auth rules.
*   **[Control Flow](./documents/control_flow.md)**: App initialization, routing, and error handling.
*   **[Sequence Diagrams](./documents/sequence_diagrams.md)**: Visual workflows for registration, batch updates, and timings.
*   **[Use Cases](./documents/use_cases.md)**: Comprehensive list of user interactions and flows.

---

## ✨ Key Features

*   **Premium UI/UX**: Dark mode, glassmorphism, and smooth micro-animations.
*   **Patient Directory**: Bulk status updates, multi-selection, and PDF form generation.
*   **Advanced Scheduling**: Multi-break management and real-time availability tracking.
*   **Dynamic Analytics**: Visualized flow trends and capacity monitoring.
*   **Admin Utilities**: System-wide data randomization and database repair tools.
*   **Email Automation**: Integrated branded email notifications for password resets and account creation.

---

## 🚀 Deployment (Netlify)

This project is pre-configured for **Netlify** hosting:

1.  **Build Command**: `npm run build`
2.  **Publish Directory**: `dist`
3.  **Environment Variables**: Ensure all `VITE_` variables from `.env` are added to the Netlify UI.

---

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Vite.
*   **Styling**: Tailwind CSS + Vanilla CSS (Aesthetic-first approach).
*   **Database**: Google Firebase (Firestore, Authentication).
*   **Notifications**: EmailJS.
*   **Icons**: Lucide React.
*   **Charts**: Recharts.

---

© 2026 RAGA HealthCare Systems. All rights reserved.
