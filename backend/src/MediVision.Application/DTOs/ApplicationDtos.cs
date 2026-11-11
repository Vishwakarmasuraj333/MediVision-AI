using MediVision.Domain.Enums;

namespace MediVision.Application.DTOs;

// --- AUTH DTOs ---
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string RefreshToken, UserDto User);
public record ForgotPasswordRequest(string Email);
public record UserDto(Guid Id, string Email, string FullName, string Role, string? Department, string? MedicalLicenseNumber, string? DigitalSignatureText, bool IsActive, DateTime? LastLoginAt);
public record CreateUserRequest(string Email, string Password, string FullName, string Role, string? Department, string? MedicalLicenseNumber);
public record UpdateUserRequest(string FullName, string Role, string? Department, string? MedicalLicenseNumber, bool IsActive);

// --- PATIENT DTOs ---
public record PatientDto(
    Guid Id,
    string PatientIdentifier,
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    int Age,
    string Gender,
    string? BloodGroup,
    string? MedicalHistorySummary,
    string? Allergies,
    string? EmergencyContact,
    bool IsSynthetic,
    int TotalStudies,
    DateTime CreatedAt
);

public record CreatePatientRequest(
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string Gender,
    string? BloodGroup,
    string? MedicalHistorySummary,
    string? Allergies,
    string? EmergencyContact
);

public record UpdatePatientRequest(
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string Gender,
    string? BloodGroup,
    string? MedicalHistorySummary,
    string? Allergies,
    string? EmergencyContact
);

// --- STUDY DTOs ---
public record StudyDto(
    Guid Id,
    string StudyInstanceUid,
    Guid PatientId,
    string PatientIdentifier,
    string PatientName,
    int PatientAge,
    string PatientGender,
    string AccessionNumber,
    string Modality,
    string BodyPart,
    DateTime StudyDate,
    string? Description,
    string? ClinicalIndication,
    string? ReferringPhysician,
    string PerformingFacility,
    string Status,
    string Urgency,
    List<ImageFileDto> Images,
    AIAnalysisJobDto? LatestJob,
    ReportDto? Report,
    DateTime CreatedAt
);

public record CreateStudyRequest(
    Guid PatientId,
    string AccessionNumber,
    string Modality,
    string BodyPart,
    string? Description,
    string? ClinicalIndication,
    string? ReferringPhysician,
    string Urgency
);

public record ImageFileDto(
    Guid Id,
    Guid StudyId,
    string FileName,
    string StorageUrl,
    string ContentType,
    long FileSizeBytes,
    int? Width,
    int? Height,
    bool QualityCheckPassed,
    string? QualityCheckDetailsJson,
    string? DicomMetadataJson,
    DateTime CreatedAt
);

// --- AI DTOs ---
public record AIModelVersionDto(
    Guid Id,
    string ModelIdentifier,
    string DisplayName,
    string Architecture,
    string Version,
    long ParametersCount,
    string TrainingDataset,
    double AurocScore,
    double AuprcScore,
    double F1Score,
    double PrecisionScore,
    double RecallScore,
    bool IsActive,
    bool IsDefault
);

public record RunAnalysisRequest(
    Guid StudyId,
    Guid? ImageFileId,
    Guid? ModelVersionId,
    bool EnableSegmentation = true,
    bool EnableGradCam = true
);

public record AIAnalysisJobDto(
    Guid Id,
    Guid StudyId,
    Guid ImageFileId,
    Guid ModelVersionId,
    string ModelName,
    string ModelArchitecture,
    string Status,
    int ProgressPercentage,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    int? ExecutionTimeMs,
    string? GpuDeviceUsed,
    string? ErrorMessage,
    AIResultDto? Result,
    DateTime CreatedAt
);

public record FindingScore(
    string Condition,
    double RawScore,
    double CalibratedProbability,
    double ConfidenceLower95,
    double ConfidenceUpper95,
    bool IsPositive,
    string SeverityLevel
);

public record AIResultDto(
    Guid Id,
    Guid JobId,
    string PrimaryFinding,
    double OverallConfidence,
    string RiskCategory,
    List<FindingScore> Classifications,
    string FindingsSummary,
    string? GradCamHeatmapUrl,
    string? GradCamOverlayUrl,
    string? LungSegmentationMaskUrl,
    string? LungSegmentationOverlayUrl,
    double? DiceScore,
    double? IoUMetric,
    int? LeftLungAreaPixels,
    int? RightLungAreaPixels,
    double? CardiothoracicRatio,
    string ResearchDisclaimer,
    DateTime CreatedAt
);

// --- REPORT DTOs ---
public record ReportDto(
    Guid Id,
    Guid StudyId,
    Guid? AIResultId,
    Guid AuthorId,
    string AuthorName,
    string ReportIdentifier,
    string Title,
    string? ClinicalIndication,
    string? Technique,
    string? ComparisonStudy,
    string Findings,
    string Impression,
    string? Recommendations,
    bool CriticalFindingAlert,
    string Status,
    string? GeneratedPdfPath,
    DateTime? ApprovedAt,
    List<RadiologistReviewDto> Reviews,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateReportRequest(
    Guid StudyId,
    Guid? AIResultId,
    string Title,
    string? ClinicalIndication,
    string? Technique,
    string? ComparisonStudy,
    string Findings,
    string Impression,
    string? Recommendations,
    bool CriticalFindingAlert
);

public record UpdateReportRequest(
    string Findings,
    string Impression,
    string? Recommendations,
    bool CriticalFindingAlert
);

public record RadiologistReviewDto(
    Guid Id,
    Guid ReportId,
    Guid RadiologistId,
    string RadiologistName,
    string Decision,
    string? ReviewerNotes,
    int AgreementScore,
    string? AiSuggestionsAccepted,
    string? AiSuggestionsRejected,
    string DigitalSignatureHash,
    DateTime ReviewedAt
);

public record SubmitReviewRequest(
    Guid ReportId,
    string Decision, // Approved, Modified, Rejected
    string? ReviewerNotes,
    int AgreementScore,
    string? AiSuggestionsAccepted,
    string? AiSuggestionsRejected,
    string? UpdatedFindings,
    string? UpdatedImpression,
    string? UpdatedRecommendations
);

public record ApproveReportRequest(
    string? Notes = null,
    int? AgreementScore = 5,
    string? AiSuggestionsAccepted = null,
    string? UpdatedFindings = null,
    string? UpdatedImpression = null,
    string? UpdatedRecommendations = null
);

// --- ANALYTICS DTOs ---
public record AnalyticsDashboardDto(
    int TotalPatients,
    int TotalStudies,
    int CompletedAiAnalyses,
    int PendingReviews,
    int ApprovedReports,
    int FailedJobs,
    double AverageLatencyMs,
    List<ModalityDistributionDto> ModalityDistribution,
    List<FindingPrevalenceDto> AbnormalityPrevalence,
    List<WeeklyTrendDto> WeeklyTrends,
    List<LatencyMetricDto> LatencyByModel,
    List<AuditLogDto> RecentActivities
);

public record ModalityDistributionDto(string Modality, int Count, double Percentage);
public record FindingPrevalenceDto(string Finding, int Count, double AverageConfidence);
public record WeeklyTrendDto(string Week, int StudiesUploaded, int AiAnalyses, int ReportsApproved);
public record LatencyMetricDto(string ModelName, double P50Ms, double P95Ms, double P99Ms);

// --- AUDIT DTOs ---
public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string UserEmail,
    string Action,
    string Resource,
    string? ResourceId,
    string? Details,
    string? IpAddress,
    string? UserAgent,
    string Outcome,
    DateTime Timestamp
);

