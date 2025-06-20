# JobBoardly - Admin Features Guide

This document outlines the features, user flows, and technical interactions specific to the platform staff roles within JobBoardly.

## 1. Core Responsibilities

Platform staff are responsible for overseeing the platform's integrity, managing users (to varying degrees), ensuring content quality, providing user support, analyzing data, and maintaining system compliance and health, depending on their specific role.

## 2. Roles & Permissions Overview

JobBoardly utilizes a hierarchical admin structure with varying levels of access and responsibility:

### 2.1. Super Administrator

- **Full platform control.**
- Can manage all other admin types (SuperAdmins, Admins, Moderators, Support Agents, Data Analysts, etc.).
- Access to sensitive operations (e.g., data exports, critical system settings).
- Can create/delete/suspend/activate any platform staff account.
- Can perform all content moderation and user (Job Seeker, Employer) management tasks.
- Manages platform-wide feature toggles (future capability).

### 2.2. Administrator

- **General platform management.**
- Cannot manage (suspend/activate) Super Admins or other Admins.
- Can manage Moderators, Support Agents, and Data Analysts.
- Full content moderation capabilities (jobs, companies).
- Full Job Seeker management capabilities.
- May have access to some feature toggles (future capability).

### 2.3. Content Moderator

- **Content-focused management.**
- Can approve/reject pending job postings and company profiles.
- Can manage the status (suspend/activate) of existing jobs (except for suspending, which is Admin+) and companies.
- Cannot manage any user accounts (Job Seekers, Platform Users) except for viewing their profiles.
- Primary focus on content quality and adherence to platform guidelines.

### 2.4. Support Agent (Foundational Implementation)

- **User support focused.**
- Can view user profiles (Job Seekers, Employers, other Platform Staff) and application history.
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can primarily view data tables but cannot perform modification actions (e.g., suspend users, approve content).
- **Future Enhancements (from Roadmap):** Will have tools to reset passwords, handle basic account issues, and escalate complex issues. Will use a dedicated Support Agent Dashboard.

### 2.5. Data Analyst (Foundational Implementation)

- **Analytics and reporting focused.**
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can view the Platform Analytics overview and other data tables but cannot perform modification actions.
- **Future Enhancements (from Roadmap):** Will have read-only access to most data for analysis and access to advanced analytics and reporting tools to generate custom reports. Will use a dedicated Data Analyst Dashboard.

### 2.6. Compliance Officer (Future Role - Not Implemented)

- **Legal and compliance focused.**
- **Future capabilities (from Roadmap):** Review flagged content, handle privacy requests (GDPR, data deletion), audit trail access. Cannot modify content but can flag for review. Will use a dedicated Compliance Dashboard.

### 2.7. System Monitor (Future Role - Not Implemented)

- **Technical monitoring focused.**
- **Future capabilities (from Roadmap):** Monitor system health and performance, view error logs and system metrics. Alert management for technical issues. Cannot access user data directly. Will use a dedicated System Monitoring Dashboard.

## 3. Key Features (Current Implementation for SuperAdmin, Admin, Moderator, SupportAgent, DataAnalyst)

### 3.1. Admin Dashboard

The central hub for administrative tasks, accessible after logging in via the Admin Login page (`/auth/admin/login`). The dashboard presents an overview and a tabbed interface. Permissions and visible actions vary based on the logged-in user's role. All critical actions (status changes, deletions) are protected by confirmation modals.

- **Platform Analytics Overview (Dashboard):** (Visible to SuperAdmin, Admin, Moderator, Data Analyst)

  - Total Job Seekers, Total Companies, Total Jobs, Approved Jobs, Total Applications.
  - (Support Agents do not see this overview currently).

- **Quick Moderation Cards (Dashboard Overview):** (Usable by SuperAdmin, Admin, Moderator)

  - **Pending Job Approvals**: Quickly approve (`✅`) or reject (`❌`) new job postings.
  - **Pending Company Approvals**: Quickly approve (`✅`) or reject (`❌`) new company profiles.
  - (Disabled for Support Agents, Data Analysts).

- **Companies Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table displays Company Name, Website, Status, Jobs Posted, Apps Received, Creation Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Company Profile` (All Admin Roles with access to this tab)
    - `✅ Approve`, `❌ Reject`, `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **All Jobs Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table shows Job Title, Company Name, Status, Applicant Count, Creation Date, Last Updated Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Public Job Page` (All Admin Roles with access to this tab)
    - `🚫 Suspend Job` (SuperAdmin, Admin only)
    - `✅ Activate Job`, `✅ Approve Job`, `❌ Reject Job` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Job Seekers Management Tab:** (Viewable by SuperAdmin, Admin, Moderator, Support Agent, Data Analyst; Actions vary by role)

  - **View**: Table lists Job Seeker Name, Email, Status, Profile Searchable, Jobs Applied, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (All Admin Roles with access to this tab)
    - `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin only)
    - (Actions disabled for Moderators, Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Platform Users Management Tab:** (Viewable by SuperAdmin, Admin, Data Analyst; Actions vary by role)

  - **View**: Table displays Name, Email, Role, Status, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (SuperAdmin, Admin, Moderator, Data Analyst - Moderator can view only)
    - `🚫 Suspend / ✅ Activate`:
      - SuperAdmins: Can manage other Admins, SuperAdmins, Moderators, Support Agents, Data Analysts.
      - Admins: Can manage Moderators, Support Agents, Data Analysts only.
      - Moderators, Support Agents, Data Analysts: Cannot manage any platform users (buttons disabled).
      - Users cannot suspend/activate themselves from this tab.
  - **Functionality**: Includes search, sorting, pagination.
  - (Tab hidden for Support Agents and Moderators).

- **AI Feature Management Tab (Conceptual Placeholder):** (Visible to SuperAdmins only)
  - A placeholder UI to indicate where future controls for enabling/disabling specific AI features (e.g., AI Career Path Advisor, Dynamic Summary Generator, AI Recruiter Assistant) will reside. Currently non-functional.
  - This section will be expanded into a comprehensive "Platform Feature Toggle Management" system as a high-priority future enhancement, allowing granular control over all new platform and AI features.

### 3.2. Protected Admin Route & Login

- Access to the admin dashboard (`/admin`) is strictly limited to users with roles: `admin`, `superAdmin`, `moderator`, `supportAgent`, `dataAnalyst` (and future admin roles).
- A dedicated admin login page is available at `/auth/admin/login` for all platform staff.

## 4. User Journey Map (Admin/Moderator Example)

```mermaid
graph TD
    A[Start: Platform Staff Needs to Manage Platform] --> B{Authenticated?}
    B -- No --> C[Navigate to /auth/admin/login]
    C --> D[Enter Credentials]
    D --> E{Login Successful & Role is Admin-like?}
    E -- Yes --> F[Redirect to /admin Dashboard]
    B -- Yes --> F
    E -- No --> G[Error/Redirect to General Login]
    F --> FA[View Platform Analytics Overview (SA, A, M, DA)]
    FA --> H{Select Task based on Role}
    H -- Moderate Pending Jobs (SA, A, M) --> I[Use Quick Moderation Card for Jobs]
    I --> J_Confirm[Confirm Action: Approve/Reject Job]
    J_Confirm -- Yes --> J_Action[Perform Job Status Update]
    J_Action --> F
    J_Confirm -- No --> I
    H -- Moderate Pending Companies (SA, A, M) --> K[Use Quick Moderation Card for Companies]
    K --> L_Confirm[Confirm Action: Approve/Reject Company]
    L_Confirm -- Yes --> L_Action[Perform Company Status Update]
    L_Action --> F
    L_Confirm -- No --> K
    H -- Manage Companies (View: All; Actions: SA, A, M) --> M[Navigate to 'Companies' Tab]
    M --> N[Search/Sort/View Companies]
    N --> O[Click Action Icon]
    O --> O_Confirm[Confirmation Modal for Company Action]
    O_Confirm -- Yes --> O_Action[Perform Company Status Update]
    O_Action --> M
    O_Confirm -- No --> N
    H -- Manage Jobs (View: All; Actions: SA, A, M - M limited) --> P[Navigate to 'All Jobs' Tab]
    P --> Q[Search/Sort/View Jobs]
    Q --> R[Click Action Icon]
    R --> R_Confirm[Confirmation Modal for Job Action]
    R_Confirm -- Yes --> R_Action[Perform Job Status Update]
    R_Action --> P
    R_Confirm -- No --> Q
    H -- Manage Job Seekers (View: SA, A, M, SuA, DA; Actions: SA, A) --> S[Navigate to 'Job Seekers' Tab]
    S --> T[Search/Sort/View Job Seekers]
    T --> U[Click Action Icon]
    U --> U_Confirm[Confirmation Modal for Job Seeker Action]
    U_Confirm -- Yes --> U_Action[Perform User Status Update]
    U_Action --> S
    U_Confirm -- No --> T
    H -- Manage Platform Users (View: SA, A, M, DA; Actions: SA, A - role-dependent) --> V[Navigate to 'Platform Users' Tab]
    V --> W[Search/Sort/View Platform Users]
    W --> X[Click Action Icon]
    X --> X_Confirm[Confirmation Modal for Platform User Action]
    X_Confirm -- Yes --> X_Action[Perform User Status Update]
    X_Action --> V
    X_Confirm -- No --> W
    F --> Y[Logout]
```

## 5. Page Routes

| Route                           | Description                                                                                                        | Access Level                                                                |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `/auth/admin/login`             | Dedicated login page for all platform staff roles.                                                                 | Public (for login)                                                          |
| `/admin`                        | Main admin dashboard. Features and actions vary significantly by role.                                             | SuperAdmin, Admin, Moderator, SupportAgent, DataAnalyst (with restrictions) |
| `/profile`                      | Platform staff can manage their own profile details (name, avatar).                                                | All Authenticated Platform Staff Roles                                      |
| `/employer/candidates/[userId]` | Used by platform staff to view profiles of any user (Job Seekers or other Platform Users) via the admin dashboard. | All Platform Staff Roles (employers are restricted to job seekers)          |

## 6. Future Enhancements / Detailed Roadmap

This section outlines the comprehensive plan for evolving the JobBoardly Admin Panel, based on the enhanced requirements provided. It's important to note that many new platform features (AI or general) will require a **Platform Feature Toggle Management** system to be built first (see Phase 1 or 2 below).

### 6.1. Phase 1 (High Priority - Immediate Next Steps)

1.  **Full Functionality for New Roles:**
    - **Support Agent:** Implement tools for password resets, basic account issue handling, and an issue escalation system. Create a dedicated (or heavily adapted) dashboard view for support tickets and user lookups.
    - **Data Analyst:** Develop initial read-only advanced data views/dashboards if different from the main admin overview. Begin work on a simple report generation tool.
2.  **Basic Audit Logging System:**
    - Start logging critical admin actions to Firestore (e.g., user status changes, job/company approvals/rejections, platform user role changes). Create a simple interface for SuperAdmins to view these logs.
3.  **Basic Bulk Operations (Content):**
    - Implement basic bulk approval/rejection for pending jobs and companies in the respective admin tables if not already fully robust.

### 6.2. Phase 2 (Medium Priority)

1.  **Platform Feature Toggle Management (CRITICAL PREREQUISITE for many new features):**
    - **Description:** Implement a robust system within the Admin Panel (likely under a dedicated "System Administration" or "Feature Management" tab, primarily for SuperAdmins/Admins) to enable or disable specific platform features. This includes both AI-powered features (from the [AI Roadmap](./ai-roadmap.md)) and general platform enhancements (from the [Enhanced Feature Recommendations](./enhanced-feature-recommendations.md) roadmap).
    - **Capabilities:**
      - Global toggles for features.
      - Potential for role-based or user-segment-based feature access in the future (e.g., premium features for certain employer tiers).
      - Clear UI for admins to see feature status and manage toggles.
    - **Importance:** This system is a critical prerequisite for rolling out most new functionalities detailed in the platform's roadmaps, ensuring controlled deployment and adherence to the requirement that new features are not available to all users by default.
    - **Technical Considerations:** This involves backend logic for feature flags, database changes to store flag states, and checks throughout the application where features are conditionally rendered or executed.
2.  **Introduce New User Roles (Full Implementation):**
    - **Compliance Officer:** Develop tools for reviewing flagged content, managing privacy requests (data access/deletion stubs), and viewing audit trails relevant to compliance.
    - **System Monitor:** Create a dashboard to display (mock or basic) system health metrics, error log summaries (if available/integrated), and alert examples.
3.  **Advanced Content Quality Tools (Initial):**
    - Basic duplicate detection for job postings (flag potential duplicates).
    - Profile completeness indicators for job seekers and companies, visible in admin views.
4.  **Communication & Notification Management (Initial):**
    - Admin-to-user notification system: Allow admins to send targeted email notifications to user segments.
    - Basic internal admin notes on user/company/job records.
5.  **Custom Reporting System (Basic):**
    - Allow Data Analysts (and SuperAdmins) to generate pre-defined exportable reports (CSV/Excel) for key metrics.
6.  **Security Monitoring Enhancements (Initial):**
    - Display failed login attempt counts for user profiles.
    - Basic IP address logging for user actions (viewable by SuperAdmins).
7.  **Bulk User Operations (Initial):**
    - Allow selection of multiple users (job seekers first) for status changes (suspend/activate).

### 6.3. Phase 3 (Long-term) & Beyond

1.  **Full Role-Based Dashboards:** Implement dedicated, streamlined dashboard UIs for each admin role (Content Moderator, Support Agent, Data Analyst, Compliance Officer, System Monitor) as outlined in your requirements.
2.  **Comprehensive Feature Implementation (from Roadmaps):**
    - Systematically implement features from the [Enhanced Feature Recommendations Roadmap](./enhanced-feature-recommendations.md) and the [AI Features Roadmap](./ai-roadmap.md), controlled by the Platform Feature Toggle system. This includes:
      - **Advanced User Management:** CSV import/export, batch notifications, user lifecycle management (verification, onboarding), advanced filters.
      - **Advanced Content Management:** Job quality scoring, full duplicate detection, salary validation, job templates, full company verification system, advanced content moderation tools (user reporting, categorization, plagiarism detection).
      - **Advanced Analytics & Reporting:** Real-time dashboards, custom report builder, scheduled reports, data visualization, predictive analytics (churn, job success).
      - **Advanced Communication & Notification:** Custom templates, targeted/scheduled notifications, A/B testing, internal admin chat, task assignment, knowledge base.
      - **Full Security & Compliance:** Comprehensive audit logs, data retention, GDPR/CCPA tools, 2FA enforcement, data breach response.
      - **Full System Administration:** System maintenance mode, email template UI, rate limiting config, integration management.
      - **Full QA & Testing Tools:** User impersonation, test data management.
3.  **Predictive Analytics (Full):** User churn, job success, market trends.
4.  **AI-Powered Moderation & Quality Control (Full).**

### 6.4. Technical Considerations (To be addressed throughout development)

- **Database Design:** Implement tables for granular permissions, comprehensive audit logs, flexible platform settings, and workflow task queues.
- **Security:** Adhere to the principle of least privilege, implement action confirmations, enhance session security, and encrypt sensitive admin data.
- **Performance:** Utilize lazy loading, caching, efficient pagination, and background processing for long-running tasks.

---

_This guide is intended for informational purposes for the JobBoardly team and will be updated as features evolve._
