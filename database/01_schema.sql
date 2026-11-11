-- MediVision AI: Enterprise Medical Imaging Intelligence Platform
-- SQL Server Normalized Database Schema DDL
-- Compatible with Microsoft SQL Server 2019/2022/Azure SQL & EF Core Migrations

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MediVisionDb')
BEGIN
    PRINT 'Database MediVisionDb target initialized.';
END
GO

-- 1. Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL UNIQUE,
        NormalizedName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 2. Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        Email NVARCHAR(256) NOT NULL UNIQUE,
        NormalizedEmail NVARCHAR(256) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(500) NOT NULL,
        FullName NVARCHAR(150) NOT NULL,
        MedicalLicenseNumber NVARCHAR(100) NULL,
        Department NVARCHAR(100) NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Radiologist',
        IsActive BIT NOT NULL DEFAULT 1,
        LastLoginAt DATETIME2 NULL,
        DigitalSignatureText NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0
    );
    CREATE NONCLUSTERED INDEX IX_Users_Email ON Users(NormalizedEmail) WHERE IsDeleted = 0;
END
GO

-- 3. UserRoles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE UserRoles (
        UserId UNIQUEIDENTIFIER NOT NULL,
        RoleId INT NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
        CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
    );
END
GO

-- 4. Patients (Pseudonymized research and synthetic patient repository)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Patients')
BEGIN
    CREATE TABLE Patients (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        PatientIdentifier NVARCHAR(50) NOT NULL UNIQUE, -- E.g. MV-PAT-2026-001
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        DateOfBirth DATE NOT NULL,
        Gender NVARCHAR(20) NOT NULL,
        BloodGroup NVARCHAR(10) NULL,
        MedicalHistorySummary NVARCHAR(MAX) NULL,
        Allergies NVARCHAR(500) NULL,
        EmergencyContact NVARCHAR(150) NULL,
        IsSynthetic BIT NOT NULL DEFAULT 1, -- Explicit label: Research / Synthetic Data
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0
    );
    CREATE NONCLUSTERED INDEX IX_Patients_Identifier ON Patients(PatientIdentifier) WHERE IsDeleted = 0;
END
GO

-- 5. ImagingStudies
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImagingStudies')
BEGIN
    CREATE TABLE ImagingStudies (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        StudyInstanceUid NVARCHAR(128) NOT NULL UNIQUE,
        PatientId UNIQUEIDENTIFIER NOT NULL,
        AccessionNumber NVARCHAR(50) NOT NULL UNIQUE,
        Modality NVARCHAR(20) NOT NULL DEFAULT 'CR', -- CR, DX, CT
        BodyPart NVARCHAR(50) NOT NULL DEFAULT 'CHEST',
        StudyDate DATETIME2 NOT NULL,
        Description NVARCHAR(255) NULL,
        ClinicalIndication NVARCHAR(MAX) NULL,
        ReferringPhysician NVARCHAR(150) NULL,
        PerformingFacility NVARCHAR(150) NOT NULL DEFAULT 'MediVision Academic Medical Center',
        Status NVARCHAR(50) NOT NULL DEFAULT 'Uploaded', -- Uploaded, Analyzing, Analyzed, InReview, Approved, Rejected
        Urgency NVARCHAR(20) NOT NULL DEFAULT 'Routine', -- Routine, Urgent, Stat
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_ImagingStudies_Patients FOREIGN KEY (PatientId) REFERENCES Patients(Id) ON DELETE RESTRICT
    );
    CREATE NONCLUSTERED INDEX IX_ImagingStudies_PatientId ON ImagingStudies(PatientId);
    CREATE NONCLUSTERED INDEX IX_ImagingStudies_Status ON ImagingStudies(Status);
END
GO

-- 6. ImageFiles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImageFiles')
BEGIN
    CREATE TABLE ImageFiles (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        StudyId UNIQUEIDENTIFIER NOT NULL,
        FileName NVARCHAR(255) NOT NULL,
        StoragePath NVARCHAR(1000) NOT NULL,
        ContentType NVARCHAR(100) NOT NULL, -- application/dicom, image/png, image/jpeg
        FileSizeBytes BIGINT NOT NULL,
        FileSha256 NVARCHAR(64) NOT NULL,
        Width INT NULL,
        Height INT NULL,
        BitsAllocated INT NULL,
        PhotometricInterpretation NVARCHAR(50) NULL,
        WindowCenter FLOAT NULL,
        WindowWidth FLOAT NULL,
        QualityCheckPassed BIT NOT NULL DEFAULT 1,
        QualityCheckDetails NVARCHAR(MAX) NULL, -- JSON metrics: SNR, contrast, resolution
        DicomMetadataJson NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ImageFiles_ImagingStudies FOREIGN KEY (StudyId) REFERENCES ImagingStudies(Id) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_ImageFiles_StudyId ON ImageFiles(StudyId);
END
GO

-- 7. AIModelVersions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIModelVersions')
BEGIN
    CREATE TABLE AIModelVersions (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        ModelIdentifier NVARCHAR(100) NOT NULL UNIQUE, -- E.g. chex-densenet121-v2.1
        DisplayName NVARCHAR(150) NOT NULL,
        Architecture NVARCHAR(100) NOT NULL, -- DenseNet121, EfficientNet-B4, ResNet50, ViT-Base
        Version NVARCHAR(50) NOT NULL,
        ParametersCount BIGINT NOT NULL,
        TrainingDataset NVARCHAR(255) NOT NULL, -- NIH ChestX-ray14 / CheXpert / MIMIC-CXR (Public research)
        AurocScore FLOAT NOT NULL,
        AuprcScore FLOAT NOT NULL,
        F1Score FLOAT NOT NULL,
        PrecisionScore FLOAT NOT NULL,
        RecallScore FLOAT NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsDefault BIT NOT NULL DEFAULT 0,
        WeightsPath NVARCHAR(1000) NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        DeployedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 8. AIAnalysisJobs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIAnalysisJobs')
BEGIN
    CREATE TABLE AIAnalysisJobs (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        StudyId UNIQUEIDENTIFIER NOT NULL,
        ImageFileId UNIQUEIDENTIFIER NOT NULL,
        ModelVersionId UNIQUEIDENTIFIER NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Queued', -- Queued, Processing, Completed, Failed
        ProgressPercentage INT NOT NULL DEFAULT 0,
        StartedAt DATETIME2 NULL,
        CompletedAt DATETIME2 NULL,
        ExecutionTimeMs INT NULL,
        GpuDeviceUsed NVARCHAR(100) NULL,
        ErrorMessage NVARCHAR(MAX) NULL,
        TriggeredByUserId UNIQUEIDENTIFIER NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AIAnalysisJobs_Studies FOREIGN KEY (StudyId) REFERENCES ImagingStudies(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AIAnalysisJobs_ImageFiles FOREIGN KEY (ImageFileId) REFERENCES ImageFiles(Id),
        CONSTRAINT FK_AIAnalysisJobs_ModelVersions FOREIGN KEY (ModelVersionId) REFERENCES AIModelVersions(Id)
    );
    CREATE NONCLUSTERED INDEX IX_AIAnalysisJobs_Status ON AIAnalysisJobs(Status);
END
GO

-- 9. AIResults
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIResults')
BEGIN
    CREATE TABLE AIResults (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        JobId UNIQUEIDENTIFIER NOT NULL UNIQUE,
        PrimaryFinding NVARCHAR(100) NOT NULL,
        OverallConfidence FLOAT NOT NULL,
        RiskCategory NVARCHAR(50) NOT NULL, -- Normal, LowRisk, ModerateSuspicion, HighSuspicion
        ClassificationScoresJson NVARCHAR(MAX) NOT NULL, -- Raw logits/sigmoid probabilities
        CalibratedProbabilitiesJson NVARCHAR(MAX) NOT NULL, -- Platt scaled probabilities with 95% CI
        FindingsSummary NVARCHAR(MAX) NOT NULL,
        GradCamHeatmapPath NVARCHAR(1000) NULL,
        GradCamOverlayPath NVARCHAR(1000) NULL,
        LungSegmentationMaskPath NVARCHAR(1000) NULL,
        LungSegmentationOverlayPath NVARCHAR(1000) NULL,
        DiceScore FLOAT NULL,
        IoUMetric FLOAT NULL,
        LeftLungAreaPixels INT NULL,
        RightLungAreaPixels INT NULL,
        CardiothoracicRatio FLOAT NULL,
        ResearchDisclaimer NVARCHAR(500) NOT NULL DEFAULT 'Investigational AI Decision Support. Requires verified radiologist interpretation.',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AIResults_AIAnalysisJobs FOREIGN KEY (JobId) REFERENCES AIAnalysisJobs(Id) ON DELETE CASCADE
    );
END
GO

-- 10. Reports
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reports')
BEGIN
    CREATE TABLE Reports (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        StudyId UNIQUEIDENTIFIER NOT NULL,
        AIResultId UNIQUEIDENTIFIER NULL,
        AuthorId UNIQUEIDENTIFIER NOT NULL,
        ReportIdentifier NVARCHAR(50) NOT NULL UNIQUE, -- E.g. MV-REP-2026-0042
        Title NVARCHAR(200) NOT NULL DEFAULT 'Radiology Consultation & AI Decision-Support Report',
        ClinicalIndication NVARCHAR(MAX) NULL,
        Technique NVARCHAR(MAX) NULL,
        ComparisonStudy NVARCHAR(200) NULL,
        Findings NVARCHAR(MAX) NOT NULL,
        Impression NVARCHAR(MAX) NOT NULL,
        Recommendations NVARCHAR(MAX) NULL,
        CriticalFindingAlert BIT NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, PendingReview, Approved, Rejected, AddendumRequired
        GeneratedPdfPath NVARCHAR(1000) NULL,
        ApprovedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_Reports_ImagingStudies FOREIGN KEY (StudyId) REFERENCES ImagingStudies(Id),
        CONSTRAINT FK_Reports_AIResults FOREIGN KEY (AIResultId) REFERENCES AIResults(Id),
        CONSTRAINT FK_Reports_Users FOREIGN KEY (AuthorId) REFERENCES Users(Id)
    );
    CREATE NONCLUSTERED INDEX IX_Reports_StudyId ON Reports(StudyId);
    CREATE NONCLUSTERED INDEX IX_Reports_Status ON Reports(Status);
END
GO

-- 11. RadiologistReviews
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RadiologistReviews')
BEGIN
    CREATE TABLE RadiologistReviews (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        ReportId UNIQUEIDENTIFIER NOT NULL,
        RadiologistId UNIQUEIDENTIFIER NOT NULL,
        Decision NVARCHAR(50) NOT NULL, -- Approved, Modified, Rejected
        ReviewerNotes NVARCHAR(MAX) NULL,
        AgreementScore INT NOT NULL DEFAULT 5, -- 1 to 5 scale
        AiSuggestionsAccepted NVARCHAR(MAX) NULL,
        AiSuggestionsRejected NVARCHAR(MAX) NULL,
        DigitalSignatureHash NVARCHAR(256) NOT NULL,
        ReviewedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_RadiologistReviews_Reports FOREIGN KEY (ReportId) REFERENCES Reports(Id) ON DELETE CASCADE,
        CONSTRAINT FK_RadiologistReviews_Users FOREIGN KEY (RadiologistId) REFERENCES Users(Id)
    );
    CREATE NONCLUSTERED INDEX IX_RadiologistReviews_ReportId ON RadiologistReviews(ReportId);
END
GO

-- 12. AuditLogs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        UserId UNIQUEIDENTIFIER NULL,
        UserEmail NVARCHAR(256) NOT NULL,
        Action NVARCHAR(100) NOT NULL, -- LOGIN, VIEW_STUDY, UPLOAD_DICOM, RUN_AI_INFERENCE, APPROVE_REPORT, REJECT_REPORT, EXPORT_PDF
        Resource NVARCHAR(100) NOT NULL,
        ResourceId NVARCHAR(100) NULL,
        Details NVARCHAR(MAX) NULL,
        IpAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(255) NULL,
        Outcome NVARCHAR(20) NOT NULL DEFAULT 'Success', -- Success, Failure, Unauthorized
        Timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Action ON AuditLogs(Action);
END
GO

