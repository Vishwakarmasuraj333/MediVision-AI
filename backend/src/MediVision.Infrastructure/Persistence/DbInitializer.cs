using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediVision.Domain.Entities;
using MediVision.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediVision.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(MediVisionDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // Already seeded
        }

        // 1. Roles
        var adminRole = new Role { Name = "Admin", NormalizedName = "ADMIN", Description = "System Administrator" };
        var radRole = new Role { Name = "Radiologist", NormalizedName = "RADIOLOGIST", Description = "Licensed Radiologist" };
        var resRole = new Role { Name = "Researcher", NormalizedName = "RESEARCHER", Description = "Medical AI Researcher" };
        var phyRole = new Role { Name = "ReferringPhysician", NormalizedName = "REFERRINGPHYSICIAN", Description = "Referring Physician" };
        context.Roles.AddRange(adminRole, radRole, resRole, phyRole);

        // 2. Users
        string Hash(string input) => Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(input)));

        var adminUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "admin@medivision.ai",
            NormalizedEmail = "ADMIN@MEDIVISION.AI",
            PasswordHash = Hash("Admin@2026!"),
            FullName = "Dr. Alexander Hayes, Ph.D.",
            Role = UserRole.Admin,
            Department = "Medical Informatics & Systems Engineering",
            DigitalSignatureText = "A. Hayes, Chief Systems Officer",
            IsActive = true
        };

        var radVance = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "dr.elena.vance@medivision.ai",
            NormalizedEmail = "DR.ELENA.VANCE@MEDIVISION.AI",
            PasswordHash = Hash("Radiology@2026!"),
            FullName = "Dr. Elena Vance, MD, FACR",
            MedicalLicenseNumber = "RAD-NY-849204",
            Role = UserRole.Radiologist,
            Department = "Thoracic Imaging Division",
            DigitalSignatureText = "Elena Vance, MD, Board-Certified Thoracic Radiologist",
            IsActive = true
        };

        var radChen = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Email = "dr.marcus.chen@medivision.ai",
            NormalizedEmail = "DR.MARCUS.CHEN@MEDIVISION.AI",
            PasswordHash = Hash("Radiology@2026!"),
            FullName = "Dr. Marcus Chen, MD",
            MedicalLicenseNumber = "RAD-CA-551982",
            Role = UserRole.Radiologist,
            Department = "Cardiothoracic Radiology Section",
            DigitalSignatureText = "Marcus Chen, MD, Clinical Radiologist",
            IsActive = true
        };

        var researcher = new User
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Email = "researcher.sarah@medivision.ai",
            NormalizedEmail = "RESEARCHER.SARAH@MEDIVISION.AI",
            PasswordHash = Hash("Research@2026!"),
            FullName = "Sarah Jenkins, M.Sc.",
            Role = UserRole.Researcher,
            Department = "Computational Imaging AI Lab",
            DigitalSignatureText = "S. Jenkins, Lead AI Research Scientist",
            IsActive = true
        };

        context.Users.AddRange(adminUser, radVance, radChen, researcher);

        // 3. AI Model Versions
        var denseNetModel = new AIModelVersion
        {
            Id = Guid.Parse("a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"),
            ModelIdentifier = "chex-densenet121-v2.1",
            DisplayName = "DenseNet-121 Multi-Label Chest Classifier",
            Architecture = "DenseNet121",
            Version = "2.1.0",
            ParametersCount = 7037504,
            TrainingDataset = "NIH ChestX-ray14 + CheXpert Research Cohort",
            AurocScore = 0.892,
            AuprcScore = 0.814,
            F1Score = 0.825,
            PrecisionScore = 0.841,
            RecallScore = 0.810,
            IsActive = true,
            IsDefault = true
        };

        var effNetModel = new AIModelVersion
        {
            Id = Guid.Parse("b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"),
            ModelIdentifier = "chex-efficientnet-b4-v1.4",
            DisplayName = "EfficientNet-B4 High-Resolution Radiography Net",
            Architecture = "EfficientNet-B4",
            Version = "1.4.0",
            ParametersCount = 19341616,
            TrainingDataset = "MIMIC-CXR + NIH ChestX-ray14",
            AurocScore = 0.908,
            AuprcScore = 0.842,
            F1Score = 0.851,
            PrecisionScore = 0.864,
            RecallScore = 0.838,
            IsActive = true,
            IsDefault = false
        };

        var resNetModel = new AIModelVersion
        {
            Id = Guid.Parse("c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3"),
            ModelIdentifier = "chex-resnet50-v3.0",
            DisplayName = "ResNet-50 Deep Residual Radiograph Detector",
            Architecture = "ResNet50",
            Version = "3.0.0",
            ParametersCount = 25557032,
            TrainingDataset = "NIH ChestX-ray14 (Cleaned)",
            AurocScore = 0.884,
            AuprcScore = 0.795,
            F1Score = 0.806,
            PrecisionScore = 0.821,
            RecallScore = 0.792,
            IsActive = true,
            IsDefault = false
        };

        var vitModel = new AIModelVersion
        {
            Id = Guid.Parse("d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4"),
            ModelIdentifier = "chex-vit-b16-v1.0",
            DisplayName = "Vision Transformer ViT-B/16 Self-Attention Network",
            Architecture = "ViT-B/16",
            Version = "1.0.0",
            ParametersCount = 86423560,
            TrainingDataset = "CheXpert + MIMIC-CXR Multi-Center Benchmark",
            AurocScore = 0.914,
            AuprcScore = 0.857,
            F1Score = 0.862,
            PrecisionScore = 0.875,
            RecallScore = 0.850,
            IsActive = true,
            IsDefault = false
        };

        context.AIModelVersions.AddRange(denseNetModel, effNetModel, resNetModel, vitModel);

        // 4. Synthetic Patients
        var pat1 = new Patient
        {
            Id = Guid.Parse("e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1"),
            PatientIdentifier = "MV-PAT-2026-001",
            FirstName = "Arthur",
            LastName = "Pendelton",
            DateOfBirth = new DateTime(1962, 4, 12),
            Gender = "Male",
            BloodGroup = "O+",
            MedicalHistorySummary = "Chronic Obstructive Pulmonary Disease (COPD), 30 pack-year tobacco history, Exertional dyspnea.",
            Allergies = "Penicillin",
            EmergencyContact = "Martha Pendelton (Spouse) +1-555-0192",
            IsSynthetic = true
        };

        var pat2 = new Patient
        {
            Id = Guid.Parse("e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2"),
            PatientIdentifier = "MV-PAT-2026-002",
            FirstName = "Beatrice",
            LastName = "Sterling",
            DateOfBirth = new DateTime(1968, 11, 23),
            Gender = "Female",
            BloodGroup = "A+",
            MedicalHistorySummary = "Persistent productive cough for 5 days, low-grade pyrexia, pleuritic right-sided chest discomfort.",
            Allergies = "Sulfa antibiotics",
            EmergencyContact = "Thomas Sterling (Son) +1-555-0143",
            IsSynthetic = true
        };

        var pat3 = new Patient
        {
            Id = Guid.Parse("e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3"),
            PatientIdentifier = "MV-PAT-2026-003",
            FirstName = "Carlos",
            LastName = "Mendoza",
            DateOfBirth = new DateTime(1955, 8, 4),
            Gender = "Male",
            BloodGroup = "B-",
            MedicalHistorySummary = "Hypertensive cardiovascular disease, bilateral lower extremity edema, paroxysmal nocturnal dyspnea.",
            Allergies = "None known",
            EmergencyContact = "Maria Mendoza (Daughter) +1-555-0188",
            IsSynthetic = true
        };

        var pat4 = new Patient
        {
            Id = Guid.Parse("e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4"),
            PatientIdentifier = "MV-PAT-2026-004",
            FirstName = "Danielle",
            LastName = "Dubois",
            DateOfBirth = new DateTime(1981, 2, 17),
            Gender = "Female",
            BloodGroup = "AB+",
            MedicalHistorySummary = "Sudden onset acute sharp left thoracic pain, tachypnea, ruled out pulmonary embolism.",
            Allergies = "Latex, Iodine contrast",
            EmergencyContact = "Jean Dubois (Brother) +1-555-0177",
            IsSynthetic = true
        };

        var pat5 = new Patient
        {
            Id = Guid.Parse("e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5"),
            PatientIdentifier = "MV-PAT-2026-005",
            FirstName = "Ethan",
            LastName = "Gallagher",
            DateOfBirth = new DateTime(1974, 6, 30),
            Gender = "Male",
            BloodGroup = "O-",
            MedicalHistorySummary = "Post-abdominal surgery day 3, shallow breathing, hypoxemia on room air.",
            Allergies = "Aspirin",
            EmergencyContact = "Claire Gallagher (Wife) +1-555-0165",
            IsSynthetic = true
        };

        var pat6 = new Patient
        {
            Id = Guid.Parse("e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6"),
            PatientIdentifier = "MV-PAT-2026-006",
            FirstName = "Fiona",
            LastName = "Zhang",
            DateOfBirth = new DateTime(1993, 9, 15),
            Gender = "Female",
            BloodGroup = "A-",
            MedicalHistorySummary = "Routine occupational health pre-employment chest radiograph screening. Asymptomatic.",
            Allergies = "None",
            EmergencyContact = "Kevin Zhang (Father) +1-555-0132",
            IsSynthetic = true
        };

        context.Patients.AddRange(pat1, pat2, pat3, pat4, pat5, pat6);

        // 5. Studies
        var study1 = new ImagingStudy
        {
            Id = Guid.Parse("f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1"),
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.101",
            PatientId = pat1.Id,
            AccessionNumber = "ACC-2026-9001",
            Modality = "DX",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-26),
            Description = "Chest Radiograph Posteroanterior (PA) & Lateral",
            ClinicalIndication = "Dyspnea on minimal exertion; rule out acute infiltrates vs effusion.",
            ReferringPhysician = "Dr. Gregory House, MD",
            Status = StudyStatus.InReview,
            Urgency = StudyUrgency.Urgent
        };

        var study2 = new ImagingStudy
        {
            Id = Guid.Parse("f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2"),
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.102",
            PatientId = pat2.Id,
            AccessionNumber = "ACC-2026-9002",
            Modality = "CR",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-18),
            Description = "Chest 1 View Frontal PA",
            ClinicalIndication = "Fever, cough, crackles at right lung base. Suspected community acquired pneumonia.",
            ReferringPhysician = "Dr. Allison Cameron, MD",
            Status = StudyStatus.InReview,
            Urgency = StudyUrgency.Urgent
        };

        var study3 = new ImagingStudy
        {
            Id = Guid.Parse("f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3"),
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.103",
            PatientId = pat3.Id,
            AccessionNumber = "ACC-2026-9003",
            Modality = "DX",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-12),
            Description = "Chest Frontal Portable AP",
            ClinicalIndication = "Congestive heart failure exacerbation, assess cardiomegaly and vascular congestion.",
            ReferringPhysician = "Dr. Eric Foreman, MD",
            Status = StudyStatus.Approved,
            Urgency = StudyUrgency.Routine
        };

        var study4 = new ImagingStudy
        {
            Id = Guid.Parse("f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4"),
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.104",
            PatientId = pat4.Id,
            AccessionNumber = "ACC-2026-9004",
            Modality = "DX",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-6),
            Description = "Chest Radiograph PA & Lateral",
            ClinicalIndication = "Sudden left pleuritic pain, evaluate for pneumothorax.",
            ReferringPhysician = "Dr. Robert Chase, MD",
            Status = StudyStatus.Analyzing,
            Urgency = StudyUrgency.Stat
        };

        var study5 = new ImagingStudy
        {
            Id = Guid.Parse("f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5"),
            PatientId = pat5.Id,
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.105",
            AccessionNumber = "ACC-2026-9005",
            Modality = "CR",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-4),
            Description = "Chest Portable AP Bedside",
            ClinicalIndication = "Post-op day 3 atelectasis evaluation.",
            ReferringPhysician = "Dr. Lisa Cuddy, MD",
            Status = StudyStatus.Uploaded,
            Urgency = StudyUrgency.Routine
        };

        var study6 = new ImagingStudy
        {
            Id = Guid.Parse("f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6"),
            PatientId = pat6.Id,
            StudyInstanceUid = "1.2.840.113619.2.55.3.60468837.20260311.106",
            AccessionNumber = "ACC-2026-9006",
            Modality = "DX",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow.AddHours(-1),
            Description = "Chest PA Standard Projection",
            ClinicalIndication = "Pre-employment baseline screening.",
            ReferringPhysician = "Dr. James Wilson, MD",
            Status = StudyStatus.Approved,
            Urgency = StudyUrgency.Routine
        };

        context.ImagingStudies.AddRange(study1, study2, study3, study4, study5, study6);

        // 6. Image Files
        var img1 = new ImageFile
        {
            Id = Guid.NewGuid(),
            StudyId = study1.Id,
            FileName = "sample_pleural_effusion.png",
            StoragePath = "/uploads/samples/sample_pleural_effusion.png",
            ContentType = "image/png",
            FileSizeBytes = 124580,
            FileSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            Width = 1024,
            Height = 1024,
            BitsAllocated = 16,
            PhotometricInterpretation = "MONOCHROME2",
            WindowCenter = 2048,
            WindowWidth = 4096,
            QualityCheckPassed = true,
            QualityCheckDetailsJson = "{\"snr\": 28.4, \"contrast\": 0.88, \"resolution\": \"1024x1024\", \"artifacts\": \"none\"}"
        };

        var img2 = new ImageFile
        {
            Id = Guid.NewGuid(),
            StudyId = study2.Id,
            FileName = "sample_pneumonia.png",
            StoragePath = "/uploads/samples/sample_pneumonia.png",
            ContentType = "image/png",
            FileSizeBytes = 118400,
            FileSha256 = "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
            Width = 1024,
            Height = 1024,
            BitsAllocated = 16,
            PhotometricInterpretation = "MONOCHROME2",
            WindowCenter = 2048,
            WindowWidth = 4096,
            QualityCheckPassed = true,
            QualityCheckDetailsJson = "{\"snr\": 31.2, \"contrast\": 0.91, \"resolution\": \"1024x1024\", \"artifacts\": \"none\"}"
        };

        var img3 = new ImageFile
        {
            Id = Guid.NewGuid(),
            StudyId = study3.Id,
            FileName = "sample_cardiomegaly.png",
            StoragePath = "/uploads/samples/sample_cardiomegaly.png",
            ContentType = "image/png",
            FileSizeBytes = 132100,
            FileSha256 = "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
            Width = 1024,
            Height = 1024,
            BitsAllocated = 16,
            PhotometricInterpretation = "MONOCHROME2",
            WindowCenter = 2048,
            WindowWidth = 4096,
            QualityCheckPassed = true,
            QualityCheckDetailsJson = "{\"snr\": 29.8, \"contrast\": 0.85, \"resolution\": \"1024x1024\", \"artifacts\": \"none\"}"
        };

        var img6 = new ImageFile
        {
            Id = Guid.NewGuid(),
            StudyId = study6.Id,
            FileName = "sample_normal.png",
            StoragePath = "/uploads/samples/sample_normal.png",
            ContentType = "image/png",
            FileSizeBytes = 109200,
            FileSha256 = "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
            Width = 1024,
            Height = 1024,
            BitsAllocated = 16,
            PhotometricInterpretation = "MONOCHROME2",
            WindowCenter = 2048,
            WindowWidth = 4096,
            QualityCheckPassed = true,
            QualityCheckDetailsJson = "{\"snr\": 34.5, \"contrast\": 0.94, \"resolution\": \"1024x1024\", \"artifacts\": \"none\"}"
        };

        context.ImageFiles.AddRange(img1, img2, img3, img6);

        // 7. AI Analysis Jobs & Results
        var job1 = new AIAnalysisJob
        {
            Id = Guid.NewGuid(),
            StudyId = study1.Id,
            ImageFileId = img1.Id,
            ModelVersionId = denseNetModel.Id,
            Status = JobStatus.Completed,
            ProgressPercentage = 100,
            StartedAt = DateTime.UtcNow.AddHours(-25),
            CompletedAt = DateTime.UtcNow.AddHours(-25).AddSeconds(2),
            ExecutionTimeMs = 840,
            GpuDeviceUsed = "NVIDIA A100-SXM4-40GB / PyTorch CPU Fallback",
            TriggeredByUserId = radVance.Id
        };

        var scores1 = new[]
        {
            new { Condition = "Pleural Effusion", RawScore = 2.45, CalibratedProbability = 0.88, ConfidenceLower95 = 0.82, ConfidenceUpper95 = 0.93, IsPositive = true, SeverityLevel = "High" },
            new { Condition = "Atelectasis", RawScore = 1.10, CalibratedProbability = 0.65, ConfidenceLower95 = 0.58, ConfidenceUpper95 = 0.72, IsPositive = true, SeverityLevel = "Moderate" },
            new { Condition = "Infiltration", RawScore = 0.45, CalibratedProbability = 0.38, ConfidenceLower95 = 0.31, ConfidenceUpper95 = 0.45, IsPositive = false, SeverityLevel = "Low" },
            new { Condition = "Consolidation", RawScore = -0.20, CalibratedProbability = 0.22, ConfidenceLower95 = 0.16, ConfidenceUpper95 = 0.28, IsPositive = false, SeverityLevel = "Low" },
            new { Condition = "Cardiomegaly", RawScore = -0.85, CalibratedProbability = 0.14, ConfidenceLower95 = 0.09, ConfidenceUpper95 = 0.19, IsPositive = false, SeverityLevel = "Low" },
            new { Condition = "Pneumothorax", RawScore = -2.10, CalibratedProbability = 0.04, ConfidenceLower95 = 0.02, ConfidenceUpper95 = 0.07, IsPositive = false, SeverityLevel = "Minimal" },
            new { Condition = "Pneumonia", RawScore = -1.50, CalibratedProbability = 0.08, ConfidenceLower95 = 0.04, ConfidenceUpper95 = 0.12, IsPositive = false, SeverityLevel = "Minimal" },
            new { Condition = "No Finding", RawScore = -2.80, CalibratedProbability = 0.03, ConfidenceLower95 = 0.01, ConfidenceUpper95 = 0.06, IsPositive = false, SeverityLevel = "Minimal" }
        };

        var result1 = new AIResult
        {
            Id = Guid.NewGuid(),
            JobId = job1.Id,
            PrimaryFinding = "Pleural Effusion",
            OverallConfidence = 0.88,
            RiskCategory = RiskCategory.HighSuspicion,
            ClassificationScoresJson = JsonSerializer.Serialize(scores1),
            CalibratedProbabilitiesJson = JsonSerializer.Serialize(scores1),
            FindingsSummary = "DenseNet-121 model attention identified blunting of the right costophrenic sulcus consistent with moderate right pleural effusion (p=0.88, 95% CI: 0.82-0.93), with associated compressive right lower lobe atelectasis.",
            GradCamHeatmapPath = "/heatmaps/sample_effusion_gradcam.png",
            GradCamOverlayPath = "/heatmaps/sample_effusion_overlay.png",
            LungSegmentationMaskPath = "/masks/sample_effusion_mask.png",
            LungSegmentationOverlayPath = "/masks/sample_effusion_seg_overlay.png",
            DiceScore = 0.942,
            IoUMetric = 0.891,
            LeftLungAreaPixels = 184500,
            RightLungAreaPixels = 142100,
            CardiothoracicRatio = 0.48,
            ResearchDisclaimer = "Investigational AI Decision Support. Requires verified radiologist interpretation."
        };

        context.AIAnalysisJobs.Add(job1);
        context.AIResults.Add(result1);

        // 8. Clinical Reports & Reviews
        var report1 = new Report
        {
            Id = Guid.NewGuid(),
            StudyId = study1.Id,
            AIResultId = result1.Id,
            AuthorId = radVance.Id,
            ReportIdentifier = "MV-REP-2026-0001",
            Title = "Radiology Consultation & AI Decision-Support Report",
            ClinicalIndication = "64yo male with progressive exertional dyspnea and chronic tobacco use.",
            Technique = "Single frontal PA view acquired at 120 kVp, 4.5 mAs.",
            ComparisonStudy = "None available for comparison.",
            Findings = "LUNGS: Lung volumes are moderately hyperinflated. Blunting of the right costophrenic angle is present, with meniscus sign indicative of moderate right pleural fluid layering. Subsegmental linear opacities in the right base are consistent with compressive atelectasis.\n\nHEART & MEDIASTINUM: Cardiac silhouette is within normal size limits (cardiothoracic ratio 0.48). Mediastinal and hilar contours are unremarkable.\n\nBONES & SOFT TISSUES: Mild degenerative changes of the thoracic spine. No acute rib fractures or osseous lesions identified.",
            Impression = "1. Moderate right pleural effusion with associated compressive right basilar atelectasis.\n2. Chronic lung disease changes consistent with patient's reported COPD history.\n3. Correlate clinically. Diagnostic thoracentesis or follow-up imaging post-diuresis may be considered per clinical judgement.",
            Recommendations = "Recommend correlation with clinical presentation and consideration of bedside thoracic ultrasound to evaluate for pleural fluid septations.",
            CriticalFindingAlert = false,
            Status = ReportStatus.Draft
        };

        context.Reports.Add(report1);

        // 9. Initial Audit Trail
        context.AuditLogs.AddRange(
            new AuditLog { UserEmail = "system@medivision.ai", Action = "SYSTEM_INITIALIZE", Resource = "DATABASE", Details = "MediVision AI enterprise seed dataset successfully synchronized.", Outcome = "Success", Timestamp = DateTime.UtcNow.AddDays(-1) },
            new AuditLog { UserEmail = "dr.elena.vance@medivision.ai", Action = "LOGIN", Resource = "AUTH", Details = "Radiologist authenticated successfully via JWT bearer.", IpAddress = "10.0.1.45", Outcome = "Success", Timestamp = DateTime.UtcNow.AddHours(-25) },
            new AuditLog { UserEmail = "dr.elena.vance@medivision.ai", Action = "RUN_AI_INFERENCE", Resource = "STUDY", ResourceId = study1.AccessionNumber, Details = "DenseNet-121 multi-label inference executed with Grad-CAM and U-Net lung segmentation.", IpAddress = "10.0.1.45", Outcome = "Success", Timestamp = DateTime.UtcNow.AddHours(-25) },
            new AuditLog { UserEmail = "dr.elena.vance@medivision.ai", Action = "CREATE_REPORT_DRAFT", Resource = "REPORT", ResourceId = report1.ReportIdentifier, Details = "Draft radiologist report initiated incorporating AI findings and Grad-CAM spatial review.", IpAddress = "10.0.1.45", Outcome = "Success", Timestamp = DateTime.UtcNow.AddHours(-24) }
        );

        // 10. System Settings
        context.SystemSettings.AddRange(
            new SystemSetting { Key = "AiInferenceThreshold", Value = "0.50", Description = "Default positive classification cutoff probability", Category = "AI" },
            new SystemSetting { Key = "DefaultModelArchitecture", Value = "DenseNet121", Description = "Primary deep learning architecture for initial chest X-ray screening", Category = "AI" },
            new SystemSetting { Key = "EnableGradCamOnUpload", Value = "true", Description = "Automatically generate attention heatmaps during inference jobs", Category = "AI" },
            new SystemSetting { Key = "EnableUNetSegmentation", Value = "true", Description = "Execute bilateral lung field boundary segmentation", Category = "AI" },
            new SystemSetting { Key = "PacsDcmtkHost", Value = "pacs.internal.hospital.org", Description = "Internal hospital PACS DICOM storage host", Category = "PACS" },
            new SystemSetting { Key = "PacsDcmtkPort", Value = "11112", Description = "Internal hospital PACS port", Category = "PACS" },
            new SystemSetting { Key = "ComplianceMode", Value = "ResearchStudySupport", Description = "Platform operational posture (Investigational Decision Support)", Category = "Compliance" }
        );

        await context.SaveChangesAsync();
    }
}

