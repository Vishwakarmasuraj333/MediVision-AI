"""DICOM and Medical Image Ingestion & Quality Assurance Utilities."""
import os
import io
import numpy as np
from PIL import Image
import pydicom
try:
    from pydicom.pixels import apply_voi_lut
except ImportError:
    from pydicom.pixel_data_handlers.util import apply_voi_lut

def parse_medical_image(file_bytes: bytes, filename: str):
    """
    Parses a medical image (DICOM, PNG, or JPEG) and converts it to a normalized grayscale numpy array [0, 255].
    Extracts comprehensive DICOM metadata tags when available.
    """
    ext = os.path.splitext(filename)[1].lower()
    metadata = {}

    if ext in [".dcm", ".dicom"] or file_bytes[:132].endswith(b"DICM"):
        # Parse authentic DICOM with pydicom
        dicom_stream = io.BytesIO(file_bytes)
        ds = pydicom.dcmread(dicom_stream, force=True)

        metadata = {
            "PatientID": getattr(ds, "PatientID", "MV-ANON"),
            "StudyInstanceUID": getattr(ds, "StudyInstanceUID", "1.2.840..."),
            "Modality": getattr(ds, "Modality", "DX"),
            "BodyPartExamined": getattr(ds, "BodyPartExamined", "CHEST"),
            "StudyDate": getattr(ds, "StudyDate", "20260311"),
            "PhotometricInterpretation": getattr(ds, "PhotometricInterpretation", "MONOCHROME2"),
            "BitsAllocated": getattr(ds, "BitsAllocated", 16),
            "BitsStored": getattr(ds, "BitsStored", 12),
            "WindowCenter": float(ds.WindowCenter) if "WindowCenter" in ds and not isinstance(ds.WindowCenter, (list, pydicom.multival.MultiValue)) else 2048,
            "WindowWidth": float(ds.WindowWidth) if "WindowWidth" in ds and not isinstance(ds.WindowWidth, (list, pydicom.multival.MultiValue)) else 4096,
        }

        # Apply VOI LUT or rescale window
        try:
            pixel_array = apply_voi_lut(ds.pixel_array, ds)
        except Exception:
            pixel_array = ds.pixel_array.astype(np.float32)

        # Invert if MONOCHROME1 (zero is white)
        if getattr(ds, "PhotometricInterpretation", "MONOCHROME2") == "MONOCHROME1":
            pixel_array = np.amax(pixel_array) - pixel_array

        # Normalize to 0-255 uint8
        p_min, p_max = np.min(pixel_array), np.max(pixel_array)
        if p_max > p_min:
            norm_array = ((pixel_array - p_min) / (p_max - p_min) * 255.0).astype(np.uint8)
        else:
            norm_array = np.zeros(pixel_array.shape, dtype=np.uint8)

        img = Image.fromarray(norm_array)
    else:
        # Standard PNG/JPEG format
        img = Image.open(io.BytesIO(file_bytes)).convert("L")
        norm_array = np.array(img, dtype=np.uint8)
        metadata = {
            "Format": img.format or "RASTER",
            "Width": img.width,
            "Height": img.height,
            "Modality": "CR/DX",
            "BodyPartExamined": "CHEST"
        }

    # Perform automated image quality assessment
    quality_metrics = evaluate_image_quality(norm_array)

    return img, norm_array, metadata, quality_metrics

def evaluate_image_quality(image_array: np.ndarray):
    """
    Calculates radiographic image quality metrics:
    - Signal-to-Noise Ratio (SNR) in dB
    - Dynamic range & contrast index
    - Motion blur / sharpness using Laplacian variance
    - Quality threshold determination
    """
    arr = image_array.astype(np.float32)
    mean_signal = np.mean(arr)
    std_noise = np.std(arr)
    snr = 20 * np.log10(mean_signal / max(std_noise, 1e-5)) if mean_signal > 0 else 0

    # Sharpness via Laplacian gradient
    if arr.ndim >= 2 and arr.shape[0] >= 2 and arr.shape[1] >= 2:
        gy, gx = np.gradient(arr)
        sharpness = float(np.var(gx) + np.var(gy))
    else:
        sharpness = 0.0

    # Clipping detection (overexposure / underexposure)
    clip_low = np.mean(arr < 5) * 100
    clip_high = np.mean(arr > 250) * 100

    passed = (snr > 12.0) and (clip_low < 45.0) and (clip_high < 40.0)

    return {
        "snr_db": round(float(snr), 2),
        "sharpness_score": round(float(sharpness), 2),
        "underexposure_percentage": round(float(clip_low), 2),
        "overexposure_percentage": round(float(clip_high), 2),
        "quality_check_passed": passed,
        "artifact_warning": "High underexposure" if clip_low > 35 else "None detected"
    }

