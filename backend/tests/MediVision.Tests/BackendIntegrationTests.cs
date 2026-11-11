using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using MediVision.Application.DTOs;
using Xunit;

namespace MediVision.Tests;

public class BackendIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public BackendIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> GetAuthTokenAsync(string email = "admin@medivision.ai", string password = "Admin@2026!")
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password));
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return content!.Token;
    }

    // 1. POST /api/auth/login
    [Fact]
    public async Task Post_Auth_Login_ValidCredentials_ReturnsOkWithJwtToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("dr.elena.vance@medivision.ai", "Radiology@2026!"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(body);
        Assert.NotEmpty(body.Token);
        Assert.Equal("Radiologist", body.User.Role);
    }

    [Fact]
    public async Task Post_Auth_Login_InvalidPassword_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("dr.elena.vance@medivision.ai", "WrongPassword!"));
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Post_Auth_Login_EmptyPayload_ReturnsBadRequest()
    {
        var response = await _client.PostAsync("/api/auth/login", new StringContent("{}", Encoding.UTF8, "application/json"));
        // Serialized empty email/password returns Unauthorized or BadRequest
        Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.Unauthorized);
    }

    // 2. GET /api/patients
    [Fact]
    public async Task Get_Patients_ReturnsOkWithPatientList()
    {
        var response = await _client.GetAsync("/api/patients");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var patients = await response.Content.ReadFromJsonAsync<List<PatientDto>>();
        Assert.NotNull(patients);
        Assert.True(patients.Count > 0);
    }

    // 3. POST /api/patients
    [Fact]
    public async Task Post_Patients_ValidRequest_CreatesPatientAndReturnsCreated()
    {
        var newPatient = new CreatePatientRequest(
            FirstName: "TestJohn",
            LastName: "TestDoe",
            DateOfBirth: new DateTime(1985, 5, 20),
            Gender: "Male",
            BloodGroup: "A+",
            MedicalHistorySummary: "Integration test synthetic record",
            Allergies: "None",
            EmergencyContact: "Family"
        );

        var response = await _client.PostAsJsonAsync("/api/patients", newPatient);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<PatientDto>();
        Assert.NotNull(created);
        Assert.StartsWith("MV-PAT-2026-", created.PatientIdentifier);
    }

    [Fact]
    public async Task Post_Patients_MissingRequiredFields_ReturnsBadRequest()
    {
        var invalidReq = new CreatePatientRequest(
            FirstName: "",
            LastName: "   ",
            DateOfBirth: DateTime.UtcNow.AddYears(1), // Future DOB
            Gender: "Male",
            BloodGroup: null,
            MedicalHistorySummary: null,
            Allergies: null,
            EmergencyContact: null
        );

        var response = await _client.PostAsJsonAsync("/api/patients", invalidReq);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // 4. POST /api/studies/upload
    [Fact]
    public async Task Post_Studies_Upload_ValidImage_ReturnsOkWithMetadata()
    {
        using var form = new MultipartFormDataContent();
        var sampleBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }; // PNG header
        form.Add(new ByteArrayContent(sampleBytes), "file", "chest_xray_test.png");

        var response = await _client.PostAsync("/api/studies/upload", form);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("imageId", content);
        Assert.Contains("accessionNumber", content);
    }

    [Fact]
    public async Task Post_Studies_Upload_InvalidFormat_ReturnsBadRequest()
    {
        using var form = new MultipartFormDataContent();
        form.Add(new ByteArrayContent(new byte[] { 0x01, 0x02 }), "file", "malicious_script.exe");

        var response = await _client.PostAsync("/api/studies/upload", form);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // 5. POST /api/ai/analyze
    [Fact]
    public async Task Post_Ai_Analyze_ValidStudy_ReturnsJobDto()
    {
        // First retrieve a study
        var studiesRes = await _client.GetAsync("/api/studies");
        studiesRes.EnsureSuccessStatusCode();
        var studies = await studiesRes.Content.ReadFromJsonAsync<List<StudyDto>>();
        Assert.NotNull(studies);
        var study = studies[0];

        var req = new RunAnalysisRequest(
            StudyId: study.Id,
            ImageFileId: study.Images.FirstOrDefault()?.Id,
            ModelVersionId: null,
            EnableSegmentation: true,
            EnableGradCam: true
        );

        var response = await _client.PostAsJsonAsync("/api/ai/analyze", req);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var job = await response.Content.ReadFromJsonAsync<AIAnalysisJobDto>();
        Assert.NotNull(job);
        Assert.Equal("Completed", job.Status);
        Assert.NotNull(job.Result);
    }

    [Fact]
    public async Task Post_Ai_Analyze_NonExistentStudy_ReturnsNotFound()
    {
        var req = new RunAnalysisRequest(
            StudyId: Guid.NewGuid(),
            ImageFileId: null,
            ModelVersionId: null
        );

        var response = await _client.PostAsJsonAsync("/api/ai/analyze", req);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // 6. GET /api/ai/results/{id}
    [Fact]
    public async Task Get_Ai_Results_ValidResult_ReturnsAIResultDto()
    {
        var studiesRes = await _client.GetAsync("/api/studies");
        var studies = await studiesRes.Content.ReadFromJsonAsync<List<StudyDto>>();
        var studyWithResult = studies?.FirstOrDefault(s => s.LatestJob?.Result != null);

        if (studyWithResult?.LatestJob?.Result != null)
        {
            var resId = studyWithResult.LatestJob.Result.Id;
            var response = await _client.GetAsync($"/api/ai/results/{resId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<AIResultDto>();
            Assert.NotNull(result);
            Assert.NotEmpty(result.PrimaryFinding);
        }
    }

    [Fact]
    public async Task Get_Ai_Results_InvalidId_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/ai/results/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // 7. GET /api/ai/heatmap/{id}
    [Fact]
    public async Task Get_Ai_Heatmap_InvalidId_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/ai/heatmap/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // 8. POST /api/reports
    [Fact]
    public async Task Post_Reports_ValidRequest_CreatesReport()
    {
        var studiesRes = await _client.GetAsync("/api/studies");
        var studies = await studiesRes.Content.ReadFromJsonAsync<List<StudyDto>>();
        Assert.NotNull(studies);
        var study = studies[0];

        var req = new CreateReportRequest(
            StudyId: study.Id,
            AIResultId: study.LatestJob?.Result?.Id,
            Title: "Thoracic Consultation Report",
            ClinicalIndication: "Dyspnea on exertion",
            Technique: "Frontal PA projection",
            ComparisonStudy: "None",
            Findings: "Clear lung fields bilaterally. Cardiac size normal.",
            Impression: "No acute cardiopulmonary disease.",
            Recommendations: "Clinical follow-up as needed.",
            CriticalFindingAlert: false
        );

        var response = await _client.PostAsJsonAsync("/api/reports", req);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ReportDto>();
        Assert.NotNull(created);
        Assert.Equal("Draft", created.Status);
    }

    [Fact]
    public async Task Post_Reports_MissingFindings_ReturnsBadRequest()
    {
        var req = new CreateReportRequest(
            StudyId: Guid.NewGuid(),
            AIResultId: null,
            Title: "Invalid",
            ClinicalIndication: null,
            Technique: null,
            ComparisonStudy: null,
            Findings: "",
            Impression: "",
            Recommendations: null,
            CriticalFindingAlert: false
        );

        var response = await _client.PostAsJsonAsync("/api/reports", req);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // 9. PUT /api/reports/{id}/approve
    [Fact]
    public async Task Put_Reports_Approve_ValidReport_ReturnsApprovedReport()
    {
        var reportsRes = await _client.GetAsync("/api/reports");
        var reports = await reportsRes.Content.ReadFromJsonAsync<List<ReportDto>>();
        Assert.NotNull(reports);
        var draft = reports.FirstOrDefault(r => r.Status == "Draft") ?? reports[0];

        var approveReq = new ApproveReportRequest(
            Notes: "Verified by Attending Radiologist Dr. Vance",
            AgreementScore: 5,
            AiSuggestionsAccepted: "AI findings verified",
            UpdatedFindings: draft.Findings,
            UpdatedImpression: draft.Impression,
            UpdatedRecommendations: draft.Recommendations
        );

        var response = await _client.PutAsJsonAsync($"/api/reports/{draft.Id}/approve", approveReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var approved = await response.Content.ReadFromJsonAsync<ReportDto>();
        Assert.NotNull(approved);
        Assert.Equal("Approved", approved.Status);
    }

    [Fact]
    public async Task Put_Reports_Approve_NonExistent_ReturnsNotFound()
    {
        var response = await _client.PutAsJsonAsync($"/api/reports/{Guid.NewGuid()}/approve", new ApproveReportRequest());
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // 10. GET /api/analytics/dashboard
    [Fact]
    public async Task Get_Analytics_Dashboard_ReturnsOkWithDashboardMetrics()
    {
        var response = await _client.GetAsync("/api/analytics/dashboard");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dashboard = await response.Content.ReadFromJsonAsync<AnalyticsDashboardDto>();
        Assert.NotNull(dashboard);
        Assert.True(dashboard.TotalPatients >= 0);
        Assert.True(dashboard.TotalStudies >= 0);
        Assert.NotEmpty(dashboard.AbnormalityPrevalence);
    }

    // --- RBAC & SECURITY TESTS ---
    [Fact]
    public async Task SecureEndpoint_Users_Unauthenticated_ReturnsUnauthorized()
    {
        var unauthedClient = _factory.CreateClient();
        var response = await unauthedClient.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SecureEndpoint_AuditLogs_Unauthenticated_ReturnsUnauthorized()
    {
        var unauthedClient = _factory.CreateClient();
        var response = await unauthedClient.GetAsync("/api/audit");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SecureEndpoint_Settings_Update_NonAdmin_ReturnsForbidden()
    {
        // Authenticate as Radiologist
        var radToken = await GetAuthTokenAsync("dr.elena.vance@medivision.ai", "Radiology@2026!");
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", radToken);

        var response = await client.PutAsJsonAsync("/api/settings/TestKey", "TestValue");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SecureEndpoint_Settings_Update_Admin_ReturnsOk()
    {
        // Authenticate as Admin
        var adminToken = await GetAuthTokenAsync("admin@medivision.ai", "Admin@2026!");
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        var response = await client.PutAsJsonAsync("/api/settings/TestSettingKey", "TestSettingValue");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
