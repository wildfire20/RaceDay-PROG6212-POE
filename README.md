# RaceDay

RaceDay is a web-based event management system for running, walking and cycling events in South Africa.

The idea behind the system is to give Organisers an easier way to manage events, categories, enrolments and race results. Participants will also be able to create accounts, browse events, enter events and keep track of their results.

This project is completed in three parts. Part 1 focuses on planning the system and designing the database before any API code is written.

## Part 1 - System Planning and Database

For Part 1, I planned the structure of RaceDay and created the database that will be used later in the project.

The main work completed in this part includes:

- Entity Relationship Diagram (ERD)
- REST API endpoint plan
- SQL Server database script
- Sample data
- GitHub version control
- GitHub Actions CI/CD workflow
- References

## User Roles

RaceDay has two user roles: Organiser and Participant.

### Organiser

The Organiser is responsible for managing events.

An Organiser will be able to:

- Create events
- Edit and delete events
- Add categories to events
- View Participants who have enrolled
- View the category selected by each Participant
- View enrolment statuses
- Capture finish times
- Capture finishing positions
- Publish race results

### Participant

The Participant is the person taking part in an event.

A Participant will be able to:

- Register for an account
- Log in
- Browse available events
- View event details
- Select an event category
- Enrol in an event
- View their enrolments
- View their results
- View and update their profile information

## Database

The RaceDay database was created using SQL Server.

The database contains six main tables:

1. Users
2. Events
3. Categories
4. EventCategories
5. Enrolments
6. Results

Primary keys and foreign keys are used to connect the tables.

I also used constraints such as `NOT NULL`, `UNIQUE`, `CHECK` and `DEFAULT` where they were needed.

The `EventCategories` table is used to connect Events and Categories because an event can have more than one category and a category can also be used for more than one event.

The `Results` table uses a unique `EnrolmentId`. This means one enrolment can only have one result.

## Entity Relationship Diagram

The ERD for RaceDay is stored in:

`docs/RaceDay_ERD.png`

The diagram shows the six database entities, their attributes, primary keys, foreign keys and the relationships between them.

## API Endpoint Plan

The planned REST API endpoints are stored in:

`docs/API_Endpoint_Plan.md`

The endpoint plan covers:

- Authentication
- User profiles
- Events
- Categories
- Event enrolments
- Results

For each endpoint, I included the HTTP method, route, description, required role, request body and expected response.

No API code is written in Part 1. The endpoint plan will be used when the API is developed later.

## SQL Script

The SQL Server script is stored in:

`docs/RaceDay_Database.sql`

The script creates the `RaceDayDB` database and all six tables.

It also adds realistic sample data, including:

- 2 Organisers
- 2 Participants
- 3 Events
- 5 Categories
- Event category records
- Participant enrolments
- Sample results

The full script was tested in SQL Server Management Studio and ran successfully.

## Running the Database

To run the database:

1. Open SQL Server Management Studio.
2. Connect to the SQL Server instance.
3. Open `RaceDay_Database.sql`.
4. Run the full script.
5. Refresh the Databases folder.
6. Open `RaceDayDB`.
7. Check the Tables folder to confirm that all six tables were created.

## GitHub and CI/CD

Git was used throughout Part 1 to keep track of the work completed on the project.

The GitHub Actions workflow is stored in:

`.github/workflows/validate-part1.yml`

The workflow checks that the important Part 1 files are present in the repository.

The workflow has been tested successfully on GitHub Actions and completed with a green build.

### CI/CD Screenshot

A screenshot of the successful GitHub Actions workflow is included in the project documentation.

If the screenshot is saved as `docs/CI_CD_Green_Build.png`, it can also be displayed here:

![RaceDay Part 1 CI/CD Green Build](docs/CI_CD_Green_Build.png)

## References

The sources I used while researching and completing Part 1 are listed in:

`docs/References.md`

These include documentation and tutorials used for the ERD, SQL Server, REST API planning and GitHub Actions.

## Video Presentation

The Part 1 video will show and explain:

- The RaceDay ERD
- The database relationships
- The API endpoint plan
- The SQL database design
- Running the SQL script in SSMS
- The GitHub repository
- The successful GitHub Actions workflow

YouTube Video Link:

https://youtu.be/YI4MqQKTz7M

## AI Tool Disclosure

AI tools were used during the project to help with planning, explaining unfamiliar concepts, proofreading and troubleshooting.

The final project structure, database design, testing and submitted work were reviewed by me before submission...

## Database Verification

The file `docs/Database_Verification.sql` contains queries used to check:

- That all six RaceDay tables exist
- The number of sample records in each table
- The foreign key relationships between the tables

These queries were also used during testing in SQL Server Management Studio.

The main relationships in the ERD are:

- One Organiser can create many Events
- One Participant can have many Enrolments
- One Event can have many EventCategories
- One Category can be used in many EventCategories
- One EventCategory can have many Enrolments
- One Enrolment can have zero or one Result

## Part 2 - RESTful API Development

Part 2 continues from the planning completed in Part 1. In this part, I implemented the RaceDay REST API using ASP.NET Core Web API, Entity Framework Core and SQL Server.

The API follows the database structure and endpoint plan created in Part 1.

### Technologies Used

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Swagger
- xUnit
- GitHub Actions

### Part 2 Database

Entity Framework Core Code First was used to create the Part 2 database.

The database is called:

`RaceDayPart2DB`

The main tables are:

- Users
- Events
- Categories
- EventCategories
- Enrolments
- Results

EF Core migrations are stored inside the `RaceDay.Api` project.

### Authentication and Roles

RaceDay uses two roles:

**Organiser**

An Organiser can:

- Create, update and delete their events
- Create categories
- Assign categories to their events
- View Participant enrolments
- Capture race results
- Publish race results

**Participant**

A Participant can:

- Register and log in
- View available events
- View event categories
- Enrol in events
- View their own enrolments
- View published race results
- View and update their profile

Passwords are stored as hashes rather than plain text.

The API uses server-side sessions to keep track of the logged-in user and their role.

### API Functionality

The Part 2 API includes endpoints for:

- Registration
- Login and logout
- User profiles
- Events
- Categories
- Event categories
- Event enrolments
- Race results

Role restrictions are enforced by the API. For example, Participants cannot create events and Organisers cannot use Participant-only enrolment functionality.

### Swagger

Swagger is included in the project to display and test the RaceDay API endpoints.

To run the API:

1. Open the RaceDay project.
2. Make sure SQL Server is running.
3. Run:

`dotnet run --project RaceDay.Api`

4. Open the Swagger address shown in the terminal.

For example:

`http://localhost:5287/swagger`

The port number may change depending on the local environment.

### Automated Tests

Automated tests are stored in:

`RaceDay.Api.Tests`

The project currently contains 9 automated tests covering:

- Successful registration
- Password hashing
- Successful login
- Incorrect password rejection
- Unauthenticated profile access
- Organiser event creation
- Participant rejection from Organiser endpoints
- Participant event enrolment
- Enrolment persistence

All 9 tests pass locally.

Tests can be run using:

`dotnet test RaceDay.slnx`

### Part 2 CI/CD

The GitHub Actions workflow for Part 2 is stored in:

`.github/workflows/part2-ci.yml`

The workflow automatically:

- Restores project dependencies
- Builds the RaceDay solution
- Runs the automated tests

The latest Part 2 workflow completed successfully with a green build.

![RaceDay Part 2 CI/CD Green Build](docs/Part2_CI_Green_Build.png)

### Part 2 Video Presentation

The Part 2 video demonstrates the API, authentication, role restrictions, Swagger, database functionality, automated tests and GitHub Actions.

YouTube Video Link:

https://youtu.be/4oi03TqbXBQ