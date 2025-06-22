# JobBoardly - Folder Structure Deep Dive

This document provides a detailed breakdown of the JobBoardly project's file and folder structure.

## Root Directory

The root of the project contains configuration files that govern the entire application.

```
/
├── .env                  # Environment variables (GITIGNORED). Stores Firebase keys, API keys, etc.
├── .eslintrc.json        # ESLint configuration for code linting and quality.
├── .husky/               # Git hooks configuration (e.g., pre-commit checks).
├── .prettierrc.json      # Prettier configuration for consistent code formatting.
├── .vscode/              # VS Code specific settings.
├── README.md             # The main project README file with a high-level overview.
├── apphosting.yaml       # Firebase App Hosting configuration.
├── components.json       # ShadCN UI configuration file.
├── docs/                 # Project documentation (guides, planning, reference).
├── firestore.rules       # Security rules for the Firestore database.
├── jest.config.js        # Jest configuration for running tests.
├── jest.setup.js         # Setup file for the Jest test environment.
├── next.config.ts        # Next.js configuration file.
├── next-env.d.ts         # TypeScript definitions for Next.js.
├── package.json          # Lists project dependencies and scripts.
├── public/               # Static assets like images, fonts, and robots.txt.
├── sonar-scanner.js      # Configuration for SonarQube code quality analysis.
├── src/                  # Main application source code.
└── tsconfig.json         # TypeScript compiler configuration.
```

---

## `/src` Directory

This is where all the application's source code resides.

### `src/ai` - Genkit AI Integration

This directory contains all AI-related logic, powered by Google's Genkit.

- `genkit.ts`: The central configuration file where Genkit is initialized with plugins (like `googleAI`) and default models are set.
- `dev.ts`: The entry point for running the Genkit development server. It imports all the flow files.
- `flows/`: A directory containing individual files for each distinct AI feature.
  - `parse-resume-flow.ts`: Defines the AI flow for parsing resume documents and extracting structured data.
  - `parse-job-description-flow.ts`: Defines the AI flow for parsing job description documents.
  - `ai-powered-job-matching.ts`: Defines the flow for matching job seekers to jobs.
  - `ai-powered-candidate-matching.ts`: Defines the flow for matching candidates to job descriptions.
  - `generate-profile-summary-flow.ts`: Defines the flow for generating professional summaries for users.

### `src/app` - Next.js App Router

This directory manages all application routes and pages.

- `layout.tsx`: The root layout of the application, wrapping all pages. It includes the `<html>` and `<body>` tags, sets up fonts, and wraps children with all the global context providers.
- `globals.css`: Global CSS file, including Tailwind CSS directives and the HSL color variable definitions for the ShadCN theme.
- `page.tsx`: The main landing page of the application (`/`).
- **Route Directories**: Each sub-folder represents a route segment.
  - `/jobs`: Contains the main page for browsing jobs.
  - `/jobs/[jobId]`: A dynamic route for displaying the details of a specific job.
  - `/employer`: The landing page for employers.
  - `/employer/post-job`: The page for creating or editing a job posting.
  - `/admin`: The main dashboard for platform staff. Access is protected by role.
  - `/auth`: Contains pages for user authentication like `login`, `register`, and `change-password`.
- **Route Handlers**:
  - `/sitemap.xml/route.ts`: A special route that dynamically generates the `sitemap.xml` file for SEO by fetching data from Firestore.

### `src/components` - Reusable UI Components

This is where all React components are stored.

- `ui/`: Contains the pre-built, unstyled components from the ShadCN UI library (e.g., `Button`, `Card`, `Input`). These files are generally not modified directly.
- **Custom Components**: The root of `components` contains custom, application-specific components.
  - `JobCard.tsx`: Displays a summary of a single job in listings.
  - `FilterSidebar.tsx`: The sidebar used on the `/jobs` page for filtering.
  - `UserProfileForm.tsx`: The main form for editing a user's profile.
- **Component Groups**: Components are often grouped into subdirectories based on their feature area.
  - `layout/`: Components related to the overall page structure, like `Navbar.tsx` and `Footer.tsx`.
  - `profile/`: Components specifically used on the profile management page.
  - `employer/`: Components used in the employer-facing sections of the app.
  - `admin/`: Components for the admin dashboard tables and editors.

### `src/contexts` - React Context Providers

This directory is organized by feature or domain, providing global and section-specific state management.

- `Auth/`: Manages core Firebase authentication state.
  - `AuthContext.tsx`: Provides the `firebaseUser` object, `loading` state, and functions like `loginUser`, `registerUser`, `logout`.
- `UserProfile/`: Manages the detailed profile of the logged-in user.
  - `UserProfileContext.tsx`: Depends on `AuthContext`. Fetches and provides the `user` object from Firestore and the `updateUserProfile` function.
- `Company/`: Manages the company data for logged-in employers.
  - `CompanyContext.tsx`: Depends on `UserProfileContext`. Fetches and provides the `company` object from Firestore and the `updateCompanyProfile` function.
- `Notification/`: Manages user notifications.
  - `NotificationContext.tsx`: Depends on `AuthContext`. Fetches and provides user `notifications` and related actions.
- `JobSeekerActions/`: Encapsulates actions specific to job seekers.
  - `JobSeekerActionsContext.tsx`: Provides functions for applying to jobs, saving/unsaving jobs, managing saved searches, etc.
- `EmployerActions/`: Encapsulates actions specific to employers.
  - `EmployerActionsContext.tsx`: Provides functions for managing applicants, saving candidate searches, etc.

### `src/hooks` - Custom React Hooks

Contains reusable hooks to encapsulate logic.

- `use-toast.ts`: Manages the global toast notification system.
- `use-debounce.ts`: A utility hook to delay execution of a function, used for search inputs.
- `use-mobile.ts`: A hook to detect if the user is on a mobile-sized screen.

### `src/lib` - Libraries & Utilities

A folder for helper functions and third-party library configurations.

- `firebase.ts`: Initializes the Firebase app and exports instances of `auth`, `db` (Firestore), and `storage`.
- `utils.ts`: Contains utility functions, most notably the `cn` function for merging Tailwind CSS classes. Also includes helper functions like `formatCurrencyINR` and `checkPasswordStrength`.
- `mockData.ts`: (If present) Would contain mock data used for development or testing purposes.

### `src/types` - TypeScript Definitions

This directory centralizes all custom TypeScript types and interfaces, organized by data model.

- `user.ts`: Contains `UserProfile`, `UserRole`, `ExperienceEntry`, etc.
- `company.ts`: Contains `Company`.
- `job.ts`: Contains `Job`, `Filters`, `SavedSearch`, etc.
- `application.ts`: Contains `Application`, `ScreeningQuestion`, etc.
- `notification.ts`: Contains `Notification` and related types.
- `index.ts`: A central file that re-exports all types from the other files in this directory, allowing for easy importing from `@/types`.

---

## `/docs` Directory - Project Documentation

This directory contains all non-code documentation for the project, organized for clarity.

- `api/`: Contains the detailed backend API specification, broken down by resource (e.g., `auth.md`, `jobs.md`).
- `guides/`: Contains user-centric guides explaining how to use the platform's features from the perspective of different roles (Job Seeker, Employer, Admin).
- `planning/`: Contains forward-looking documents like roadmaps and system plans.
- `reference/`: Contains technical reference documents, such as this folder structure deep dive.
- `index.md`: An index page that serves as a table of contents for the entire documentation.
