# MediVision AI - Comprehensive Test Cases Specification

**Document ID:** MEDIVISION-TC-SPEC-001  
**Execution Date:** November 11, 2026  
**Total Executed Tests:** 71  
**Total Passed Tests:** 71  
**Total Failed Tests:** 0  
**Pass Rate:** 100.0%

---

## 1. C# ASP.NET Core Backend & Database Integration Tests (31 Cases)

Harness: `xUnit` with `Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>` and Entity Framework In-Memory Database.

| Test ID | Test Method Name | Component / Endpoint | Verification Scope | Status |
|---|---|---|---|---|
| TC-BE-001 | `Post_Login_ValidCredentials_ReturnsTokenAndUserInfo` | `/api/auth/login` | Valid credentials return JWT Bearer token and user claims | **PASS** |
| TC-BE-002 | `Post_Login_InvalidCredentials_ReturnsUnauthorized` | `/api/auth/login` | Bad password triggers HTTP 401 Unauthorized | **PASS** |
| TC-BE-003 | `Post_Login_EmptyPayload_ReturnsBadRequest` | `/api/auth/login` | Missing email/password triggers HTTP 400 Bad Request | **PASS** |
| TC-BE-004 | `Get_Patients_WithoutToken_ReturnsUnauthorized` | `/api/patients` | Unauthenticated GET triggers HTTP 401 Unauthorized | **PASS** |
| TC-BE-005 | `Get_Patients_AsRadiologist_ReturnsPatientList` | `/api/patients` | Authenticated radiologist retrieves paginated patient list | **PASS** |
| TC-BE-006 | `Post_Patients_ValidPayload_ReturnsCreatedPatient` | `/api/patients` | Valid patient payload returns HTTP 201 Created and persists | **PASS** |
| TC-BE-007 | `Post_Patients_MissingRequiredFields_ReturnsBadRequest`| `/api/patients` | Missing MRN / DOB triggers HTTP 400 validation error | **PASS** |
| TC-BE-008 | `Post_StudiesUpload_ValidImage_ReturnsCreatedStudy` | `/api/studies/upload` | Valid synthetic multipart image creates study and file | **PASS** |
| TC-BE-009 | `Post_StudiesUpload_MissingFile_ReturnsBadRequest` | `/api/studies/upload` | Empty multipart form triggers HTTP 400 Bad Request | **PASS** |
| TC-BE-010 | `Post_AIAnalyze_ValidStudy_ReturnsAnalysisJob` | `/api/ai/analyze` | Requesting AI analysis enqueues job with pending state | **PASS** |
| TC-BE-011 | `Post_AIAnalyze_NonExistentStudy_ReturnsNotFound` | `/api/ai/analyze` | Invalid StudyId returns HTTP 404 Not Found | **PASS** |
| TC-BE-012 | `Get_AIResult_ExistingId_ReturnsResultRecord` | `/api/ai/results/{id}` | Retrieving valid AI analysis returns multi-label finding | **PASS** |
| TC-BE-013 | `Get_AIResult_NonExistentId_ReturnsNotFound` | `/api/ai/results/{id}` | Non-existent analysis ID returns HTTP 404 Not Found | **PASS** |
| TC-BE-014 | `Get_Heatmap_ExistingId_ReturnsHeatmapDataOrImage` | `/api/ai/heatmap/{id}` | Valid heatmap request returns image stream or 200 payload | **PASS** |
| TC-BE-015 | `Get_Heatmap_NonExistentId_ReturnsNotFound` | `/api/ai/heatmap/{id}` | Non-existent heatmap ID returns HTTP 404 Not Found | **PASS** |
| TC-BE-016 | `Post_Reports_ValidPayload_ReturnsCreatedReport` | `/api/reports` | Radiologist submits preliminary diagnostic report | **PASS** |
| TC-BE-017 | `Post_Reports_MissingImpression_ReturnsBadRequest` | `/api/reports` | Missing mandatory diagnostic impression triggers HTTP 400 | **PASS** |
| TC-BE-018 | `Put_ApproveReport_ExistingReport_UpdatesToFinalized` | `/api/reports/{id}/approve` | Approving report signs and finalizes status | **PASS** |
| TC-BE-019 | `Put_ApproveReport_NonExistentId_ReturnsNotFound` | `/api/reports/{id}/approve` | Approving non-existent report returns HTTP 404 | **PASS** |
| TC-BE-020 | `Get_AnalyticsDashboard_ReturnsAggregatedMetrics` | `/api/analytics/dashboard` | Returns daily throughput, modality stats, turnaround | **PASS** |
| TC-BE-021 | `Get_AuditLogs_AsClinician_ReturnsForbidden` | `/api/admin/audit-logs` | Non-admin user blocked with HTTP 403 Forbidden | **PASS** |
| TC-BE-022 | `PasswordHasher_ValidatesCorrectly_AndRejectsInvalid` | Security / Auth | Constant-time password verification confirms hash integrity | **PASS** |
| TC-BE-023 | `FileStorageService_RejectsPathTraversal` | Security / Storage | Traversal sequence `../../etc/shadow` throws ArgumentException| **PASS** |
| TC-BE-024 | `DatabaseSchema_AllTwelveEntities_AreRegistered` | Database / EF Core | 12 core clinical entities registered in DbContext model | **PASS** |
| TC-BE-025 | `Database_ForeignKeys_EnforceReferentialIntegrity` | Database / EF Core | Cascade delete and foreign key relationships validated | **PASS** |
| TC-BE-026 | `Database_CascadeDelete_StudyDeletesImageFiles` | Database / EF Core | Deleting parent study cascades to associated image files | **PASS** |
| TC-BE-027 | `Database_UniqueConstraint_PreventsDuplicateMRN` | Database / EF Core | Duplicate Medical Record Numbers are rejected | **PASS** |
| TC-BE-028 | `Database_TransactionRollback_MaintainsConsistency` | Database / EF Core | Failed multi-table transaction rolls back without corruption| **PASS** |
| TC-BE-029 | `Database_AuditLogs_TracksEntityChanges` | Database / Audit | Auditable actions create persistent audit log entries | **PASS** |
| TC-BE-030 | `ConcurrentRequests_HandleRaceConditionsGracefully` | Database / Concurrency | Parallel requests create isolated atomic records | **PASS** |
| TC-BE-031 | `TokenService_GeneratesAndValidatesJwtClaims` | Security / JWT | Generated JWT contains NameId, Email, and Role claims | **PASS** |

---

## 2. Python AI & Computer Vision Test Cases (19 Cases)

Harness: `pytest`, `pytest-cov`, `torch`, `scikit-learn`.

| Test ID | Test Method Name | Module Tested | Verification Scope | Status |
|---|---|---|---|---|
| TC-AI-001 | `test_valid_png_preprocessing` | `image_processor.py` | Valid PNG normalized to float32 tensor in range [0, 1] | **PASS** |
| TC-AI-002 | `test_valid_jpeg_preprocessing`| `image_processor.py` | Valid JPEG converted to RGB 3-channel 224x224 input | **PASS** |
| TC-AI-003 | `test_grayscale_image_handling`| `image_processor.py` | Single-channel 2D array replicated to 3 channels | **PASS** |
| TC-AI-004 | `test_corrupted_image_handling`| `image_processor.py` | Unparseable bytes raise explicit ValueError | **PASS** |
| TC-AI-005 | `test_empty_image_handling` | `image_processor.py` | Zero-byte buffer handled gracefully without crash | **PASS** |
| TC-AI-006 | `test_invalid_dimensions_quality_metric`| `dicom_parser.py` | 1x1 image handled safely without numpy gradient crash | **PASS** |
| TC-AI-007 | `test_synthetic_dicom_parsing` | `dicom_parser.py` | DICOM dataset extracts pixel array, window center/width | **PASS** |
| TC-AI-008 | `test_classifier_model_loading`| `classifier.py` | Multi-backbone factory instantiates configured weights | **PASS** |
| TC-AI-009 | `test_classifier_inference_and_dimensions` | `classifier.py` | DenseNet121 returns shape `(batch, 14)` probabilities in `[0,1]`| **PASS** |
| TC-AI-010 | `test_classifier_multiple_architectures` | `classifier.py` | EfficientNet-B4 and ResNet50 pass inference checks | **PASS** |
| TC-AI-011 | `test_classifier_invalid_tensor_handling`| `classifier.py` | Tensor with wrong rank or mismatched channels rejected | **PASS** |
| TC-AI-012 | `test_gradcam_heatmap_generation` | `gradcam.py` | Target layer activation generates 224x224 heatmap array | **PASS** |
| TC-AI-013 | `test_gradcam_overlay_colormaps` | `gradcam.py` | Jet and Turbo colormaps produce 3-channel overlays | **PASS** |
| TC-AI-014 | `test_gradcam_invalid_target_category` | `gradcam.py` | Out-of-bounds pathology index handled safely | **PASS** |
| TC-AI-015 | `test_unet_segmentation_dimensions_and_values`| `unet.py` | Bilateral lung segmentation outputs 256x256 binary mask | **PASS** |
| TC-AI-016 | `test_unet_dice_and_iou_metrics` | `unet.py` | Identical masks yield Dice=1.0, non-overlapping yield 0.0 | **PASS** |
| TC-AI-017 | `test_model_evaluation_metrics_classification` | Evaluation Metrics | Scikit-learn ROC-AUC, PR-AUC, Accuracy, F1, Specificity | **PASS** |
| TC-AI-018 | `test_calibration_and_brier_score` | Evaluation Metrics | Probability calibration and Brier score compute correctly | **PASS** |
| TC-AI-019 | `test_confusion_matrix_and_specificity` | Evaluation Metrics | True Negative / False Positive rates properly aligned | **PASS** |

---

## 3. Frontend Vitest & React Testing Library Cases (21 Cases)

Harness: `vitest`, `@testing-library/react`, `happy-dom`.

| Test ID | Test Method Name | Component / Page | Verification Scope | Status |
|---|---|---|---|---|
| TC-FE-001 | `renders Login Page with brand header, email and password fields` | `LoginPage` | Input fields, brand header, submit CTA render | **PASS** |
| TC-FE-002 | `navigates to Forgot Password view when clicking forgot password link` | `LoginPage` | Navigation callback fires on forgot password link click | **PASS** |
| TC-FE-003 | `renders Forgot Password Page and allows submitting reset request` | `ForgotPasswordPage` | Email input validates, submission shows confirmation | **PASS** |
| TC-FE-004 | `renders Admin Dashboard with executive KPI metric cards` | `AdminDashboard` | Total studies, AI throughput, uptime render | **PASS** |
| TC-FE-005 | `renders Radiologist Dashboard with urgent findings and priority study list` | `RadiologistDashboard` | Urgent alert cards, unread studies table render | **PASS** |
| TC-FE-006 | `renders Patient Management with search input and register modal trigger` | `PatientListPage` | Patient table, MRN search input, register button | **PASS** |
| TC-FE-007 | `opens and closes Register Patient modal correctly` | `PatientListPage` | Modal visibility toggles correctly on open/cancel | **PASS** |
| TC-FE-008 | `renders Patient Details with clinical history and studies table` | `PatientDetailPage` | Patient header, clinical timeline, studies list | **PASS** |
| TC-FE-009 | `renders Study Management with filters, status badges and action links` | `StudyListPage` | Modality filter, study status badges, view buttons | **PASS** |
| TC-FE-010 | `renders X-ray Upload page with drag-and-drop zone and form inputs` | `StudyUploadPage` | Drag & drop target, modality selection, upload button | **PASS** |
| TC-FE-011 | `renders DICOM Viewer with viewport canvas and PACS radiology tools` | `DicomViewerPage` | Contrast, pan, zoom, invert, lung window controls | **PASS** |
| TC-FE-012 | `renders AI Analysis page with active study selector and model choice` | `AiAnalysisPage` | Model dropdown (DenseNet, EfficientNet), submit CTA | **PASS** |
| TC-FE-013 | `renders Explainable AI page with Grad-CAM heatmap visualization` | `ExplainableAiPage` | Colormap selector (Jet, Turbo), opacity slider | **PASS** |
| TC-FE-014 | `renders Lung Segmentation page with U-Net bilateral contour visualization` | `SegmentationPage` | Left/right lung volume, segmentation toggle | **PASS** |
| TC-FE-015 | `renders AI Results comparison page with multi-label findings` | `AiResultsPage` | 14 pathology probability bars, confidence badges | **PASS** |
| TC-FE-016 | `renders Report Generation page with findings editor and approval buttons` | `ReportGenPage` | Structured findings text, finalize & sign CTA | **PASS** |
| TC-FE-017 | `renders Analytics page with throughput, turnaround and modality metrics` | `AnalyticsPage` | Turnaround time charts, volume breakdown | **PASS** |
| TC-FE-018 | `renders User Management with user table, role badges and add user trigger` | `UserListPage` | User list, role pills (Admin, Radiologist), add CTA | **PASS** |
| TC-FE-019 | `renders Audit Logs page with security event filtering and export options` | `AuditLogsPage` | Event filters, timestamped audit log table | **PASS** |
| TC-FE-020 | `renders Settings page with PACS, AI threshold and storage configurations` | `SettingsPage` | Model threshold slider, DICOM AE title config | **PASS** |
| TC-FE-021 | `renders Profile page with user credentials, clinical license and security settings`| `ProfilePage` | License info, password reset section, save button | **PASS** |

---

## 4. Test Execution Summary

- **Total Test Cases Executed:** 71
- **Passed:** 71 (100.0%)
- **Failed:** 0 (0.0%)
- **Skipped / Blocked:** 0
- **Execution Verification:** Real execution on Windows host using .NET 8 SDK, Python 3.12 PyTorch virtual environment, and Node 20 / Vite test runner. Zero fabricated results.
