# API v1: Admin Endpoints

These endpoints are for platform staff to manage users, content, and platform settings. Access is strictly controlled by `platformStaff` roles (`admin`, `superAdmin`, `moderator`, etc.), with specific permissions varying by endpoint.

---

### Get Platform Statistics

- **`GET /api/v1/admin/stats`**
- **Description**: Fetches platform-wide statistics for the admin dashboard.
- **Authorization**: `platformStaff` (with potential restrictions based on role, e.g., Support Agents may not see this).
- **Success Response** (`200 OK`):
  ```json
  {
    "totalJobSeekers": 1250,
    "totalCompanies": 210,
    "totalJobs": 875,
    "approvedJobs": 750,
    "totalApplications": 15300
  }
  ```

---

### Get All Companies for Management

- **`GET /api/v1/admin/companies`**
- **Description**: Fetches a paginated list of all companies for admin management, including pending and suspended ones.
- **Authorization**: `platformStaff`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `q` | `string` | Search term for company name. |
  | `status`| `string` | Filter by status (`pending`, `approved`, etc.). |
  | `page` | `number` | Page number for pagination. |
  | `limit` | `number` | Items per page. |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "companyA",
        "name": "Innovatech Solutions",
        "websiteUrl": "https://innovatech.com",
        "status": "approved",
        "jobCount": 15,
        "applicationCount": 120,
        "createdAt": "2023-10-26T10:00:00Z"
      },
      {
        "id": "companyB",
        "name": "Data Systems",
        "websiteUrl": "https://datasystems.com",
        "status": "pending",
        "jobCount": 0,
        "applicationCount": 0,
        "createdAt": "2023-10-27T11:00:00Z"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 21, "totalItems": 210 }
  }
  ```

---

### Update Company Status

- **`PUT /api/v1/admin/companies/:companyId/status`**
- **Description**: Approves, rejects, suspends, or deletes a company.
- **Authorization**: `platformStaff` (permissions vary by role, e.g., moderators can't suspend).
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `status` | `string` | `required`, one of: `approved`, `rejected`, `suspended`, `deleted`, `active` | The new status. |
  | `reason`| `string` | `optional` | A reason for the status change, especially for rejection or suspension. |
- **Success Response** (`200 OK`): The updated company object.

---

### Get All Jobs for Management

- **`GET /api/v1/admin/jobs`**
- **Description**: Fetches a paginated list of all jobs for admin management.
- **Authorization**: `platformStaff`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `q` | `string` | Search term for job title or company name. |
  | `status`| `string` | Filter by status. |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "job123",
        "title": "Senior Frontend Developer",
        "companyName": "Innovatech Solutions",
        "status": "approved",
        "applicantCount": 45,
        "createdAt": "2023-10-26T10:00:00Z"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 88, "totalItems": 875 }
  }
  ```

---

### Update Job Status

- **`PUT /api/v1/admin/jobs/:jobId/status`**
- **Description**: Approves, rejects, or suspends a job posting.
- **Authorization**: `platformStaff` (permissions vary by role).
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `status` | `string` | `required`, one of: `approved`, `rejected`, `suspended` | The new status. |
  | `reason`| `string` | `optional` | A reason for rejection or suspension. |
- **Success Response** (`200 OK`): The updated job object.

---

### Get All Users for Management

- **`GET /api/v1/admin/users`**
- **Description**: Fetches a paginated list of all users. Can be filtered by role.
- **Authorization**: `platformStaff`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `role` | `string` | Filter by user role (e.g., `jobSeeker`, `moderator`). |
- **Success Response** (`200 OK`): Paginated list of user objects.

---

### Update User Status

- **`PUT /api/v1/admin/users/:userId/status`**
- **Description**: Suspends, activates, or deletes a user account.
- **Authorization**: `platformStaff` (`admin`, `superAdmin` only).
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `status` | `string` | `required`, one of: `active`, `suspended`, `deleted` | The new status. |
- **Success Response** (`200 OK`): The updated user object.

---

### Get Legal Document Content

- **`GET /api/v1/admin/legal/:docName`**
- **Description**: Fetches the content of a legal document for editing.
- **Authorization**: `superAdmin`.
- **URL Parameters**:
  - `docName`: `string`, one of `privacyPolicy`, `termsOfService`.
- **Success Response** (`200 OK`):
  ```json
  {
    "id": "privacyPolicy",
    "content": "## Privacy Policy\n\nThis is the current content...",
    "lastUpdated": "2023-10-26T10:00:00Z"
  }
  ```

---

### Update Legal Document Content

- **`PUT /api/v1/admin/legal/:docName`**
- **Description**: Updates the content of a legal document.
- **Authorization**: `superAdmin`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `content` | `string` | `required`, `Markdown format` | The new Markdown content for the document. |
- **Success Response** (`200 OK`): The updated legal document object.
