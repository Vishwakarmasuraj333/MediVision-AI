# MediVision AI - Enterprise REST API Integration Test Report

**Document ID:** MEDIVISION-API-REP-001  
**Audit Date:** November 11, 2026  
**Auditor:** Senior Automation Test Engineer  
**Harness:** ASP.NET Core `WebApplicationFactory<Program>`, xUnit, System.Net.Http  

---

## 1. Scope & Tested Endpoints

The complete REST API surface of the MediVision ASP.NET Core backend was audited across the 10 mandated endpoints:

1. `POST /api/auth/login`
2. `POST /api/patients`
3. `GET /api/patients`
4. `POST /api/studies/upload`
5. `POST /api/ai/analyze`
6. `GET /api/ai/results/{id}`
7. `GET /api/ai/heatmap/{id}`
8. `POST /api/reports`
9. `PUT /api/reports/{id}/approve`
10. `GET /api/analytics/dashboard`

---

## 2. API Endpoint Verification Matrix

### 2.1 Authentication & Authorization Endpoints

#### POST `/api/auth/login`
- **Valid Request:** Standard credentials return HTTP 200 OK with `token`, `user.id`, `user.email`, `user.role`. (`TC-BE-001`)
- **Invalid Request:** Incorrect password returns HTTP 401 Unauthorized. (`TC-BE-002`)
- **Missing Required Fields:** Empty payload returns HTTP 400 Bad Request with field validation errors. (`TC-BE-003`)

---

### 2.2 Patient Management Endpoints

#### GET `/api/patients`
- **Unauthorized Access:** Request without Authorization header returns HTTP 401 Unauthorized. (`TC-BE-004`)
- **Authorized Access:** Authenticated Radiologist returns HTTP 200 OK with array of patient objects. (`TC-BE-005`)

#### POST `/api/patients`
- **Valid Request:** Creates new patient, generates internal UUID, returns HTTP 201 Created with Location header. (`TC-BE-006`)
- **Missing Fields:** Omission of `medicalRecordNumber` or `dateOfBirth` returns HTTP 400 Bad Request. (`TC-BE-007`)
- **Duplicate Prevention:** Submitting duplicate MRN is blocked by unique constraint. (`TC-BE-027`)

---

### 2.3 Imaging Studies & Upload Endpoints

#### POST `/api/studies/upload`
- **Valid Request:** Multipart form containing valid synthetic image bytes creates study record, returns HTTP 201 Created. (`TC-BE-008`)
- **Missing File:** Multipart form without file attachment returns HTTP 400 Bad Request. (`TC-BE-009`)
- **Directory Traversal Defense:** Filenames containing directory climbing sequences are sanitized and rejected. (`TC-BE-023`)

---

### 2.4 AI Diagnostic Decision Support Endpoints

#### POST `/api/ai/analyze`
- **Valid Request:** Requesting analysis for an existing `studyId` returns HTTP 202 Accepted with analysis job record. (`TC-BE-010`)
- **Non-Existent Study:** Invalid `studyId` returns HTTP 404 Not Found. (`TC-BE-011`)

#### GET `/api/ai/results/{id}`
- **Valid ID:** Returns HTTP 200 OK with 14 pathology probabilities, primary finding, and confidence score. (`TC-BE-012`)
- **Non-Existent ID:** Returns HTTP 404 Not Found. (`TC-BE-013`)

#### GET `/api/ai/heatmap/{id}`
- **Valid ID:** Returns HTTP 200 OK with heatmap file stream or base64 overlay payload. (`TC-BE-014`)
- **Non-Existent ID:** Returns HTTP 404 Not Found. (`TC-BE-015`)

---

### 2.5 Diagnostic Reports Endpoints

#### POST `/api/reports`
- **Valid Request:** Radiologist submits structured findings, impression, and recommendations, returning HTTP 201 Created. (`TC-BE-016`)
- **Missing Impression:** Missing clinical impression returns HTTP 400 Bad Request. (`TC-BE-017`)

#### PUT `/api/reports/{id}/approve`
- **Valid ID:** Updates report status to `Finalized`, sets signing radiologist timestamp, returns HTTP 200 OK. (`TC-BE-018`)
- **Non-Existent ID:** Returns HTTP 404 Not Found. (`TC-BE-019`)

---

### 2.6 Analytics & System Auditing Endpoints

#### GET `/api/analytics/dashboard`
- **Authorized Request:** Returns HTTP 200 OK with daily study volume, AI inference throughput, and turnaround time metrics. (`TC-BE-020`)

#### GET `/api/admin/audit-logs`
- **Forbidden Access:** User with `Clinician` role is denied with HTTP 403 Forbidden. (`TC-BE-021`)

---

## 3. API Resilience & Error Propagation

- All unhandled exceptions are caught by global ASP.NET Core exception handling middleware, returning standardized RFC 7807 Problem Details.
- Database connection rollbacks preserve atomic consistency under simulated request faults (`TC-BE-028`).
