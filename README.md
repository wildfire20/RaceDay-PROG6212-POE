# RaceDay

RaceDay is a web-based event management system designed for South African road running, walking, and cycling events.

The system allows Organisers to create and manage sporting events, event categories, participant enrolments, and race results. Participants can create accounts, browse available events, enrol in an event by selecting a category, manage their personal information, and view their race results.

The RaceDay project is developed progressively across three parts:

- Part 1: System Planning and Database
- Part 2: RESTful API Development
- Part 3: ASP.NET Core MVC Web Application

## User Roles

### Organiser

An Organiser can:

- Create, edit, and delete events.
- Manage categories for events.
- View Participants who have enrolled in their events.
- View the selected category and enrolment status of Participants.
- Capture and publish race finish times and finishing positions.
- Upload an event banner image.

### Participant

A Participant can:

- Register and log in to the system.
- Browse upcoming events.
- View complete event information and available categories.
- Enrol in an event and select a category.
- View their previous and current enrolments.
- View their personal race results.
- View and update their profile information.
- Upload a profile picture.

## Part 1 - System Planning and Database

# RaceDay

RaceDay is a web-based event management system designed for South African road running, walking, and cycling events.

The system allows Organisers to create and manage events, categories, participant enrolments, and race results. Participants can register, browse events, enrol in categories, manage their profiles, and view their results.

This Portfolio of Evidence is developed progressively across three parts.

- Part 1: System Planning and Database
- Part 2: RESTful API Development
- Part 3: ASP.NET Core MVC Web Application

---

# Part 1 - System Planning and Database

Part 1 focuses on planning the RaceDay system before the API is implemented.

The Part 1 submission includes:

- Entity Relationship Diagram (ERD)
- REST API Endpoint Plan
- SQL Server Database Script
- Realistic Sample Data
- GitHub Actions CI/CD workflow
- References
- Video Presentation

---

## User Roles

### Organiser

The Organiser role is responsible for managing RaceDay events.

An Organiser can:

- Create events
- Edit events
- Delete events
- Manage event categories
- View Participant enrolments
- View selected Participant categories
- Update enrolment statuses
- Capture Participant finish times
- Capture finishing positions
- Publish race results

### Participant

The Participant role is used by people entering RaceDay events.

A Participant can:

- Register for an account
- Log in to the system
- Browse available events
- View event information
- Select an event category
- Enrol in an event
- View their enrolments
- View their personal results
- View and update their profile

---

## Database Design

The RaceDay database is implemented using SQL Server.

The database contains six main entities:

1. Users
2. Events
3. Categories
4. EventCategories
5. Enrolments
6. Results

The database design uses primary keys, foreign keys, unique constraints, check constraints, default values, and required fields to maintain data integrity.

The `EventCategories` entity resolves the many-to-many relationship between Events and Categories.

The `Results` table uses a unique `EnrolmentId` so that one enrolment can have a maximum of one result.

---

## Entity Relationship Diagram

The RaceDay ERD is stored in:

`/docs/RaceDay_ERD.png`

The ERD shows all six entities, their attributes, primary keys, foreign keys, and relationship cardinalities.

---

## API Endpoint Plan

The REST API endpoint plan is stored in:

`/docs/API_Endpoint_Plan.md`

The plan covers:

- Authentication
- User Profile
- Events
- Categories
- Event Enrolments
- Results

Each planned endpoint includes:

- HTTP Method
- Route
- Description
- Required Role
- Request Body
- Expected Response

---

## SQL Database Script

The SQL Server database script is stored in:

`/docs/RaceDay_Database.sql`

The script:

- Creates the RaceDayDB database
- Creates all six database tables
- Defines primary keys
- Defines foreign keys
- Defines constraints
- Adds realistic sample data
- Can be executed from the beginning on a clean SQL Server instance

The script was tested successfully using SQL Server Management Studio.

Sample data includes:

- 2 Organisers
- 2 Participants
- 3 Events
- 5 Categories
- Event category assignments
- Sample enrolments
- Sample results

---

## Running the Database Script

1. Open SQL Server Management Studio.
2. Connect to the SQL Server instance.
3. Open the `RaceDay_Database.sql` file.
4. Execute the full SQL script.
5. Refresh the Databases folder.
6. Confirm that `RaceDayDB` has been created.
7. Expand the Tables folder and confirm that all six RaceDay tables are present.

---

## CI/CD

A GitHub Actions workflow is included in:

`.github/workflows/validate-part1.yml`

The workflow validates that the required Part 1 files and folders are present in the repository.

### CI/CD Screenshot

A screenshot of the successful GitHub Actions green build will be added once access to the official GitHub repository is available.

---

## References

All sources used during planning and development are recorded in:

`/docs/References.md`

---

## Video Presentation

The Part 1 presentation video will demonstrate:

- RaceDay system planning
- ERD design
- Entity relationships
- API endpoint planning
- SQL database design
- Running the SQL script in SQL Server Management Studio
- GitHub repository structure
- Successful CI/CD workflow

YouTube Video Link:

`To be added after recording`

---

## AI Tool Disclosure

AI tools were used to assist with planning, concept explanation, proofreading, and troubleshooting during the development process.

All final design decisions, implementation, testing, and evaluation of the work were reviewed by the student.