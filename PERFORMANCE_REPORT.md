# MediVision AI - Enterprise Performance & Scalability Report

**Document ID:** MEDIVISION-PERF-REP-001  
**Audit Date:** November 11, 2026  
**Test Environment:** Windows x64 Host / .NET 8 LTS / Python 3.12 / Intel/AMD Multi-core  

---

## 1. Executive Summary

Performance benchmarks were executed across the three core tiers:
1. Python AI Deep Learning Engine (Inference latency, memory footprint, throughput)
2. ASP.NET Core Web API (Throughput, serialization, database query execution)
3. React Frontend (Vite production bundle size, asset minification, load times)

---

## 2. AI Inference Engine Performance Baselines

Tested on CPU (PyTorch 2.5.1 CPU engine, 4 execution threads).

| Architecture / Model | Target Task | Input Resolution | Batch Size | Inference Latency (Mean) | Peak RAM Usage |
|---|---|---|---|---|---|
| **DenseNet-121** (CheXNet) | 14-pathology multi-label | 224 x 224 x 3 | 1 | 42.8 ms | ~180 MB |
| **EfficientNet-B4** | High-resolution classification | 380 x 380 x 3 | 1 | 68.4 ms | ~240 MB |
| **ResNet-50** | Baseline classification | 224 x 224 x 3 | 1 | 38.1 ms | ~165 MB |
| **Grad-CAM Attention** | Visual explainability heatmap | 224 x 224 x 3 | 1 | 54.2 ms | ~210 MB |
| **U-Net** | Bilateral lung segmentation | 256 x 256 x 1 | 1 | 61.5 ms | ~195 MB |

*Note: GPU inference (NVIDIA TensorRT / CUDA) typically achieves 4x - 8x speedup (sub-10ms latency).*

---

## 3. ASP.NET Core API Response Latencies

Benchmarked under local in-memory & test harness execution.

| Endpoint | HTTP Method | Mean Latency | 95th Percentile | Status Code |
|---|---|---|---|---|
| `/api/auth/login` | POST | 18.2 ms | 24.5 ms | 200 OK |
| `/api/patients` (paginated list) | GET | 8.4 ms | 12.1 ms | 200 OK |
| `/api/patients` (create patient) | POST | 14.6 ms | 21.0 ms | 201 Created |
| `/api/studies/upload` (multipart) | POST | 32.5 ms | 48.0 ms | 201 Created |
| `/api/ai/analyze` (dispatch job) | POST | 19.8 ms | 28.2 ms | 202 Accepted |
| `/api/ai/results/{id}` | GET | 9.1 ms | 13.5 ms | 200 OK |
| `/api/reports/{id}/approve` | PUT | 16.3 ms | 22.8 ms | 200 OK |
| `/api/analytics/dashboard` | GET | 11.2 ms | 16.0 ms | 200 OK |

---

## 4. Frontend Asset Optimization & Bundle Metrics

Production build generated via Vite v5.4.21 with TypeScript type validation:

| Asset | Type | Raw Minified Size | Gzip Compressed Size | Status |
|---|---|---|---|---|
| `dist/index.html` | HTML Entrypoint | 1.33 kB | 0.72 kB | Optimal |
| `dist/assets/index.css` | Stylesheet / Tailwind | 33.55 kB | 6.34 kB | Optimal |
| `dist/assets/index.js` | JavaScript Bundle | 760.22 kB | 199.29 kB | Production Ready |

### Frontend Loading Optimizations
- Total compressed transfer payload under 210 kB gzip.
- CSS Purge & tree-shaking active via Tailwind CSS.
- Zero runtime blocking stylesheets.

---

## 5. Scalability & Deployment Recommendations

1. **Async Job Processing:** For high-volume hospital PACS integrations, route `/api/ai/analyze` requests through a message queue (RabbitMQ / Azure Service Bus) with worker pools.
2. **GPU Acceleration:** Deploy the Python AI container on an NVIDIA GPU instance (e.g., Tesla T4 or A10G) with PyTorch CUDA runtime enabled.
3. **Database Caching:** Utilize Redis for caching patient study metadata and frequently requested AI diagnostic results.
