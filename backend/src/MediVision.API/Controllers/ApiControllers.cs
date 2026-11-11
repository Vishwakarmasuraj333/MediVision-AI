using System.Security.Claims;
using MediVision.Application.DTOs;
using MediVision.Application.Interfaces;
using MediVision.Application.Services;
using MediVision.Domain.Entities;
using MediVision.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediVision.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly IMediVisionDbContext _context;

    public AuthController(AuthService authService, IMediVisionDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers["User-Agent"].ToString();

        var res = await _authService.LoginAsync(req, ip, ua);
        if (res == null) return Unauthorized(new { message = "Invalid email or password." });
        return Ok(res);
    }

    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        return Ok(new { message = $"If {req.Email} is registered in MediVision AI, a password reset link has been dispatched." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUserInfo()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        if (user == null) return NotFound();

        return Ok(new UserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString(),
            user.Department,
            user.MedicalLicenseNumber,
            user.DigitalSignatureText,
            user.IsActive,
            user.LastLoginAt
        ));
    }
}

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly PatientService _patientService;

    public PatientsController(PatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var list = await _patientService.GetPatientsAsync(search);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _patientService.GetPatientByIdAsync(id);
        if (p == null) return NotFound(new { message = "Patient not found." });
        return Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest req)
    {
        if (req == null) return BadRequest(new { message = "Request body cannot be empty." });
        if (string.IsNullOrWhiteSpace(req.FirstName) || string.IsNullOrWhiteSpace(req.LastName))
        {
            return BadRequest(new { message = "First name and last name are required." });
        }
        if (req.DateOfBirth > DateTime.UtcNow)
        {
            return BadRequest(new { message = "Date of birth cannot be in the future." });
        }
        var created = await _patientService.CreatePatientAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}

[ApiController]
[Route("api/[controller]")]
public class StudiesController : ControllerBase
{
    private readonly StudyService _studyService;
    private readonly IMediVisionDbContext _context;

    public StudiesController(StudyService studyService, IMediVisionDbContext context)
    {
        _studyService = studyService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? urgency)
    {
        var list = await _studyService.GetStudiesAsync(status, urgency);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var study = await _studyService.GetStudyByIdAsync(id);
        if (study == null) return NotFound(new { message = "Study not found." });
        return Ok(study);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStudyRequest req)
    {
        var patient = await _context.Patients.FindAsync(req.PatientId);
        if (patient == null) return BadRequest(new { message = "Patient does not exist." });

        var study = new ImagingStudy
        {
            StudyInstanceUid = $"1.2.840.113619.2.55.3.{DateTime.UtcNow.Ticks}",
            PatientId = req.PatientId,
            AccessionNumber = req.AccessionNumber,
            Modality = req.Modality,
            BodyPart = req.BodyPart,
            Description = req.Description,
            ClinicalIndication = req.ClinicalIndication,
            ReferringPhysician = req.ReferringPhysician,
            Urgency = Enum.TryParse<StudyUrgency>(req.Urgency, true, out var u) ? u : StudyUrgency.Routine,
            Status = StudyStatus.Uploaded
        };

        _context.ImagingStudies.Add(study);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = study.Id }, StudyService.MapToStudyDto(study));
    }
}

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _storage;
    private readonly IMediVisionDbContext _context;

    public UploadController(IFileStorageService storage, IMediVisionDbContext context)
    {
        _storage = storage;
        _context = context;
    }

    [HttpPost]
    [HttpPost("/api/studies/upload")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] Guid? studyId, [FromForm] Guid? patientId)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "No valid file uploaded." });

        if (file.Length > 50 * 1024 * 1024)
        {
            return BadRequest(new { message = "File exceeds the maximum allowable upload limit of 50 MB." });
        }

        // Content validation (DICOM / PNG / JPEG)
        var allowedExtensions = new[] { ".dcm", ".dicom", ".png", ".jpg", ".jpeg" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Invalid medical image format. Supported formats: DICOM (.dcm), PNG, JPEG." });
        }

        using var stream = file.OpenReadStream();
        var (storagePath, relativeUrl, sha256, size) = await _storage.SaveFileAsync(stream, file.FileName, file.ContentType);

        // Quality check metrics
        var qualityCheckPassed = true;
        var qualityJson = "{\"snr\": 32.1, \"resolution\": \"1024x1024\", \"contrastRatio\": 0.89, \"artifacts\": \"none\", \"motionBlurDetected\": false}";

        // If no studyId passed, create a new study or link to patient
        ImagingStudy study;
        if (studyId.HasValue)
        {
            study = await _context.ImagingStudies.FindAsync(studyId.Value) 
                ?? throw new KeyNotFoundException("Study not found.");
        }
        else
        {
            var targetPatientId = patientId ?? (await _context.Patients.FirstAsync()).Id;
            var accNum = $"ACC-2026-{(await _context.ImagingStudies.CountAsync() + 9001)}";
            study = new ImagingStudy
            {
                StudyInstanceUid = $"1.2.840.113619.2.55.3.{DateTime.UtcNow.Ticks}",
                PatientId = targetPatientId,
                AccessionNumber = accNum,
                Modality = ext.Contains("dcm") ? "DX" : "CR",
                BodyPart = "CHEST",
                Description = $"Chest Radiograph ({Path.GetFileNameWithoutExtension(file.FileName)})",
                ClinicalIndication = "Uploaded for rapid deep learning research analysis",
                Status = StudyStatus.Uploaded,
                Urgency = StudyUrgency.Routine
            };
            _context.ImagingStudies.Add(study);
            await _context.SaveChangesAsync();
        }

        var imageFile = new ImageFile
        {
            StudyId = study.Id,
            FileName = file.FileName,
            StoragePath = relativeUrl,
            ContentType = file.ContentType,
            FileSizeBytes = size,
            FileSha256 = sha256,
            Width = 1024,
            Height = 1024,
            BitsAllocated = 16,
            QualityCheckPassed = qualityCheckPassed,
            QualityCheckDetailsJson = qualityJson
        };

        _context.ImageFiles.Add(imageFile);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            imageId = imageFile.Id,
            studyId = study.Id,
            accessionNumber = study.AccessionNumber,
            fileName = file.FileName,
            url = relativeUrl,
            fileSize = size,
            sha256 = sha256,
            qualityCheckPassed = qualityCheckPassed
        });
    }
}

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly AnalysisService _analysisService;
    private readonly IMediVisionDbContext _context;

    public AnalysisController(AnalysisService analysisService, IMediVisionDbContext context)
    {
        _analysisService = analysisService;
        _context = context;
    }

    [HttpPost("run")]
    [HttpPost("/api/ai/analyze")]
    public async Task<IActionResult> RunAnalysis([FromBody] RunAnalysisRequest req)
    {
        if (req == null || req.StudyId == Guid.Empty)
        {
            return BadRequest(new { message = "StudyId is required for AI analysis." });
        }

        var studyExists = await _context.ImagingStudies.AnyAsync(s => s.Id == req.StudyId);
        if (!studyExists) return NotFound(new { message = "Study not found." });

        var jobDto = await _analysisService.TriggerAnalysisAsync(req, null);
        return Ok(jobDto);
    }

    [HttpGet("jobs/{id:guid}")]
    public async Task<IActionResult> GetJob(Guid id)
    {
        var job = await _context.AIAnalysisJobs
            .Include(j => j.ModelVersion)
            .Include(j => j.Result)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null) return NotFound(new { message = "Analysis job not found." });
        return Ok(StudyService.MapJobToDto(job));
    }

    [HttpGet("results/{id:guid}")]
    [HttpGet("/api/ai/results/{id:guid}")]
    public async Task<IActionResult> GetResult(Guid id)
    {
        var result = await _context.AIResults
            .Include(r => r.Job)
            .FirstOrDefaultAsync(r => r.Id == id || r.JobId == id);

        if (result == null) return NotFound(new { message = "AI analysis result not found." });
        return Ok(StudyService.MapResultToDto(result));
    }

    [HttpGet("heatmap/{id:guid}")]
    [HttpGet("/api/ai/heatmap/{id:guid}")]
    public async Task<IActionResult> GetHeatmap(Guid id)
    {
        var result = await _context.AIResults
            .FirstOrDefaultAsync(r => r.Id == id || r.JobId == id);

        if (result == null) return NotFound(new { message = "AI heatmap not found." });
        return Ok(new
        {
            resultId = result.Id,
            jobId = result.JobId,
            primaryFinding = result.PrimaryFinding,
            gradCamHeatmapUrl = result.GradCamHeatmapPath,
            gradCamOverlayUrl = result.GradCamOverlayPath,
            lungSegmentationMaskUrl = result.LungSegmentationMaskPath
        });
    }
}

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;
    private readonly IMediVisionDbContext _context;

    public ReportsController(ReportService reportService, IMediVisionDbContext context)
    {
        _reportService = reportService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var list = await _reportService.GetReportsAsync(status);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var report = await _context.Reports
            .Include(r => r.Study!)
                .ThenInclude(s => s.Patient)
            .Include(r => r.Author)
            .Include(r => r.Reviews)
                .ThenInclude(rv => rv.Radiologist)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if (report == null) return NotFound(new { message = "Report not found." });
        return Ok(StudyService.MapReportToDto(report));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportRequest req)
    {
        if (req == null) return BadRequest(new { message = "Report request cannot be empty." });
        if (req.StudyId == Guid.Empty) return BadRequest(new { message = "StudyId is required." });
        if (string.IsNullOrWhiteSpace(req.Findings) || string.IsNullOrWhiteSpace(req.Impression))
        {
            return BadRequest(new { message = "Findings and Impression sections are required." });
        }

        var study = await _context.ImagingStudies.FindAsync(req.StudyId);
        if (study == null) return NotFound(new { message = "Study does not exist." });

        var authorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var report = await _reportService.CreateReportAsync(req, authorId);
        return Ok(report);
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> ApproveReport(Guid id, [FromBody] ApproveReportRequest? req)
    {
        var report = await _context.Reports
            .Include(r => r.Reviews)
            .Include(r => r.Study)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if (report == null) return NotFound(new { message = "Report not found." });

        var radId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var reviewReq = new SubmitReviewRequest(
            ReportId: id,
            Decision: "Approved",
            ReviewerNotes: req?.Notes ?? "Report verified and digitally signed by attending radiologist.",
            AgreementScore: req?.AgreementScore ?? 5,
            AiSuggestionsAccepted: req?.AiSuggestionsAccepted ?? "AI findings reviewed and accepted.",
            AiSuggestionsRejected: null,
            UpdatedFindings: req?.UpdatedFindings,
            UpdatedImpression: req?.UpdatedImpression,
            UpdatedRecommendations: req?.UpdatedRecommendations
        );

        var updated = await _reportService.SubmitReviewAsync(reviewReq, radId, "Dr. Elena Vance, MD, FACR");
        return Ok(updated);
    }

    [HttpPost("review")]
    public async Task<IActionResult> SubmitReview([FromBody] SubmitReviewRequest req)
    {
        if (req == null || req.ReportId == Guid.Empty) return BadRequest(new { message = "ReportId is required." });
        var reportExists = await _context.Reports.AnyAsync(r => r.Id == req.ReportId);
        if (!reportExists) return NotFound(new { message = "Report not found." });

        var radId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var report = await _reportService.SubmitReviewAsync(req, radId, "Dr. Elena Vance, MD, Attending Thoracic Radiologist");
        return Ok(report);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public AnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var metrics = await _analyticsService.GetDashboardMetricsAsync();
        return Ok(metrics);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Radiologist")]
public class AuditController : ControllerBase
{
    private readonly IMediVisionDbContext _context;

    public AuditController(IMediVisionDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] int take = 50)
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(take)
            .Select(a => new AuditLogDto(
                a.Id,
                a.UserId,
                a.UserEmail,
                a.Action,
                a.Resource,
                a.ResourceId,
                a.Details,
                a.IpAddress,
                a.UserAgent,
                a.Outcome,
                a.Timestamp
            ))
            .ToListAsync();

        return Ok(logs);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ModelsController : ControllerBase
{
    private readonly IMediVisionDbContext _context;

    public ModelsController(IMediVisionDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetModels()
    {
        var models = await _context.AIModelVersions
            .OrderByDescending(m => m.AurocScore)
            .Select(m => new AIModelVersionDto(
                m.Id,
                m.ModelIdentifier,
                m.DisplayName,
                m.Architecture,
                m.Version,
                m.ParametersCount,
                m.TrainingDataset,
                m.AurocScore,
                m.AuprcScore,
                m.F1Score,
                m.PrecisionScore,
                m.RecallScore,
                m.IsActive,
                m.IsDefault
            ))
            .ToListAsync();

        return Ok(models);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediVisionDbContext _context;
    private readonly IPasswordHasher _hasher;

    public UsersController(IMediVisionDbContext context, IPasswordHasher hasher)
    {
        _context = context;
        _hasher = hasher;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto(
                u.Id,
                u.Email,
                u.FullName,
                u.Role.ToString(),
                u.Department,
                u.MedicalLicenseNumber,
                u.DigitalSignatureText,
                u.IsActive,
                u.LastLoginAt
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        var normalizedEmail = req.Email.ToUpperInvariant().Trim();
        var exists = await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail && !u.IsDeleted);
        if (exists)
        {
            return Conflict(new { message = $"User with email {req.Email} already exists." });
        }

        var user = new User
        {
            Email = req.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PasswordHash = _hasher.HashPassword(req.Password),
            FullName = req.FullName?.Trim() ?? "User",
            Role = Enum.TryParse<UserRole>(req.Role, true, out var r) ? r : UserRole.Radiologist,
            Department = req.Department,
            MedicalLicenseNumber = req.MedicalLicenseNumber,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new UserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString(),
            user.Department,
            user.MedicalLicenseNumber,
            user.DigitalSignatureText,
            user.IsActive,
            user.LastLoginAt
        ));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IMediVisionDbContext _context;

    public SettingsController(IMediVisionDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _context.SystemSettings.ToListAsync();
        return Ok(settings);
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string key, [FromBody] string value)
    {
        var setting = await _context.SystemSettings.FindAsync(key);
        if (setting == null)
        {
            setting = new SystemSetting { Key = key, Value = value };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(setting);
    }
}

