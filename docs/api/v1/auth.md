# API v1: Authentication Endpoints

These endpoints handle user registration, login, and password management for all user roles.

---

### Register Job Seeker

- **`POST /api/v1/auth/register`**
- **Description**: Registers a new job seeker.
- **Authorization**: `public`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `name` | `string` | `required` | The user's full name. |
  | `email` | `string` | `required`, `email format` | The user's email. |
  | `password`| `string` | `required`, `min:8`, strong password rules | The user's password. |
- **Mock Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response** (`201 Created`): Returns a JWT and the newly created user profile object.
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uid": "user123",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "jobSeeker",
      "status": "active",
      "createdAt": "2023-10-26T10:00:00Z"
    }
  }
  ```
- **Error Response** (`400 Bad Request`): If email is already in use or password is weak.
  ```json
  { "error": "This email address is already in use." }
  ```

---

### Register Employer

- **`POST /api/v1/auth/register/employer`**
- **Description**: Registers a new employer and creates a corresponding company profile with `pending` status.
- **Authorization**: `public`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `recruiterName`| `string`| `required` | The full name of the recruiter signing up. |
  | `companyName`| `string`| `required` | The name of the company. |
  | `email` | `string` | `required`, `email format` | The recruiter's email. |
  | `password`| `string` | `required`, `min:8`, strong password rules | The recruiter's password. |
- **Mock Request Body**:
  ```json
  {
    "recruiterName": "John Recruiter",
    "companyName": "Innovatech Solutions",
    "email": "john@innovatech.com",
    "password": "Password123!"
  }
  ```
- **Success Response** (`201 Created`): Returns a JWT, user profile, and company object.
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uid": "employer1",
      "name": "John Recruiter",
      "email": "john@innovatech.com",
      "role": "employer",
      "companyId": "companyA",
      "isCompanyAdmin": true
    },
    "company": {
      "id": "companyA",
      "name": "Innovatech Solutions",
      "status": "pending"
    }
  }
  ```

---

### User Login (Unified)

- **`POST /api/v1/auth/login`**
- **Description**: Authenticates a user (job seeker or employer) and returns a JWT.
- **Authorization**: `public`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `email` | `string` | `required`, `email format` | The user's email. |
  | `password`| `string` | `required` | The user's password. |
- **Success Response** (`200 OK`): Returns JWT, user profile, and company object (if employer).
- **Error Response** (`401 Unauthorized`): For invalid credentials. (`403 Forbidden`) if account is suspended/deleted.

---

### Admin Login

- **`POST /api/v1/auth/login/admin`**
- **Description**: Authenticates a platform staff member.
- **Authorization**: `public`.
- **Success Response** (`200 OK`): Returns JWT and admin user profile.

---

### Change Password

- **`POST /api/v1/auth/change-password`**
- **Description**: Allows an authenticated user to change their password.
- **Authorization**: `authenticated`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `currentPassword` | `string` | `required` | The user's current password for re-authentication. |
  | `newPassword`| `string` | `required`, `min:8`, strong password rules | The user's new password. |
- **Success Response**: `204 No Content`.
- **Error Response** (`400 Bad Request`): If `currentPassword` is incorrect. (`403 Forbidden`) if recent re-authentication is required.
