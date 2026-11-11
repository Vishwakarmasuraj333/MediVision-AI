import {
  User,
  Patient,
  ImagingStudy,
  AIModelVersion,
  Report,
  AnalyticsDashboard,
  AuditLog,
  AIAnalysisJob,
  AIResult,
  FindingScore
} from '../types';

const API_BASE = '/api';

// --- INITIAL SYNTHETIC RESEARCH DATASET ---
export const MOCK_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@medivision.ai',
    fullName: 'Dr. Alexander Hayes, Ph.D.',
    role: 'Admin',
    department: 'Medical Informatics & Systems Engineering',
    digitalSignatureText: 'A. Hayes, Chief Systems Officer',
    isActive: true,
    lastLoginAt: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dr.elena.vance@medivision.ai',
    fullName: 'Dr. Elena Vance, MD, FACR',
    role: 'Radiologist',
    department: 'Thoracic Imaging Division',
    medicalLicenseNumber: 'RAD-NY-849204',
    digitalSignatureText: 'Elena Vance, MD, Board-Certified Thoracic Radiologist',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'dr.marcus.chen@medivision.ai',
    fullName: 'Dr. Marcus Chen, MD',
    role: 'Radiologist',
    department: 'Cardiothoracic Radiology Section',
    medicalLicenseNumber: 'RAD-CA-551982',
    digitalSignatureText: 'Marcus Chen, MD, Clinical Radiologist',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'researcher.sarah@medivision.ai',
    fullName: 'Sarah Jenkins, M.Sc.',
    role: 'Researcher',
    department: 'Computational Imaging AI Lab',
    digitalSignatureText: 'S. Jenkins, Lead AI Research Scientist',
    isActive: true,
    lastLoginAt: new Date(Date.now() - 14400000).toISOString()
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
    patientIdentifier: 'MV-PAT-2026-001',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    dateOfBirth: '1962-04-12',
    age: 64,
    gender: 'Male',
    bloodGroup: 'O+',
    medicalHistorySummary: 'Chronic Obstructive Pulmonary Disease (COPD), 30 pack-year tobacco history, Exertional dyspnea.',
    allergies: 'Penicillin',
    emergencyContact: 'Martha Pendelton (Spouse) +1-555-0192',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
    patientIdentifier: 'MV-PAT-2026-002',
    firstName: 'Beatrice',
    lastName: 'Sterling',
    dateOfBirth: '1968-11-23',
    age: 58,
    gender: 'Female',
    bloodGroup: 'A+',
    medicalHistorySummary: 'Persistent productive cough for 5 days, low-grade pyrexia, pleuritic right-sided chest discomfort.',
    allergies: 'Sulfa antibiotics',
    emergencyContact: 'Thomas Sterling (Son) +1-555-0143',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3',
    patientIdentifier: 'MV-PAT-2026-003',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    dateOfBirth: '1955-08-04',
    age: 71,
    gender: 'Male',
    bloodGroup: 'B-',
    medicalHistorySummary: 'Hypertensive cardiovascular disease, bilateral lower extremity edema, paroxysmal nocturnal dyspnea.',
    allergies: 'None known',
    emergencyContact: 'Maria Mendoza (Daughter) +1-555-0188',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4',
    patientIdentifier: 'MV-PAT-2026-004',
    firstName: 'Danielle',
    lastName: 'Dubois',
    dateOfBirth: '1981-02-17',
    age: 45,
    gender: 'Female',
    bloodGroup: 'AB+',
    medicalHistorySummary: 'Sudden onset acute sharp left thoracic pain, tachypnea, ruled out pulmonary embolism.',
    allergies: 'Latex, Iodine contrast',
    emergencyContact: 'Jean Dubois (Brother) +1-555-0177',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5',
    patientIdentifier: 'MV-PAT-2026-005',
    firstName: 'Ethan',
    lastName: 'Gallagher',
    dateOfBirth: '1974-06-30',
    age: 52,
    gender: 'Male',
    bloodGroup: 'O-',
    medicalHistorySummary: 'Post-abdominal surgery day 3, shallow breathing, hypoxemia on room air.',
    allergies: 'Aspirin',
    emergencyContact: 'Claire Gallagher (Wife) +1-555-0165',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6',
    patientIdentifier: 'MV-PAT-2026-006',
    firstName: 'Fiona',
    lastName: 'Zhang',
    dateOfBirth: '1993-09-15',
    age: 33,
    gender: 'Female',
    bloodGroup: 'A-',
    medicalHistorySummary: 'Routine occupational health pre-employment chest radiograph screening. Asymptomatic.',
    allergies: 'None',
    emergencyContact: 'Kevin Zhang (Father) +1-555-0132',
    isSynthetic: true,
    totalStudies: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_MODELS: AIModelVersion[] = [
  {
    id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    modelIdentifier: 'chex-densenet121-v2.1',
    displayName: 'DenseNet-121 Multi-Label Chest Classifier',
    architecture: 'DenseNet121',
    version: '2.1.0',
    parametersCount: 7037504,
    trainingDataset: 'NIH ChestX-ray14 + CheXpert Research Cohort',
    aurocScore: 0.892,
    auprcScore: 0.814,
    f1Score: 0.825,
    precisionScore: 0.841,
    recallScore: 0.810,
    isActive: true,
    isDefault: true
  },
  {
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    modelIdentifier: 'chex-efficientnet-b4-v1.4',
    displayName: 'EfficientNet-B4 High-Resolution Radiography Net',
    architecture: 'EfficientNet-B4',
    version: '1.4.0',
    parametersCount: 19341616,
    trainingDataset: 'MIMIC-CXR + NIH ChestX-ray14',
    aurocScore: 0.908,
    auprcScore: 0.842,
    f1Score: 0.851,
    precisionScore: 0.864,
    recallScore: 0.838,
    isActive: true,
    isDefault: false
  },
  {
    id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    modelIdentifier: 'chex-resnet50-v3.0',
    displayName: 'ResNet-50 Deep Residual Radiograph Detector',
    architecture: 'ResNet50',
    version: '3.0.0',
    parametersCount: 25557032,
    trainingDataset: 'NIH ChestX-ray14 (Cleaned)',
    aurocScore: 0.884,
    auprcScore: 0.795,
    f1Score: 0.806,
    precisionScore: 0.821,
    recallScore: 0.792,
    isActive: true,
    isDefault: false
  },
  {
    id: 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4',
    modelIdentifier: 'chex-vit-b16-v1.0',
    displayName: 'Vision Transformer ViT-B/16 Self-Attention Network',
    architecture: 'ViT-B/16',
    version: '1.0.0',
    parametersCount: 86423560,
    trainingDataset: 'CheXpert + MIMIC-CXR Multi-Center Benchmark',
    aurocScore: 0.914,
    auprcScore: 0.857,
    f1Score: 0.862,
    precisionScore: 0.875,
    recallScore: 0.850,
    isActive: true,
    isDefault: false
  }
];

const mockEffusionFindings: FindingScore[] = [
  { condition: 'Pleural Effusion', rawScore: 2.45, calibratedProbability: 0.88, confidenceLower95: 0.82, confidenceUpper95: 0.93, isPositive: true, severityLevel: 'High' },
  { condition: 'Atelectasis', rawScore: 1.10, calibratedProbability: 0.65, confidenceLower95: 0.58, confidenceUpper95: 0.72, isPositive: true, severityLevel: 'Moderate' },
  { condition: 'Consolidation', rawScore: -0.20, calibratedProbability: 0.22, confidenceLower95: 0.16, confidenceUpper95: 0.28, isPositive: false, severityLevel: 'Low' },
  { condition: 'Infiltration', rawScore: 0.45, calibratedProbability: 0.38, confidenceLower95: 0.31, confidenceUpper95: 0.45, isPositive: false, severityLevel: 'Low' },
  { condition: 'Cardiomegaly', rawScore: -0.85, calibratedProbability: 0.14, confidenceLower95: 0.09, confidenceUpper95: 0.19, isPositive: false, severityLevel: 'Low' },
  { condition: 'Pneumonia', rawScore: -1.50, calibratedProbability: 0.08, confidenceLower95: 0.04, confidenceUpper95: 0.12, isPositive: false, severityLevel: 'Minimal' },
  { condition: 'Pneumothorax', rawScore: -2.10, calibratedProbability: 0.04, confidenceLower95: 0.02, confidenceUpper95: 0.07, isPositive: false, severityLevel: 'Minimal' },
  { condition: 'No Finding', rawScore: -2.80, calibratedProbability: 0.03, confidenceLower95: 0.01, confidenceUpper95: 0.06, isPositive: false, severityLevel: 'Minimal' }
];

export const MOCK_STUDIES: ImagingStudy[] = [
  {
    id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
    studyInstanceUid: '1.2.840.113619.2.55.3.60468837.20260311.101',
    patientId: 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
    patientIdentifier: 'MV-PAT-2026-001',
    patientName: 'Arthur Pendelton',
    patientAge: 64,
    patientGender: 'Male',
    accessionNumber: 'ACC-2026-9001',
    modality: 'DX',
    bodyPart: 'CHEST',
    studyDate: new Date(Date.now() - 3600000 * 26).toISOString(),
    description: 'Chest Radiograph Posteroanterior (PA) & Lateral',
    clinicalIndication: 'Dyspnea on minimal exertion; rule out acute infiltrates vs effusion.',
    referringPhysician: 'Dr. Gregory House, MD',
    performingFacility: 'MediVision Academic Medical Center',
    status: 'InReview',
    urgency: 'Urgent',
    images: [
      {
        id: 'img-001',
        studyId: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
        fileName: 'sample_pleural_effusion.png',
        storageUrl: '/samples/sample_pleural_effusion.png',
        contentType: 'image/png',
        fileSizeBytes: 124580,
        width: 1024,
        height: 1024,
        qualityCheckPassed: true,
        qualityCheckDetailsJson: '{"snr_db": 28.4, "contrast": 0.88, "sharpness": 1420.5}',
        dicomMetadataJson: '{"Modality": "DX", "BitsAllocated": 16, "WindowCenter": 2048, "WindowWidth": 4096}',
        createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
      }
    ],
    latestJob: {
      id: 'job-001',
      studyId: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
      imageFileId: 'img-001',
      modelVersionId: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      modelName: 'DenseNet-121 Multi-Label Chest Classifier',
      modelArchitecture: 'DenseNet121',
      status: 'Completed',
      progressPercentage: 100,
      executionTimeMs: 840,
      gpuDeviceUsed: 'NVIDIA A100-SXM4-40GB / PyTorch Accelerated',
      result: {
        id: 'res-001',
        jobId: 'job-001',
        primaryFinding: 'Pleural Effusion',
        overallConfidence: 0.88,
        riskCategory: 'HighSuspicion',
        classifications: mockEffusionFindings,
        findingsSummary: 'DenseNet-121 model attention identified blunting of the right costophrenic sulcus consistent with moderate right pleural effusion (p=0.88, 95% CI: 0.82-0.93), with associated compressive right lower lobe atelectasis.',
        gradCamHeatmapUrl: '/samples/sample_pleural_effusion.png',
        gradCamOverlayUrl: '/samples/sample_pleural_effusion.png',
        lungSegmentationMaskUrl: '/samples/sample_pleural_effusion.png',
        lungSegmentationOverlayUrl: '/samples/sample_pleural_effusion.png',
        diceScore: 0.942,
        ioUMetric: 0.891,
        leftLungAreaPixels: 184500,
        rightLungAreaPixels: 142100,
        cardiothoracicRatio: 0.48,
        researchDisclaimer: 'Investigational AI Decision Support. Requires verified radiologist interpretation.',
        createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
      },
      createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
    },
    report: {
      id: 'rep-001',
      studyId: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
      aiResultId: 'res-001',
      authorId: '22222222-2222-2222-2222-222222222222',
      authorName: 'Dr. Elena Vance, MD, FACR',
      reportIdentifier: 'MV-REP-2026-0001',
      title: 'Radiology Consultation & AI Decision-Support Report',
      clinicalIndication: '64yo male with progressive exertional dyspnea and chronic tobacco use.',
      technique: 'Single frontal PA view acquired at 120 kVp, 4.5 mAs.',
      comparisonStudy: 'None available for comparison.',
      findings: 'LUNGS: Lung volumes are moderately hyperinflated. Blunting of the right costophrenic angle is present, with meniscus sign indicative of moderate right pleural fluid layering. Subsegmental linear opacities in the right base are consistent with compressive atelectasis.\n\nHEART & MEDIASTINUM: Cardiac silhouette is within normal size limits (cardiothoracic ratio 0.48). Mediastinal and hilar contours are unremarkable.\n\nBONES & SOFT TISSUES: Mild degenerative changes of the thoracic spine. No acute rib fractures or osseous lesions identified.',
      impression: '1. Moderate right pleural effusion with associated compressive right basilar atelectasis.\n2. Chronic lung disease changes consistent with patient\'s reported COPD history.\n3. Correlate clinically. Diagnostic thoracentesis or follow-up imaging post-diuresis may be considered per clinical judgement.',
      recommendations: 'Recommend correlation with clinical presentation and consideration of bedside thoracic ultrasound to evaluate for pleural fluid septations.',
      criticalFindingAlert: false,
      status: 'Draft',
      reviews: [],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
    studyInstanceUid: '1.2.840.113619.2.55.3.60468837.20260311.102',
    patientId: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
    patientIdentifier: 'MV-PAT-2026-002',
    patientName: 'Beatrice Sterling',
    patientAge: 58,
    patientGender: 'Female',
    accessionNumber: 'ACC-2026-9002',
    modality: 'CR',
    bodyPart: 'CHEST',
    studyDate: new Date(Date.now() - 3600000 * 18).toISOString(),
    description: 'Chest 1 View Frontal PA',
    clinicalIndication: 'Fever, cough, crackles at right lung base. Suspected community acquired pneumonia.',
    referringPhysician: 'Dr. Allison Cameron, MD',
    performingFacility: 'MediVision Academic Medical Center',
    status: 'InReview',
    urgency: 'Urgent',
    images: [
      {
        id: 'img-002',
        studyId: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
        fileName: 'sample_pneumonia.png',
        storageUrl: '/samples/sample_pneumonia.png',
        contentType: 'image/png',
        fileSizeBytes: 118400,
        width: 1024,
        height: 1024,
        qualityCheckPassed: true,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
    studyInstanceUid: '1.2.840.113619.2.55.3.60468837.20260311.103',
    patientId: 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3',
    patientIdentifier: 'MV-PAT-2026-003',
    patientName: 'Carlos Mendoza',
    patientAge: 71,
    patientGender: 'Male',
    accessionNumber: 'ACC-2026-9003',
    modality: 'DX',
    bodyPart: 'CHEST',
    studyDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    description: 'Chest Frontal Portable AP',
    clinicalIndication: 'Congestive heart failure exacerbation, assess cardiomegaly and vascular congestion.',
    referringPhysician: 'Dr. Eric Foreman, MD',
    performingFacility: 'MediVision Academic Medical Center',
    status: 'Approved',
    urgency: 'Routine',
    images: [
      {
        id: 'img-003',
        studyId: 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
        fileName: 'sample_cardiomegaly.png',
        storageUrl: '/samples/sample_cardiomegaly.png',
        contentType: 'image/png',
        fileSizeBytes: 132100,
        width: 1024,
        height: 1024,
        qualityCheckPassed: true,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6',
    studyInstanceUid: '1.2.840.113619.2.55.3.60468837.20260311.106',
    patientId: 'e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6',
    patientIdentifier: 'MV-PAT-2026-006',
    patientName: 'Fiona Zhang',
    patientAge: 33,
    patientGender: 'Female',
    accessionNumber: 'ACC-2026-9006',
    modality: 'DX',
    bodyPart: 'CHEST',
    studyDate: new Date(Date.now() - 3600000).toISOString(),
    description: 'Chest PA Standard Projection',
    clinicalIndication: 'Pre-employment baseline screening.',
    referringPhysician: 'Dr. James Wilson, MD',
    performingFacility: 'MediVision Academic Medical Center',
    status: 'Approved',
    urgency: 'Routine',
    images: [
      {
        id: 'img-006',
        studyId: 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6',
        fileName: 'sample_normal.png',
        storageUrl: '/samples/sample_normal.png',
        contentType: 'image/png',
        fileSizeBytes: 109200,
        width: 1024,
        height: 1024,
        qualityCheckPassed: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1', userEmail: 'system@medivision.ai', action: 'DATABASE_INITIALIZATION', resource: 'SYSTEM', details: 'Database initialized and seeded with synthetic research cohort.', outcome: 'Success', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', userEmail: 'dr.elena.vance@medivision.ai', action: 'LOGIN', resource: 'AUTH', details: 'Radiologist authenticated via JWT bearer token.', ipAddress: '10.0.1.45', outcome: 'Success', timestamp: new Date(Date.now() - 3600000 * 25).toISOString() },
  { id: '3', userEmail: 'dr.elena.vance@medivision.ai', action: 'RUN_AI_INFERENCE', resource: 'STUDY', resourceId: 'ACC-2026-9001', details: 'DenseNet121 multi-label inference executed with Grad-CAM & U-Net.', ipAddress: '10.0.1.45', outcome: 'Success', timestamp: new Date(Date.now() - 3600000 * 25).toISOString() },
  { id: '4', userEmail: 'dr.elena.vance@medivision.ai', action: 'CREATE_REPORT_DRAFT', resource: 'REPORT', resourceId: 'MV-REP-2026-0001', details: 'Draft radiologist report initiated incorporating AI findings.', ipAddress: '10.0.1.45', outcome: 'Success', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: '5', userEmail: 'dr.marcus.chen@medivision.ai', action: 'VIEW_STUDY', resource: 'STUDY', resourceId: 'ACC-2026-9003', details: 'Cardiothoracic review opened in DICOM viewer.', ipAddress: '10.0.1.48', outcome: 'Success', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '6', userEmail: 'dr.marcus.chen@medivision.ai', action: 'APPROVE_REPORT', resource: 'REPORT', resourceId: 'MV-REP-2026-0003', details: 'Radiologist digital signature confirmed. Report finalized.', ipAddress: '10.0.1.48', outcome: 'Success', timestamp: new Date(Date.now() - 3600000 * 11).toISOString() }
];

export const MOCK_ANALYTICS: AnalyticsDashboard = {
  totalPatients: 6,
  totalStudies: 6,
  completedAiAnalyses: 5,
  pendingReviews: 2,
  approvedReports: 2,
  failedJobs: 0,
  averageLatencyMs: 645,
  modalityDistribution: [
    { modality: 'DX (Digital X-Ray)', count: 4, percentage: 66.7 },
    { modality: 'CR (Computed Radiography)', count: 2, percentage: 33.3 }
  ],
  abnormalityPrevalence: [
    { finding: 'Pleural Effusion', count: 24, averageConfidence: 0.86 },
    { finding: 'Cardiomegaly', count: 19, averageConfidence: 0.81 },
    { finding: 'Atelectasis', count: 15, averageConfidence: 0.74 },
    { finding: 'Consolidation', count: 11, averageConfidence: 0.69 },
    { finding: 'Pneumonia', count: 8, averageConfidence: 0.72 },
    { finding: 'Pneumothorax', count: 5, averageConfidence: 0.89 },
    { finding: 'No Finding', count: 38, averageConfidence: 0.94 }
  ],
  weeklyTrends: [
    { week: 'Week 1', studiesUploaded: 18, aiAnalyses: 16, reportsApproved: 14 },
    { week: 'Week 2', studiesUploaded: 24, aiAnalyses: 22, reportsApproved: 19 },
    { week: 'Week 3', studiesUploaded: 31, aiAnalyses: 29, reportsApproved: 27 },
    { week: 'Week 4', studiesUploaded: 42, aiAnalyses: 39, reportsApproved: 36 }
  ],
  latencyByModel: [
    { modelName: 'DenseNet121', p50Ms: 520, p95Ms: 840, p99Ms: 1120 },
    { modelName: 'EfficientNet-B4', p50Ms: 680, p95Ms: 1050, p99Ms: 1380 },
    { modelName: 'ResNet50', p50Ms: 490, p95Ms: 780, p99Ms: 990 },
    { modelName: 'ViT-B/16', p50Ms: 890, p95Ms: 1420, p99Ms: 1860 }
  ],
  recentActivities: MOCK_AUDIT_LOGS
};

