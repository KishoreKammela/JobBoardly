# API v1: Job Endpoints

These endpoints are for interacting with job listings.

---

### Get All Approved Jobs

- **`GET /api/v1/jobs`**
- **Description**: Fetches a paginated list of all `approved` jobs for public display.
- **Authorization**: `public`.
- **Query Parameters**: See the `Filters` type in `src/types/index.ts`. Examples:
  | Field | Type | Description |
  |---|---|---|
  | `q` | `string` | Search term for title, company, skills, etc. |
  | `loc` | `string` | Location. |
  | `type` | `string` | `Full-time`, `Part-time`, etc. |
  | `remote`| `boolean`| `true` to show only remote jobs. |
  | `industry`| `string` | Filter by industry. |
  | `expLevel`| `string` | `Entry-Level`, `Mid-Level`, etc. |
  | `minSal`| `number` | Minimum salary (annual INR). |
  | `page` | `number` | Page number for pagination. |
  | `limit` | `number` | Items per page (e.g., 9). |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "job123",
        "title": "Senior Frontend Developer",
        "company": "Innovatech Solutions",
        "location": "San Francisco, CA",
        "type": "Full-time",
        "isRemote": false,
        "postedDate": "2023-10-26T10:00:00Z",
        "skills": ["React", "TypeScript", "Next.js"],
        "salaryMin": 120000,
        "salaryMax": 150000
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 75, "totalItems": 750 }
  }
  ```

---

### Get Single Job Details

- **`GET /api/v1/jobs/:jobId`**
- **Description**: Fetches the full details of a single job.
- **Authorization**: `public` (for `approved` jobs), `platformStaff` / `owning employer` (for any status).
- **Success Response** (`200 OK`):
  ```json
  {
    "job": {
      "id": "job123",
      "title": "Senior Frontend Developer",
      "company": "Innovatech Solutions",
      "companyId": "companyA",
      "responsibilities": "You will be responsible for building...",
      "requirements": "A bachelor's degree in CS... 5+ years of experience...",
      "skills": ["React", "TypeScript"],
      "industry": "Technology",
      "experienceLevel": "Senior-Level",
      "screeningQuestions": [
        {
          "id": "q1",
          "questionText": "Are you legally authorized to work in the specified location?",
          "type": "yesNo",
          "isRequired": true
        }
      ]
    },
    "company": {
      "id": "companyA",
      "name": "Innovatech Solutions",
      "description": "A leading provider of innovative tech solutions...",
      "logoUrl": "https://placehold.co/100x100.png?text=IS"
    }
  }
  ```
- **Error Response** (`404 Not Found`): If the job doesn't exist. (`403 Forbidden`) if the user doesn't have permission to view its status.

---

### Create a Job

- **`POST /api/v1/jobs`**
- **Description**: Creates a new job posting. The job is created with `pending` status for admin review.
- **Authorization**: `employer`.
- **Request Body**: The `Job` object (excluding fields like `id`, `status`, `postedDate`, `createdAt`).
- **Success Response** (`201 Created`): The newly created job object with its assigned ID and `pending` status.

---

### Update a Job

- **`PUT /api/v1/jobs/:jobId`**
- **Description**: Updates an existing job posting. Resubmits the job for approval by setting its status back to `pending`.
- **Authorization**: `employer` who owns the job.
- **Request Body**: The `Job` object fields that are updatable.
- **Success Response** (`200 OK`): The updated job object.

---

### Apply for a Job

- **`POST /api/v1/jobs/:jobId/apply`**
- **Description**: Submits a job application.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `answers`| `ApplicationAnswer[]` | `optional` | Array of answers to screening questions. |
- **Mock Request Body**:
  ```json
  {
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Are you authorized to work...?",
        "answer": true
      }
    ]
  }
  ```
- **Success Response** (`201 Created`): The created `Application` object.
- **Error Response** (`400 Bad Request`): If the job seeker has already applied for this job.
