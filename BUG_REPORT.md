# MediVision AI - Enterprise Bug Report & Remediation Log

**Document ID:** MEDIVISION-BUG-LOG-001  
**Audit Date:** November 11, 2026  
**Status:** All Discovered Defects Remediated and Verified  

---

## 1. Summary of Discovered Defects

| Bug ID | Severity | Subsystem / Module | Description | Status |
|---|---|---|---|---|
| **BUG-001** | High | Deployment / Docker | Frontend Dockerfile referenced invalid Nginx path context | **FIXED & VERIFIED** |
| **BUG-002** | High | Backend / API | `AnalysisController` routing ambiguity prevented endpoint resolution | **FIXED & VERIFIED** |
| **BUG-003** | Medium | AI Service / Preprocessing | Numpy gradient shape bounds error on 1x1 image inputs | **FIXED & VERIFIED** |
| **BUG-004** | Critical | Backend / Security | Incomplete path traversal sanitization in `FileStorageService` | **FIXED & VERIFIED** |
| **BUG-005** | High | Backend / Security | Insecure plain-text bypass in `PasswordHasher.VerifyPassword` | **FIXED & VERIFIED** |
| **BUG-006** | Medium | Frontend / Test Harness | JSDOM ESM CSS-calc incompatibility under Node 20.16 | **FIXED & VERIFIED** |

---

## 2. Detailed Defect Reports

### BUG-001: Frontend Dockerfile Invalid Nginx Configuration Context
- **Severity:** High (Build Breaker)
- **Component:** `docker/Dockerfile.frontend`, `docker/docker-compose.yml`
- **Reproduction:** Running `docker compose build frontend` failed with `COPY ./docker/nginx.conf ... failed: file not found`.
- **Root Cause:** Build context was set to `../frontend`, but Dockerfile attempted to copy `./docker/nginx.conf` relative to root.
- **Remediation:** Copied `nginx.conf` into `frontend/nginx.conf` and updated `docker/Dockerfile.frontend` to `COPY nginx.conf /etc/nginx/conf.d/default.conf`.
- **Verification:** Verified Dockerfile references local `nginx.conf` present inside `frontend/`.

---

### BUG-002: ASP.NET Core `AnalysisController` Ambiguous Endpoint Route
- **Severity:** High (Runtime API Error)
- **Component:** `backend/src/MediVision.API/Controllers/AnalysisController.cs`
- **Reproduction:** Calling `POST /api/ai/analyze` or `GET /api/ai/results/{id}` produced `AmbiguousMatchException: The request matched multiple endpoints`.
- **Root Cause:** The class was decorated with `[Route("api/ai")]`, while individual actions were decorated with absolute routes `[HttpPost("/api/ai/analyze")]` and `[HttpGet("/api/ai/results/{id}")]`, creating conflicting routing tables.
- **Remediation:** Removed the redundant controller-level route attribute and standardized action-level routing attributes.
- **Verification:** Verified via `TestWebApplicationFactory` in `TC-BE-010` and `TC-BE-012`; all endpoints returned expected HTTP 200/201 responses.

---

### BUG-003: DICOM Quality Assessment Numerical Gradient Error on Small Tensors
- **Severity:** Medium (AI Pipeline Edge Case)
- **Component:** `ai-service/app/utils/dicom_parser.py`
- **Reproduction:** Passing an image with height or width < 2 to `evaluate_image_quality()` triggered `ValueError: Shape of array too small to calculate a numerical gradient`.
- **Root Cause:** `np.gradient(arr)` requires at least 2 coordinate points along each dimension to compute differences.
- **Remediation:** Added dimension validation:
  ```python
  if arr.ndim >= 2 and arr.shape[0] >= 2 and arr.shape[1] >= 2:
      gy, gx = np.gradient(arr.astype(np.float64))
      sharpness = float(np.mean(np.sqrt(gx**2 + gy**2)))
  else:
      sharpness = 0.0
  ```
- **Verification:** Verified with test case `TC-AI-006` (`test_invalid_dimensions_quality_metric`); passed with 0 errors.

---

### BUG-004: Potential Directory Traversal in File Storage Provider
- **Severity:** Critical (CWE-22 / Path Traversal)
- **Component:** `backend/src/MediVision.Infrastructure/Services/FileStorageService.cs`
- **Reproduction:** Passing filenames containing `../../` or `..\..\` resolved outside the intended `/storage/uploads/` sandbox.
- **Root Cause:** `Path.Combine(rootPath, relativePath)` does not prevent directory climbing if relative path contains parent directory markers.
- **Remediation:** Enforced canonicalized path verification:
  ```csharp
  var fullPath = Path.GetFullPath(Path.Combine(_baseStoragePath, relativePath));
  var rootPath = Path.GetFullPath(_baseStoragePath);
  if (!fullPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase))
  {
      throw new ArgumentException("Path traversal sequence detected.", nameof(relativePath));
  }
  ```
- **Verification:** Verified via test case `TC-BE-023`; directory escape sequences throw `ArgumentException`.

---

### BUG-005: Insecure Password Hash Verification Bypass
- **Severity:** High (CWE-305 / Authentication Bypass)
- **Component:** `backend/src/MediVision.Infrastructure/Services/PasswordHasher.cs`
- **Reproduction:** Plain-text comparison fallback in development branch could permit unauthorized credential matching.
- **Root Cause:** Insecure legacy fallback logic permitted plain-text equality checks.
- **Remediation:** Removed plain-text bypass. Enforced strict SHA-256 salted hashing with constant-time byte comparison using `CryptographicOperations.FixedTimeEquals`.
- **Verification:** Verified via test case `TC-BE-022`; only cryptographically hashed credentials validate successfully.

---

### BUG-006: JSDOM CSS-Calc ESM Module Resolution Failure in Vitest
- **Severity:** Medium (Test Harness Blocker)
- **Component:** `frontend/vitest.config.ts`
- **Reproduction:** Running `npm test` with `environment: 'jsdom'` caused `ERR_REQUIRE_ESM` inside `@csstools/css-calc`.
- **Root Cause:** Modern jsdom package uses pure ESM CSS parsing modules that fail under standard Node.js CJS module loaders without experimental flags.
- **Remediation:** Migrated the frontend test runner environment to `happy-dom`, which provides high-fidelity DOM simulation without ESM compatibility bugs.
- **Verification:** All 5 test suites (21 test cases) executed cleanly in under 7 seconds.
