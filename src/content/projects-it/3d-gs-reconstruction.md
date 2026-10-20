---
title: "Migliorare il 3D Gaussian Splatting con segmentazione semantica e video inpainting"
slug: 3d-gs-reconstruction
type: "Progetto universitario"
subtype: "Visione 3D"
tags: [3D Gaussian Splatting, COLMAP, Segmentazione semantica, Video inpainting, Computer vision]
summary: "Miglioramento della ricostruzione 3D da video: mascheramento di persone e animali in movimento e recupero dello sfondo statico con inpainting temporalmente coerente."
publishedAt: 2026-04-20
---

## Panoramica

Questo è stato il mio progetto finale per il mini-corso **«Vision and Learning for Physical Spaces»**, tenuto dalla Prof.ssa Iro Armeni (Gradient Spaces Lab, Stanford University). Durante le esercitazioni del corso abbiamo conosciuto una pipeline per ricostruire una scena statica a partire da un video generato con l'IA. La scena era perlopiù statica e quindi adatta alla pipeline, anche se la struttura 3D generata poteva essere incoerente e causare piccoli problemi di ricostruzione. Nei video del mondo reale abbiamo osservato il caso opposto: le geometrie degli oggetti statici sono coerenti perché rappresentano elementi reali, mentre le persone e gli altri elementi in movimento producono effetti fantasma, geometrie instabili e strutture sfocate o sospese.

Nel progetto ho quindi esteso la pipeline del corso, basata su COLMAP, aggiungendo una fase di mascheramento tramite segmentazione semantica e una successiva fase di video inpainting per sostituire i pixel mascherati. L'obiettivo era rimuovere gli oggetti in movimento in primo piano recuperando al contempo uno sfondo plausibile, così da rendere i fotogrammi più coerenti per la ricostruzione. Filtrare le persone dalle immagini di spazi pubblici contribuisce inoltre a ridurne la presenza indesiderata nel modello 3D finale, con un importante beneficio per la privacy.

## Pipeline di base

La pipeline di base estrae i fotogrammi dal video e, facoltativamente, li ridimensiona; esegue poi l'estrazione e il matching delle feature e la mappatura incrementale con COLMAP tramite `pycolmap`. I parametri delle gaussiane vengono inizializzati a partire dalla nuvola di punti sparsa, quindi si addestra un modello 3DGS. L'ho valutata su un video 720p girato camminando per una strada di Padova, campionando un fotogramma ogni 20 e addestrando per 5.000 iterazioni con il trainer Gaussian Splatting di Graphdeco.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/original_frames-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>Fotogrammi del video di input, ripreso in una strada affollata di Padova.</figcaption>
</figure>

La baseline ha prodotto una ricostruzione approssimativa plausibile, ma le persone e gli animali in movimento hanno causato evidenti effetti fantasma e instabilità locali in primo piano.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/baseline_reconstruction-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>Ricostruzione 3D Gaussian Splatting ottenuta dai fotogrammi originali.</figcaption>
</figure>

## Rimozione dei contenuti dinamici

Ho aggiunto una fase di segmentazione semantica basata sull'implementazione MIT ADE20K, con encoder dilatato ResNet-50 e decoder PPM in grado di predire 150 classi. Le etichette previste vengono convertite in maschere binarie per persone e animali, incluse classi come persona, cane, uccello e piccione, oltre a classi relative a borse. I veicoli non sono stati mascherati: il video di prova mostra un'area pedonale e l'esperimento li considera statici.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/masked_frames-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>Le maschere semantiche individuano persone e animali nei fotogrammi.</figcaption>
</figure>

Le maschere vengono dilatate con un kernel 15 × 15 per includere i contorni incerti degli oggetti. Tuttavia, ricostruire direttamente dai fotogrammi mascherati e anneriti peggiorava il risultato: il contenuto mancante disturbava il matching delle feature e produceva geometrie più frammentate. Ho quindi usato ProPainter, un modello di video inpainting che combina le informazioni propagate dai fotogrammi vicini con il completamento spazio-temporale, per riempire le regioni mascherate mantenendo la coerenza nel tempo.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/inpainted_frames-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>ProPainter riempie le regioni mascherate generando uno sfondo coerente nel tempo.</figcaption>
</figure>

I fotogrammi completati con l'inpainting vengono quindi elaborati nuovamente con COLMAP e 3DGS per stimare la scena e addestrare la ricostruzione finale.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/final_reconstruction-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>Ricostruzione finale ottenuta usando i fotogrammi completati con l'inpainting.</figcaption>
</figure>

## Risultati

Rispetto alla baseline, la pipeline migliorata riduce notevolmente gli effetti fantasma causati dalle persone che camminano. Gli elementi statici appaiono più nitidi e coerenti nelle viste renderizzate; inoltre, rispetto alle sole maschere nere, la fase di inpainting conserva più evidenze visive utili per l'estrazione e il matching delle feature.

Gli errori rimanenti si concentrano nelle occlusioni ampie o ripetute. Folle dense e persone che restano a lungo nello stesso punto, ad esempio vicino a una panchina, lasciano meno informazioni affidabili sullo sfondo sottostante. In queste aree l'inpainting è incerto e la geometria ricostruita può rimanere sfocata.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <video controls playsinline preload="metadata">
    <source src="/3dgs-media/comparison-web.mp4" type="video/mp4" />
    Il browser non supporta i video incorporati.
  </video>
  <figcaption>Confronto affiancato tra la ricostruzione baseline e quella migliorata.</figcaption>
</figure>

## Limiti e sviluppi futuri

L'esperimento si basa su un'ipotesi semplice: persone e animali si muovono, mentre i veicoli no. Un approccio più generale dovrebbe determinare quali entità si stanno effettivamente muovendo, invece di affidarsi alle categorie semantiche. In questo modo si eviterebbe sia di mascherare persone ferme sia di mantenere veicoli in movimento.

L'inpainting potrebbe inoltre migliorare se lo sfondo generato fosse guidato dalla geometria della scena. Le occlusioni ripetute o dense sono difficili da colmare usando solo i fotogrammi vicini; informazioni geometriche potrebbero rendere il contenuto ricostruito più coerente con la scena.

## Conclusioni

La segmentazione semantica aiuta a escludere le evidenze visive dinamiche, ma il solo mascheramento non basta: le regioni mancanti devono essere riempite mantenendo la coerenza temporale. In questo esperimento, combinare maschere semantiche e video inpainting ha reso sensibilmente più robusta la ricostruzione SfM e 3DGS, pur lasciando le difficoltà previste nelle aree fortemente occluse.
