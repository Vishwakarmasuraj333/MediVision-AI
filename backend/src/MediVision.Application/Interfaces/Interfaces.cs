using MediVision.Application.DTOs;
using MediVision.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MediVision.Application.Interfaces;

public interface IMediVisionDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Patient> Patients { get; }
    DbSet<ImagingStudy> ImagingStudies { get; }
    DbSet<ImageFile> ImageFiles { get; }
    DbSet<AIModelVersion> AIModelVersions { get; }
    DbSet<AIAnalysisJob> AIAnalysisJobs { get; }
    DbSet<AIResult> AIResults { get; }
    DbSet<Report> Reports { get; }
    DbSet<RadiologistReview> RadiologistReviews { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IFileStorageService
{
    Task<(string storagePath, string relativeUrl, string sha256, long size)> SaveFileAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream?> GetFileStreamAsync(string relativePath);
    string GetPhysicalPath(string relativePath);
}

public interface IAiServiceClient
{
    Task<AIResultDto> PredictAndAnalyzeAsync(string imagePhysicalPath, string architecture, bool enableGradCam, bool enableSegmentation);
    Task<List<AIModelVersionDto>> GetAvailableModelsAsync();
    Task<bool> CheckHealthAsync();
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? UserEmail { get; }
    string? UserRole { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
}

