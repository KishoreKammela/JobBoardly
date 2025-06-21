# API v1: Notification Endpoints (Future)

This section outlines the planned API for the notification system.

---

### Get My Notifications

- **`GET /api/v1/notifications`**
- **Description**: Fetches the authenticated user's recent notifications.
- **Authorization**: `authenticated`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `page` | `number` | Page number for pagination. |
  | `limit` | `number` | Items per page (e.g., 20). |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "notif1",
        "userId": "user123",
        "title": "Application Status Update",
        "message": "Innovatech Solutions has reviewed your application for Senior Frontend Developer.",
        "type": "APPLICATION_STATUS_UPDATE",
        "link": "/my-jobs",
        "isRead": false,
        "createdAt": "2023-10-28T10:00:00Z"
      },
      {
        "id": "notif2",
        "userId": "user123",
        "title": "New Job Match",
        "message": "A new job, 'Lead React Developer', matches your profile.",
        "type": "GENERIC_INFO",
        "link": "/jobs/job789",
        "isRead": true,
        "createdAt": "2023-10-27T11:00:00Z"
      }
    ],
    "unreadCount": 1
  }
  ```

---

### Mark Notification as Read

- **`POST /api/v1/notifications/:notificationId/mark-as-read`**
- **Description**: Marks a single notification as read.
- **Authorization**: `authenticated`.
- **Success Response**: `204 No Content`.

---

### Mark All Notifications as Read

- **`POST /api/v1/notifications/mark-all-as-read`**
- **Description**: Marks all of the user's notifications as read.
- **Authorization**: `authenticated`.
- **Success Response**: `204 No Content`.

---

### Update Notification Preferences

- **`PUT /api/v1/me/notification-preferences`**
- **Description**: Updates the user's settings for receiving different types of notifications.
- **Authorization**: `authenticated`.
- **Request Body**:
  ```json
  {
    "jobAlerts": {
      "newJobsMatchingProfile": false,
      "savedSearchAlerts": true,
      "applicationStatusUpdates": true
    }
  }
  ```
- **Success Response** (`200 OK`): The updated `jobAlerts` object.
