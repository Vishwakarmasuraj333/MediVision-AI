using MediVision.Domain.Enums;

namespace MediVision.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? MedicalLicenseNumber { get; set; }
    public string? Department { get; set; }
    public UserRole Role { get; set; } = UserRole.Radiologist;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? DigitalSignatureText { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<Report> AuthoredReports { get; set; } = new List<Report>();
    public ICollection<RadiologistReview> Reviews { get; set; } = new List<RadiologistReview>();
    public ICollection<AIAnalysisJob> TriggeredJobs { get; set; } = new List<AIAnalysisJob>();
}

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Patient
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PatientIdentifier { get; set; } = string.Empty; // E.g. MV-PAT-2026-001
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? BloodGroup { get; set; }
    public string? MedicalHistorySummary { get; set; }
    public string? Allergies { get; set; }
    public string? EmergencyContact { get; set; }
    public bool IsSynthetic { get; set; } = true; // Synthetic Research Proxy
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<ImagingStudy> Studies { get; set; } = new List<ImagingStudy>();
}

public class ImagingStudy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StudyInstanceUid { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string AccessionNumber { get; set; } = string.Empty;
    public string Modality { get; set; } = "DX"; // DX, CR, CT
    public string BodyPart { get; set; } = "CHEST";
    public DateTime StudyDate { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public string? ClinicalIndication { get; set; }
    public string? ReferringPhysician { get; set; }
    public string PerformingFacility { get; set; } = "MediVision Academic Health Center";
    public StudyStatus Status { get; set; } = StudyStatus.Uploaded;
    public StudyUrgency Urgency { get; set; } = StudyUrgency.Routine;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<ImageFile> Images { get; set; } = new List<ImageFile>();
    public ICollection<AIAnalysisJob> AnalysisJobs { get; set; } = new List<AIAnalysisJob>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
}

public class ImageFile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudyId { get; set; }
    public ImagingStudy? Study { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/jpeg";
    public long FileSizeBytes { get; set; }
    public string FileSha256 { get; set; } = string.Empty;
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? BitsAllocated { get; set; }
    public string? PhotometricInterpretation { get; set; }
    public double? WindowCenter { get; set; }
    public double? WindowWidth { get; set; }
    public bool QualityCheckPassed { get; set; } = true;
    public string? QualityCheckDetailsJson { get; set; }
    public string? DicomMetadataJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AIModelVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ModelIdentifier { get; set; } = string.Empty; // chex-densenet121-v2.1
    public string DisplayName { get; set; } = string.Empty;
    public string Architecture { get; set; } = string.Empty; // DenseNet121, EfficientNet-B4, ResNet50, ViT-B/16
    public string Version { get; set; } = "1.0.0";
    public long ParametersCount { get; set; }
    public string TrainingDataset { get; set; } = "NIH ChestX-ray14 / CheXpert";
    public double AurocScore { get; set; }
    public double AuprcScore { get; set; }
    public double F1Score { get; set; }
    public double PrecisionScore { get; set; }
    public double RecallScore { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public string? WeightsPath { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime DeployedAt { get; set; } = DateTime.UtcNow;
}

public class AIAnalysisJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudyId { get; set; }
    public ImagingStudy? Study { get; set; }
    public Guid ImageFileId { get; set; }
    public ImageFile? ImageFile { get; set; }
    public Guid ModelVersionId { get; set; }
    public AIModelVersion? ModelVersion { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Queued;
    public int ProgressPercentage { get; set; } = 0;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? ExecutionTimeMs { get; set; }
    public string? GpuDeviceUsed { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid? TriggeredByUserId { get; set; }
    public User? TriggeredByUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AIResult? Result { get; set; }
}

public class AIResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public AIAnalysisJob? Job { get; set; }
    public string PrimaryFinding { get; set; } = "No Finding";
    public double OverallConfidence { get; set; } = 0.95;
    public RiskCategory RiskCategory { get; set; } = RiskCategory.Normal;
    public string ClassificationScoresJson { get; set; } = "{}";
    public string CalibratedProbabilitiesJson { get; set; } = "{}";
    public string FindingsSummary { get; set; } = string.Empty;
    public string? GradCamHeatmapPath { get; set; }
    public string? GradCamOverlayPath { get; set; }
    public string? LungSegmentationMaskPath { get; set; }
    public string? LungSegmentationOverlayPath { get; set; }
    public double? DiceScore { get; set; }
    public double? IoUMetric { get; set; }
    public int? LeftLungAreaPixels { get; set; }
    public int? RightLungAreaPixels { get; set; }
    public double? CardiothoracicRatio { get; set; }
    public string ResearchDisclaimer { get; set; } = "Investigational AI Decision Support. Requires verified radiologist interpretation.";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Report
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudyId { get; set; }
    public ImagingStudy? Study { get; set; }
    public Guid? AIResultId { get; set; }
    public AIResult? AIResult { get; set; }
    public Guid AuthorId { get; set; }
    public User? Author { get; set; }
    public string ReportIdentifier { get; set; } = string.Empty; // MV-REP-2026-001
    public string Title { get; set; } = "Radiology Consultation & AI Decision-Support Report";
    public string? ClinicalIndication { get; set; }
    public string? Technique { get; set; }
    public string? ComparisonStudy { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string Impression { get; set; } = string.Empty;
    public string? Recommendations { get; set; }
    public bool CriticalFindingAlert { get; set; } = false;
    public ReportStatus Status { get; set; } = ReportStatus.Draft;
    public string? GeneratedPdfPath { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<RadiologistReview> Reviews { get; set; } = new List<RadiologistReview>();
}

public class RadiologistReview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReportId { get; set; }
    public Report? Report { get; set; }
    public Guid RadiologistId { get; set; }
    public User? Radiologist { get; set; }
    public ReviewDecision Decision { get; set; } = ReviewDecision.Approved;
    public string? ReviewerNotes { get; set; }
    public int AgreementScore { get; set; } = 5; // 1-5 scale
    public string? AiSuggestionsAccepted { get; set; }
    public string? AiSuggestionsRejected { get; set; }
    public string DigitalSignatureHash { get; set; } = string.Empty;
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // LOGIN, VIEW_STUDY, UPLOAD_DICOM, RUN_AI_INFERENCE, APPROVE_REPORT, REJECT_REPORT, EXPORT_PDF
    public string Resource { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string Outcome { get; set; } = "Success"; // Success, Failure, Unauthorized
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class SystemSetting
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

