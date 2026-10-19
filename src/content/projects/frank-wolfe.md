---
title: "Frank-Wolfe Algorithms for Targeted Adversarial Attacks"
type: "Course Project"
subtype: "Optimization"
tags: [PyTorch, Hugging Face, Optimization, Adversarial ML]
summary: "Implementing and comparing vanilla, away-step, and pairwise Frank-Wolfe methods for targeted ℓ∞-bounded attacks on image classifiers."
publishedAt: 2025-09-20
github: https://github.com/Afotrelle/adversarial_optimization
---

This was my final project for the **"Optimization for Data Science"** course, completed with Mattia Piazza. We studied how projection-free Frank-Wolfe methods can generate targeted adversarial examples: small changes to an image that cause a classifier to predict a chosen incorrect class.

**[View the project on GitHub →](https://github.com/Afotrelle/adversarial_optimization)**

## Project overview

Many common first-order attacks rely on projecting each update back into a feasible perturbation set. Frank-Wolfe methods instead use a linear minimization oracle to choose a feasible direction, then update by moving toward a point in the constraint set. This avoids an explicit projection step and can produce lower-distortion perturbations.

We implemented three variants for targeted white-box attacks, assuming access to the model and its gradients. Each attack minimizes the target-class loss while keeping the perturbation within an ℓ∞ budget:

- **Vanilla Frank-Wolfe (FW):** takes a conditional-gradient step toward the atom selected by the linear minimization oracle, using a diminishing step size.
- **Away-Step Frank-Wolfe (AFW):** maintains an active set and can move away from an unhelpful vertex to address the zig-zagging behavior of vanilla FW.
- **Pairwise Frank-Wolfe (PFW):** transfers weight directly from an active-set vertex toward the newly selected FW vertex.

AFW and PFW use a bisection line search in our implementation. An attack stops once it reaches the requested target class or reaches the iteration limit.

## Experimental setup

We evaluated the methods on 200 images from each of three image-classification tasks:

- **MNIST:** handwritten digits classified by a SigLIP-based CNN.
- **ImageNet-1K:** natural images classified by a pretrained ResNet-50.
- **FairFace:** age-group classification with a Vision Transformer.

For each image, the target was a randomly selected label different from the original prediction. We swept the ℓ∞ budget ε from 0.10 to 0.50 in increments of 0.02 for all datasets, with an additional 0.01-to-0.10 sweep for ImageNet and FairFace. Attacks were capped at 25 iterations. We recorded attack success rate (ASR), iterations to success, wall-clock time, and perturbation distortion. Results below are averages across the tested budgets; timings were measured on a MacBook Pro with an Apple M1 Pro and 32 GB RAM.

## Results

| Dataset | Algorithm | ASR | Avg. iterations | Avg. time per attack |
|---|---|---:|---:|---:|
| MNIST | Vanilla FW | 100.00% | 4.68 | 0.93 s |
| MNIST | Away-Step FW | 97.33% | 4.27 | 3.64 s |
| MNIST | Pairwise FW | 99.76% | 3.09 | 2.54 s |
| ImageNet-1K | Vanilla FW | 96.02% | 8.26 | 1.04 s |
| ImageNet-1K | Away-Step FW | 91.45% | 7.95 | 6.25 s |
| ImageNet-1K | Pairwise FW | 87.98% | 7.25 | 3.83 s |
| FairFace | Vanilla FW | 99.81% | 3.88 | 0.71 s |
| FairFace | Away-Step FW | 99.89% | 2.64 | 1.98 s |
| FairFace | Pairwise FW | 98.14% | 2.69 | 1.92 s |

All three methods were effective across the tasks, especially at larger perturbation budgets. On ImageNet and FairFace, success rates rose quickly as ε increased, approaching saturation around ε = 0.10. Many successful attacks used less distortion than the maximum allowed by the budget.

The variants generally reached the target in fewer iterations than vanilla FW, with PFW often requiring the fewest. However, their line-search and active-set bookkeeping raised per-iteration cost. Vanilla FW was the fastest method in wall-clock time on ImageNet and FairFace and achieved the highest average ASR on MNIST and ImageNet. AFW achieved the highest FairFace ASR and fewest iterations there, but took longer per attack. The most efficient choice therefore depends on whether success rate, iteration count, or runtime is the priority.

## Takeaway and next steps

The experiments show that projection-free Frank-Wolfe methods can produce strong targeted attacks under ℓ∞ constraints. The more elaborate variants can reduce iteration counts, but that does not necessarily translate to lower runtime: in this implementation, the line search and active-set updates made them more expensive per iteration. Vanilla FW offered a strong practical balance of effectiveness and speed.

Absolute timings depend on the hardware and implementation. Potential next steps include momentum, adaptive step-size policies, and stopping rules that jointly consider attack success, runtime, and distortion.
