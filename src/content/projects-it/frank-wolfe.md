---
title: "Algoritmi di Frank-Wolfe per attacchi avversari mirati"
slug: frank-wolfe
type: "Progetto universitario"
subtype: "Ottimizzazione"
tags: [PyTorch, Hugging Face, Ottimizzazione, Adversarial ML]
summary: "Implementazione e confronto dei metodi Frank-Wolfe vanilla, away-step e pairwise per attacchi mirati con vincolo ℓ∞ su classificatori di immagini."
publishedAt: 2025-09-20
github: https://github.com/Afotrelle/adversarial_optimization
---

Questo è stato il mio progetto finale per il corso **«Optimization for Data Science»**, realizzato con Mattia Piazza. Abbiamo studiato come i metodi Frank-Wolfe, che non richiedono proiezioni, possano generare esempi avversari mirati: piccole modifiche a un'immagine che inducono un classificatore a predire una classe errata scelta in anticipo.

**[Visualizza il progetto su GitHub →](https://github.com/Afotrelle/adversarial_optimization)**

## Panoramica del progetto

Molti attacchi del primo ordine si basano sulla proiezione di ogni aggiornamento nell'insieme delle perturbazioni ammissibili. I metodi Frank-Wolfe usano invece un oracolo di minimizzazione lineare per scegliere una direzione ammissibile, quindi aggiornano la soluzione spostandosi verso un punto dell'insieme vincolato. In questo modo evitano la proiezione esplicita e possono produrre perturbazioni con distorsione inferiore.

Abbiamo implementato tre varianti per attacchi mirati white-box, assumendo di avere accesso al modello e ai suoi gradienti. Ogni attacco minimizza la loss della classe obiettivo mantenendo la perturbazione entro un budget ℓ∞:

- **Frank-Wolfe vanilla (FW):** compie un passo di gradiente condizionato verso il vertice selezionato dall'oracolo di minimizzazione lineare, usando un passo decrescente.
- **Away-Step Frank-Wolfe (AFW):** mantiene un insieme attivo e può allontanarsi da un vertice poco utile, contrastando l'andamento a zig-zag del FW vanilla.
- **Pairwise Frank-Wolfe (PFW):** trasferisce direttamente il peso da un vertice dell'insieme attivo al nuovo vertice selezionato da FW.

Nella nostra implementazione AFW e PFW usano una ricerca lineare per bisezione. L'attacco termina quando raggiunge la classe obiettivo richiesta o il limite di iterazioni.

## Configurazione sperimentale

Abbiamo valutato i metodi su 200 immagini per ciascuno di tre compiti di classificazione:

- **MNIST:** classificazione di cifre manoscritte con una CNN basata su SigLIP.
- **ImageNet-1K:** classificazione di immagini naturali con ResNet-50 preaddestrata.
- **FairFace:** classificazione per fascia d'età con un Vision Transformer.

Per ogni immagine, abbiamo scelto casualmente come obiettivo un'etichetta diversa dalla predizione originale. Per tutti i dataset abbiamo variato il budget ℓ∞ ε da 0,10 a 0,50, con incrementi di 0,02; per ImageNet e FairFace abbiamo aggiunto un intervallo da 0,01 a 0,10. Gli attacchi avevano un limite di 25 iterazioni. Abbiamo registrato tasso di successo (ASR), iterazioni necessarie per il successo, tempo di esecuzione e distorsione della perturbazione. I risultati sono medie sui budget testati; i tempi sono stati misurati su un MacBook Pro con Apple M1 Pro e 32 GB di RAM.

## Risultati

| Dataset | Algoritmo | ASR | Iterazioni medie | Tempo medio per attacco |
|---|---|---:|---:|---:|
| MNIST | FW vanilla | 100,00% | 4,68 | 0,93 s |
| MNIST | Away-Step FW | 97,33% | 4,27 | 3,64 s |
| MNIST | Pairwise FW | 99,76% | 3,09 | 2,54 s |
| ImageNet-1K | FW vanilla | 96,02% | 8,26 | 1,04 s |
| ImageNet-1K | Away-Step FW | 91,45% | 7,95 | 6,25 s |
| ImageNet-1K | Pairwise FW | 87,98% | 7,25 | 3,83 s |
| FairFace | FW vanilla | 99,81% | 3,88 | 0,71 s |
| FairFace | Away-Step FW | 99,89% | 2,64 | 1,98 s |
| FairFace | Pairwise FW | 98,14% | 2,69 | 1,92 s |

Tutti e tre i metodi sono risultati efficaci, soprattutto con budget di perturbazione più ampi. Su ImageNet e FairFace il tasso di successo è aumentato rapidamente con ε, avvicinandosi alla saturazione intorno a ε = 0,10. Molti attacchi riusciti hanno usato una distorsione inferiore al massimo consentito dal budget.

In generale, le varianti hanno raggiunto l'obiettivo in meno iterazioni rispetto a FW vanilla; spesso PFW ha richiesto il minor numero di iterazioni. Tuttavia, la ricerca lineare e la gestione degli insiemi attivi hanno aumentato il costo per iterazione. In tempo reale, FW vanilla è stato il metodo più veloce su ImageNet e FairFace e ha ottenuto l'ASR medio più alto su MNIST e ImageNet. AFW ha raggiunto l'ASR più alto e il minor numero di iterazioni su FairFace, ma ha richiesto più tempo per attacco. Il metodo più efficiente dipende quindi dalla priorità: tasso di successo, numero di iterazioni o tempo di esecuzione.

## Conclusioni e sviluppi futuri

Gli esperimenti mostrano che i metodi Frank-Wolfe senza proiezione possono generare attacchi mirati efficaci con vincoli ℓ∞. Le varianti più elaborate possono ridurre il numero di iterazioni, ma non necessariamente il tempo totale: in questa implementazione, la ricerca lineare e gli aggiornamenti dell'insieme attivo hanno aumentato il costo di ogni iterazione. FW vanilla ha offerto un buon equilibrio pratico tra efficacia e velocità.

I tempi assoluti dipendono dall'hardware e dall'implementazione. Tra i possibili sviluppi: aggiungere momentum, adottare strategie adattive per il passo e definire criteri di arresto che considerino congiuntamente successo dell'attacco, tempo e distorsione.
