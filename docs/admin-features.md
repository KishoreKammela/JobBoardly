# JobBoardly - Admin Features Guide

This document outlines the features, user flows, and technical interactions specific to the Administrator, Super Administrator, and Moderator roles within the JobBoardly platform.

## 1. Core Responsibilities

Platform staff (Super Admins, Admins, Moderators) are responsible for overseeing the platform's integrity, managing users (to varying degrees), and ensuring the quality of content (job postings and company profiles).

## 2. Roles & Permissions Overview

- **Super Administrator**: Has all administrative capabilities, including managing other Super Admins, Admins, and Moderators. Can perform all content moderation and user management tasks.
- **Administrator**: Has most administrative capabilities but cannot manage (suspend/activate) other Super Admins or Admins. Can manage Moderators. Can perform all content moderation and Job Seeker management tasks.
- **Moderator**: Has limited administrative capabilities, primarily focused on content moderation (approving/rejecting pending jobs and companies) and viewing platform data. Cannot manage any user accounts (Job Seekers, Platform Users) except for viewing their profiles.

## 3. Key Features

### 3.1. Admin Dashboard

The central hub for administrative tasks, accessible after logging in via the Admin Login page. The dashboard presents an overview and a tabbed interface for organized management. All critical actions (status changes, deletions) are protected by confirmation modals.

- **Platform Analytics Overview (Dashboard):** (Visible to SuperAdmin, Admin, Moderator)

  - Total Job Seekers, Total Companies, Total Jobs, Approved Jobs, Total Applications.

- **Quick Moderation Cards (Dashboard Overview):** (Usable by SuperAdmin, Admin, Moderator)

  - **Pending Job Approvals**: Quickly approve (`✅`) or reject (`❌`) new job postings.
  - **Pending Company Approvals**: Quickly approve (`✅`) or reject (`❌`) new company profiles.

- **Companies Management Tab:** (Viewable by all; Actions vary by role)

  - **View**: Table displays Company Name, Website, Status, Jobs Posted, Applications Received, Creation Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Company Profile` (SuperAdmin, Admin, Moderator)
    - `✅ Approve` (SuperAdmin, Admin, Moderator)
    - `❌ Reject` (SuperAdmin, Admin, Moderator)
    - `🚫 Suspend` (SuperAdmin, Admin, Moderator)
    - `✅ Activate` (SuperAdmin, Admin, Moderator)
    - `🗑️ Delete (Soft)` (SuperAdmin, Admin, Moderator)
  - **Functionality**: Includes search, sorting, pagination.

- **All Jobs Management Tab:** (Viewable by all; Actions vary by role)

  - **View**: Table shows Job Title, Company Name, Status, Applicant Count, Creation Date, Last Updated Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Public Job Page` (SuperAdmin, Admin, Moderator)
    - `🚫 Suspend` (SuperAdmin, Admin - NOT Moderator)
    - `✅ Activate` (SuperAdmin, Admin, Moderator)
    - `✅ Approve` (SuperAdmin, Admin, Moderator)
    - `❌ Reject` (SuperAdmin, Admin, Moderator)
  - **Functionality**: Includes search, sorting, pagination.

- **Job Seekers Management Tab:** (Viewable by all; Actions vary by role)

  - **View**: Table lists Job Seeker Name, Email, Status, Profile Searchable, Jobs Applied, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (SuperAdmin, Admin, Moderator)
    - `🚫 Suspend` (SuperAdmin, Admin - NOT Moderator)
    - `✅ Activate` (SuperAdmin, Admin - NOT Moderator)
    - `🗑️ Delete (Soft)` (SuperAdmin, Admin - NOT Moderator)
  - **Functionality**: Includes search, sorting, pagination.

- **Platform Users Management Tab (Admins/SuperAdmins/Moderators):** (Viewable by all; Actions vary by role)
  - **View**: Table displays Name, Email, Role (Admin/SuperAdmin/Moderator), Status, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (SuperAdmin, Admin, Moderator) - View profile of other platform staff.
    - `🚫 Suspend / ✅ Activate`:
      - SuperAdmins: Can manage other Admins, SuperAdmins, and Moderators.
      - Admins: Can manage Moderators only.
      - Moderators: Cannot manage any platform users (buttons disabled).
      - Users cannot suspend/activate themselves from this tab.
  - **Functionality**: Includes search, sorting, pagination.

### 3.2. Protected Admin Route & Login

- Access to the admin dashboard (`/admin`) is strictly limited to users with "admin", "superAdmin", or "moderator" roles.
- A dedicated admin login page is available at `/auth/admin/login` for all platform staff.

## 4. User Journey Map (Admin/Moderator)

```mermaid
graph TD
    A[Start: Platform Staff Needs to Manage Platform] --> B{Authenticated?}
    B -- No --> C[Navigate to /auth/admin/login]
    C --> D[Enter Credentials]
    D --> E{Login Successful & Role is SA/A/M?}
    E -- Yes --> F[Redirect to /admin Dashboard]
    B -- Yes --> F
    E -- No --> G[Error/Redirect to General Login]
    F --> FA[View Platform Analytics Overview]
    FA --> H{Select Task}
    H -- Moderate Pending Jobs --> I[Use Quick Moderation Card for Jobs (SA, A, M)]
    I --> J_Confirm[Confirm Action: Approve/Reject Job]
    J_Confirm -- Yes --> J_Action[Perform Job Status Update]
    J_Action --> F
    J_Confirm -- No --> I
    H -- Moderate Pending Companies --> K[Use Quick Moderation Card for Companies (SA, A, M)]
    K --> L_Confirm[Confirm Action: Approve/Reject Company]
    L_Confirm -- Yes --> L_Action[Perform Company Status Update]
    L_Action --> F
    L_Confirm -- No --> K
    H -- Manage Companies --> M[Navigate to 'Companies' Tab (SA, A, M)]
    M --> N[Search/Sort/View Companies]
    N --> O[Click Action Icon (SA, A, M actions on Companies)]
    O --> O_Confirm[Confirmation Modal for Company Action]
    O_Confirm -- Yes --> O_Action[Perform Company Status Update]
    O_Action --> M
    O_Confirm -- No --> N
    H -- Manage Jobs --> P[Navigate to 'All Jobs' Tab (SA, A, M)]
    P --> Q[Search/Sort/View Jobs]
    Q --> R[Click Action Icon (M cannot Suspend Jobs)]
    R --> R_Confirm[Confirmation Modal for Job Action]
    R_Confirm -- Yes --> R_Action[Perform Job Status Update]
    R_Action --> P
    R_Confirm -- No --> Q
    H -- Manage Job Seekers --> S[Navigate to 'Job Seekers' Tab (SA, A, M - M view/profile-view only)]
    S --> T[Search/Sort/View Job Seekers]
    T --> U[Click Action Icon: View Profile (All), Suspend/Activate/Delete (SA, A only)]
    U --> U_Confirm[Confirmation Modal for Job Seeker Action]
    U_Confirm -- Yes --> U_Action[Perform User Status Update]
    U_Action --> S
    U_Confirm -- No --> T
    H -- Manage Platform Users --> V[Navigate to 'Platform Users' Tab (SA, A, M - M view/profile-view only)]
    V --> W[Search/Sort/View Platform Users]
    W --> X[Click Action Icon: View Profile (All), Suspend/Activate (SA for SA/A/M; A for M only; M for none)]
    X --> X_Confirm[Confirmation Modal for Platform User Action]
    X_Confirm -- Yes --> X_Action[Perform User Status Update]
    X_Action --> V
    X_Confirm -- No --> W
    F --> Y[Logout]
```

## 5. Page Routes

| Route                           | Description                                                                                                        | Access Level                 |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| `/auth/admin/login`             | Dedicated login page for administrators, super administrators, and moderators.                                     | Public (for login)           |
| `/admin`                        | Main admin dashboard with tabs for managing various aspects of the platform.                                       | SuperAdmin, Admin, Moderator |
| `/profile`                      | Platform staff can manage their own profile details (name, avatar).                                                | SuperAdmin, Admin, Moderator |
| `/employer/candidates/[userId]` | Used by platform staff to view profiles of any user (Job Seekers or other Platform Users) via the admin dashboard. | SuperAdmin, Admin, Moderator |

## 6. Key "API" Interactions (Data Flows)

Platform Staff interact primarily with the Firebase Firestore database. Permissions are enforced in the UI and backend functions (if any future Cloud Functions are added).

- **Fetching Data**: Queries Firestore with filters based on roles.
- **Updating Status**: Updates Firestore documents. `handleUserStatusUpdate` now has stricter role-based checks:
  - Moderators cannot use `handleUserStatusUpdate` for user status changes (Job Seekers or Platform Users).
  - Admins cannot use `handleUserStatusUpdate` for other Admins/SuperAdmins.
  - SuperAdmins can manage status for all users.

## 7. Future Updates (Potential Enhancements)

- Granular permissions for Moderators (e.g., can only edit certain fields of a job posting they approved).
- Dedicated Moderator dashboard view with only relevant tasks.
- Audit logs for admin actions.

---

_This guide is intended for informational purposes for the JobBoardly team._
