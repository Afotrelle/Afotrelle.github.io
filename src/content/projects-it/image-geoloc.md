---
title: "CNN gerarchiche per la geolocalizzazione di immagini"
slug: image-geoloc
type: "Progetto universitario"
subtype: "Computer vision"
tags: [PyTorch, Computer vision, CNN, Geolocalizzazione, Geometria S2]
summary: "Progetto di gruppo sull'applicazione di CNN per geolocalizzare immagini di Street View in dieci stati degli Stati Uniti."
publishedAt: 2026-02-06
github: https://github.com/MatteoCamillo-code/GeoLoc-CVCS
---

Questo è un riepilogo del progetto finale che ho presentato con i colleghi (e amici) [Matteo Camillo](https://www.linkedin.com/in/matteo-camillo-b6b274240/) e [Daniele Gelmini](https://www.linkedin.com/in/daniele-gelmini/) per il corso di **Computer Vision and Cognitive Systems**, tenuto dal Prof. Lamberto Ballan.

**[Visualizza il progetto su GitHub →](https://github.com/MatteoCamillo-code/GeoLoc-CVCS)**

## Panoramica del progetto

La geolocalizzazione di immagini cerca di stimare il luogo in cui è stata scattata una fotografia basandosi solo sul suo contenuto visivo. È particolarmente difficile con le immagini di Street View: le scene condividono molti elementi visivi, spesso mancano punti di riferimento distintivi e piccole differenze possono corrispondere a località molto distanti.

Abbiamo esplorato un approccio basato sulla classificazione: l'area di studio viene suddivisa in celle geografiche e una rete neurale convoluzionale predice la cella in cui ricade l'immagine. Invece di usare un'unica risoluzione cartografica, il nostro approccio principale adotta un modello gerarchico multi-head che apprende a tre scale spaziali, combinando il contesto regionale più ampio con predizioni di posizione più precise.

## Dataset

Gli esperimenti usano OSV-mini, un sottoinsieme di OpenStreetView5M con circa 129.000 immagini distribuite in dieci stati degli Stati Uniti: circa 119.000 immagini di addestramento e 10.000 di test. Abbiamo anche valutato l'ampliamento dei dati di addestramento con immagini del dataset MediaEval Placing Task 2016 (MP-16), filtrate geograficamente. Abbiamo conservato i campioni MP-16 appartenenti agli stessi stati e classificati da un classificatore preliminare di scene come urbani o naturali con confidenza superiore a 0,7; il dataset combinato conteneva circa 177.000 immagini.

Durante l'addestramento, le immagini sono state aumentate con crop ridimensionati casuali, riflessioni orizzontali e rotazioni, quindi adattate alla dimensione richiesta da ciascun modello. Le prestazioni sono state misurate con la distanza del cerchio massimo tra le coordinate previste e quelle reali. Riportiamo la percentuale di immagini localizzate entro 1, 5, 25 e 100 km.

## Modelli ed esperimenti

Siamo partiti da una baseline ResNet-50 preaddestrata su ImageNet, dotata di un classificatore per la partizione geografica più fine. Abbiamo quindi confrontato:

- **Predizione gerarchica multi-head:** un estrattore visivo condiviso con teste di classificazione separate per le partizioni geografiche S2 fine, media e grossolana. I punteggi gerarchici vengono combinati per selezionare una cella al livello più fine.
- **Individual Scene Networks (ISN):** un classificatore di scene instrada ogni immagine verso un modello di geolocalizzazione specializzato in scene urbane o naturali. Le immagini di interni sono state escluse perché rappresentavano meno dell'1% del dataset.
- **Loss gerarchica pesata:** pesi pari a 0,61, 0,27 e 0,12 danno priorità rispettivamente alle partizioni più fine, intermedia e grossolana.
- **Inferenza basata sul centro di densità:** invece di restituire il centro geometrico della cella, la predizione usa la posizione media delle immagini di addestramento contenute nella cella più probabile. I punteggi gerarchici vengono propagati tra le risoluzioni per combinare le evidenze relative alle celle più fini.
- **Ulteriori ablazioni:** abbiamo testato un Convolutional Block Attention Module (CBAM), l'addestramento con i dati MP-16 e la sostituzione di ResNet-50 con Inception-v4.

Abbiamo suddiviso l'area di studio, composta da dieci stati, in celle S2 a tre risoluzioni, dalle celle fini a quelle regionali più ampie. Il modello gerarchico predice tutti e tre i livelli insieme, consentendo al contesto spaziale più ampio di informare la stima della posizione più precisa.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/s2-partition.png" alt="Partizione geografica S2 dell'area di studio, composta da dieci stati USA, a tre risoluzioni: celle fini, intermedie e grossolane." />
  <figcaption>Le celle S2 si adattano alla distribuzione delle immagini nell'area di studio; le partizioni più grossolane contengono meno celle, ma più grandi.</figcaption>
</figure>

I diagrammi seguenti mostrano il modello baseline con una sola testa, l'architettura gerarchica multi-head e l'alternativa ISN, che distingue scene urbane e naturali.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/baseline.png" alt="Architettura baseline per la geolocalizzazione: backbone ResNet-50 con una testa di classificazione delle celle geografiche." />
  <figcaption>Baseline: un modello ResNet-50 predice una cella della partizione geografica più fine.</figcaption>
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/multihead.png" alt="Architettura multi-head con tre livelli di partizione S2 e le corrispondenti teste di probabilità delle celle." />
  <figcaption>Modello multi-head: le feature visive condivise vengono classificate a risoluzione geografica fine, intermedia e grossolana.</figcaption>
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/ISN.png" alt="Architettura Individual Scene Network: classifica la scena e instrada l'immagine a modelli specializzati in ambienti urbani o naturali." />
  <figcaption>ISN: un classificatore di scene instrada l'immagine verso un modello di geolocalizzazione specializzato in contesti urbani o naturali.</figcaption>
</figure>

Per l'inferenza pesata, abbiamo propagato alle celle più fini le informazioni provenienti dalle tre risoluzioni, quindi stimato la posizione usando il centro di densità degli esempi di addestramento contenuti nella cella più probabile.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/weighted-pred.png" alt="Illustrazione dell'inferenza gerarchica pesata sulle celle geografiche: combinazione delle probabilità a tre risoluzioni S2." />
  <figcaption>L'inferenza pesata combina le probabilità delle celle gerarchiche e usa la distribuzione delle posizioni di addestramento all'interno della cella.</figcaption>
</figure>

La strategia di inferenza basata sul centro di densità ha prodotto il miglioramento maggiore. Sul validation set, il modello multi-head pesato ha raggiunto il 13,45% entro 1 km, rispetto al 6,34% ottenuto prima del cambiamento nell'inferenza. La suddivisione del modello in specialisti urbani e naturali non ha migliorato i risultati per questo dataset; CBAM e Inception-v4 non hanno prodotto miglioramenti costanti.

Abbiamo anche testato l'aggiunta dell'attenzione CBAM dopo il backbone ResNet-50, ma non ha migliorato i risultati di validazione sul dataset OSV-mini originale.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/cbam.png" alt="Diagramma del modello multi-head con un modulo Convolutional Block Attention inserito dopo il backbone ResNet-50." />
  <figcaption>CBAM è stato valutato come modulo aggiuntivo per il raffinamento delle feature.</figcaption>
</figure>

La figura seguente mostra i risultati di validazione delle configurazioni iniziali e delle successive ablazioni.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/results3.png" alt="Tabella della geo-accuratezza sul validation set: ampliamento con MP-16 e prove con CBAM, ISN e Inception-v4." />
  <figcaption>Le ablazioni sul validation set dopo l'aggiunta dei dati MP-16 mostrano che più dati e modifiche architetturali non migliorano sistematicamente la precisione alle distanze maggiori.</figcaption>
</figure>

## Risultati sul test set

Il confronto sul test set riportato di seguito mostra un netto miglioramento della geolocalizzazione regionale rispetto alla baseline ResNet-50, ottenuto combinando l'inferenza gerarchica pesata con i dati MP-16 filtrati. La configurazione migliore ha raggiunto il 33,94% entro 100 km, mentre la precisione a scala cittadina è rimasta bassa.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/test_set.png" alt="Tabella dell'accuratezza di geolocalizzazione sul test set: confronto tra baseline ResNet-50, inferenza pesata multi-head, ampliamento MP-16 e CBAM entro 1, 5, 25 e 100 km." />
  <figcaption>Geo-accuratezza (%) sul test set a soglie di distanza crescenti: la configurazione migliore raggiunge il 33,94% entro 100 km.</figcaption>
</figure>

La configurazione migliore ha aumentato la precisione entro 100 km dal 6,88% al 33,94% e quella entro 25 km dall'1,60% al 16,55%. Il miglioramento è stato molto più contenuto alle distanze cittadine: solo lo 0,16% delle immagini di test è stato localizzato entro 1 km.

## Discussione

Gli esperimenti suggeriscono che, in questo caso, combinare le evidenze spaziali a più scale geografiche e predire in base alla densità osservata delle posizioni di addestramento sia più utile che aumentare la complessità architetturale. Le immagini urbane sono state particolarmente difficili: ambienti costruiti simili in stati diversi possono confondere il modello, mentre i punti di vista limitati, spesso centrati sui veicoli, e la scarsa varietà ambientale del dataset hanno reso meno efficaci gli specialisti separati per contesti urbani e naturali.

Le prestazioni sul validation set sono state notevolmente superiori a quelle sul test set. OpenStreetView5M separa le sequenze di immagini in base al collaboratore o al veicolo, perciò i set di addestramento e test contengono sequenze riprese da persone e auto diverse. Il nostro validation set, invece, è stato estratto casualmente dal set di addestramento e poteva quindi includere immagini delle stesse sequenze di ripresa presenti anche nella parte usata per addestrare il modello. Di conseguenza, non rappresentava fedelmente il test set, separato per sequenza.

Questa differenza nella suddivisione suggerisce che il modello abbia sovradattato a indizi visivi specifici dell'auto o della telecamera, ricorrenti all'interno di una sequenza, invece di apprendere caratteristiche capaci di identificare una posizione in modo affidabile usando veicoli e telecamere differenti. Gli esempi seguenti evidenziano alcuni di questi indizi: il cruscotto e il parabrezza visibili nella parte inferiore dell'immagine, oltre alle differenze nella posizione della telecamera e nell'inquadratura. Una suddivisione casuale per la validazione può premiare la memorizzazione di questi schemi specifici della ripresa, mentre il test richiede una maggiore capacità di generalizzare a nuove fonti di acquisizione.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/geoloc-media/overfitting.png" alt="Tre immagini di Street View che mostrano indizi legati all'acquisizione: visibilità di cruscotto e parabrezza, posizione della telecamera e inquadratura." />
  <figcaption>Gli indizi dipendenti dal veicolo e dalla telecamera possono ripetersi all'interno di una sequenza, ma cambiare tra collaboratori e auto diversi.</figcaption>
</figure>

Il lavoro evidenzia un limite importante della normale loss di classificazione applicata alla geolocalizzazione: penalizza allo stesso modo una predizione in una cella vicina e una distante migliaia di chilometri. Un possibile sviluppo consiste nell'usare un label smoothing localizzato che tenga conto della prossimità geografica, insieme a una pulizia e selezione più accurate dei dati. Altre direzioni includono partizioni cartografiche alternative o dotate di significato semantico e il fine-tuning di una porzione maggiore del backbone visivo.
