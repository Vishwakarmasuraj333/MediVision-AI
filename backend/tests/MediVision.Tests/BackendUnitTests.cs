using MediVision.Application.DTOs;
using MediVision.Application.Interfaces;
using MediVision.Application.Services;
using MediVision.Domain.Entities;
using MediVision.Domain.Enums;
using MediVision.Infrastructure.Persistence;
using MediVision.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MediVision.Tests;

public class BackendUnitTests
{
    private MediVisionDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<MediVisionDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        var context = new MediVisionDbContext(options);
        return context;
    }

    [Fact]
    public async Task AuthService_ValidCredentials_ReturnsLoginResponse()
    {
        // Arrange
        var context = CreateInMemoryContext(Guid.NewGuid().ToString());
        var hasher = new PasswordHasher();
        var jwtMock = new Mock<IJwtTokenService>();
        jwtMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("mock_valid_token");
        jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("mock_refresh_token");

        var user = new User
        {
            Email = "dr.elena.vance@medivision.ai",
            NormalizedEmail = "DR.ELENA.VANCE@MEDIVISION.AI",
            PasswordHash = hasher.HashPassword("Radiology@2026!"),
            FullName = "Dr. Elena Vance, MD",
            Role = UserRole.Radiologist,
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var authService = new AuthService(context, jwtMock.Object, hasher);

        // Act
        var result = await authService.LoginAsync(new LoginRequest("dr.elena.vance@medivision.ai", "Radiology@2026!"), "127.0.0.1", "TestClient");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("mock_valid_token", result.Token);
        Assert.Equal("dr.elena.vance@medivision.ai", result.User.Email);
        Assert.Equal("Radiologist", result.User.Role);
    }

    [Fact]
    public async Task AuthService_InvalidPassword_ReturnsNullAndLogsAudit()
    {
        // Arrange
        var context = CreateInMemoryContext(Guid.NewGuid().ToString());
        var hasher = new PasswordHasher();
        var jwtMock = new Mock<IJwtTokenService>();

        var user = new User
        {
            Email = "dr.elena.vance@medivision.ai",
            NormalizedEmail = "DR.ELENA.VANCE@MEDIVISION.AI",
            PasswordHash = hasher.HashPassword("CorrectPassword!"),
            FullName = "Dr. Elena Vance, MD"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var authService = new AuthService(context, jwtMock.Object, hasher);

        // Act
        var result = await authService.LoginAsync(new LoginRequest("dr.elena.vance@medivision.ai", "WrongPassword!"), "127.0.0.1", "TestClient");

        // Assert
        Assert.Null(result);
        var audit = await context.AuditLogs.FirstOrDefaultAsync(a => a.Action == "LOGIN_FAILED");
        Assert.NotNull(audit);
    }

    [Fact]
    public async Task PatientService_CreatePatient_SetsSyntheticFlagAndGeneratesId()
    {
        // Arrange
        var context = CreateInMemoryContext(Guid.NewGuid().ToString());
        var service = new PatientService(context);

        var request = new CreatePatientRequest(
            FirstName: "Arthur",
            LastName: "Pendelton",
            DateOfBirth: new DateTime(1962, 4, 12),
            Gender: "Male",
            BloodGroup: "O+",
            MedicalHistorySummary: "COPD research cohort",
            Allergies: "Penicillin",
            EmergencyContact: "Spouse"
        );

        // Act
        var patient = await service.CreatePatientAsync(request);

        // Assert
        Assert.NotNull(patient);
        Assert.StartsWith("MV-PAT-2026-", patient.PatientIdentifier);
        Assert.True(patient.IsSynthetic);
        Assert.Equal("Arthur", patient.FirstName);
    }

    [Fact]
    public async Task ReportService_SubmitReview_ApprovesReportAndCalculatesDigitalSignature()
    {
        // Arrange
        var context = CreateInMemoryContext(Guid.NewGuid().ToString());
        var patient = new Patient { PatientIdentifier = "MV-PAT-2026-0001", FirstName = "Arthur", LastName = "Pendelton" };
        var study = new ImagingStudy { Patient = patient, AccessionNumber = "ACC-001", Status = StudyStatus.InReview };
        var radiologist = new User { FullName = "Dr. Elena Vance, MD", Role = UserRole.Radiologist, Email = "vance@medivision.ai" };
        var report = new Report
        {
            Study = study,
            Author = radiologist,
            ReportIdentifier = "MV-REP-001",
            Findings = "Right pleural blunting",
            Impression = "Suspicion of effusion",
            Status = ReportStatus.Draft
        };

        context.Patients.Add(patient);
        context.ImagingStudies.Add(study);
        context.Users.Add(radiologist);
        context.Reports.Add(report);
        await context.SaveChangesAsync();

        var reportService = new ReportService(context);

        // Act
        var reviewReq = new SubmitReviewRequest(
            ReportId: report.Id,
            Decision: "Approved",
            ReviewerNotes: "AI findings verified and confirmed.",
            AgreementScore: 5,
            AiSuggestionsAccepted: "Pleural Effusion detection accepted",
            AiSuggestionsRejected: null,
            UpdatedFindings: "Confirmed moderate right pleural effusion.",
            UpdatedImpression: "Moderate right pleural effusion. Thoracentesis suggested.",
            UpdatedRecommendations: "Clinical correlation recommended."
        );

        var updatedReport = await reportService.SubmitReviewAsync(reviewReq, radiologist.Id, "Dr. Elena Vance, MD");

        // Assert
        Assert.Equal("Approved", updatedReport.Status);
        Assert.Single(updatedReport.Reviews);
        Assert.NotEmpty(updatedReport.Reviews[0].DigitalSignatureHash);
        Assert.Equal(StudyStatus.Approved, study.Status);
    }

    [Fact]
    public void PasswordHasher_VerifyPassword_RejectsTamperedOrPlaintextPassword()
    {
        var hasher = new PasswordHasher();
        var password = "SecureRadiologyPassword2026!";
        var hash = hasher.HashPassword(password);

        Assert.True(hasher.VerifyPassword(password, hash));
        Assert.False(hasher.VerifyPassword("WrongPassword", hash));
        Assert.False(hasher.VerifyPassword("", hash));
        Assert.False(hasher.VerifyPassword(password, ""));
    }

    [Fact]
    public void FileStorageService_PathTraversalAttempt_ThrowsUnauthorizedAccessException()
    {
        var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
        var testStoragePath = Path.Combine(Path.GetTempPath(), "MediVisionTestStorage_" + Guid.NewGuid());
        configMock.Setup(c => c["Storage:RootPath"]).Returns(testStoragePath);

        var loggerMock = new Mock<Microsoft.Extensions.Logging.ILogger<FileStorageService>>();
        var storage = new FileStorageService(configMock.Object, loggerMock.Object);

        Assert.Throws<UnauthorizedAccessException>(() =>
        {
            storage.GetPhysicalPath("../../Windows/System32/cmd.exe");
        });

        Assert.Throws<UnauthorizedAccessException>(() =>
        {
            storage.GetPhysicalPath("../../../etc/passwd");
        });
    }

    [Fact]
    public void JwtTokenGenerator_GeneratesValidTokenWithUserClaims()
    {
        var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
        configMock.Setup(c => c["Jwt:SecretKey"]).Returns("TestSecretKeyForMediVisionEnterpriseUnitTests2026!MustBeLong");
        configMock.Setup(c => c["Jwt:Issuer"]).Returns("MediVision.TestAPI");
        configMock.Setup(c => c["Jwt:Audience"]).Returns("MediVision.TestClient");

        var generator = new JwtTokenGenerator(configMock.Object);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "vance@medivision.ai",
            FullName = "Dr. Elena Vance",
            Role = UserRole.Radiologist,
            Department = "Thoracic"
        };

        var token = generator.GenerateAccessToken(user);
        Assert.NotEmpty(token);
        Assert.Contains(".", token); // Standard JWT format: header.payload.signature

        var refreshToken = generator.GenerateRefreshToken();
        Assert.NotEmpty(refreshToken);
    }
}

