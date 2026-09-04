-- RaceDay Database
-- Part 1 - System Planning and Database

USE master;
GO

IF DB_ID('RaceDayDB') IS NOT NULL
BEGIN
    ALTER DATABASE RaceDayDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE RaceDayDB;
END
GO

CREATE DATABASE RaceDayDB;
GO

USE RaceDayDB;
GO

-- =============================================
-- Users Table
-- Stores both Organisers and Participants
-- =============================================

CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    ProfilePictureUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_Users_Role
        CHECK (Role IN ('Organiser', 'Participant'))
);
GO

-- =============================================
-- Events Table
-- Stores RaceDay running, walking and cycling events
-- =============================================

CREATE TABLE Events
(
    EventId INT IDENTITY(1,1) PRIMARY KEY,
    OrganiserId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    EventDate DATETIME2 NOT NULL,
    Location NVARCHAR(200) NOT NULL,
    Distance DECIMAL(10,2) NOT NULL,
    EventType NVARCHAR(20) NOT NULL,
    BannerImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Events_Users
        FOREIGN KEY (OrganiserId)
        REFERENCES Users(UserId),

    CONSTRAINT CK_Events_Distance
        CHECK (Distance > 0),

    CONSTRAINT CK_Events_EventType
        CHECK (EventType IN ('Run', 'Walk', 'Cycle'))
);
GO

-- =============================================
-- Categories Table
-- Stores categories that can be assigned to events
-- =============================================

CREATE TABLE Categories
(
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    CategoryType NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NOT NULL,

    CONSTRAINT UQ_Categories_Name_CategoryType
        UNIQUE (Name, CategoryType)
);
GO

-- =============================================
-- EventCategories Table
-- Links Events and Categories
-- =============================================

CREATE TABLE EventCategories
(
    EventCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL,
    CategoryId INT NOT NULL,

    CONSTRAINT FK_EventCategories_Events
        FOREIGN KEY (EventId)
        REFERENCES Events(EventId),

    CONSTRAINT FK_EventCategories_Categories
        FOREIGN KEY (CategoryId)
        REFERENCES Categories(CategoryId),

    CONSTRAINT UQ_EventCategories_Event_Category
        UNIQUE (EventId, CategoryId)
);
GO

-- =============================================
-- Enrolments Table
-- Stores Participant event enrolments
-- =============================================

CREATE TABLE Enrolments
(
    EnrolmentId INT IDENTITY(1,1) PRIMARY KEY,
    ParticipantId INT NOT NULL,
    EventCategoryId INT NOT NULL,
    EnrolmentDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',

    CONSTRAINT FK_Enrolments_Users
        FOREIGN KEY (ParticipantId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_Enrolments_EventCategories
        FOREIGN KEY (EventCategoryId)
        REFERENCES EventCategories(EventCategoryId),

    CONSTRAINT CK_Enrolments_Status
    CHECK (Status IN ('Pending', 'Confirmed', 'Cancelled')),

CONSTRAINT UQ_Enrolments_Participant_EventCategory
    UNIQUE (ParticipantId, EventCategoryId)

);
GO

-- =============================================
-- Results Table
-- Stores Participant race results
-- =============================================

CREATE TABLE Results
(
    ResultId INT IDENTITY(1,1) PRIMARY KEY,
    EnrolmentId INT NOT NULL UNIQUE,
    FinishTime TIME NOT NULL,
    FinishingPosition INT NOT NULL,
    IsPublished BIT NOT NULL DEFAULT 0,
    RecordedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Results_Enrolments
        FOREIGN KEY (EnrolmentId)
        REFERENCES Enrolments(EnrolmentId),

    CONSTRAINT CK_Results_FinishingPosition
        CHECK (FinishingPosition > 0)
);
GO

-- =============================================
-- Sample Data
-- =============================================

-- ---------------------------------------------
-- Users
-- Minimum required:
-- 2 Organisers and 2 Participants
-- ---------------------------------------------

INSERT INTO Users
    (FirstName, LastName, Email, PasswordHash, Role, PhoneNumber)
VALUES
    ('Thabo', 'Mokoena', 'thabo.mokoena@raceday.co.za',
     'HASHED_PASSWORD_ORGANISER_1', 'Organiser', '0825550101'),

    ('Naledi', 'Dlamini', 'naledi.dlamini@raceday.co.za',
     'HASHED_PASSWORD_ORGANISER_2', 'Organiser', '0835550102'),

    ('Sipho', 'Nkosi', 'sipho.nkosi@email.com',
     'HASHED_PASSWORD_PARTICIPANT_1', 'Participant', '0715550103'),

    ('Ayesha', 'Patel', 'ayesha.patel@email.com',
     'HASHED_PASSWORD_PARTICIPANT_2', 'Participant', '0725550104');
GO


-- ---------------------------------------------
-- Events
-- Minimum required: 3 Events
-- ---------------------------------------------

INSERT INTO Events
    (OrganiserId, Name, Description, EventDate, Location, Distance, EventType)
VALUES
    (1,
     'Pretoria City Run',
     'A road running event through central Pretoria.',
     '2026-10-10 07:00:00',
     'Pretoria, Gauteng',
     10.00,
     'Run'),

    (1,
     'Joburg Community Walk',
     'A community walking event suitable for participants of different fitness levels.',
     '2026-11-07 08:00:00',
     'Johannesburg, Gauteng',
     5.00,
     'Walk'),

    (2,
     'Cape Coastal Cycle',
     'A cycling event along selected coastal routes in Cape Town.',
     '2026-12-05 06:30:00',
     'Cape Town, Western Cape',
     21.00,
     'Cycle');
GO


-- ---------------------------------------------
-- Categories
-- ---------------------------------------------

INSERT INTO Categories
    (Name, CategoryType, Description)
VALUES
    ('5km', 'Distance', 'Five kilometre event category'),

    ('10km', 'Distance', 'Ten kilometre event category'),

    ('21km', 'Distance', 'Twenty-one kilometre event category'),

    ('Under 20', 'Age Group', 'Category for participants under the age of 20'),

    ('Senior', 'Age Group', 'Senior participant category');
GO


-- ---------------------------------------------
-- Event Categories
-- Assign categories to events
-- ---------------------------------------------

INSERT INTO EventCategories
    (EventId, CategoryId)
VALUES
    (1, 2),  -- Pretoria City Run - 10km
    (1, 4),  -- Pretoria City Run - Under 20
    (1, 5),  -- Pretoria City Run - Senior

    (2, 1),  -- Joburg Community Walk - 5km
    (2, 4),  -- Joburg Community Walk - Under 20
    (2, 5),  -- Joburg Community Walk - Senior

    (3, 3),  -- Cape Coastal Cycle - 21km
    (3, 4),  -- Cape Coastal Cycle - Under 20
    (3, 5);  -- Cape Coastal Cycle - Senior
GO


-- ---------------------------------------------
-- Enrolments
-- Sample Participant enrolments
-- ---------------------------------------------

INSERT INTO Enrolments
    (ParticipantId, EventCategoryId, Status)
VALUES
    (3, 1, 'Confirmed'),
    (4, 3, 'Confirmed'),
    (3, 4, 'Pending'),
    (4, 7, 'Confirmed');
GO


-- ---------------------------------------------
-- Results
-- Sample results so that every database entity
-- contains realistic seed data
-- ---------------------------------------------

INSERT INTO Results
    (EnrolmentId, FinishTime, FinishingPosition, IsPublished)
VALUES
    (1, '00:52:18', 14, 1),
    (2, '01:07:42', 27, 1);
GO
