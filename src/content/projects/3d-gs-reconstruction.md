---
title: "Improving 3D Gaussian Splatting with Semantic Segmentation and Video Inpainting"
type: "Course Project"
subtype: "3D Vision"
tags: [3D Gaussian Splatting, COLMAP, Semantic Segmentation, Video Inpainting, Computer Vision]
summary: "Improving video-based 3D Gaussian Splatting by masking moving people and animals, then using temporally consistent inpainting to recover static scene content."
publishedAt: 2026-04-20
---

## Overview

This was my final project for the mini-course **"Vision and Learning for Physical Spaces"** led by Prof. Iro Armeni (Gradient Spaces Lab @Stanford University). During the course labs we were introduced to a pipeline for reconstructing a static scene from an AI-generated video. The scene was mostly static, which suited the reconstruction pipeline, even though the generated 3D structure could be incoherent and cause minor reconstruction problems. But when trying real-world videos, we noticed the opposite situation: static 3D geometries are consistent since representing real-world objects, but having people and other moving entities produced ghosting, unstable geometry, and blurred or floating structures in the reconstruction.

Therefore in my project I extended the course's COLMAP-style pipeline by adding a semantic segmentation masking step, followed by a video inpainting step to replace the masked pixels. The aim was to remove moving foreground objects while recovering plausible background content, so the frames would be more consistent for reconstruction. Filtering people from public-space imagery does also have an important privacy-protection role in reducing their unwanted presence in the resulting 3D model.

## Baseline pipeline

The baseline extracts and optionally resizes video frames, runs feature extraction, matching, and incremental mapping with COLMAP through `pycolmap`, initializes Gaussian parameters from the sparse point cloud, and trains a 3DGS model. I evaluated it on a 720p street-walk video in Padova, subsampling one frame every 20 frames and training for 5,000 iterations with the Graphdeco Gaussian Splatting trainer.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/original_frames-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>Input video frames from a crowded street in Padova.</figcaption>
</figure>

Although the baseline produced a plausible coarse reconstruction, moving people and animals caused visible ghosting and local instability in the foreground.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/baseline_reconstruction-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>3D Gaussian Splatting reconstruction from the original frames.</figcaption>
</figure>

## Removing dynamic content

I added a semantic segmentation stage using the MIT ADE20K implementation, with a ResNet-50 dilated encoder and PPM decoder predicting 150 classes. The predicted labels are converted into binary masks for people and animals, including classes such as person, dog, bird, and pigeon, as well as bag-related classes. Vehicles were left unmasked because the test video depicts a pedestrian area and the experiment assumed they were static.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/masked_frames-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>Semantic masks identify people and animals in the frames.</figcaption>
</figure>

The masks are dilated with a 15 × 15 kernel to include uncertain object boundaries. However, reconstructing directly from blacked-out masked frames made the result worse: the missing image content disrupted feature matching and produced more fragmented geometry. I therefore used ProPainter, a video inpainting model that combines information propagated from neighboring frames with spatio-temporal completion, to fill the masked regions consistently over time.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/inpainted_frames-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>ProPainter fills the masked regions with temporally consistent background content.</figcaption>
</figure>

The inpainted frames are then passed through COLMAP and 3DGS again to estimate the scene and train the final reconstruction.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/final_reconstruction-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>Final reconstruction using the inpainted frames.</figcaption>
</figure>

## Results

Compared with the baseline, the improved pipeline substantially reduces ghosting from walking people. Static structures appear cleaner and more consistent across rendered views, and the inpainting stage preserves more useful visual evidence for feature extraction and matching than black masks alone.

The remaining errors are concentrated in wide or repeated occlusions. Dense crowds and people who remain in one place, such as near a bench, leave less reliable evidence of the underlying background. In these areas, inpainting is uncertain and the reconstructed geometry can remain fuzzy.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/comparison-web.mp4" type="video/mp4" />
    Your browser does not support embedded videos.
  </video>
  <figcaption>Side-by-side comparison of the baseline and improved reconstructions.</figcaption>
</figure>

## Limitations and next steps

The experiment uses a simple assumption: people and animals move, while vehicles do not. A more general approach should identify which entities are actually moving rather than relying on semantic categories. This would avoid masking stationary people or retaining moving vehicles.

Inpainting could also be improved by grounding the generated background in scene geometry. Repeated or dense occlusions are difficult to fill from neighboring frames alone; geometric guidance could help produce content that is more consistent with the reconstructed scene.

## Takeaway

Semantic segmentation helps exclude dynamic image evidence, but masking on its own is not enough: the missing regions must be filled in a way that maintains temporal consistency. Combining semantic masks with video inpainting made the SfM and 3DGS reconstruction noticeably more robust in this experiment, while leaving the expected challenges in heavily occluded areas.
