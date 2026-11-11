using MediVision.Application.Interfaces;
using MediVision.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MediVision.Infrastructure.Persistence;

public class MediVisionDbContext : DbContext, IMediVisionDbContext
{
    public MediVisionDbContext(DbContextOptions<MediVisionDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<ImagingStudy> ImagingStudies => Set<ImagingStudy>();
    public DbSet<ImageFile> ImageFiles => Set<ImageFile>();
    public DbSet<AIModelVersion> AIModelVersions => Set<AIModelVersion>();
    public DbSet<AIAnalysisJob> AIAnalysisJobs => Set<AIAnalysisJob>();
    public DbSet<AIResult> AIResults => Set<AIResult>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<RadiologistReview> RadiologistReviews => Set<RadiologistReview>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // Role
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Patient
        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PatientIdentifier).IsUnique();
            entity.Property(e => e.PatientIdentifier).HasMaxLength(50).IsRequired();
        });

        // ImagingStudy
        modelBuilder.Entity<ImagingStudy>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StudyInstanceUid).IsUnique();
            entity.HasIndex(e => e.AccessionNumber).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Urgency).HasConversion<string>();

            entity.HasOne(e => e.Patient)
                  .WithMany(p => p.Studies)
                  .HasForeignKey(e => e.PatientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ImageFile
        modelBuilder.Entity<ImageFile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Study)
                  .WithMany(s => s.Images)
                  .HasForeignKey(e => e.StudyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // AIModelVersion
        modelBuilder.Entity<AIModelVersion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ModelIdentifier).IsUnique();
        });

        // AIAnalysisJob
        modelBuilder.Entity<AIAnalysisJob>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Study)
                  .WithMany(s => s.AnalysisJobs)
                  .HasForeignKey(e => e.StudyId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ImageFile)
                  .WithMany()
                  .HasForeignKey(e => e.ImageFileId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ModelVersion)
                  .WithMany()
                  .HasForeignKey(e => e.ModelVersionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TriggeredByUser)
                  .WithMany(u => u.TriggeredJobs)
                  .HasForeignKey(e => e.TriggeredByUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // AIResult
        modelBuilder.Entity<AIResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RiskCategory).HasConversion<string>();

            entity.HasOne(e => e.Job)
                  .WithOne(j => j.Result)
                  .HasForeignKey<AIResult>(e => e.JobId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Report
        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReportIdentifier).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Study)
                  .WithMany(s => s.Reports)
                  .HasForeignKey(e => e.StudyId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AIResult)
                  .WithMany()
                  .HasForeignKey(e => e.AIResultId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Author)
                  .WithMany(u => u.AuthoredReports)
                  .HasForeignKey(e => e.AuthorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // RadiologistReview
        modelBuilder.Entity<RadiologistReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Decision).HasConversion<string>();

            entity.HasOne(e => e.Report)
                  .WithMany(r => r.Reviews)
                  .HasForeignKey(e => e.ReportId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Radiologist)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(e => e.RadiologistId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.Action);
        });

        // SystemSetting
        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Key);
        });
    }
}

