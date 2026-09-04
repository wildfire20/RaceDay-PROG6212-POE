# RaceDay REST API Endpoint Plan

This document outlines the REST API endpoints planned for the RaceDay system.

The endpoints are based on the main functions required for the Organiser and Participant roles. The plan includes the HTTP method, route, required role, request data and the responses that can be returned.

The API itself will be developed in Part 2. No API code is written in Part 1.
## Role Definitions

- **Public** - The endpoint can be accessed without logging in.
- **Any Authenticated User** - Either an Organiser or Participant can access the endpoint after logging in.
- **Organiser** - Only authenticated users with the Organiser role can access the endpoint.
- **Participant** - Only authenticated users with the Participant role can access the endpoint.

## 1. Authentication Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Creates a new RaceDay user account as either an Organiser or Participant. | Public | `{ "firstName": "string", "lastName": "string", "email": "string", "password": "string", "role": "Organiser or Participant", "phoneNumber": "string" }` | `201 Created` - account created. `400 Bad Request` - invalid details. `409 Conflict` - email already registered. |
| POST | `/api/auth/login` | Authenticates a registered user and creates their authenticated session. | Public | `{ "email": "string", "password": "string" }` | `200 OK` - login successful. `400 Bad Request` - invalid request. `401 Unauthorized` - incorrect credentials. |
| POST | `/api/auth/logout` | Ends the authenticated user's current session. | Any Authenticated User | None | `200 OK` - logout successful. `401 Unauthorized` - user is not authenticated. |

## 2. User Profile Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| GET | `/api/profile` | Returns the profile information of the currently authenticated user. | Any Authenticated User | None | `200 OK` - profile returned. `401 Unauthorized` - user is not authenticated. `404 Not Found` - profile could not be found. |
| PUT | `/api/profile` | Updates the profile information of the currently authenticated user. | Any Authenticated User | `{ "firstName": "string", "lastName": "string", "phoneNumber": "string" }` | `200 OK` - profile updated. `400 Bad Request` - invalid data. `401 Unauthorized` - user is not authenticated. `404 Not Found` - profile could not be found. |

## 3. Event Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| GET | `/api/events` | Returns all available RaceDay events. | Any Authenticated User | None | `200 OK` - events returned successfully. `401 Unauthorized` - user is not authenticated. |
| GET | `/api/events/{id}` | Returns the full details of a specific event. | Any Authenticated User | None | `200 OK` - event returned. `401 Unauthorized` - user is not authenticated. `404 Not Found` - event does not exist. |
| POST | `/api/events` | Creates a new event for the authenticated Organiser. | Organiser | `{ "name": "string", "description": "string", "eventDate": "datetime", "location": "string", "distance": 0.0, "eventType": "Run, Walk or Cycle" }` | `201 Created` - event created successfully. `400 Bad Request` - invalid event information. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not an Organiser. |
| PUT | `/api/events/{id}` | Updates an event created by the authenticated Organiser. | Organiser | `{ "name": "string", "description": "string", "eventDate": "datetime", "location": "string", "distance": 0.0, "eventType": "Run, Walk or Cycle" }` | `200 OK` - event updated. `400 Bad Request` - invalid data. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the event. `404 Not Found` - event does not exist. |
| DELETE | `/api/events/{id}` | Deletes an event created by the authenticated Organiser. | Organiser | None | `204 No Content` - event deleted successfully. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot delete the event. `404 Not Found` - event does not exist. |

## 4. Category Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| GET | `/api/categories` | Returns the available RaceDay categories. | Any Authenticated User | None | `200 OK` - categories returned successfully. `401 Unauthorized` - user is not authenticated. |
| GET | `/api/events/{eventId}/categories` | Returns all categories assigned to a specific event. | Any Authenticated User | None | `200 OK` - event categories returned. `401 Unauthorized` - user is not authenticated. `404 Not Found` - event does not exist. |
| POST | `/api/events/{eventId}/categories` | Adds a category to a specific event. | Organiser | `{ "categoryId": 0 }` | `201 Created` - category assigned to event. `400 Bad Request` - invalid request. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not an Organiser or does not own the event. `404 Not Found` - event or category does not exist. `409 Conflict` - category is already assigned to the event. |
| DELETE | `/api/events/{eventId}/categories/{categoryId}` | Removes a category from a specific event. | Organiser | None | `204 No Content` - category removed from event. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the event. `404 Not Found` - event category relationship does not exist. |
| POST | `/api/categories` | Creates a new RaceDay category that can later be assigned to events. | Organiser | `{ "name": "string", "categoryType": "string", "description": "string" }` | `201 Created` - category created. `400 Bad Request` - invalid category information. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not an Organiser. `409 Conflict` - category already exists. |

## 5. Event Enrolment Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| POST | `/api/events/{eventId}/enrolments` | Enrols the authenticated Participant into an event using one of the categories available for that event. | Participant | `{ "eventCategoryId": 0 }` | `201 Created` - enrolment recorded successfully. `400 Bad Request` - invalid enrolment information. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not a Participant. `404 Not Found` - event or event category does not exist. `409 Conflict` - Participant is already enrolled in the event. |
| GET | `/api/enrolments/my` | Returns all event enrolments belonging to the authenticated Participant. | Participant | None | `200 OK` - enrolments returned successfully. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not a Participant. |
| GET | `/api/events/{eventId}/enrolments` | Returns all Participants enrolled in an event, including their selected category and enrolment status. | Organiser | None | `200 OK` - event enrolments returned. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not allowed to manage the event. `404 Not Found` - event does not exist. |
| PUT | `/api/enrolments/{id}/status` | Updates the status of an existing event enrolment. | Organiser | `{ "status": "Pending, Confirmed or Cancelled" }` | `200 OK` - enrolment status updated. `400 Bad Request` - invalid status. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the enrolment. `404 Not Found` - enrolment does not exist. |

## 6. Result Endpoints

| HTTP Method | Route | Description | Role Required | Request Body | Expected Response |
|---|---|---|---|---|---|
| POST | `/api/enrolments/{enrolmentId}/result` | Captures a finish time and finishing position for an enrolled Participant after an event. | Organiser | `{ "finishTime": "HH:mm:ss", "finishingPosition": 0 }` | `201 Created` - result recorded. `400 Bad Request` - invalid result data. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the event. `404 Not Found` - enrolment does not exist. `409 Conflict` - a result already exists for the enrolment. |
| PUT | `/api/results/{id}` | Updates an existing Participant result before or after publication. | Organiser | `{ "finishTime": "HH:mm:ss", "finishingPosition": 0 }` | `200 OK` - result updated. `400 Bad Request` - invalid result information. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the result. `404 Not Found` - result does not exist. |
| PUT | `/api/results/{id}/publish` | Publishes a recorded result so that it can be viewed by the Participant. | Organiser | None | `200 OK` - result published successfully. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the result. `404 Not Found` - result does not exist. |
| GET | `/api/results/my` | Returns the authenticated Participant's published race results and personal performance history. | Participant | None | `200 OK` - results returned successfully. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user is not a Participant. |
| GET | `/api/events/{eventId}/results` | Returns the recorded results for Participants in a specific event. | Organiser | None | `200 OK` - event results returned. `401 Unauthorized` - user is not authenticated. `403 Forbidden` - user cannot manage the event. `404 Not Found` - event does not exist. |

