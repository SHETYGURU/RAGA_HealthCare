# RAGA HealthCare Platform

Welcome to the **RAGA HealthCare** platform, a premium, high-performance hospital management system built with React, TypeScript, and Firebase. This platform is designed for state-of-the-art medical facility management.

**Live Demo**: [reagahealthcare.netlify.app](https://reagahealthcare.netlify.app/)

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
- **Service ID**: `[YOUR_SERVICE_ID]`
- **Password Reset Template**: `[RESET_TEMPLATE_ID]`
- **Account Creation Template**: `[DOCTOR_TEMPLATE_ID]`

---

## 📚 Documentation Suite

For deep technical insights, explore our documentation directory:

*   **[Architecture Overview](./apps/host/documents/architecture.md)**: Tech stack, component structure, and design system.
*   **[Authentication Guide](./apps/host/documents/authentication_guide.md)**: Deep dive into the Login flow, EmailJS integration, and Firebase Auth rules.
*   **[Control Flow](./apps/host/documents/control_flow.md)**: App initialization, routing, and error handling.
*   **[Sequence Diagrams](./apps/host/documents/sequence_diagrams.md)**: Visual workflows for registration, batch updates, and timings.
*   **[Use Cases](./apps/host/documents/use_cases.md)**: Comprehensive list of user interactions and flows.

---

## ✨ Key Features

*   **Premium UI/UX**: Dark mode, glassmorphism, and smooth micro-animations.
*   **Patient Directory**: Bulk status updates, multi-selection, and PDF form generation.
*   **Advanced Scheduling**: Multi-break management and real-time availability tracking.
*   **Dynamic Analytics**: Visualized flow trends and capacity monitoring.
*   **Admin Utilities**: System-wide data randomization and database repair tools.
*   **Email Automation**: Integrated branded email notifications for password resets and account creation.
*   **Performance Optimized**: 90%+ bundle size reduction via manual chunking and full lazy loading.

---

## ⚡ Performance & Scalability

This platform is engineered for high performance:
- **Code Splitting**: All modules are lazily loaded to minimize initial TTI (Time to Interactive).
- **Manual Chunking**: Large dependencies (Firebase, Recharts) are isolated into parallel-loaded vendor chunks.
- **UI Virtualization**: Patient lists use pagination/load-more logic to maintain 60FPS even with thousands of records.
- **PWA Ready**: Integrated Service Workers for offline capabilities and caching.

---

---

## 🚀 Deployment (Netlify)

This project is pre-configured for **Netlify** hosting:

1.  **Build Settings**:
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `apps/host/dist`
2.  **Environment Variables**:
    You must add the following variables in the Netlify Dashboard (Site Settings > Build & Deploy > Environment):
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_EMAILJS_SERVICE_ID`
    *   ... (and others from your `.env` file)

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
