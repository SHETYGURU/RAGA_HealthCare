# Architecture Overview - RAGA HealthCare

A breakdown of the technologies and architectural patterns used in the platform.

## 1. Technology Stack

*   **Frontend**: React 18+ with TypeScript.
*   **Build Tool**: Vite (Optimized for speed and modern ESM).
*   **Styling**: 
    *   **Tailwind CSS**: For utility-first layouts and rapid UI development.
    *   **Vanilla CSS**: Used in `index.css` for global design tokens, complex animations (glassmorphism), and scrollbars.
*   **Icons**: Lucide React.
*   **Charts**: Recharts (Declarative charting library).
*   **Notifications**: EmailJS (Branded transactional emails).
*   **State Management**: 
    *   **Zustand**: Lightweight global state for Authentication and UI/Theme preferences.
*   **Backend & Database**: Google Firebase (Firestore, Auth).

## 2. Component Architecture

The application follows a **Modular Architecture**:

*   **Host**: The main shell (`App.tsx`) managing authentication, routing, and layout.
*   **Modules**: Self-contained feature areas (e.g., `PatientModule`, `AnalyticsModule`) loaded via `React.lazy`.
*   **Services**: Logic layer for API/Database interactions (`src/services`).
    *   `doctorService.ts`: Handles medical staff records.
    *   `patientService.ts`: Manages patient records and status updates.
    *   `seedData.ts`: Central utility for database population and repair.

## 3. Design System

The system uses a custom design system defined in `index.css`:

*   **Modern Aesthetics**: Glassmorphism, subtle gradients, and rounded corners (2xl/3xl).
*   **Dynamic UX**: Micro-animations using Tailwind's `animate-in` and hover effects.
*   **Dark Mode**: Native support using the `.dark` class.

## 4. Security & Authentication

*   **Authentication**: Firebase Email/Password Auth.
*   **Notifications**: EmailJS integration for secondary security verification (Password Resets).
*   **Authorization**: Role-based access control (RBAC).
    *   Users are identified via their `uid` and cross-referenced with Firestore collections (`admins` vs `doctors`).
*   **Data Integrity**: Use of Firestore Batches for atomic multi-document updates.

## 5. Build & Performance Optimization

*   **Manual Chunking**: Large libraries are split into separate vendor files (Firebase, Recharts, PDF generators) to allow parallel browser downloads.
*   **Lazy Loading**: 100% of major route components are loaded via `Suspense` and `React.lazy`.
*   **Asset Compression**: Vite is configured for Gzip/Brotli compression and ESM-only targeting.
*   **Pagination**: High-density lists (Patients) use a "Load More" strategy to keep the DOM node count low.

---

© 2026 RAGA HealthCare Systems. All rights reserved.
