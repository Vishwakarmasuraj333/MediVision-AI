# MediVision AI - Artificial Intelligence & Computer Vision Validation Report

**Document ID:** MEDIVISION-AI-VAL-001  
**Audit Date:** November 11, 2026  
**Auditor:** Senior AI/ML Validation Engineer  
**Harness:** PyTest 9.2.0 / scikit-learn 1.6.1 / PyTorch 2.5.1 / Pydicom 3.0.1  

---

## 1. Regulatory & Clinical Safety Disclaimer

> [!IMPORTANT]
> **RESEARCH & DECISION SUPPORT USE ONLY.**  
> MediVision AI is designed as a clinical decision support tool for certified radiologists. Software automated unit and integration tests verify code correctness, numerical stability, and tensor pipeline integrity. Passing software quality assurance tests does **NOT** constitute medical validation, clinical diagnostic efficacy, or FDA/CE-mark clearance. Model confidence probabilities must never be interpreted as diagnostic certainty.

---

## 2. Multi-Label Pathology Classification Pipeline

The classification engine analyzes frontal chest radiographs (CXR) for 14 cardiopulmonary conditions:
1. Atelectasis
2. Cardiomegaly
3. Consolidation
4. Edema
5. Effusion
6. Emphysema
7. Fibrosis
8. Hernia
9. Infiltration
10. Mass
11. Nodule
12. Pleural Thickening
13. Pneumonia
14. Pneumothorax

### 2.1 Model Architectures & Pipeline Verification

| Architecture | Input Dimensions | Preprocessing | Activation Function | Verification Status |
|---|---|---|---|---|
| **DenseNet-121** | 224 x 224 x 3 | ImageNet Norm | Multi-label Sigmoid | **VERIFIED** (`TC-AI-008/009`) |
| **EfficientNet-B4**| 380 x 380 x 3 | ImageNet Norm | Multi-label Sigmoid | **VERIFIED** (`TC-AI-010`) |
| **ResNet-50** | 224 x 224 x 3 | ImageNet Norm | Multi-label Sigmoid | **VERIFIED** (`TC-AI-010`) |

### 2.2 Numerical & Mathematical Validation
- Output probabilities strictly bounded in interval `[0.0, 1.0]` across all 14 pathology heads.
- Tensor shapes strictly verified as `(N, 14)` where $N$ is batch size.
- Invalid input tensors (wrong channel count, wrong rank, corrupted bytes) cleanly raise handled exceptions without unhandled kernel crashes (`TC-AI-011`).

---

## 3. Explainable AI (Grad-CAM) Validation

Grad-CAM (Gradient-weighted Class Activation Mapping) is implemented on the final convolutional layer of the backbone (e.g., `features.denseblock4.denselayer16` for DenseNet-121).

- **Activation Map Resolution:** Interpolated to match native input dimension (224 x 224).
- **Colormaps:** Jet and Turbo colormap transformations verified (`TC-AI-013`).
- **Overlay Blending:** Alpha blending range `[0.0, 1.0]` verified; default $\alpha = 0.4$.
- **Edge Conditions:** Out-of-bounds pathology index handling verified (`TC-AI-014`).

---

## 4. Lung Segmentation (U-Net) Validation

A 4-level encoder-decoder U-Net architecture with skip connections segments left and right lung fields from background thoracic anatomy.

| Metric | Verification Test | Observed Value | Minimum Threshold | Status |
|---|---|---|---|---|
| **Mask Dimensions** | `TC-AI-015` | 256 x 256 x 1 | Match input | **VERIFIED** |
| **Mask Binarization** | `TC-AI-015` | $\{0, 1\}$ | Binary discrete | **VERIFIED** |
| **Identical Masks Dice**| `TC-AI-016` | 1.000 | 1.000 | **VERIFIED** |
| **Disjoint Masks Dice** | `TC-AI-016` | 0.000 | 0.000 | **VERIFIED** |
| **Identical Masks IoU** | `TC-AI-016` | 1.000 | 1.000 | **VERIFIED** |

---

## 5. Statistical Evaluation Metrics via scikit-learn

Automated pipeline validation (`TC-AI-017`, `TC-AI-018`, `TC-AI-019`) verified the computational accuracy of the clinical metrics reporting suite:

- **ROC-AUC (Area Under Receiver Operating Characteristic):** Computes per-class and macro-average curves.
- **PR-AUC (Precision-Recall Area Under Curve):** Sensitive to severe class imbalance prevalent in clinical datasets.
- **Sensitivity / Recall:** Measures positive case detection rate: $\frac{TP}{TP + FN}$.
- **Specificity:** Measures true negative rate: $\frac{TN}{TN + FP}$.
- **Brier Score / Calibration:** Measures reliability of predicted probabilities against binary ground truth.
- **Confusion Matrix:** Correctly maps True Positives, False Positives, True Negatives, and False Negatives.

---

## 6. DICOM Parsing & Quality Preprocessing

- Validated using synthetic DICOM fixtures (`TC-AI-007`).
- Correctly parses DICOM tags: Modality (`CR`, `DX`), Patient ID, Study Date, Window Center, Window Width.
- High dynamic range 16-bit monochrome arrays rescaled to 8-bit visual range.
- Bounds protection against degenerate arrays ($< 2 \times 2$) prevents gradient crashes (`BUG-003`).
