---
title: "Hierarchical CNNs for Image Geolocation"
type: "Course Project"
subtype: "Computer Vision"
tags: [PyTorch, Computer Vision, CNNs, Geolocation, S2 Geometry]
summary: "A group project exploring the application of CNNs for geolocating Street View images across ten US states."
publishedAt: 2026-02-06
github: https://github.com/MatteoCamillo-code/GeoLoc-CVCS
---

This is a summary of the final project that I presented together with my colleagues (and friends) [<ins>Matteo Camillo](https://www.linkedin.com/in/matteo-camillo-b6b274240/) and [<ins>Daniele Gelmini](https://www.linkedin.com/in/daniele-gelmini/) for the course of **Computer Vision and Cognitive Systems**, taught by Prof. Lamberto Ballan.

**[View the project on GitHub →](https://github.com/MatteoCamillo-code/GeoLoc-CVCS)**

## Project overview

Image geolocalization aims to estimate where a photograph was taken from its visual content alone. This is especially difficult for Street View imagery: scenes share many visual patterns, often lack distinctive landmarks, and small visual differences can correspond to locations far apart.

We explored a classification-based approach in which the study area is divided into geographic cells, and a convolutional neural network predicts the cell containing an image. Rather than relying on a single map resolution, our main approach uses a hierarchical multi-head model to learn at three spatial scales, combining coarse regional context with finer-grained location predictions.

## Dataset

Our experiments used OSV-mini, a subset of OpenStreetView5M containing approximately 129,000 images across ten US states: about 119,000 training images and 10,000 test images. We also tested expanding the training data with geographically filtered images from the MediaEval Placing Task 2016 (MP-16) dataset. MP-16 samples were restricted to the same states and retained when an initial scene classifier identified them as urban or natural with confidence above 0.7; the combined dataset contained approximately 177,000 images.

For training, images were augmented with random resized crops, horizontal flips, and rotations, then resized to the input size required by each model. Performance was measured using Great Circle Distance between predicted and ground-truth coordinates. We report the percentage of images localized within 1 km, 5 km, 25 km, and 100 km.

## Models and experiments

We began with a ResNet-50 baseline pretrained on ImageNet and a classifier for the finest geographic partition. We then compared:

- **Hierarchical multi-head prediction:** a shared image backbone with separate classification heads for fine, medium, and coarse S2 geographic partitions. The hierarchical scores are combined to select a fine-level cell.
- **Individual Scene Networks (ISN):** a scene classifier routes each image to a separate urban or natural geolocalization model. Indoor images were excluded because they made up less than 1% of the dataset.
- **Weighted hierarchical loss:** loss weights of 0.61, 0.27, and 0.12 prioritize the finest, medium, and coarsest partitions, respectively.
- **Density-center inference:** instead of returning a cell’s geometric center, predictions use the average locations of training images in the most likely cell. Hierarchical scores are propagated across resolutions to combine evidence for fine-level cells.
- **Further ablations:** we tested a Convolutional Block Attention Module (CBAM), training with MP-16 data, and replacing ResNet-50 with Inception-v4.

We partitioned the ten-state study area with S2 Geometry at three resolutions, from fine cells to coarser regional cells. The hierarchical model predicts all three levels together so broader spatial context can inform the finer location estimate.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/s2-partition.png" alt="S2 geographic partitioning of the ten-state US study area at three resolutions, with fine, medium, and coarse cells." />
  <figcaption>The S2 cells adapt to the distribution of images across the study area, with coarser partitions containing fewer, larger cells.</figcaption>
</figure>

The diagrams below show the baseline single-head model, the multi-head hierarchical design, and the urban/natural Individual Scene Network (ISN) alternative.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/baseline.png" alt="Baseline geolocalization architecture with a ResNet-50 backbone and one geographic-cell classification head." />
  <figcaption>Baseline: one ResNet-50 model predicts a cell from the finest geographic partition.</figcaption>
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/multihead.png" alt="Multi-head geolocalization architecture with three S2 partition levels and corresponding cell-probability heads." />
  <figcaption>Multi-head model: shared image features are classified at fine, medium, and coarse geographic resolutions.</figcaption>
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/ISN.png" alt="Individual Scene Network architecture that classifies the scene and routes it to specialized urban or natural models." />
  <figcaption>ISN: a scene classifier routes an image to a specialized urban or natural geolocalization model.</figcaption>
</figure>

For weighted inference, we propagated evidence from the three resolutions to the fine cells, then estimated the location using the density center of training examples in the most likely cell.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/weighted-pred.png" alt="Illustration of weighted hierarchical inference over geographic cells, combining probabilities across three S2 resolutions." />
  <figcaption>Weighted inference combines hierarchical cell probabilities and uses the distribution of training locations within a cell.</figcaption>
</figure>

The density-center inference strategy produced the largest improvement. On validation data, the weighted multi-head model reached 13.45% within 1 km, compared with 6.34% before the inference change. Splitting the model into urban and natural specialists did not improve results for this dataset, and CBAM and Inception-v4 did not provide consistent gains.

We also tested adding CBAM attention after the ResNet-50 backbone, but it did not improve the validation results for the original OSV-mini data.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/cbam.png" alt="Multi-head model diagram with a Convolutional Block Attention Module inserted after the ResNet-50 backbone." />
  <figcaption>CBAM was evaluated as an additional feature-refinement module.</figcaption>
</figure>

Validation results for the initial configurations and the later ablations are shown in the figure below.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/results3.png" alt="Validation geo-accuracy table including MP-16 dataset expansion, CBAM, ISN, and Inception-v4 experiments." />
  <figcaption>Validation ablations after adding MP-16 data show that more data and architectural changes did not consistently improve performance at longer distances.</figcaption>
</figure>

## Test results

The test-set comparison below shows a substantial regional improvement over the ResNet-50 baseline after adding hierarchical weighted inference and filtered MP-16 data. The best configuration achieved 33.94% within 100 km, while city-scale accuracy remained low.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/test_set.png" alt="Test-set geolocalization accuracy table comparing the ResNet-50 baseline, multi-head weighted inference, MP-16 augmentation, and CBAM across 1, 5, 25, and 100 kilometer thresholds." />
  <figcaption>Test-set geo-accuracy (%) at increasing distance thresholds; the best result is 33.94% within 100 km.</figcaption>
</figure>

The best tested configuration increased accuracy within 100 km from 6.88% to 33.94%, and within 25 km from 1.60% to 16.55%. The improvement was much smaller at city-scale thresholds: only 0.16% of test images were localized within 1 km.

## Discussion

The experiments suggest that combining spatial evidence across multiple geographic scales and predicting from the observed density of training locations are more useful here than adding architectural complexity. Urban images were particularly challenging: similar built environments across different states can confuse the model, while the dataset’s vehicle-centered viewpoints and limited environmental diversity made separate urban and natural specialists less effective.

Validation performance was substantially higher than test performance. OpenStreetView5M separates image sequences by contributor/vehicle, so the training and test sets contain sequences captured by different people and cars. Our validation set, however, was sampled randomly from the training set and could therefore contain images from the same capture sequences as its training portion. It was not a close proxy for the sequence-separated test set.

This split difference suggests the model overfit to car- or camera-dependent visual cues that recur within a capture sequence, rather than learning features that reliably identify a location across different vehicles and cameras. The examples below highlight such cues, including the dashboard and windshield at the bottom of the frame and differences in camera placement and framing. A random validation split can reward memorizing these capture-specific patterns, while the test set requires stronger generalization to new capture sources.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/overfitting.png" alt="Three Street View images showing capture-specific camera cues, including dashboard and windshield visibility, camera placement, and framing." />
  <figcaption>Vehicle- and camera-dependent cues can recur within a capture sequence but change across contributors and cars.</figcaption>
</figure>

The work highlights a key limitation of ordinary classification loss for geolocalization: it penalizes a prediction in a nearby cell just as strongly as one thousands of kilometers away. A promising next step would be localized label smoothing that accounts for geographic proximity, alongside more careful data cleaning and selection. Other directions include alternative or semantically meaningful map partitions and fine-tuning more of the image backbone.
