"""Generate sample synthetic chest radiograph images and DICOM files for MediVision AI platform."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid

def create_synthetic_chest_xray(path: str, condition: str = "normal", size: int = 512):
    """Generates an anatomically plausible synthetic chest radiograph proxy for research."""
    img = Image.new("L", (size, size), color=15)
    draw = ImageDraw.Draw(img)

    # 1. Outer Thoracic Cage (rib cage contour)
    draw.ellipse([size * 0.12, size * 0.15, size * 0.88, size * 0.92], fill=45)
    
    # 2. Bilateral Lung Fields (radiolucent = darker)
    # Left Lung (patient's anatomical left, image right)
    draw.polygon([
        (size * 0.53, size * 0.25),
        (size * 0.78, size * 0.28),
        (size * 0.84, size * 0.65),
        (size * 0.78, size * 0.85),
        (size * 0.55, size * 0.78),
    ], fill=18)
    
    # Right Lung (patient's anatomical right, image left)
    draw.polygon([
        (size * 0.47, size * 0.25),
        (size * 0.22, size * 0.28),
        (size * 0.16, size * 0.65),
        (size * 0.22, size * 0.85),
        (size * 0.45, size * 0.78),
    ], fill=18)

    # 3. Cardiac Silhouette (radiopaque = brighter)
    # Positioned centrally, projecting predominantly into the left hemithorax
    cardiac_left = size * 0.38
    cardiac_right = size * 0.68 if condition == "cardiomegaly" else size * 0.62
    draw.ellipse([cardiac_left, size * 0.45, cardiac_right, size * 0.82], fill=110)

    # 4. Mediastinum & Trachea
    draw.rectangle([size * 0.47, size * 0.10, size * 0.53, size * 0.45], fill=85)
    draw.rectangle([size * 0.485, size * 0.12, size * 0.515, size * 0.35], fill=25) # Tracheal air column

    # 5. Diaphragm Hemidomes
    draw.arc([size * 0.15, size * 0.72, size * 0.48, size * 0.88], start=180, end=360, fill=130, width=12)
    draw.arc([size * 0.52, size * 0.73, size * 0.85, size * 0.88], start=180, end=360, fill=130, width=12)

    # 6. Condition-specific radiographic patterns
    if condition == "pleural_effusion":
        # Right costophrenic angle blunting with fluid meniscus
        draw.polygon([
            (size * 0.16, size * 0.68),
            (size * 0.35, size * 0.82),
            (size * 0.35, size * 0.88),
            (size * 0.16, size * 0.88)
        ], fill=140)
    elif condition == "pneumonia":
        # Dense alveolar consolidation opacity in right middle/lower zone
        draw.ellipse([size * 0.22, size * 0.52, size * 0.38, size * 0.72], fill=135)
    elif condition == "atelectasis":
        # Linear/platelike subsegmental opacity
        draw.line([(size * 0.20, size * 0.62), (size * 0.42, size * 0.65)], fill=150, width=8)

    # 7. Add anatomic rib shadows
    for i in range(7):
        y_pos = size * (0.28 + i * 0.08)
        draw.arc([size * 0.14, y_pos, size * 0.48, y_pos + size * 0.12], start=160, end=340, fill=75, width=4)
        draw.arc([size * 0.52, y_pos, size * 0.86, y_pos + size * 0.12], start=200, end=380, fill=75, width=4)

    # Blur to produce natural radiograph appearance
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    
    # Add subtle radiographic detector quantum noise
    arr = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 4, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    
    final_img = Image.fromarray(arr)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    final_img.save(path)
    return path

def create_synthetic_dicom(output_dcm_path: str, png_source_path: str, patient_id: str = "MV-PAT-2026-001"):
    """Wraps pixel data into an authentic Part 10 DICOM file with full metadata header tags."""
    img = Image.open(png_source_path).convert("L")
    pixel_array = np.array(img, dtype=np.uint16) * 16 # Scale to 12-bit dynamic range

    file_meta = Dataset()
    file_meta.MediaStorageSOPClassUID = "1.2.840.10008.5.1.4.1.1.1" # Digital X-Ray Image Storage - For Presentation
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds = FileDataset(output_dcm_path, {}, file_meta=file_meta, preamble=b"\0" * 128)
    ds.Modality = "DX"
    ds.PatientID = patient_id
    ds.PatientName = "Pendelton^Arthur"
    ds.PatientBirthDate = "19620412"
    ds.PatientSex = "M"
    ds.StudyDate = "20260311"
    ds.StudyTime = "143000"
    ds.StudyDescription = "Chest PA & Lateral Research Radiograph"
    ds.BodyPartExamined = "CHEST"
    ds.ViewPosition = "PA"
    ds.StudyInstanceUID = generate_uid()
    ds.SeriesInstanceUID = generate_uid()
    ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    ds.SOPClassUID = file_meta.MediaStorageSOPClassUID
    ds.Rows = pixel_array.shape[0]
    ds.Columns = pixel_array.shape[1]
    ds.BitsAllocated = 16
    ds.BitsStored = 12
    ds.HighBit = 11
    ds.PixelRepresentation = 0
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.WindowCenter = 2048
    ds.WindowWidth = 4096
    ds.RescaleIntercept = 0
    ds.RescaleSlope = 1
    ds.PixelData = pixel_array.tobytes()

    ds.is_little_endian = True
    ds.is_implicit_VR = False
    ds.save_as(output_dcm_path, write_like_original=False)
    return output_dcm_path

if __name__ == "__main__":
    base_dir = r"C:\Users\GEECON_P\.gemini\antigravity\scratch\medivision-ai\sample-data"
    os.makedirs(base_dir, exist_ok=True)
    
    effusion_png = os.path.join(base_dir, "sample_pleural_effusion.png")
    pneumonia_png = os.path.join(base_dir, "sample_pneumonia.png")
    cardio_png = os.path.join(base_dir, "sample_cardiomegaly.png")
    normal_png = os.path.join(base_dir, "sample_normal.png")
    
    create_synthetic_chest_xray(effusion_png, "pleural_effusion")
    create_synthetic_chest_xray(pneumonia_png, "pneumonia")
    create_synthetic_chest_xray(cardio_png, "cardiomegaly")
    create_synthetic_chest_xray(normal_png, "normal")
    
    dcm_path = os.path.join(base_dir, "sample_study_001.dcm")
    create_synthetic_dicom(dcm_path, effusion_png)
    
    # Also copy samples to backend Storage so they can be immediately served via API
    backend_storage = r"C:\Users\GEECON_P\.gemini\antigravity\scratch\medivision-ai\backend\Storage\samples"
    os.makedirs(backend_storage, exist_ok=True)
    import shutil
    shutil.copy(effusion_png, os.path.join(backend_storage, "sample_pleural_effusion.png"))
    shutil.copy(pneumonia_png, os.path.join(backend_storage, "sample_pneumonia.png"))
    shutil.copy(cardio_png, os.path.join(backend_storage, "sample_cardiomegaly.png"))
    shutil.copy(normal_png, os.path.join(backend_storage, "sample_normal.png"))
    
    print("Sample radiographs and DICOM generated successfully!")

