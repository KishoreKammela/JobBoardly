
# JobBoardly - AI-Powered Job Portal

JobBoardly is a modern, AI-enhanced job board platform designed to connect job seekers with employers efficiently. It leverages cutting-edge technologies to provide features like resume parsing, AI-driven job matching, and a seamless application process.

## Tech Stack

JobBoardly is built with a modern, robust, and scalable technology stack:

*   **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router) - For server-side rendering, static site generation, and a powerful React-based development experience.
*   **UI Library**: [React](https://reactjs.org/) - For building dynamic and interactive user interfaces.
*   **Component Library**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable components built on Radix UI and Tailwind CSS.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
*   **Backend & Database**: [Firebase](https://firebase.google.com/)
    *   **Authentication**: Secure user login and registration (Email/Password, Google, GitHub, Microsoft).
    *   **Firestore**: NoSQL database for storing job listings, user profiles, applications, and settings.
    *   **Storage**: For hosting user-uploaded files like resumes.
    *   **App Hosting**: (Configured via `apphosting.yaml`) For deploying the Next.js application.
*   **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) - An open-source framework for building AI-powered features, used here for resume parsing, job description parsing, and intelligent job/candidate matching.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - For static typing, improved code quality, and better developer experience.

## Core Features Implemented

### For Job Seekers:
*   **User Authentication**: Secure registration and login via email/password and social providers (Google, GitHub, Microsoft).
*   **User Profile Management**: Create and update personal and professional details.
*   **Resume Upload & AI Parsing**: Upload resumes (PDF, DOCX, TXT), with AI attempting to parse and pre-fill profile information.
*   **Job Search & Filtering**: Browse job listings with filters for keywords, location, role type, and remote options.
*   **Dynamic Job Detail Pages**: View comprehensive details for each job.
*   **Save Jobs**: Bookmark jobs for later viewing.
*   **One-Click Apply (Conceptual)**: Apply for jobs (currently logs application, full workflow can be expanded).
*   **My Jobs Page**: View and manage saved and applied jobs with filtering.
*   **AI-Powered Job Matching**: Get AI-driven job recommendations based on your profile summary (editable for the session) matched against all available jobs.
*   **User Settings**: Customize basic platform preferences (currently uses `localStorage`, planned for Firestore).

### For Employers:
*   **User Authentication**: Secure registration and login via email/password and social providers.
*   **Company Profile Management**: Set up and manage company details.
*   **Job Posting**: Create and publish job listings.
    *   **AI Job Description Parsing**: Upload a job description document (PDF, DOCX, TXT) for AI to parse and pre-fill the posting form.
*   **View Posted Jobs**: Manage and see an overview of jobs posted by the company.
*   **View Applicants**: See a list of candidates who have applied for a specific job.
*   **Dynamic Candidate Detail Pages**: View comprehensive profiles of job seekers.
*   **Candidate Search & Filtering**: Browse job seeker profiles with filters for keywords, location, and availability.
*   **AI-Powered Candidate Matching**: Input a job description (text or file upload) and get AI-driven recommendations for suitable candidates from the platform.
*   **User Settings**: Customize basic platform preferences.

### For Admins:
*   **Admin Dashboard**: Basic dashboard for platform management (currently placeholder for features like user management, job moderation, analytics).
*   **Protected Admin Route**: Access restricted to users with the 'admin' role.

### General Platform Features:
*   **Responsive Design**: UI adapts to different screen sizes.
*   **Protected Routes**: Secure access to user-specific and role-specific pages.
*   **Intelligent Redirection**: Users are redirected appropriately based on their authentication status and role (e.g., to dashboards after login, or to login page if unauthenticated).
*   **Dynamic Routing**: For job details and candidate profiles.
*   **Toast Notifications**: For user feedback on actions.

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
├── .env                        # Environment variables (GITIGNORED)
├── .gitignore                  # Specifies intentionally untracked files
├── apphosting.yaml             # Firebase App Hosting configuration
├── components.json             # ShadCN UI configuration
├── firestore.rules             # Firestore security rules
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
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
**Note:** The Firebase configuration is currently hardcoded in `src/lib/firebase.ts`. For better security and flexibility, it's recommended to move these to environment variables as shown above and update `src/lib/firebase.ts` to read from `process.env`.

### 2. Firebase Setup
This project requires a Firebase project with the following services enabled and configured:
*   **Authentication**: Enable Email/Password, Google, GitHub, and Microsoft sign-in methods.
*   **Firestore**: Set up a Firestore database in Native mode.
*   **Storage**: Enable Firebase Storage for file uploads (e.g., resumes).
*   **Genkit**: Ensure your environment is set up for Genkit, potentially with access to Google AI Studio models (like Gemini) or Vertex AI. This might involve setting up Application Default Credentials or an API key.

## Local Development Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

## Deployment Instructions

### Firebase App Hosting
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

### Firestore Security Rules
**CRITICAL**: Deploy your Firestore security rules to protect your database. The `firestore.rules` file contains a basic set of rules. **You must review and expand these rules based on your application's specific access control requirements.**
```bash
firebase deploy --only firestore:rules
```

### General Deployment Notes
*   Ensure all necessary environment variables are set in your deployment environment (Firebase App Hosting allows setting these in the console).
*   For Genkit flows in production, refer to the Genkit documentation for production deployment patterns, which might involve deploying them as Firebase Functions or another serverless environment.

## Key Routes Examples

### Public Routes:
*   `/`: Home page (redirects to dashboard if logged in)
*   `/jobs`: Job listings page
*   `/jobs/[jobId]`: Dynamic page for individual job details
*   `/employer`: Employer landing page

### Job Seeker Routes (Authentication Required for most):
*   `/auth/login`: Job seeker login page
*   `/auth/register`: Job seeker registration page
*   `/profile`: Job seeker profile management
*   `/my-jobs`: View saved and applied jobs
*   `/ai-match`: AI-powered job matching tool
*   `/settings`: User settings page

### Employer Routes (Authentication Required):
*   `/employer/login`: Employer login page
*   `/employer/register`: Employer registration page
*   `/employer/post-job`: Page to create a new job posting
*   `/employer/posted-jobs`: View and manage jobs posted by the employer
*   `/employer/jobs/[jobId]/applicants`: View applicants for a specific job
*   `/employer/find-candidates`: Search and filter candidate profiles
*   `/employer/candidates/[candidateId]`: Dynamic page for individual candidate details
*   `/employer/ai-candidate-match`: AI-powered candidate matching tool

### Admin Routes (Admin Role Required):
*   `/admin`: Admin dashboard

## Admin User Creation
Currently, creating an admin user is a manual process:
1.  A user registers normally (e.g., as a job seeker or employer).
2.  Manually access your Firestore database (e.g., via the Firebase Console).
3.  Navigate to the `users` collection and find the document for the user you want to make an admin (identified by their UID).
4.  Edit the `role` field for that user and set its value to `"admin"`.

## Future Development & Recommendations (Based on Roadmap)

This section outlines potential future enhancements based on the provided development roadmap and current project state.

### 🚀 Phase 1: MVP Launch (Largely Achieved)
*   **Focus**: Ensure all core features listed above are stable and user-friendly.
*   **Email Job Alerts (To Implement)**:
    *   **Backend**: Set up Firebase Functions triggered on new job postings or on a schedule.
    *   **Logic**: Match new jobs to user profiles/saved searches (requires storing search criteria).
    *   **Email Service**: Integrate an email service (e.g., SendGrid, Mailgun, or Firebase Extensions like "Trigger Email").
*   **Application Tracking (Enhance)**: While basic application logging exists, a more visual "kanban-style" or status-based tracking system for employers would be beneficial.

### 📈 Phase 2: Enhanced Experience
*   **AI-Powered Job Recommendations (Continuous Improvement)**:
    *   Refine prompts for `aiPoweredJobMatching` and `aiPoweredCandidateMatching` flows.
    *   Consider user feedback mechanisms to improve AI suggestions.
*   **In-app Notifications and Messaging**:
    *   **Notifications**: Use Firestore to store notifications (e.g., new application, message received). Implement real-time listeners for users.
    *   **Messaging**: A more significant feature involving dedicated Firestore collections for conversations, messages, and real-time updates.
*   **Advanced Search Filters (Salary, Experience Level)**:
    *   Add UI elements for these filters.
    *   **Firestore Queries**: This will likely require more complex Firestore queries and potentially composite indexes. For salary ranges, queries can become tricky (e.g., finding jobs where `salaryMin <= desiredMax` AND `salaryMax >= desiredMin`).
    *   **Data Structure**: Ensure user profiles and job data have clearly defined fields for experience level.
*   **Mobile App Optimization (PWA)**:
    *   Implement Service Workers, a Web App Manifest, and ensure responsive design is flawless. Next.js has PWA plugins/examples available.
*   **Enhanced Employer Analytics**:
    *   Track metrics like job views, application rates, applicant demographics (if ethically collected and anonymized).
    *   Use Firebase Functions to aggregate data or display charts on the employer dashboard.

### 🔬 Phase 3: Advanced Features
*   **Video Interview Integration**:
    *   Integrate with third-party APIs (e.g., Whereby, Jitsi, or commercial services).
    *   Store interview links/schedules in Firestore.
*   **Skills Assessments and Coding Tests**:
    *   Integrate with platforms like HackerRank, Coderbyte, or build a simpler internal system.
    *   Store results associated with candidate profiles.
*   **Salary Benchmarking Tools**:
    *   Aggregate anonymized salary data (with consent).
    *   Display industry benchmarks. This requires careful data handling and statistical analysis.
*   **Company Review System**:
    *   Allow users to submit reviews for companies.
    *   Requires moderation and careful data modeling in Firestore.
*   **LinkedIn Integration**:
    *   OAuth for "Sign in with LinkedIn".
    *   API integration to pre-fill profiles or share jobs (requires LinkedIn Developer App approval).

### 🚀 Phase 4: Market Leadership
*   **Advanced AI Chatbot Support**:
    *   Use Genkit with more advanced models and conversational flows for user support, job search assistance, or employer guidance.
    *   Could leverage RAG (Retrieval Augmented Generation) with your job/candidate data.
*   **Predictive Job Market Analytics**:
    *   Complex data analysis and machine learning on platform data to predict trends.
*   **Virtual Office Tours (AR/VR)**: A significant R&D effort, potentially integrating with specialized platforms.
*   **Learning and Development Partnerships**: Integrate links or resources from learning platforms.

### General Recommendations for All Phases:
*   **Firestore Security Rules**: **Continuously review and strengthen your `firestore.rules` file.** As new features are added, ensure data access is strictly controlled. This is paramount for security.
*   **Scalable Search**: For features like job search and candidate search, as your data grows, client-side filtering and basic Firestore queries will become slow. Plan to integrate a dedicated search service like Algolia, Elasticsearch, or Meilisearch.
*   **User Settings Persistence**: Migrate user settings from `localStorage` to Firestore (within the `users` document) so they persist across devices.
*   **Firebase App Check**: Implement Firebase App Check to protect your backend resources (including Genkit flows if exposed via HTTP) from abuse.
*   **Comprehensive Testing**: Implement unit, integration, and end-to-end tests.
*   **Code Quality & Refactoring**: Regularly refactor code to maintain readability and performance.
*   **Accessibility (a11y)**: Continue to ensure components and pages are accessible. ShadCN UI provides a good foundation.
*   **Performance Optimization**: Monitor Next.js build outputs, bundle sizes, and image optimization. Use Next.js dynamic imports for code splitting where appropriate.

This README should serve as a solid foundation for the JobBoardly project. Good luck with the next phases of development!
