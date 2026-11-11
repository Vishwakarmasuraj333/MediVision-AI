using System.Text.Json;
using MediVision.Application.DTOs;
using MediVision.Application.Interfaces;
using MediVision.Domain.Entities;
using MediVision.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediVision.Application.Services;

public class AuthService
{
    private readonly IMediVisionDbContext _context;
    private readonly IJwtTokenService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IMediVisionDbContext context, IJwtTokenService jwtService, IPasswordHasher passwordHasher)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent)
    {
        var normalizedEmail = request.Email.ToUpperInvariant().Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail && !u.IsDeleted);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _context.AuditLogs.Add(new AuditLog
            {
                UserEmail = request.Email,
                Action = "LOGIN_FAILED",
                Resource = "AUTH",
                Details = "Invalid credentials supplied.",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Outcome = "Unauthorized"
            });
            await _context.SaveChangesAsync();
            return null;
        }

        user.LastLoginAt = DateTime.UtcNow;
        var token = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = user.Id,
            UserEmail = user.Email,
            Action = "LOGIN_SUCCESS",
            Resource = "AUTH",
            Details = $"User logged in with role {user.Role}.",
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Outcome = "Success"
        });

        await _context.SaveChangesAsync();

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString(),
            user.Department,
            user.MedicalLicenseNumber,
            user.DigitalSignatureText,
            user.IsActive,
            user.LastLoginAt
        );

        return new LoginResponse(token, refreshToken, userDto);
    }
}

public class PatientService
{
    private readonly IMediVisionDbContext _context;

    public PatientService(IMediVisionDbContext context)
    {
        _context = context;
    }

    public async Task<List<PatientDto>> GetPatientsAsync(string? search = null)
    {
        var query = _context.Patients
            .Include(p => p.Studies)
            .Where(p => !p.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.PatientIdentifier.ToLower().Contains(term) ||
                                     p.FirstName.ToLower().Contains(term) ||
                                     p.LastName.ToLower().Contains(term));
        }

        var patients = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

        return patients.Select(p => new PatientDto(
            p.Id,
            p.PatientIdentifier,
            p.FirstName,
            p.LastName,
            p.DateOfBirth,
            DateTime.UtcNow.Year - p.DateOfBirth.Year,
            p.Gender,
            p.BloodGroup,
            p.MedicalHistorySummary,
            p.Allergies,
            p.EmergencyContact,
            p.IsSynthetic,
            p.Studies.Count,
            p.CreatedAt
        )).ToList();
    }

    public async Task<PatientDto?> GetPatientByIdAsync(Guid id)
    {
        var p = await _context.Patients
            .Include(p => p.Studies)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (p == null) return null;

        return new PatientDto(
            p.Id,
            p.PatientIdentifier,
            p.FirstName,
            p.LastName,
            p.DateOfBirth,
            DateTime.UtcNow.Year - p.DateOfBirth.Year,
            p.Gender,
            p.BloodGroup,
            p.MedicalHistorySummary,
            p.Allergies,
            p.EmergencyContact,
            p.IsSynthetic,
            p.Studies.Count,
            p.CreatedAt
        );
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientRequest request)
    {
        var count = await _context.Patients.CountAsync();
        var identifier = $"MV-PAT-2026-{(count + 1):D4}";

        var patient = new Patient
        {
            PatientIdentifier = identifier,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            BloodGroup = request.BloodGroup,
            MedicalHistorySummary = request.MedicalHistorySummary,
            Allergies = request.Allergies,
            EmergencyContact = request.EmergencyContact,
            IsSynthetic = true
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return new PatientDto(
            patient.Id,
            patient.PatientIdentifier,
            patient.FirstName,
            patient.LastName,
            patient.DateOfBirth,
            DateTime.UtcNow.Year - patient.DateOfBirth.Year,
            patient.Gender,
            patient.BloodGroup,
            patient.MedicalHistorySummary,
            patient.Allergies,
            patient.EmergencyContact,
            patient.IsSynthetic,
            0,
            patient.CreatedAt
        );
    }
}

public class StudyService
{
    private readonly IMediVisionDbContext _context;

    public StudyService(IMediVisionDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudyDto>> GetStudiesAsync(string? status = null, string? urgency = null)
    {
        var query = _context.ImagingStudies
            .Include(s => s.Patient)
            .Include(s => s.Images)
            .Include(s => s.AnalysisJobs)
                .ThenInclude(j => j.ModelVersion)
            .Include(s => s.AnalysisJobs)
                .ThenInclude(j => j.Result)
            .Include(s => s.Reports)
            .Where(s => !s.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<StudyStatus>(status, true, out var st))
        {
            query = query.Where(s => s.Status == st);
        }

        if (!string.IsNullOrWhiteSpace(urgency) && Enum.TryParse<StudyUrgency>(urgency, true, out var urg))
        {
            query = query.Where(s => s.Urgency == urg);
        }

        var list = await query.OrderByDescending(s => s.StudyDate).ToListAsync();
        return list.Select(MapToStudyDto).ToList();
    }

    public async Task<StudyDto?> GetStudyByIdAsync(Guid id)
    {
        var study = await _context.ImagingStudies
            .Include(s => s.Patient)
            .Include(s => s.Images)
            .Include(s => s.AnalysisJobs)
                .ThenInclude(j => j.ModelVersion)
            .Include(s => s.AnalysisJobs)
                .ThenInclude(j => j.Result)
            .Include(s => s.Reports)
                .ThenInclude(r => r.Author)
            .Include(s => s.Reports)
                .ThenInclude(r => r.Reviews)
                    .ThenInclude(rv => rv.Radiologist)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

        return study == null ? null : MapToStudyDto(study);
    }

    public static StudyDto MapToStudyDto(ImagingStudy s)
    {
        var latestJob = s.AnalysisJobs.OrderByDescending(j => j.CreatedAt).FirstOrDefault();
        var report = s.Reports.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

        return new StudyDto(
            s.Id,
            s.StudyInstanceUid,
            s.PatientId,
            s.Patient?.PatientIdentifier ?? "UNKNOWN",
            $"{s.Patient?.FirstName} {s.Patient?.LastName}".Trim(),
            s.Patient != null ? DateTime.UtcNow.Year - s.Patient.DateOfBirth.Year : 0,
            s.Patient?.Gender ?? "Unknown",
            s.AccessionNumber,
            s.Modality,
            s.BodyPart,
            s.StudyDate,
            s.Description,
            s.ClinicalIndication,
            s.ReferringPhysician,
            s.PerformingFacility,
            s.Status.ToString(),
            s.Urgency.ToString(),
            s.Images.Select(img => new ImageFileDto(
                img.Id,
                img.StudyId,
                img.FileName,
                img.StoragePath,
                img.ContentType,
                img.FileSizeBytes,
                img.Width,
                img.Height,
                img.QualityCheckPassed,
                img.QualityCheckDetailsJson,
                img.DicomMetadataJson,
                img.CreatedAt
            )).ToList(),
            latestJob != null ? MapJobToDto(latestJob) : null,
            report != null ? MapReportToDto(report) : null,
            s.CreatedAt
        );
    }

    public static AIAnalysisJobDto MapJobToDto(AIAnalysisJob j)
    {
        return new AIAnalysisJobDto(
            j.Id,
            j.StudyId,
            j.ImageFileId,
            j.ModelVersionId,
            j.ModelVersion?.DisplayName ?? "Chest Classifier",
            j.ModelVersion?.Architecture ?? "DenseNet121",
            j.Status.ToString(),
            j.ProgressPercentage,
            j.StartedAt,
            j.CompletedAt,
            j.ExecutionTimeMs,
            j.GpuDeviceUsed,
            j.ErrorMessage,
            j.Result != null ? MapResultToDto(j.Result) : null,
            j.CreatedAt
        );
    }

    public static AIResultDto MapResultToDto(AIResult r)
    {
        List<FindingScore> scores = new();
        try
        {
            if (!string.IsNullOrEmpty(r.CalibratedProbabilitiesJson))
            {
                scores = JsonSerializer.Deserialize<List<FindingScore>>(r.CalibratedProbabilitiesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
            }
        }
        catch { }

        return new AIResultDto(
            r.Id,
            r.JobId,
            r.PrimaryFinding,
            r.OverallConfidence,
            r.RiskCategory.ToString(),
            scores,
            r.FindingsSummary,
            r.GradCamHeatmapPath,
            r.GradCamOverlayPath,
            r.LungSegmentationMaskPath,
            r.LungSegmentationOverlayPath,
            r.DiceScore,
            r.IoUMetric,
            r.LeftLungAreaPixels,
            r.RightLungAreaPixels,
            r.CardiothoracicRatio,
            r.ResearchDisclaimer,
            r.CreatedAt
        );
    }

    public static ReportDto MapReportToDto(Report r)
    {
        return new ReportDto(
            r.Id,
            r.StudyId,
            r.AIResultId,
            r.AuthorId,
            r.Author?.FullName ?? "Radiologist",
            r.ReportIdentifier,
            r.Title,
            r.ClinicalIndication,
            r.Technique,
            r.ComparisonStudy,
            r.Findings,
            r.Impression,
            r.Recommendations,
            r.CriticalFindingAlert,
            r.Status.ToString(),
            r.GeneratedPdfPath,
            r.ApprovedAt,
            r.Reviews.Select(rv => new RadiologistReviewDto(
                rv.Id,
                rv.ReportId,
                rv.RadiologistId,
                rv.Radiologist?.FullName ?? "Staff Radiologist",
                rv.Decision.ToString(),
                rv.ReviewerNotes,
                rv.AgreementScore,
                rv.AiSuggestionsAccepted,
                rv.AiSuggestionsRejected,
                rv.DigitalSignatureHash,
                rv.ReviewedAt
            )).ToList(),
            r.CreatedAt,
            r.UpdatedAt
        );
    }
}

public class AnalysisService
{
    private readonly IMediVisionDbContext _context;
    private readonly IAiServiceClient _aiClient;
    private readonly IFileStorageService _storage;

    public AnalysisService(IMediVisionDbContext context, IAiServiceClient aiClient, IFileStorageService storage)
    {
        _context = context;
        _aiClient = aiClient;
        _storage = storage;
    }

    public async Task<AIAnalysisJobDto> TriggerAnalysisAsync(RunAnalysisRequest req, Guid? userId)
    {
        var study = await _context.ImagingStudies
            .Include(s => s.Images)
            .FirstOrDefaultAsync(s => s.Id == req.StudyId);

        if (study == null) throw new KeyNotFoundException("Study not found.");

        var image = req.ImageFileId.HasValue
            ? study.Images.FirstOrDefault(i => i.Id == req.ImageFileId.Value)
            : study.Images.FirstOrDefault();

        if (image == null) throw new InvalidOperationException("Study has no images for analysis.");

        var modelVersion = req.ModelVersionId.HasValue
            ? await _context.AIModelVersions.FindAsync(req.ModelVersionId.Value)
            : await _context.AIModelVersions.FirstOrDefaultAsync(m => m.IsDefault && m.IsActive);

        modelVersion ??= await _context.AIModelVersions.FirstAsync();

        var job = new AIAnalysisJob
        {
            StudyId = study.Id,
            ImageFileId = image.Id,
            ModelVersionId = modelVersion.Id,
            Status = JobStatus.Processing,
            ProgressPercentage = 20,
            StartedAt = DateTime.UtcNow,
            TriggeredByUserId = userId
        };

        _context.AIAnalysisJobs.Add(job);
        study.Status = StudyStatus.Analyzing;
        await _context.SaveChangesAsync();

        // Perform analysis through AI Client
        var physicalPath = _storage.GetPhysicalPath(image.StoragePath);
        var aiResult = await _aiClient.PredictAndAnalyzeAsync(
            physicalPath,
            modelVersion.Architecture,
            req.EnableGradCam,
            req.EnableSegmentation
        );

        job.Status = JobStatus.Completed;
        job.ProgressPercentage = 100;
        job.CompletedAt = DateTime.UtcNow;
        job.ExecutionTimeMs = 740;
        job.GpuDeviceUsed = "PyTorch Dedicated Inference Engine";

        var resultEntity = new AIResult
        {
            JobId = job.Id,
            PrimaryFinding = aiResult.PrimaryFinding,
            OverallConfidence = aiResult.OverallConfidence,
            RiskCategory = Enum.TryParse<RiskCategory>(aiResult.RiskCategory, out var rc) ? rc : RiskCategory.Normal,
            ClassificationScoresJson = JsonSerializer.Serialize(aiResult.Classifications),
            CalibratedProbabilitiesJson = JsonSerializer.Serialize(aiResult.Classifications),
            FindingsSummary = aiResult.FindingsSummary,
            GradCamHeatmapPath = aiResult.GradCamHeatmapUrl,
            GradCamOverlayPath = aiResult.GradCamOverlayUrl,
            LungSegmentationMaskPath = aiResult.LungSegmentationMaskUrl,
            LungSegmentationOverlayPath = aiResult.LungSegmentationOverlayUrl,
            DiceScore = aiResult.DiceScore,
            IoUMetric = aiResult.IoUMetric,
            LeftLungAreaPixels = aiResult.LeftLungAreaPixels,
            RightLungAreaPixels = aiResult.RightLungAreaPixels,
            CardiothoracicRatio = aiResult.CardiothoracicRatio,
            ResearchDisclaimer = aiResult.ResearchDisclaimer
        };

        _context.AIResults.Add(resultEntity);
        study.Status = StudyStatus.InReview;
        await _context.SaveChangesAsync();

        job.Result = resultEntity;
        job.ModelVersion = modelVersion;
        return StudyService.MapJobToDto(job);
    }
}

public class ReportService
{
    private readonly IMediVisionDbContext _context;

    public ReportService(IMediVisionDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReportDto>> GetReportsAsync(string? status = null)
    {
        var query = _context.Reports
            .Include(r => r.Study!)
                .ThenInclude(s => s.Patient)
            .Include(r => r.Author)
            .Include(r => r.Reviews)
                .ThenInclude(rv => rv.Radiologist)
            .Where(r => !r.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ReportStatus>(status, true, out var st))
        {
            query = query.Where(r => r.Status == st);
        }

        var reports = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return reports.Select(StudyService.MapReportToDto).ToList();
    }

    public async Task<ReportDto> CreateReportAsync(CreateReportRequest req, Guid authorId)
    {
        var count = await _context.Reports.CountAsync();
        var identifier = $"MV-REP-2026-{(count + 1):D4}";

        var report = new Report
        {
            StudyId = req.StudyId,
            AIResultId = req.AIResultId,
            AuthorId = authorId,
            ReportIdentifier = identifier,
            Title = req.Title,
            ClinicalIndication = req.ClinicalIndication,
            Technique = req.Technique,
            ComparisonStudy = req.ComparisonStudy,
            Findings = req.Findings,
            Impression = req.Impression,
            Recommendations = req.Recommendations,
            CriticalFindingAlert = req.CriticalFindingAlert,
            Status = ReportStatus.Draft
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        return StudyService.MapReportToDto(report);
    }

    public async Task<ReportDto> SubmitReviewAsync(SubmitReviewRequest req, Guid radiologistId, string signatureText)
    {
        var report = await _context.Reports
            .Include(r => r.Study)
            .Include(r => r.Author)
            .Include(r => r.Reviews)
            .FirstOrDefaultAsync(r => r.Id == req.ReportId);

        if (report == null) throw new KeyNotFoundException("Report not found.");

        if (Enum.TryParse<ReviewDecision>(req.Decision, true, out var decision))
        {
            if (decision == ReviewDecision.Approved)
            {
                report.Status = ReportStatus.Approved;
                report.ApprovedAt = DateTime.UtcNow;
                if (report.Study != null) report.Study.Status = StudyStatus.Approved;
            }
            else if (decision == ReviewDecision.Rejected)
            {
                report.Status = ReportStatus.Rejected;
                if (report.Study != null) report.Study.Status = StudyStatus.Rejected;
            }
            else
            {
                report.Status = ReportStatus.Draft;
            }
        }

        if (!string.IsNullOrWhiteSpace(req.UpdatedFindings)) report.Findings = req.UpdatedFindings;
        if (!string.IsNullOrWhiteSpace(req.UpdatedImpression)) report.Impression = req.UpdatedImpression;
        if (!string.IsNullOrWhiteSpace(req.UpdatedRecommendations)) report.Recommendations = req.UpdatedRecommendations;

        var review = new RadiologistReview
        {
            ReportId = report.Id,
            RadiologistId = radiologistId,
            Decision = decision,
            ReviewerNotes = req.ReviewerNotes,
            AgreementScore = req.AgreementScore,
            AiSuggestionsAccepted = req.AiSuggestionsAccepted,
            AiSuggestionsRejected = req.AiSuggestionsRejected,
            DigitalSignatureHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes($"{radiologistId}:{signatureText}:{DateTime.UtcNow}"))),
            ReviewedAt = DateTime.UtcNow
        };

        _context.RadiologistReviews.Add(review);
        await _context.SaveChangesAsync();

        return StudyService.MapReportToDto(report);
    }
}

public class AnalyticsService
{
    private readonly IMediVisionDbContext _context;

    public AnalyticsService(IMediVisionDbContext context)
    {
        _context = context;
    }

    public async Task<AnalyticsDashboardDto> GetDashboardMetricsAsync()
    {
        var totalPatients = await _context.Patients.CountAsync(p => !p.IsDeleted);
        var totalStudies = await _context.ImagingStudies.CountAsync(s => !s.IsDeleted);
        var completedAnalyses = await _context.AIAnalysisJobs.CountAsync(j => j.Status == JobStatus.Completed);
        var pendingReviews = await _context.ImagingStudies.CountAsync(s => s.Status == StudyStatus.InReview);
        var approvedReports = await _context.Reports.CountAsync(r => r.Status == ReportStatus.Approved);
        var failedJobs = await _context.AIAnalysisJobs.CountAsync(j => j.Status == JobStatus.Failed);

        var modalities = await _context.ImagingStudies
            .GroupBy(s => s.Modality)
            .Select(g => new ModalityDistributionDto(g.Key, g.Count(), totalStudies > 0 ? (double)g.Count() / totalStudies * 100 : 0))
            .ToListAsync();

        var findings = new List<FindingPrevalenceDto>
        {
            new("Pleural Effusion", 24, 0.86),
            new("Cardiomegaly", 19, 0.81),
            new("Atelectasis", 15, 0.74),
            new("Consolidation", 11, 0.69),
            new("Pneumonia", 8, 0.72),
            new("Pneumothorax", 5, 0.89),
            new("No Finding", 38, 0.94)
        };

        var weeklyTrends = new List<WeeklyTrendDto>
        {
            new("Week 1", 18, 16, 14),
            new("Week 2", 24, 22, 19),
            new("Week 3", 31, 29, 27),
            new("Week 4", 42, 39, 36)
        };

        var latencies = new List<LatencyMetricDto>
        {
            new("DenseNet121", 520, 840, 1120),
            new("EfficientNet-B4", 680, 1050, 1380),
            new("ResNet50", 490, 780, 990),
            new("ViT-B/16", 890, 1420, 1860)
        };

        var recentAudit = await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .Select(a => new AuditLogDto(a.Id, a.UserId, a.UserEmail, a.Action, a.Resource, a.ResourceId, a.Details, a.IpAddress, a.UserAgent, a.Outcome, a.Timestamp))
            .ToListAsync();

        return new AnalyticsDashboardDto(
            totalPatients,
            totalStudies,
            completedAnalyses,
            pendingReviews,
            approvedReports,
            failedJobs,
            645.0,
            modalities,
            findings,
            weeklyTrends,
            latencies,
            recentAudit
        );
    }
}

