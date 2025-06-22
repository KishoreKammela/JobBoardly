# JobBoardly - AI-Powered Job Portal

JobBoardly is a modern, AI-enhanced job board platform designed to connect job seekers with employers efficiently. It leverages cutting-edge technologies to provide features like resume parsing, AI-driven job matching, screening questions, and a seamless application process. Our vision is to create the most intelligent and automated job marketplace, where AI guides careers and optimizes hiring success.

## Tech Stack

JobBoardly is built with a modern, robust, and scalable technology stack:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router) - For server-side rendering, static site generation, and a powerful React-based development experience.
- **UI Library**: [React](https://reactjs.org/) - For building dynamic and interactive user interfaces.
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable components built on Radix UI and Tailwind CSS.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- **PDF Generation**: [react-to-print](https://github.com/gregnb/react-to-print) - For client-side PDF generation of profiles.
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Secure user login and registration (Email/Password, Google, GitHub, Microsoft). Handles account status (active/suspended/deleted).
  - **Firestore**: NoSQL database for storing job listings, user profiles, applications, company profiles, settings (including theme preference and legal content).
  - **Storage**: For hosting user-uploaded files like resumes.
  - **App Hosting / Functions**: (App Hosting configured via `apphosting.yaml`, Firebase Functions for backend tasks - _Functions planned for future features like notification triggers_).
- **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) - An open-source framework for building AI-powered features, used here for resume parsing, job description parsing (for employers), AI-powered professional summary generation, and intelligent job/candidate matching. Powered by Gemini models.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For static typing, improved code quality, and better developer experience.
- **Code Quality & Testing**:
  - **Testing Framework**: [Jest](https://jestjs.io/) - For unit and integration testing.
  - **Linting**: [ESLint](https://eslint.org/) - For identifying and fixing problems in JavaScript/TypeScript code.
  - **Code Formatting**: [Prettier](https://prettier.io/) - For consistent code style.
  - **Git Hooks**: [Husky](https://typicode.github.io/husky/) - For running scripts (like linters) on Git events.
  - **Staged Files Linting**: [lint-staged](https://github.com/okonet/lint-staged) - For running linters only on changed files.
  - **Code Quality Analysis**: [SonarQube](https://www.sonarqube.org/) (via `sonarqube-scanner`) - For continuous inspection of code quality.

## Style Guidelines

The visual identity of JobBoardly is designed to be modern, clear, and innovative.

- **Colors (Theme defined in `src/app/globals.css` using HSL CSS variables):**
  - **Light Mode:**
    - **Primary Color**: Deep Sky Blue (`hsl(211 100% 50%)`) - Inspired by clarity and innovation in career tech.
    - **Background Color**: Light Gray (`hsl(210 17% 98%)`) - Provides a clean and modern backdrop.
    - **Accent Color**: Teal (`hsl(162 72% 46%)`) - Offers a vibrant contrast to highlight key interactive elements.
  - **Dark Mode:**
    - **Primary Color**: Deep Sky Blue (`hsl(211 100% 50%)`) - Retained for vibrancy.
    - **Background Color**: Dark Blue-Gray (`hsl(220 14% 10%)`) - A deep, professional background.
    - **Accent Color**: Teal (`hsl(162 72% 46%)`) - Retained for vibrant contrast.
- **Typography:**
  - **Body and Headline Font**: 'Inter' (variable `--font-inter`) - A grotesque-style sans-serif with a modern and neutral aesthetic, suitable for both headlines and body text. Implemented using `next/font`.
- **Icons:**
  - Utilizes `lucide-react` for clean, modern icons representing job categories, locations, actions, and other attributes.
- **Layout:**
  - Employs a grid-based layout for organizing job listings and other content, ensuring responsiveness across devices (primarily using Tailwind CSS utility classes).
- **Animations & Transitions:**
  - Uses subtle animations, like smooth transitions and loading indicators (e.g., ShadCN UI component animations, Tailwind CSS transitions), to enhance user experience without being distracting.

## Core Features Overview

JobBoardly offers a comprehensive suite of features tailored for Job Seekers, Employers, and Administrators.

- **For Job Seekers**: User authentication, advanced profile management with resume parsing and AI summary generation, downloadable PDF profiles, robust job search and filtering (including saving searches), job saving, application submission with screening question support, application withdrawal, AI-powered job matching, and personalized settings. Re-application to the same job is prevented.
  - [Detailed Job Seeker Guide](./docs/guides/01-job-seeker-guide.md)
- **For Employers**: Secure authentication, company profile management with admin approval, AI-assisted job posting (including parsing job description documents and adding screening questions), applicant tracking (including viewing screening question answers), and candidate search with boolean logic, advanced filters, and saved search capabilities. AI-powered candidate matching helps find relevant talent.
  - [Detailed Employer Guide](./docs/guides/02-employer-guide.md)
- **For Platform Staff (Administrators, Super Administrators, Moderators, Support Agents, Data Analysts)**: A comprehensive admin dashboard with tabs for managing companies (approve/reject/suspend), all jobs (approve/reject/suspend/edit - including viewing screening questions), job seekers (suspend/activate), platform users (suspend/activate admins/superAdmins/moderators), and legal content (Privacy Policy, Terms of Service - SuperAdmin only). Features quick moderation cards and robust search/sort/pagination for all managed entities. Permissions vary by role.
  - [Detailed Admin Guide](./docs/guides/03-admin-guide.md)
- **For a complete breakdown of all currently implemented features, see our [Platform Features Overview](./docs/reference/01-platform-features-overview.md).**
- **Future Vision & Roadmaps**:
  - See our ambitious **[AI Features Roadmap](./docs/planning/02-ai-features-roadmap.md)** to understand how we're building the future of job searching and hiring with AI.
  - Explore our **[Comprehensive Notification & Email System Plan](./docs/planning/03-notification-system-plan.md)** for engaging user communication.
  - Review our **[Future Development Roadmap](./docs/planning/01-future-development-roadmap.md)** for a holistic view of planned enhancements, new features, and technology considerations.

## Folder Structure

A high-level overview of the project's directory structure:

```
/
├── public/                     # Static assets (includes robots.txt)
├── src/
│   ├── ai/                     # Genkit AI flows and configuration
│   ├── app/                    # Next.js App Router
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions, Firebase config
│   └── types/                  # TypeScript type definitions
├── docs/                       # Detailed documentation
│   ├── api/                    # Detailed backend API documentation
│   │   └── v1/
│   ├── guides/                 # User-facing guides
│   ├── planning/               # Future development roadmaps
│   └── reference/              # Technical reference documents
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

For a more detailed explanation of each file and folder, see the [Folder Structure Deep Dive](./docs/reference/04-folder-structure-deep-dive.md).

## Detailed Documentation & API Specification

- For a comprehensive list and description of all application routes, please see: [**Application Routes Documentation**](./docs/reference/02-routes-documentation.md)
- For a detailed breakdown of the project's files and folders, please see: [**Folder Structure Deep Dive**](./docs/reference/04-folder-structure-deep-dive.md)
- For a detailed specification of the backend API, including endpoints, request/response schemas, and mock data, please see the [**API Documentation**](./docs/api/v1/README.md).

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

# Base URL for sitemap generation and metadata
NEXT_PUBLIC_BASE_URL="http://localhost:9002" # Or your production URL
```

**Important**:

- If your `.env` file is not in `.gitignore`, **add it now** to prevent accidentally committing your API keys.
- Create a `.env.example` file with placeholders for these keys to guide other developers or for your own reference.
- After setting or changing these variables, **you must restart your Next.js development server and Genkit server** for them to take effect.

### 2. Firebase Setup

Ensure Firebase Authentication (Email/Pass, Google, GitHub, Microsoft), Firestore (Native mode), and Storage are enabled in your Firebase project. Set up necessary composite indexes in Firestore as prompted by errors during development or for query optimization (especially for the Admin Dashboard filtering/sorting and sitemap generation). The `legalContent` collection also needs to exist for Privacy Policy and Terms of Service management.

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
