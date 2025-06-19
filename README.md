# JobBoardly - AI-Powered Job Portal

JobBoardly is a modern, AI-enhanced job board platform designed to connect job seekers with employers efficiently. It leverages cutting-edge technologies to provide features like resume parsing, AI-driven job matching, and a seamless application process.

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
- **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) - An open-source framework for building AI-powered features, used here for resume parsing, job description parsing, and intelligent job/candidate matching. Powered by Gemini models.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For static typing, improved code quality, and better developer experience.
- **Code Quality & Testing**:
  - **Testing Framework**: [Jest](https://jestjs.io/) - For unit and integration testing.
  - **Linting**: [ESLint](https://eslint.org/) - For identifying and fixing problems in JavaScript/TypeScript code.
  - **Code Formatting**: [Prettier](https://prettier.io/) - For consistent code style.
  - **Git Hooks**: [Husky](https://typicode.github.io/husky/) - For running scripts (like linters) on Git events.
  - **Staged Files Linting**: [lint-staged](https://github.com/okonet/lint-staged) - For running linters only on changed files.
  - **Code Quality Analysis**: [SonarQube](https://www.sonarqube.org/) (via `sonarqube-scanner`) - For continuous inspection of code quality.

## Core Features Implemented

### For Job Seekers:

- **User Authentication**: Secure registration and login via email/password and social providers. Includes password strength indicators and a dedicated "Change Password" page. Suspended accounts are prevented from logging in.
- **User Profile Management**: Create and update personal and professional details. Includes options for profile visibility (searchable by employers or private).
- **Resume Upload & AI Parsing**: Upload resumes (PDF, DOCX, TXT) or paste text, with AI attempting to parse and pre-fill profile information. Parsed summary stored.
- **Downloadable PDF Profile**: Download their own profile in a clean, ATS-friendly PDF format.
- **Profile Preview**: View their own profile as it might appear to employers.
- **Job Search & Filtering**: Browse job listings with filters for keywords, location, role type, remote options, and **recent activity** (e.g., posted in last 7 days).
- **Dynamic Job Detail Pages**: View comprehensive details for each job, including share functionality. If a job has screening questions, seekers answer them during application.
- **Save Jobs & Saved Searches**: Bookmark jobs and save search filter criteria for later viewing and quick application via the settings page.
- **Application Submission**: Apply for jobs, including answering any employer-defined screening questions. Creates an application document in Firestore.
- **My Jobs Page**: View and manage saved and applied jobs with filtering options.
- **AI-Powered Job Matching**: Get AI-driven job recommendations based on a comprehensive profile summary (editable for the session) matched against all available approved jobs. Context includes detailed work experience, education, skills, and preferences.
- **User Settings**: Customize platform preferences:
  - **Theme**: Light, Dark, or System preference (stored in Firestore).
  - Notification preferences.
  - Manage saved searches.
  - Job board display preferences (list/grid, items per page).

### For Employers:

- **User Authentication**: Secure registration and login. Includes password strength and "Change Password". Company creation upon first employer registration. Suspended accounts are prevented from logging in.
- **Company Profile Management**: Set up and manage company details. Company profiles require admin approval before being publicly visible. Current company status (e.g., "Pending", "Approved", "Rejected", "Suspended") visible.
- **Job Posting & Management**:
  - Create and publish job listings.
  - **AI Job Description Parsing**: Upload a job description document (PDF, DOCX, TXT) for AI to parse and pre-fill the posting form.
  - **Screening Questions**: Add custom screening questions (text, yes/no) to job postings.
  - **Job Status**: Jobs are submitted with a 'pending' status and require admin approval. Editing an existing job displays its current status and resubmits it as 'pending'.
- **View Posted Jobs**: Manage jobs posted by the company, including applicant counts and job status. Edit existing jobs.
- **View Applicants**: See candidates who applied for a specific job. View their answers to screening questions. Filter applicants by application status.
- **Application Status Management**: Update the status of applications (e.g., Reviewed, Interviewing, Hired, Rejected) and add internal notes.
- **Dynamic Candidate Detail Pages**: View comprehensive profiles of job seekers, including downloadable PDF versions (if enabled by seeker).
- **Candidate Search & Filtering**: Browse job seeker profiles with advanced filters for keywords (supports basic **boolean logic**: AND, OR, NOT, "phrases"), location, availability, **job search status, desired salary range, and recent profile activity**.
- **AI-Powered Candidate Matching**: Input a job description (text or file upload) and get AI-driven recommendations for suitable candidates. Context includes detailed candidate work experience, education, skills, and preferences.
- **User Settings**: Customize basic platform preferences (theme, notifications).

### For Admins & Super Admins:

- **Admin Dashboard (Tabbed Interface)**:
  - **Companies Management**:
    - Table view: Name, Website, Status, Jobs Posted, Applications Received, Created At.
    - Actions: Approve, Reject, **Suspend/Activate** company (suspending a company also suspends its recruiters).
    - Search, sort, and pagination for company data.
  - **Job Seekers Management**:
    - Table view: Name, Email, Status (active/suspended), Profile Searchable, Jobs Applied, Last Active, Joined Date.
    - Actions: **Preview Profile** (opens seeker's public profile view), **Suspend/Activate** user.
    - Search, sort, and pagination.
  - **Platform Users Management (Admins/SuperAdmins)**:
    - Table view: Name, Email, Role, Status, Last Active, Joined Date.
    - Actions: **Suspend/Activate Admin** (SuperAdmin only).
    - Search, sort, and pagination.
  - **Job Listing Moderation**: Review, approve, or reject job postings. Job titles link to public detail pages.
  - **Company Profile Moderation**: Review, approve, or reject new company profiles.
- **Protected Admin Route**: Access restricted, with a dedicated admin login page at `/auth/admin/login`.
- **SuperAdmin Role**: Can manage (suspend/activate) regular admin accounts.

### General Platform Features:

- **Responsive Design**: UI adapts to different screen sizes.
- **Responsive Navbar**: Adapts, moving items to user dropdown on smaller screens.
- **Protected Routes**: Secure access to user-specific and role-specific pages.
- **Intelligent Redirection**: Users redirected based on auth status and role.
- **Dynamic Routing**: For job details, candidate profiles, company profiles.
- **Toast Notifications**: For user feedback.
- **`data-ai-hint` Attributes**: For placeholder images.
- **Robust Firebase Initialization**: Improved error handling.
- **Clean UI**: Internal IDs not exposed.
- **Accessibility**: ARIA labels for icon buttons, semantic HTML for tables.
- **Privacy**: Placeholder "Privacy Policy" and "Terms ofService" pages linked in footer.
- **Performance**: Debouncing for search inputs. Optimized PDF profile generation.

## Folder Structure

A high-level overview of the project's directory structure:

```
/
├── public/                     # Static assets
├── src/
│   ├── ai/                     # Genkit AI flows and configuration
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group for auth pages
│   │   │   ├── admin/login/
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
│   ├── contexts/               # React Context providers (AuthContext)
│   ├── hooks/                  # Custom React hooks (useAuth, useDebounce, useToast, useIsMobile)
│   ├── lib/                    # Utility functions, Firebase config
│   └── types/                  # TypeScript type definitions
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

Ensure Firebase Authentication (Email/Pass, Google, GitHub, Microsoft), Firestore (Native mode), and Storage are enabled in your Firebase project. Set up necessary composite indexes in Firestore as prompted by errors during development or for query optimization (especially for the Admin Dashboard filtering/sorting if implemented server-side in the future).

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

## Key Routes Examples

### Public Routes:

- `/`: Home page
- `/jobs`: Job listings (paginated)
- `/jobs/[jobId]`: Job details (with screening questions if any)
- `/companies`: Company listings (paginated)
- `/companies/[companyId]`: Company details
- `/employer`: Employer landing page
- `/privacy-policy`: Privacy Policy page
- `/terms-of-service`: Terms of Service page

### Job Seeker Routes (Auth Required):

- `/auth/login`, `/auth/register`
- `/auth/change-password`: Change password page
- `/profile`: Job seeker profile management (resume, visibility, PDF download)
- `/profile/preview`: Preview own profile
- `/my-jobs`: Saved and applied jobs
- `/ai-match`: AI job matching
- `/settings`: Theme, notifications, saved searches

### Employer Routes (Auth Required):

- `/employer/login`, `/employer/register`
- `/employer/post-job`: Create/edit job (with screening questions)
- `/employer/posted-jobs`: Manage own jobs
- `/employer/jobs/[jobId]/applicants`: View applicants (with answers)
- `/employer/find-candidates`: Search candidates (paginated, boolean search, advanced filters)
- `/employer/candidates/[candidateId]`: Candidate details (PDF download)
- `/employer/ai-candidate-match`: AI candidate matching

### Admin Routes (Admin/SuperAdmin Role Required):

- `/auth/admin/login`
- `/admin`: Admin dashboard (tabs for companies, job seekers, platform users; moderation, suspend/activate features, search, sort, pagination)

## Admin User Creation

1.  A user registers normally (e.g., as a job seeker or employer).
2.  Manually access your Firebase Firestore database.
3.  Navigate to the `users` collection, find the user's document by their UID.
4.  Edit the `role` field to `"admin"` or `"superAdmin"`.
5.  Ensure their `status` field is set to `"active"`.

This README reflects the major features and structure of JobBoardly.
