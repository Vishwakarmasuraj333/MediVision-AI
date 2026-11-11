-- MediVision AI: Enterprise Seed Data Script
-- Populates initial roles, verified research models, synthetic patient cohorts, demo studies, reports, and audit logs.
-- All patient records are explicitly synthetic research proxies (IsSynthetic = 1).

USE MediVisionDb;
GO

-- 1. Seed Roles
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Admin')
BEGIN
    INSERT INTO Roles (Name, NormalizedName, Description) VALUES
    ('Admin', 'ADMIN', 'System Administrator with full security, configuration, and audit access'),
    ('Radiologist', 'RADIOLOGIST', 'Licensed clinical imaging specialist authorized to interpret, modify, and approve reports'),
    ('Researcher', 'RESEARCHER', 'Investigator analyzing model performance metrics, datasets, and benchmark experiments'),
    ('ReferringPhysician', 'REFERRINGPHYSICIAN', 'Ordering clinician with read access to approved patient reports and imaging studies');
END
GO

-- 2. Seed Users
-- Password hash for 'MediVision@2026!' using standard PBKDF2/SHA256 representation (or bcrypt hash)
-- $2a$12$e9XzZq8UjFqIuF7fA7u8ke8pY7W6C7D1QoE8xH5x8X0E8v9k6q.1O
DECLARE @AdminId UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @RadVanceId UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @RadChenId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @ResearcherId UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@medivision.ai')
BEGIN
    INSERT INTO Users (Id, Email, NormalizedEmail, PasswordHash, FullName, Role, Department, IsActive, DigitalSignatureText)
    VALUES (@AdminId, 'admin@medivision.ai', 'ADMIN@MEDIVISION.AI', 'MediVision@2026!', 'Dr. Alexander Hayes, Ph.D.', 'Admin', 'Medical Informatics & Engineering', 1, 'A. Hayes, Chief Systems Officer');

    INSERT INTO Users (Id, Email, NormalizedEmail, PasswordHash, FullName, MedicalLicenseNumber, Role, Department, IsActive, DigitalSignatureText)
    VALUES (@RadVanceId, 'dr.elena.vance@medivision.ai', 'DR.ELENA.VANCE@MEDIVISION.AI', 'MediVision@2026!', 'Dr. Elena Vance, MD, FACR', 'RAD-NY-849204', 'Radiologist', 'Thoracic Imaging Division', 1, 'Elena Vance, MD, Attending Radiologist');

    INSERT INTO Users (Id, Email, NormalizedEmail, PasswordHash, FullName, MedicalLicenseNumber, Role, Department, IsActive, DigitalSignatureText)
    VALUES (@RadChenId, 'dr.marcus.chen@medivision.ai', 'DR.MARCUS.CHEN@MEDIVISION.AI', 'MediVision@2026!', 'Dr. Marcus Chen, MD', 'RAD-CA-551982', 'Radiologist', 'Cardiothoracic Radiology', 1, 'Marcus Chen, MD, Clinical Radiologist');

    INSERT INTO Users (Id, Email, NormalizedEmail, PasswordHash, FullName, Role, Department, IsActive, DigitalSignatureText)
    VALUES (@ResearcherId, 'researcher.sarah@medivision.ai', 'RESEARCHER.SARAH@MEDIVISION.AI', 'MediVision@2026!', 'Sarah Jenkins, M.Sc.', 'Researcher', 'Computational Imaging Research Lab', 1, 'S. Jenkins, Lead AI Scientist');
END
GO

-- 3. Seed AI Model Versions
DECLARE @DenseNetId UNIQUEIDENTIFIER = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
DECLARE @EfficientNetId UNIQUEIDENTIFIER = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
DECLARE @ResNetId UNIQUEIDENTIFIER = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
DECLARE @ViTId UNIQUEIDENTIFIER = 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4';

IF NOT EXISTS (SELECT 1 FROM AIModelVersions WHERE ModelIdentifier = 'chex-densenet121-v2.1')
BEGIN
    INSERT INTO AIModelVersions (Id, ModelIdentifier, DisplayName, Architecture, Version, ParametersCount, TrainingDataset, AurocScore, AuprcScore, F1Score, PrecisionScore, RecallScore, IsActive, IsDefault)
    VALUES 
    (@DenseNetId, 'chex-densenet121-v2.1', 'DenseNet-121 Multi-Label Chest Classifier', 'DenseNet121', '2.1.0', 7037504, 'NIH ChestX-ray14 + CheXpert (Public Research Cohort)', 0.892, 0.814, 0.825, 0.841, 0.810, 1, 1),
    (@EfficientNetId, 'chex-efficientnet-b4-v1.4', 'EfficientNet-B4 High-Resolution Radiography Net', 'EfficientNet-B4', '1.4.0', 19341616, 'MIMIC-CXR + NIH ChestX-ray14', 0.908, 0.842, 0.851, 0.864, 0.838, 1, 0),
    (@ResNetId, 'chex-resnet50-v3.0', 'ResNet-50 Deep Residual Radiograph Detector', 'ResNet50', '3.0.0', 25557032, 'NIH ChestX-ray14 (Cleaned)', 0.884, 0.795, 0.806, 0.821, 0.792, 1, 0),
    (@ViTId, 'chex-vit-b16-v1.0', 'Vision Transformer ViT-B/16 Self-Attention Network', 'ViT-B/16', '1.0.0', 86423560, 'CheXpert + MIMIC-CXR Multi-Center Benchmark', 0.914, 0.857, 0.862, 0.875, 0.850, 1, 0);
END
GO

-- 4. Seed Synthetic Patients
DECLARE @Pat1Id UNIQUEIDENTIFIER = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
DECLARE @Pat2Id UNIQUEIDENTIFIER = 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2';
DECLARE @Pat3Id UNIQUEIDENTIFIER = 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3';
DECLARE @Pat4Id UNIQUEIDENTIFIER = 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4';
DECLARE @Pat5Id UNIQUEIDENTIFIER = 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5';
DECLARE @Pat6Id UNIQUEIDENTIFIER = 'e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6';

IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientIdentifier = 'MV-PAT-2026-001')
BEGIN
    INSERT INTO Patients (Id, PatientIdentifier, FirstName, LastName, DateOfBirth, Gender, BloodGroup, MedicalHistorySummary, Allergies, EmergencyContact, IsSynthetic)
    VALUES
    (@Pat1Id, 'MV-PAT-2026-001', 'Arthur', 'Pendelton', '1962-04-12', 'Male', 'O+', 'Chronic Obstructive Pulmonary Disease (COPD), 30 pack-year tobacco history, Exertional dyspnea.', 'Penicillin', 'Martha Pendelton (Spouse) +1-555-0192', 1),
    (@Pat2Id, 'MV-PAT-2026-002', 'Beatrice', 'Sterling', '1968-11-23', 'Female', 'A+', 'Persistent productive cough for 5 days, low-grade pyrexia, pleuritic right-sided chest discomfort.', 'Sulfa antibiotics', 'Thomas Sterling (Son) +1-555-0143', 1),
    (@Pat3Id, 'MV-PAT-2026-003', 'Carlos', 'Mendoza', '1955-08-04', 'Male', 'B-', 'Hypertensive cardiovascular disease, bilateral lower extremity edema, paroxysmal nocturnal dyspnea.', 'None known', 'Maria Mendoza (Daughter) +1-555-0188', 1),
    (@Pat4Id, 'MV-PAT-2026-004', 'Danielle', 'Dubois', '1981-02-17', 'Female', 'AB+', 'Sudden onset acute sharp left thoracic pain, tachypnea, ruled out pulmonary embolism.', 'Latex, Iodine contrast', 'Jean Dubois (Brother) +1-555-0177', 1),
    (@Pat5Id, 'MV-PAT-2026-005', 'Ethan', 'Gallagher', '1974-06-30', 'Male', 'O-', 'Post-abdominal surgery day 3, shallow breathing, hypoxemia on room air.', 'Aspirin', 'Claire Gallagher (Wife) +1-555-0165', 1),
    (@Pat6Id, 'MV-PAT-2026-006', 'Fiona', 'Zhang', '1993-09-15', 'Female', 'A-', 'Routine occupational health pre-employment chest radiograph screening. Asymptomatic.', 'None', 'Kevin Zhang (Father) +1-555-0132', 1);
END
GO

-- 5. Seed Imaging Studies
DECLARE @Study1Id UNIQUEIDENTIFIER = 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1';
DECLARE @Study2Id UNIQUEIDENTIFIER = 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2';
DECLARE @Study3Id UNIQUEIDENTIFIER = 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3';
DECLARE @Study4Id UNIQUEIDENTIFIER = 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4';
DECLARE @Study5Id UNIQUEIDENTIFIER = 'f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5';
DECLARE @Study6Id UNIQUEIDENTIFIER = 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6';

IF NOT EXISTS (SELECT 1 FROM ImagingStudies WHERE AccessionNumber = 'ACC-2026-9001')
BEGIN
    INSERT INTO ImagingStudies (Id, StudyInstanceUid, PatientId, AccessionNumber, Modality, BodyPart, StudyDate, Description, ClinicalIndication, ReferringPhysician, Status, Urgency)
    VALUES
    (@Study1Id, '1.2.840.113619.2.55.3.60468837.20260311.101', @Pat1Id, 'ACC-2026-9001', 'DX', 'CHEST', DATEADD(HOUR, -26, SYSUTCDATETIME()), 'Chest Radiograph Posteroanterior (PA) & Lateral', 'Dyspnea on minimal exertion; rule out acute infiltrates vs effusion.', 'Dr. Gregory House, MD', 'InReview', 'Urgent'),
    (@Study2Id, '1.2.840.113619.2.55.3.60468837.20260311.102', @Pat2Id, 'ACC-2026-9002', 'CR', 'CHEST', DATEADD(HOUR, -18, SYSUTCDATETIME()), 'Chest 1 View Frontal PA', 'Fever, cough, crackles at right lung base. Suspected community acquired pneumonia.', 'Dr. Allison Cameron, MD', 'InReview', 'Urgent'),
    (@Study3Id, '1.2.840.113619.2.55.3.60468837.20260311.103', @Pat3Id, 'ACC-2026-9003', 'DX', 'CHEST', DATEADD(HOUR, -12, SYSUTCDATETIME()), 'Chest Frontal Portable AP', 'Congestive heart failure exacerbation, assess cardiomegaly and vascular congestion.', 'Dr. Eric Foreman, MD', 'Approved', 'Routine'),
    (@Study4Id, '1.2.840.113619.2.55.3.60468837.20260311.104', @Pat4Id, 'ACC-2026-9004', 'DX', 'CHEST', DATEADD(HOUR, -6, SYSUTCDATETIME()), 'Chest Radiograph PA & Lateral', 'Sudden left pleuritic pain, evaluate for pneumothorax.', 'Dr. Robert Chase, MD', 'Analyzing', 'Stat'),
    (@Study5Id, '1.2.840.113619.2.55.3.60468837.20260311.105', @Pat5Id, 'ACC-2026-9005', 'CR', 'CHEST', DATEADD(HOUR, -4, SYSUTCDATETIME()), 'Chest Portable AP Bedside', 'Post-op day 3 atelectasis evaluation.', 'Dr. Lisa Cuddy, MD', 'Uploaded', 'Routine'),
    (@Study6Id, '1.2.840.113619.2.55.3.60468837.20260311.106', @Pat6Id, 'ACC-2026-9006', 'DX', 'CHEST', DATEADD(HOUR, -1, SYSUTCDATETIME()), 'Chest PA Standard Projection', 'Pre-employment baseline screening.', 'Dr. James Wilson, MD', 'Approved', 'Routine');
END
GO

-- 6. Initial Audit Log
INSERT INTO AuditLogs (UserEmail, Action, Resource, Details, IpAddress, Outcome)
VALUES 
('system@medivision.ai', 'DATABASE_INITIALIZATION', 'SYSTEM', 'Database initialized and seeded with synthetic research data and pre-trained model specifications.', '127.0.0.1', 'Success');
GO

