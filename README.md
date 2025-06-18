# JobBoardly - AI-Powered Job Portal

JobBoardly is a modern, AI-enhanced job board platform designed to connect job seekers with employers efficiently. It leverages cutting-edge technologies to provide features like resume parsing, AI-driven job matching, and a seamless application process.

## Tech Stack

JobBoardly is built with a modern, robust, and scalable technology stack:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router) - For server-side rendering, static site generation, and a powerful React-based development experience.
- **UI Library**: [React](https://reactjs.org/) - For building dynamic and interactive user interfaces.
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable components built on Radix UI and Tailwind CSS.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Secure user login and registration (Email/Password, Google, GitHub, Microsoft).
  - **Firestore**: NoSQL database for storing job listings, user profiles, applications, company profiles, and settings.
  - **Storage**: For hosting user-uploaded files like resumes.
  - **App Hosting / Functions**: (App Hosting configured via `apphosting.yaml`, Firebase Functions for backend tasks).
- **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) - An open-source framework for building AI-powered features, used here for resume parsing, job description parsing, and intelligent job/candidate matching.
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

- **User Authentication**: Secure registration and login via email/password and social providers (Google, GitHub, Microsoft).
- **User Profile Management**: Create and update personal and professional details.
- **Resume Upload & AI Parsing**: Upload resumes (PDF, DOCX, TXT), with AI attempting to parse and pre-fill profile information.
- **Job Search & Filtering**: Browse job listings with filters for keywords, location, role type, and remote options.
- **Dynamic Job Detail Pages**: View comprehensive details for each job.
- **Save Jobs & Saved Searches**: Bookmark jobs and save search filter criteria for later viewing and quick application.
- **Application Submission**: Apply for jobs (creates an application document in Firestore).
- **My Jobs Page**: View and manage saved and applied jobs with filtering options.
- **AI-Powered Job Matching**: Get AI-driven job recommendations based on your profile summary (editable for the session) matched against all available approved jobs.
- **User Settings**: Customize basic platform preferences (currently uses `localStorage`, planned for Firestore). Manage saved searches.

### For Employers:

- **User Authentication**: Secure registration and login via email/password and social providers. Company creation upon first employer registration.
- **Company Profile Management**: Set up and manage company details. Company profiles require admin approval before being publicly visible.
- **Job Posting**: Create and publish job listings.
  - **AI Job Description Parsing**: Upload a job description document (PDF, DOCX, TXT) for AI to parse and pre-fill the posting form.
  - **Job Status**: Jobs are submitted with a 'pending' status and require admin approval to go live.
- **View Posted Jobs**: Manage and see an overview of jobs posted by the company, including applicant counts and job status (Pending, Approved, Rejected). Edit existing jobs (resubmits for approval).
- **View Applicants**: See a list of candidates who have applied for a specific job.
- **Application Status Management**: Update the status of applications (e.g., Reviewed, Interviewing, Hired, Rejected) and add internal notes.
- **Dynamic Candidate Detail Pages**: View comprehensive profiles of job seekers.
- **Candidate Search & Filtering**: Browse job seeker profiles with filters for keywords, location, and availability.
- **AI-Powered Candidate Matching**: Input a job description (text or file upload) and get AI-driven recommendations for suitable candidates from the platform.
- **User Settings**: Customize basic platform preferences.

### For Admins:

- **Admin Dashboard**:
  - **Job Listing Moderation**: Review, approve, or reject job postings. Link to view job details.
  - **Company Profile Moderation**: Review, approve, or reject new company profiles. Link to view company details.
  - **User Management**: View all registered users in a structured table (Name, Email, Role, Joined Date).
  - Placeholders for advanced moderation tools (Content Flagging, Platform Analytics, Policy & Appeals).
- **Protected Admin Route**: Access restricted to users with the 'admin' role.

### General Platform Features:

- **Responsive Design**: UI adapts to different screen sizes.
- **Responsive Navbar**: Adapts to screen sizes, moving navigation items to the user dropdown menu if space is limited.
- **Protected Routes**: Secure access to user-specific and role-specific pages.
- **Intelligent Redirection**: Users are redirected appropriately based on their authentication status and role.
- **Dynamic Routing**: For job details, candidate profiles, and company profiles.
- **Toast Notifications**: For user feedback on actions.
- **`data-ai-hint` Attributes**: Added to placeholder images for improved accessibility and future AI image generation integration.
- **Robust Firebase Initialization**: Improved error handling during Firebase setup.

## Folder Structure

A high-level overview of the project's directory structure:

```
/
├── public/                     # Static assets
├── src/
│   ├── ai/                     # Genkit AI flows and configuration
│   │   ├── flows/              # Specific AI flow implementations
│   │   ├── dev.ts              # Genkit development server entry point
│   │   └── genkit.ts           # Genkit global initialization
│   ├── app/                    # Next.js App Router (pages, layouts)
│   │   ├── (auth)/             # Route group for auth pages
│   │   ├── admin/              # Admin specific pages
│   │   ├── employer/           # Employer specific pages
│   │   ├── jobs/
│   │   │   └── [jobId]/        # Dynamic job detail page
│   │   ├── companies/
│   │   │   └── [companyId]/    # Dynamic company detail page
│   │   ├── api/                # API routes (if any, Genkit uses its own system)
│   │   ├── globals.css         # Global styles and ShadCN theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   │   ├── employer/           # Components specific to employer features
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/               # React Context providers (e.g., AuthContext)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions, Firebase config, mock data
│   └── types/                  # TypeScript type definitions
├── .husky/                     # Husky Git hooks
├── .env                        # Environment variables (GITIGNORED)
├── .eslintignore
├── .eslintrc.json
├── .gitignore                  # Specifies intentionally untracked files
├── .prettierignore
├── .prettierrc.json
├── apphosting.yaml             # Firebase App Hosting configuration
├── components.json             # ShadCN UI configuration
├── firestore.rules             # Firestore security rules
├── jest.config.js
├── jest.setup.js
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── sonar-scanner.js            # SonarQube scanner configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Configuration & Setup

### 1. Environment Variables

Create a `.env` file in the root of the project. This file is ignored by Git and should contain your Firebase project configuration:

```env
# Firebase Configuration - Replace with your actual Firebase project credentials
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-your-measurement-id" # Optional

# For Genkit (Google AI Studio / Vertex AI) if using specific API keys not managed by default credentials
# Example: GOOGLE_API_KEY="your-google-cloud-api-key"
```

### 2. Firebase Setup

This project requires a Firebase project with the following services enabled and configured:

- **Authentication**: Enable Email/Password, Google, GitHub, and Microsoft sign-in methods.
- **Firestore**: Set up a Firestore database in Native mode.
- **Storage**: Enable Firebase Storage for file uploads (e.g., resumes).
- **Genkit**: Ensure your environment is set up for Genkit, potentially with access to Google AI Studio models (like Gemini) or Vertex AI. This might involve setting up Application Default Credentials or an API key.
- **Firebase Functions**: Required for backend tasks like email alerts or advanced data processing (see "Backend Development Outline").

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Steps

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd jobboardly
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    yarn install
    ```

    This will also set up Husky Git hooks automatically via the `prepare` script.

3.  **Set up environment variables**:
    Create a `.env` file in the project root as described in the "Configuration & Setup" section and populate it with your Firebase project credentials.

4.  **Run the Next.js development server**:
    This server handles the frontend and Next.js backend functionalities.

    ```bash
    npm run dev
    ```

    The application will typically be available at `http://localhost:9002`.

5.  **Run the Genkit development server**:
    Genkit flows run in a separate development server. Open a new terminal window/tab for this.
    ```bash
    npm run genkit:dev
    # or for auto-reloading on changes:
    npm run genkit:watch
    ```
    The Genkit development UI will be available at `http://localhost:4000`.

You need both servers running concurrently to use the AI-powered features.

### Code Quality & Testing Scripts

- **Lint**: `npm run lint` (checks for code style issues)
- **Format**: `npm run format` (automatically formats code)
- **Test**: `npm run test` (runs unit/integration tests with Jest)
- **Test Coverage**: `npm run test:cov` (runs tests and generates a coverage report)
- **SonarQube Analysis**: `npm run sonar` (runs SonarQube scanner - requires SonarQube server setup, see `sonar-scanner.js`)
- **Type Checking**: `npm run typecheck` (runs TypeScript compiler to check for type errors)

The pre-commit hook (Husky + lint-staged) will automatically run ESLint and Prettier on staged files before committing.

## Deployment Instructions

### Vercel (Recommended for Test/Production Frontend)

1.  **Connect Repository**: Connect your GitHub/GitLab/Bitbucket repository to Vercel.
2.  **Configure Project**: Vercel typically auto-detects Next.js projects.
3.  **Environment Variables**: Set up the same environment variables (from your `.env` file) in your Vercel project settings.
4.  **Build & Deploy**: Vercel will automatically build and deploy your Next.js application upon pushes to the connected branch (e.g., `main` or `develop`).
5.  **Genkit/Backend**: If Genkit flows are intended for production use beyond simple frontend calls (e.g., triggered by Firestore events or HTTP endpoints not directly part of Next.js API routes), they might need to be deployed separately, for instance, as Firebase Functions.

### Firebase App Hosting (Alternative for Frontend)

The project is configured for Firebase App Hosting via `apphosting.yaml`.

1.  **Build the application**:
    ```bash
    npm run build
    ```
2.  **Deploy using Firebase CLI**:
    Ensure you have the Firebase CLI installed and configured.
    ```bash
    firebase deploy --only hosting
    # Or, if you're using App Hosting's integrated build process,
    # simply connect your repository to Firebase App Hosting.
    ```

### Backend Services (Firebase Functions)

For features like Email Job Alerts or automated moderation tasks (see "Backend Development Outline"), you will need to deploy Firebase Functions.

1.  Set up Firebase Functions in your project.
2.  Write the backend logic for these functions (e.g., in TypeScript).
3.  Deploy functions using `firebase deploy --only functions`.

### Firestore Security Rules

**CRITICAL**: Deploy your Firestore security rules to protect your database. The `firestore.rules` file contains a basic set of rules. **You must review and expand these rules based on your application's specific access control requirements.**

```bash
firebase deploy --only firestore:rules
```

### General Deployment Notes

- Ensure all necessary environment variables are set in your chosen deployment environment.
- For Genkit flows in production, refer to the Genkit documentation for production deployment patterns.

## Key Routes Examples

### Public Routes:

- `/`: Home page (redirects to dashboard if logged in)
- `/jobs`: Job listings page
- `/jobs/[jobId]`: Dynamic page for individual job details
- `/companies`: Company listings page (shows approved companies)
- `/companies/[companyId]`: Dynamic page for individual company details (shows if approved)
- `/employer`: Employer landing page

### Job Seeker Routes (Authentication Required for most):

- `/auth/login`: Job seeker login page
- `/auth/register`: Job seeker registration page
- `/profile`: Job seeker profile management (including resume upload)
- `/my-jobs`: View saved and applied jobs
- `/ai-match`: AI-powered job matching tool
- `/settings`: User settings page (including saved searches)

### Employer Routes (Authentication Required):

- `/employer/login`: Employer login page
- `/employer/register`: Employer registration page
- `/employer/post-job`: Page to create or edit a job posting (submitted for admin approval)
- `/employer/posted-jobs`: View and manage jobs posted by the employer (see applicant counts, job status)
- `/employer/jobs/[jobId]/applicants`: View applicants for a specific job, manage application statuses.
- `/employer/find-candidates`: Search and filter candidate profiles
- `/employer/candidates/[candidateId]`: Dynamic page for individual candidate details
- `/employer/ai-candidate-match`: AI-powered candidate matching tool

### Admin Routes (Admin Role Required):

- `/admin`: Admin dashboard (job/company moderation, user overview)

## Admin User Creation

Currently, creating an admin user is a manual process:

1.  A user registers normally (e.g., as a job seeker or employer).
2.  Manually access your Firestore database (e.g., via the Firebase Console).
3.  Navigate to the `users` collection and find the document for the user you want to make an admin (identified by their UID).
4.  Edit the `role` field for that user and set its value to `"admin"`.

## Backend Development Outline for Future Features

The following features require backend development, likely using **Firebase Functions**:

### 1. Email Job Alerts

- **Trigger**: Scheduled Firebase Function (e.g., daily) or Firestore trigger on new job creation (after approval).
- **Logic**:
  - Query recently approved jobs.
  - For each user with `savedSearches`:
    - Iterate through their saved searches.
    - Match new jobs against the filter criteria of each saved search.
  - (Optional) Match new jobs against general user profile keywords/preferences.
  - Compile a list of matching jobs for each relevant user.
- **Email Sending**:
  - Use an email service (e.g., SendGrid, Mailgun, or Firebase Extensions like "Trigger Email").
  - Format and send personalized email digests of new, relevant job opportunities.
- **Data Access**: Needs read access to `jobs` (approved), `users` (for `savedSearches`, email, preferences).

### 2. Advanced Moderation & Analytics (Backend Support)

- **Content Flagging & Scam Detection (Automated)**:
  - **Trigger**: Firebase Function triggered on `jobs` or `companies` collection create/update.
  - **Logic**:
    - Maintain a list of suspicious keywords/patterns (can be stored in Firestore or config).
    - Analyze job/company descriptions, titles, salary fields.
    - If flagged, update the document's status to `'flagged'` or add it to a dedicated moderation queue collection.
  - **Advanced**: Integrate with external APIs or simple ML models for more sophisticated detection (e.g., Vertex AI, TensorFlow.js in a Function).
- **Report Management (Backend Processing)**:
  - **Data**: A Firestore collection like `userReports` (`jobId`, `companyId`, `reporterUid`, `reason`, `timestamp`, `status: 'new' | 'reviewed'`).
  - **Trigger**: Firebase Function on new report creation or an admin action in the UI.
  - **Logic**: Notify admins, increment report counts on content, or automatically take action (e.g., unlist content after X reports).
- **Analytics Data Aggregation**:
  - **Trigger**: Scheduled Firebase Functions (e.g., hourly or daily).
  - **Logic**:
    - Process `jobs`, `companies`, `users`, `applications` collections.
    - Aggregate data: count new jobs/companies, approval rates, application status distributions, user sign-ups.
  - **Storage**: Store aggregated metrics in a separate Firestore collection (e.g., `platformAnalytics`) for quick reads by the admin dashboard.
- **Moderation Activity Logs**:
  - **Data**: A Firestore collection like `adminActivityLogs` (`adminUid`, `actionType`, `targetId (job/company/user)`, `timestamp`, `details`).
  - **Trigger/Write**: Can be written directly from frontend admin actions (if rules allow) or via a Firebase Function called by admin actions.

### 3. Denormalization (for Performance & Scalability)

- **Applicant Count on Jobs**:
  - **Trigger**: Firebase Function triggered on `applications` collection create/delete (or status changes if certain statuses shouldn't count).
  - **Logic**: Increment/decrement an `applicantCount` field on the corresponding `Job` document. This avoids expensive count queries on the frontend when listing jobs.
- **Job Count on Companies**: Similar logic if needed for company profiles.

## Future Development & Recommendations (Roadmap)

This section outlines potential future enhancements.

### 🚀 Phase 1: MVP Launch (Largely Achieved)

- **Focus**: Ensure all core features listed above are stable and user-friendly.
- **Email Job Alerts (Backend Required)**:
  - Implement Firebase Functions as outlined in "Backend Development Outline".
- **Application Tracking (Enhanced)**: The current status-based system for employers is a good foundation. A visual Kanban-style board could be a future UI enhancement on top of this data.

### 📈 Phase 2: Enhanced Experience

- **AI-Powered Job Recommendations (Continuous Improvement)**:
  - Refine prompts for `aiPoweredJobMatching` and `aiPoweredCandidateMatching` flows.
  - Consider user feedback mechanisms to improve AI suggestions.
- **In-app Notifications and Messaging**:
  - **Notifications**: Use Firestore to store notifications (e.g., new application, message received, job/company approved/rejected). Implement real-time listeners for users.
  - **Messaging**: A more significant feature involving dedicated Firestore collections for conversations, messages, and real-time updates.
- **Advanced Search Filters (Salary, Experience Level)**:
  - Add UI elements for these filters.
  - **Firestore Queries**: This will likely require more complex Firestore queries and potentially composite indexes.
  - **Data Structure**: Ensure user profiles and job data have clearly defined fields.
- **Mobile App Optimization (PWA)**:
  - Implement Service Workers, a Web App Manifest, and ensure responsive design is flawless.
- **Enhanced Employer Analytics (UI + Backend)**:
  - Display aggregated data (from backend functions) like job views, application rates on the employer dashboard.

### 🔬 Phase 3: Advanced Features

- **Video Interview Integration**:
  - Integrate with third-party APIs. Store interview links/schedules in Firestore.
- **Skills Assessments and Coding Tests**:
  - Integrate with platforms like HackerRank, or build a simpler internal system.
- **Salary Benchmarking Tools**:
  - Aggregate anonymized salary data (with consent). Requires careful data handling.
- **Company Review System**:
  - Allow users to submit reviews for companies. Requires moderation.
- **LinkedIn Integration**:
  - OAuth for "Sign in with LinkedIn". API integration for profile pre-fill.

### 🚀 Phase 4: Market Leadership

- **Advanced AI Chatbot Support**:
  - Use Genkit for user support, job search assistance, or RAG with platform data.
- **Predictive Job Market Analytics**:
  - Complex data analysis and ML on platform data.
- **Learning and Development Partnerships**.

### General Recommendations for All Phases:

- **Firestore Security Rules**: **Continuously review and strengthen your `firestore.rules` file.** This is paramount.
- **Scalable Search**: For features like job search and candidate search, as your data grows, consider integrating a dedicated search service like Algolia, Elasticsearch, or Meilisearch.
- **User Settings Persistence**: Migrate user settings from `localStorage` to Firestore for cross-device persistence.
- **Firebase App Check**: Implement Firebase App Check to protect backend resources.
- **Comprehensive Testing**: Continue to expand unit, integration, and (if possible) end-to-end tests. Maintain high test coverage.
- **Code Quality & Refactoring**: Regularly refactor code. Use ESLint, Prettier, and SonarQube actively.
- **Accessibility (a11y)**: Continue to ensure components and pages are accessible.
- **Performance Optimization**: Monitor Next.js build outputs, bundle sizes, and image optimization.

This README should serve as a solid foundation for the JobBoardly project. Good luck with the next phases of development!
