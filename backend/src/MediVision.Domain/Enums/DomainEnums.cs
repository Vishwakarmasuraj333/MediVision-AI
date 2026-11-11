namespace MediVision.Domain.Enums;

public enum UserRole
{
    Admin,
    Radiologist,
    Researcher,
    ReferringPhysician
}

public enum StudyStatus
{
    Uploaded,
    Analyzing,
    Analyzed,
    InReview,
    Approved,
    Rejected
}

public enum StudyUrgency
{
    Routine,
    Urgent,
    Stat
}

public enum JobStatus
{
    Queued,
    Processing,
    Completed,
    Failed
}

public enum ReportStatus
{
    Draft,
    PendingReview,
    Approved,
    Rejected,
    AddendumRequired
}

public enum ReviewDecision
{
    Approved,
    Modified,
    Rejected
}

public enum RiskCategory
{
    Normal,
    LowRisk,
    ModerateSuspicion,
    HighSuspicion
}

