using MediVision.Domain.Entities;
using MediVision.Domain.Enums;
using MediVision.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace MediVision.Tests;

public class DatabaseConsistencyTests
{
    private MediVisionDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<MediVisionDbContext>()
            .UseInMemoryDatabase(databaseName: "DbConsistency_" + Guid.NewGuid())
            .Options;
        var ctx = new MediVisionDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public async Task Db_AllTwelveEntities_CanBeCreatedAndRetrieved()
    {
        using var ctx = CreateContext();

        // 1. Role
        var role = new Role { Name = "SuperAdmin", NormalizedName = "SUPERADMIN" };
        ctx.Roles.Add(role);

        // 2. User
        var user = new User
        {
            Email = "dbtest@medivision.ai",
            NormalizedEmail = "DBTEST@MEDIVISION.AI",
            FullName = "Database Tester",
            PasswordHash = "HashedSecret",
            Role = UserRole.Radiologist
        };
        ctx.Users.Add(user);

        // 3. Patient
        var patient = new Patient
        {
            PatientIdentifier = "MV-PAT-2026-999",
            FirstName = "TestFirst",
            LastName = "TestLast",
            DateOfBirth = new DateTime(1990, 1, 1),
            Gender = "Female",
            IsSynthetic = true
        };
        ctx.Patients.Add(patient);

        // 4. ImagingStudy
        var study = new ImagingStudy
        {
            Patient = patient,
            StudyInstanceUid = "1.2.840.113619.test.001",
            AccessionNumber = "ACC-TEST-999",
            Modality = "DX",
            BodyPart = "CHEST",
            StudyDate = DateTime.UtcNow,
            Status = StudyStatus.Uploaded
        };
        ctx.ImagingStudies.Add(study);

        // 5. ImageFile
        var image = new ImageFile
        {
            Study = study,
            FileName = "test_image.png",
            StoragePath = "/storage/uploads/test_image.png",
            ContentType = "image/png",
            FileSizeBytes = 1024,
            FileSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            QualityCheckPassed = true
        };
        ctx.ImageFiles.Add(image);

        // 6. AIModelVersion
        var model = new AIModelVersion
        {
            ModelIdentifier = "test-densenet-v1",
            DisplayName = "Test Classifier",
            Architecture = "DenseNet121",
            Version = "1.0",
            ParametersCount = 7000000,
            TrainingDataset = "Synthetic Benchmark",
            AurocScore = 0.90,
            AuprcScore = 0.85,
            F1Score = 0.84,
            PrecisionScore = 0.86,
            RecallScore = 0.82
        };
        ctx.AIModelVersions.Add(model);

        // 7. AIAnalysisJob
        var job = new AIAnalysisJob
        {
            Study = study,
            ImageFile = image,
            ModelVersion = model,
            Status = JobStatus.Completed,
            TriggeredByUser = user
        };
        ctx.AIAnalysisJobs.Add(job);

        // 8. AIResult
        var result = new AIResult
        {
            Job = job,
            PrimaryFinding = "Pleural Effusion",
            OverallConfidence = 0.92,
            RiskCategory = RiskCategory.HighSuspicion,
            ClassificationScoresJson = "[]",
            CalibratedProbabilitiesJson = "[]",
            FindingsSummary = "Automated test detection"
        };
        ctx.AIResults.Add(result);

        // 9. Report
        var report = new Report
        {
            Study = study,
            AIResult = result,
            Author = user,
            ReportIdentifier = "MV-REP-TEST-001",
            Findings = "Clear",
            Impression = "Normal",
            Status = ReportStatus.Draft
        };
        ctx.Reports.Add(report);

        // 10. RadiologistReview
        var review = new RadiologistReview
        {
            Report = report,
            Radiologist = user,
            Decision = ReviewDecision.Approved,
            DigitalSignatureHash = "0xABCDEF1234567890"
        };
        ctx.RadiologistReviews.Add(review);

        // 11. AuditLog
        var audit = new AuditLog
        {
            UserEmail = user.Email,
            Action = "TEST_RUN",
            Resource = "DATABASE",
            Outcome = "Success"
        };
        ctx.AuditLogs.Add(audit);

        // 12. SystemSetting
        var setting = new SystemSetting
        {
            Key = "TestAuditSetting",
            Value = "Active"
        };
        ctx.SystemSettings.Add(setting);

        await ctx.SaveChangesAsync();

        // Assert all 12 tables hold data
        Assert.True(await ctx.Roles.AnyAsync());
        Assert.True(await ctx.Users.AnyAsync());
        Assert.True(await ctx.Patients.AnyAsync());
        Assert.True(await ctx.ImagingStudies.AnyAsync());
        Assert.True(await ctx.ImageFiles.AnyAsync());
        Assert.True(await ctx.AIModelVersions.AnyAsync());
        Assert.True(await ctx.AIAnalysisJobs.AnyAsync());
        Assert.True(await ctx.AIResults.AnyAsync());
        Assert.True(await ctx.Reports.AnyAsync());
        Assert.True(await ctx.RadiologistReviews.AnyAsync());
        Assert.True(await ctx.AuditLogs.AnyAsync());
        Assert.True(await ctx.SystemSettings.AnyAsync());
    }

    [Fact]
    public async Task Db_ReferentialIntegrity_CascadeDeletesImageFilesOnStudyDelete()
    {
        using var ctx = CreateContext();

        var patient = new Patient
        {
            PatientIdentifier = "MV-PAT-CASCADE-01",
            FirstName = "Cascade",
            LastName = "Test",
            DateOfBirth = new DateTime(1980, 1, 1),
            Gender = "Male"
        };
        var study = new ImagingStudy
        {
            Patient = patient,
            StudyInstanceUid = "uid.cascade.01",
            AccessionNumber = "ACC-CASCADE-01",
            Modality = "CR",
            Status = StudyStatus.Uploaded
        };
        var image = new ImageFile
        {
            Study = study,
            FileName = "cascade_img.png",
            StoragePath = "/storage/uploads/c.png",
            ContentType = "image/png",
            FileSha256 = "123456"
        };

        ctx.Patients.Add(patient);
        ctx.ImagingStudies.Add(study);
        ctx.ImageFiles.Add(image);
        await ctx.SaveChangesAsync();

        Assert.Equal(1, await ctx.ImageFiles.CountAsync(i => i.StudyId == study.Id));

        // Delete study
        ctx.ImagingStudies.Remove(study);
        await ctx.SaveChangesAsync();

        // ImageFiles should be cascaded
        Assert.Equal(0, await ctx.ImageFiles.CountAsync(i => i.StudyId == study.Id));
    }
}
