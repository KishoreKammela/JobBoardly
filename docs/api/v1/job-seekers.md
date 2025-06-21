# API v1: Job Seeker Endpoints

These endpoints are for job seeker-specific actions, including profile management, job applications, and saved searches.

---

### Get My Profile

- **`GET /api/v1/me`**
- **Description**: Fetches the complete profile of the currently authenticated user.
- **Authorization**: `authenticated` (works for any role, but the response structure is most detailed for job seekers).
- **Success Response** (`200 OK`):
  ```json
  {
    "uid": "user123",
    "role": "jobSeeker",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "avatarUrl": "https://placehold.co/100x100.png?text=JD",
    "headline": "Experienced Full Stack Developer",
    "skills": ["React", "Node.js", "TypeScript"],
    "noticePeriod": "1 Month",
    "experiences": [
      {
        "id": "exp1",
        "companyName": "Tech Solutions Inc.",
        "jobRole": "Senior Software Engineer",
        "startDate": "2020-01-15",
        "endDate": null,
        "currentlyWorking": true,
        "description": "Led development of key features..."
      }
    ],
    "educations": [
      {
        "id": "edu1",
        "level": "Graduate",
        "degreeName": "B.S. in Computer Science",
        "instituteName": "University of California, Berkeley",
        "endYear": 2017
      }
    ],
    "savedJobIds": ["job456"],
    "appliedJobIds": ["job123"]
  }
  ```

---

### Update My Profile

- **`PUT /api/v1/me`**
- **Description**: Updates the profile of the authenticated user.
- **Authorization**: `authenticated`.
- **Request Body**: A subset of fields from the `UserProfile` data model. The backend validates which fields are updatable.
  ```json
  {
    "headline": "Principal Full Stack Developer & Team Lead",
    "skills": ["React", "Node.js", "TypeScript", "Next.js", "Team Leadership"],
    "noticePeriod": "3 Months"
  }
  ```
- **Success Response** (`200 OK`): The updated `UserProfile` object.

---

### Get My Applications

- **`GET /api/v1/my-applications`**
- **Description**: Fetches all job applications submitted by the job seeker.
- **Authorization**: `jobSeeker`.
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "app1",
        "jobId": "job123",
        "jobTitle": "Senior Frontend Developer",
        "status": "Reviewed",
        "appliedAt": "2023-10-25T10:00:00Z"
      },
      {
        "id": "app2",
        "jobId": "job789",
        "jobTitle": "Data Scientist",
        "status": "Applied",
        "appliedAt": "2023-10-27T14:00:00Z"
      }
    ]
  }
  ```

---

### Withdraw an Application

- **`POST /api/v1/applications/:applicationId/withdraw`**
- **Description**: Allows a job seeker to withdraw an application they have submitted.
- **Authorization**: `jobSeeker`.
- **Success Response** (`200 OK`): The updated `Application` object with status `Withdrawn by Applicant`.

---

### Save a Job

- **`POST /api/v1/my-jobs/save/:jobId`**
- **Description**: Saves a job to the job seeker's profile.
- **Authorization**: `jobSeeker`.
- **Success Response**: `204 No Content`.

---

### Unsave a Job

- **`DELETE /api/v1/my-jobs/save/:jobId`**
- **Description**: Removes a job from the job seeker's saved list.
- **Authorization**: `jobSeeker`.
- **Success Response**: `204 No Content`.

---

### Save a Job Search

- **`POST /api/v1/my-searches`**
- **Description**: Saves a combination of search terms and filters for later use.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `name` | `string` | `required` | A user-defined name for the search. |
  | `filters`| `Filters` | `required` | The filter object to save. |
- **Success Response** (`201 Created`): The newly created `SavedSearch` object.

---

### Delete a Job Search

- **`DELETE /api/v1/my-searches/:searchId`**
- **Description**: Deletes a saved job search from the user's profile.
- **Authorization**: `jobSeeker`.
- **Success Response**: `204 No Content`.
