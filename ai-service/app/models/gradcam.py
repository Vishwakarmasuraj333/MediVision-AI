"""Explainable AI (Grad-CAM) Visualizer for Deep Radiograph Interpretation."""
import os
import torch
import numpy as np
from PIL import Image
import io
import base64
from app.models.classifier import load_model, get_inference_transform, LABELS

def apply_colormap_jet(heatmap: np.ndarray) -> np.ndarray:
    """Custom vectorized Jet colormap generator without requiring heavy GUI dependencies."""
    # heatmap is float [0, 1]
    h = np.clip(heatmap, 0.0, 1.0)
    
    # 4-segment Jet approximation
    r = np.clip(1.5 - np.abs(4.0 * h - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * h - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * h - 1.0), 0.0, 1.0)
    
    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255.0).astype(np.uint8)

def apply_colormap_turbo(heatmap: np.ndarray) -> np.ndarray:
    """Turbo-like perceptual colormap for clinical thermal visualization."""
    h = np.clip(heatmap, 0.0, 1.0)
    # Polynomial approximation of Turbo colormap
    r = np.clip(0.1357 + 4.5974*h - 42.68*h**2 + 130.5*h**3 - 154.6*h**4 + 59.8*h**5, 0.0, 1.0)
    g = np.clip(0.0914 + 2.1855*h + 4.8052*h**2 - 14.01*h**3 + 4.21*h**4 + 2.7*h**5, 0.0, 1.0)
    b = np.clip(0.1066 + 12.559*h - 60.135*h**2 + 109.07*h**3 - 88.5*h**4 + 26.8*h**5, 0.0, 1.0)
    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255.0).astype(np.uint8)

def generate_gradcam(pil_image: Image.Image, architecture: str = "DenseNet121", target_class: str = None, colormap: str = "jet", alpha: float = 0.5):
    """
    Computes authentic Grad-CAM spatial activation maps from the final convolutional layer.
    """
    model = load_model(architecture)
    transform = get_inference_transform()
    input_tensor = transform(pil_image).unsqueeze(0) # [1, 3, 224, 224]
    input_tensor.requires_grad = True

    gradients = []
    activations = []

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    def forward_hook(module, input, output):
        activations.append(output)

    target_layer = getattr(model, "target_layer", None)
    if target_layer is None:
        target_layer = list(model.modules())[-3]

    hook_fwd = target_layer.register_forward_hook(forward_hook)
    hook_bwd = target_layer.register_full_backward_hook(backward_hook)

    try:
        model.zero_grad()
        output = model(input_tensor) # [1, num_classes]

        if target_class is not None and target_class in LABELS:
            class_idx = LABELS.index(target_class)
        else:
            class_idx = int(torch.argmax(output[0]).item())

        selected_label = LABELS[class_idx]
        target_score = output[0, class_idx]
        target_score.backward()

        if len(gradients) > 0 and len(activations) > 0:
            grad = gradients[0][0].detach().cpu().numpy() # [C, H, W]
            act = activations[0][0].detach().cpu().numpy()  # [C, H, W]

            # Global average pooling of gradients: weights alpha_k
            weights = np.mean(grad, axis=(1, 2)) # [C]
            cam = np.zeros(act.shape[1:], dtype=np.float32) # [H, W]

            for i, w in enumerate(weights):
                cam += w * act[i]

            # ReLU on weighted combination
            cam = np.maximum(cam, 0)
        else:
            cam = np.ones((7, 7), dtype=np.float32)

        # Normalize CAM to [0, 1]
        c_max = np.max(cam)
        if c_max > 0:
            cam = cam / c_max
        else:
            cam = np.zeros_like(cam)

    finally:
        hook_fwd.remove()
        hook_bwd.remove()

    # Resize CAM to match original image size
    orig_w, orig_h = pil_image.size
    cam_img = Image.fromarray((cam * 255).astype(np.uint8)).resize((orig_w, orig_h), resample=Image.BILINEAR)
    cam_resized = np.array(cam_img, dtype=np.float32) / 255.0

    # Colorize heatmap
    if colormap.lower() == "turbo":
        heatmap_rgb = apply_colormap_turbo(cam_resized)
    else:
        heatmap_rgb = apply_colormap_jet(cam_resized)

    # Blend with original grayscale radiograph
    orig_rgb = np.array(pil_image.convert("RGB"), dtype=np.float32)
    alpha = max(0.0, min(1.0, alpha))
    overlay_rgb = (orig_rgb * (1.0 - alpha) + heatmap_rgb.astype(np.float32) * alpha).astype(np.uint8)

    # Convert to PIL images
    heatmap_pil = Image.fromarray(heatmap_rgb)
    overlay_pil = Image.fromarray(overlay_rgb)

    # Encode to base64 Data URLs
    def to_data_url(img):
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    return {
        "target_class": selected_label,
        "class_index": class_idx,
        "heatmap_data_url": to_data_url(heatmap_pil),
        "overlay_data_url": to_data_url(overlay_pil),
        "disclaimer": "Grad-CAM spatial heatmap depicts neural network feature attention gradients; it is not an anatomically definitive disease border."
    }

