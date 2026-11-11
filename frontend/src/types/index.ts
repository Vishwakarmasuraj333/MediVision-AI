export type UserRole = 'Admin' | 'Radiologist' | 'Researcher' | 'ReferringPhysician';

export type StudyStatus = 'Uploaded' | 'Analyzing' | 'Analyzed' | 'InReview' | 'Approved' | 'Rejected';
export type StudyUrgency = 'Routine' | 'Urgent' | 'Stat';
export type ReportStatus = 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'AddendumRequired';
export type RiskCategory = 'Normal' | 'LowRisk' | 'ModerateSuspicion' | 'HighSuspicion';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  medicalLicenseNumber?: string;
  digitalSignatureText?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface Patient {
  id: string;
  patientIdentifier: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  medicalHistorySummary?: string;
  allergies?: string;
  emergencyContact?: string;
  isSynthetic: boolean;
  totalStudies: number;
  createdAt: string;
}

export interface ImageFile {
  id: string;
  studyId: string;
  fileName: string;
  storageUrl: string;
  contentType: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  qualityCheckPassed: boolean;
  qualityCheckDetailsJson?: string;
  dicomMetadataJson?: string;
  createdAt: string;
}

export interface FindingScore {
  condition: string;
  rawScore: number;
  calibratedProbability: number;
  confidenceLower95: number;
  confidenceUpper95: number;
  isPositive: boolean;
  severityLevel: 'High' | 'Moderate' | 'Low' | 'Minimal' | 'None';
}

export interface AIResult {
  id: string;
  jobId: string;
  primaryFinding: string;
  overallConfidence: number;
  riskCategory: RiskCategory;
  classifications: FindingScore[];
  findingsSummary: string;
  gradCamHeatmapUrl?: string;
  gradCamOverlayUrl?: string;
  lungSegmentationMaskUrl?: string;
  lungSegmentationOverlayUrl?: string;
  diceScore?: number;
  ioUMetric?: number;
  leftLungAreaPixels?: number;
  rightLungAreaPixels?: number;
  cardiothoracicRatio?: number;
  researchDisclaimer: string;
  createdAt: string;
}

export interface AIAnalysisJob {
  id: string;
  studyId: string;
  imageFileId: string;
  modelVersionId: string;
  modelName: string;
  modelArchitecture: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
  progressPercentage: number;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  gpuDeviceUsed?: string;
  errorMessage?: string;
  result?: AIResult;
  createdAt: string;
}

export interface RadiologistReview {
  id: string;
  reportId: string;
  radiologistId: string;
  radiologistName: string;
  decision: 'Approved' | 'Modified' | 'Rejected';
  reviewerNotes?: string;
  agreementScore: number;
  aiSuggestionsAccepted?: string;
  aiSuggestionsRejected?: string;
  digitalSignatureHash: string;
  reviewedAt: string;
}

export interface Report {
  id: string;
  studyId: string;
  aiResultId?: string;
  authorId: string;
  authorName: string;
  reportIdentifier: string;
  title: string;
  clinicalIndication?: string;
  technique?: string;
  comparisonStudy?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  criticalFindingAlert: boolean;
  status: ReportStatus;
  generatedPdfPath?: string;
  approvedAt?: string;
  reviews: RadiologistReview[];
  createdAt: string;
  updatedAt: string;
}

export interface ImagingStudy {
  id: string;
  studyInstanceUid: string;
  patientId: string;
  patientIdentifier: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  accessionNumber: string;
  modality: string;
  bodyPart: string;
  studyDate: string;
  description?: string;
  clinicalIndication?: string;
  referringPhysician?: string;
  performingFacility: string;
  status: StudyStatus;
  urgency: StudyUrgency;
  images: ImageFile[];
  latestJob?: AIAnalysisJob;
  report?: Report;
  createdAt: string;
}

export interface AIModelVersion {
  id: string;
  modelIdentifier: string;
  displayName: string;
  architecture: string;
  version: string;
  parametersCount: number;
  trainingDataset: string;
  aurocScore: number;
  auprcScore: number;
  f1Score: number;
  precisionScore: number;
  recallScore: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  outcome: string;
  timestamp: string;
}

export interface AnalyticsDashboard {
  totalPatients: number;
  totalStudies: number;
  completedAiAnalyses: number;
  pendingReviews: number;
  approvedReports: number;
  failedJobs: number;
  averageLatencyMs: number;
  modalityDistribution: { modality: string; count: number; percentage: number }[];
  abnormalityPrevalence: { finding: string; count: number; averageConfidence: number }[];
  weeklyTrends: { week: string; studiesUploaded: number; aiAnalyses: number; reportsApproved: number }[];
  latencyByModel: { modelName: string; p50Ms: number; p95Ms: number; p99Ms: number }[];
  recentActivities: AuditLog[];
}

