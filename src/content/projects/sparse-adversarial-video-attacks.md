---
title: "Sparse Adversarial Video Attacks"
type: "Research"
subtype: "ML Robustness"
summary: "Exploiting l_0 and l_1 ball projections in PGD to enforce sparsity of adversarial perturbations against videos."
publishedAt: 2026-10-09
github: https://github.com/Afotrelle/Adv-attack-videos
---

## Overview

This is the work behind my Master's thesis in Data Science at the University of Padova, carried out as a research internship in the VIMP (Visual Intelligence and Machine Perception) group, under the supervision of Prof. Lamberto Ballan and Prof. Marco Fiorucci.

Video models can be fooled by small, deliberate changes to their input. Existing *sparse* video attacks ask which **frames** to perturb, and then perturb each selected frame densely. I asked a different question: how few **pixels** are needed? I built an attack that enforces sparsity as a hard constraint, at both the frame and the pixel level, inside a single gradient-based loop.

## Why sparse attacks?

A dense perturbation, however small per pixel, assumes the attacker can write to every pixel of every frame. A sparse attack asks a more useful question: *how little does an adversary need to control to still cause a failure?*

Sparsity is also a diagnostic tool. A dense attack tells you a model can be fooled, while a sparse one shows you *where* it is vulnerable. That second point turned out to be the most interesting result of the thesis (see below).

## The gap

The two closest prior works treat sparsity differently, and neither touches pixels:

| | Frame sparsity | Pixel sparsity | Mechanism |
|---|---|---|---|
| Wei et al. (2019) $\ell_{2,1}$ sparse attack | Induced (soft penalty) | None | Single gradient loop |
| DeepSAVA (Mu et al., 2021) | Enforced (search) | None | Outer Bayesian Optimisation + inner SGD |
| **This work** | Enforced (thresholding) | Enforced ($\ell_0$) or Induced ($\ell_1$)| Single gradient loop |

Both baselines minimize an unconstrained, penalty-based objective in the spirit of Carlini & Wagner. A penalty has no way to impose a hard budget, which is why their frame sparsity is only induced or searched. A projected-gradient formulation can enforce one by construction.

## Approach

The attack is projected gradient descent (PGD) with a feasible set defined at two levels:

**1. Adaptive frame selection.** At each iteration, every frame gets a score from the $\ell_1$ norm of its current perturbation, and only the top-$K$ frames are kept:

$$a_t = \sum_{h,w,c} |\delta_{t,h,w,c}|, \qquad \Phi_K = \text{top-}K\{a_t\}$$

This is a hard-thresholding step. It is recomputed from the gradient at every iteration, so there is no fixed mask and no external search.

**2. Pixel-level projection.** Within the retained frames, the perturbation is projected onto either:
- the $\ell_0$ ball (keep the $k$ largest-magnitude pixels, zero the rest), or
- the $\ell_1$ ball (the sorting-based projection of Duchi et al.).

**3. Budget allocation.** I compared two ways of spending the pixel budget: *Global* (frames compete freely for it) and *Frame-wise* (every retained frame gets an equal share).

**4. Gradient normalization.** Without it, the step size that worked varied wildly between models (anywhere from ~1 to ~10). Rescaling the gradient by the mean of its absolute value,

$$\tilde{g} = \frac{\nabla_x \mathcal{L}}{\tfrac{1}{n}\|\nabla_x \mathcal{L}\|_1},$$

lets a single step size ($\alpha = 0.001$) work across all three architectures. The step is no longer guaranteed to converge, but the attack stops at the first misclassification, so in practice this doesn't matter. On Conv+LSTM at a 1% $\ell_0$ budget, the unnormalized attack with $\alpha=1$ reaches 25% fooling rate against 93% with normalization.

## Results

I evaluated on **Conv+LSTM**, **I3D** and **VideoMAE**, using subsets of UCF101 and Kinetics-400, against my own PyTorch reimplementations of both baselines.

- **Versus the baselines.** The attacks beat Wei et al.'s $\ell_{2,1}$ attack and match DeepSAVA's fooling rate only when the whole video is available to perturb. At small frame counts, DeepSAVA's dense, frame-targeted search is still more effective.
- **Cost of the perturbation.** At matched frame counts, my attacks touch a small fraction of the pixels and use a much smaller mean absolute perturbation than either baseline. A budget parameter exposes the trade-off between fooling rate and perturbation cost, which neither baseline offers.
- **Speed.** The attacks have the lowest per-iteration cost of all methods. DeepSAVA needs fewer iterations at large frame counts, so end-to-end my framework sits between DeepSAVA and the $\ell_{2,1}$ attack, and is the fastest of the three in the sparse regime.
- **Global vs. Frame-wise.** The two allocations are almost equivalent on fooling rate, SSIM and perturbation magnitude, which I did not expect. Frame-wise keeps one structural advantage: it caps how much any single frame can receive.

## Sparsity as a lens on the model

Looking at *where* the cheapest sparse attack chooses to strike reveals clear, architecture-dependent patterns, even though all three models are fooled at similar rates:

- **VideoMAE:** perturbations form a visible grid aligned with the model's patch tokenization.
- **Conv+LSTM:** perturbation concentrates in a few early frames and propagates through the recurrent hidden state, consistent with Wei et al.'s earlier observation.
- **I3D:** perturbation is spread across frames with a strong oscillating pattern, which I tentatively relate to the temporal stride of the 3D convolutions.

These observations are qualitative, and a more systematic characterization is left open.

## Limitations and next steps

- Evaluation uses test-set subsets, not the full sets.
- Hyperparameters were tuned with all frames attacked ($K = T$), so the interaction between frame-level and pixel-level budgets is under-explored.
- My reimplemented Conv+LSTM and I3D models don't exactly match the accuracy reported in the original papers (PyTorch vs. TensorFlow, different training pipelines).

Natural follow-ups are testing the attack against existing defenses, using it as the attack generator inside an adversarial training loop (where its low per-iteration cost helps), and extending it to video foundation models with a loss on internal representations instead of the classification output.

## Acknowledgments

Thanks to Prof. Lamberto Ballan and Prof. Marco Fiorucci for their supervision, and to Matteo Bergamaschi, PhD and Prof. Francesco Rinaldi for their advice along the way.