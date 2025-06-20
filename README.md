# JobBoardly - AI-Powered Job Portal

JobBoardly is a modern, AI-enhanced job board platform designed to connect job seekers with employers efficiently. It leverages cutting-edge technologies to provide features like resume parsing, AI-driven job matching, and a seamless application process. Our vision is to create the most intelligent and automated job marketplace, where AI guides careers and optimizes hiring success.

## Tech Stack

JobBoardly is built with a modern, robust, and scalable technology stack:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router) - For server-side rendering, static site generation, and a powerful React-based development experience.
- **UI Library**: [React](https://reactjs.org/) - For building dynamic and interactive user interfaces.
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable components built on Radix UI and Tailwind CSS.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- **PDF Generation**: [react-to-print](https://github.com/gregnb/react-to-print) - For client-side PDF generation of profiles.
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Secure user login and registration (Email/Password, Google, GitHub, Microsoft). Handles account status (active/suspended).
  - **Firestore**: NoSQL database for storing job listings, user profiles, applications, company profiles, and settings (including theme preference).
  - **Storage**: For hosting user-uploaded files like resumes.
  - **App Hosting / Functions**: (App Hosting configured via `apphosting.yaml`, Firebase Functions for backend tasks).
- **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) - An open-source framework for building AI-powered features, used here for resume parsing, job description parsing (for employers), AI-powered professional summary generation, and intelligent job/candidate matching. Powered by Gemini models.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For static typing, improved code quality, and better developer experience.
- **Code Quality & Testing**:
  - **Testing Framework**: [Jest](https://jestjs.io/) - For unit and integration testing.
  - **Linting**: [ESLint](https://eslint.org/) - For identifying and fixing problems in JavaScript/TypeScript code.
  - **Code Formatting**: [Prettier](https://prettier.io/) - For consistent code style.
  - **Git Hooks**: [Husky](https://typicode.github.io/husky/) - For running scripts (like linters) on Git events.
  - **Staged Files Linting**: [lint-staged](https://github.com/okonet/lint-staged) - For running linters only on changed files.
  - **Code Quality Analysis**: [SonarQube](https://www.sonarqube.org/) (via `sonarqube-scanner`) - For continuous inspection of code quality.

## Core Features Overview

JobBoardly offers a comprehensive suite of features tailored for Job Seekers, Employers, and Administrators.

- **For Job Seekers**: User authentication, advanced profile management with resume parsing and AI summary generation, downloadable PDF profiles, robust job search and filtering, job saving, one-click applications, AI-powered job matching, and personalized settings.
  - [Detailed Job Seeker Features](./docs/job-seeker-features.md)
- **For Employers**: Secure authentication, company profile management with admin approval, AI-assisted job posting (including parsing job description documents), screening questions, applicant tracking and status management, candidate search with boolean logic and advanced filters, and AI-powered candidate matching.
  - [Detailed Employer Features](./docs/employer-features.md)
- **For Platform Staff (Administrators, Super Administrators, Moderators, Support Agents, Data Analysts)**: A comprehensive admin dashboard with tabs for managing companies (approve/reject/suspend), all jobs (approve/reject/suspend/edit), job seekers (suspend/activate), and platform users (suspend/activate admins/superAdmins/moderators). Features quick moderation cards and robust search/sort/pagination for all managed entities. Permissions vary by role (SuperAdmin > Admin > Moderator > Support Agent/Data Analyst with restricted views).
  - [Detailed Admin Features](./docs/admin-features.md)
- **General Platform Features**: Responsive design, intelligent redirection, dynamic routing, toast notifications, robust Firebase integration, accessibility considerations, and basic privacy/terms pages.
- **AI Vision**: See our ambitious [AI Features Roadmap](./docs/ai-roadmap.md) to understand how we're building the future of job searching and hiring.

## Folder Structure

A high-level overview of the project's directory structure:

```
/
├── public/                     # Static assets
├── src/
│   ├── ai/                     # Genkit AI flows and configuration
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group for auth pages
│   │   │   ├── admin/login/    # Login for SuperAdmins, Admins, Moderators, etc.
│   │   │   └── change-password/
│   │   ├── admin/              # Admin specific pages
│   │   ├── employer/           # Employer specific pages
│   │   ├── jobs/
│   │   │   └── [jobId]/        # Dynamic job detail page
│   │   ├── companies/
│   │   │   └── [companyId]/    # Dynamic company detail page
│   │   ├── profile/
│   │   │   └── preview/        # Job seeker profile preview page
│   │   ├── privacy-policy/
│   │   ├── terms-of-service/
│   │   ├── globals.css         # Global styles and ShadCN theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   │   ├── employer/
│   │   ├── layout/
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/               # React Context providers (AuthContext, JobSeekerActionsContext, EmployerActionsContext)
│   ├── hooks/                  # Custom React hooks (useAuth, useDebounce, useToast, useIsMobile)
│   ├── lib/                    # Utility functions, Firebase config
│   └── types/                  # TypeScript type definitions
├── docs/                       # Detailed feature documentation
│   ├── admin-features.md
│   ├── employer-features.md
│   ├── job-seeker-features.md
│   ├── routes-documentation.md
│   └── ai-roadmap.md           # New AI roadmap document
├── .husky/
├── .env                        # Environment variables (GITIGNORED)
├── apphosting.yaml
├── components.json
├── firestore.rules
├── jest.config.js
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Detailed Routes

For a comprehensive list and description of all application routes, please see:

- [Application Routes Documentation](./docs/routes-documentation.md)

## Configuration & Setup

### 1. Environment Variables

Create a `.env` file in the root of the project (or `.env.local` which is typically gitignored). Populate it with your Firebase project configuration and your Google AI (Gemini) API key.

**Crucial: Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are correctly set as these are required for Firebase services (Authentication, Firestore, Storage) to initialize properly.**

```env
# Firebase Configuration (Required for the app to function)
# Find these values in your Firebase project settings:
# Project settings > General > Your apps > Firebase SDK snippet > Config
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-your-measurement-id" # Optional, for Analytics

# Genkit API Key for Google AI (Gemini) (Required for AI features)
# Replace YOUR_GEMINI_API_KEY_HERE with your actual key from Google AI Studio or Google Cloud.
# Ensure this key has access to the Gemini API.
GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

**Important**:

- If your `.env` file is not in `.gitignore`, **add it now** to prevent accidentally committing your API keys.
- Create a `.env.example` file with placeholders for these keys to guide other developers or for your own reference.
- After setting or changing these variables, **you must restart your Next.js development server and Genkit server** for them to take effect.

### 2. Firebase Setup

Ensure Firebase Authentication (Email/Pass, Google, GitHub, Microsoft), Firestore (Native mode), and Storage are enabled in your Firebase project. Set up necessary composite indexes in Firestore as prompted by errors during development or for query optimization (especially for the Admin Dashboard filtering/sorting).

## Local Development Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
2.  **Run Next.js Dev Server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This usually starts the app on `http://localhost:9002`.
3.  **Run Genkit Dev Server (in a separate terminal)**:
    ```bash
    npm run genkit:dev
    # or (for auto-reloading on AI file changes)
    npm run genkit:watch
    ```
    This typically starts the Genkit server on `http://localhost:3400`.

## Platform Staff User Creation (Admin/SuperAdmin/Moderator/SupportAgent/DataAnalyst)

1.  A user registers normally (e.g., as a job seeker or employer).
2.  Manually access your Firebase Firestore database.
3.  Navigate to the `users` collection, find the user's document by their UID.
4.  Edit the `role` field to `"admin"`, `"superAdmin"`, `"moderator"`, `"supportAgent"`, or `"dataAnalyst"`.
5.  Ensure their `status` field is set to `"active"`.

This README provides a high-level overview and setup guide for JobBoardly. For detailed feature descriptions, please refer to the documents in the `/docs` directory.
