---
title: "Attacchi avversari sparsi su video"
slug: sparse-adversarial-video-attacks
type: "Ricerca"
subtype: "Tesi magistrale"
tags: [PyTorch, Hugging Face, Adversarial ML, Ottimizzazione sparsa, Modelli video, HPC, Slurm]
summary: "Uso di proiezioni sulle palle ℓ₀ e ℓ₁ in PGD per imporre perturbazioni avversarie sparse contro modelli video."
publishedAt: 2026-10-09
github: https://github.com/Afotrelle/Adv-attack-videos
---

[**GITHUB →**](https://github.com/Afotrelle/Adv-attack-videos)

Questo lavoro è alla base della mia tesi magistrale in Data Science all'Università di Padova, svolta durante un tirocinio di ricerca nel gruppo VIMP (Visual Intelligence and Machine Perception), sotto la supervisione dei Prof. Lamberto Ballan e Marco Fiorucci.

La tesi completa è disponibile pubblicamente: https://thesis.unipd.it/handle/20.500.12608/115820

## Panoramica

Piccole modifiche intenzionali all'input possono ingannare i modelli video. Gli attacchi sparsi esistenti si chiedono quali **fotogrammi** perturbare e poi modificano densamente ogni fotogramma selezionato. Io ho affrontato una domanda diversa: quanti pochi **pixel** bastano? Ho sviluppato un attacco che impone la sparsità come vincolo rigido sia a livello di fotogramma sia a livello di pixel, all'interno di un unico ciclo basato sul gradiente.

## Perché gli attacchi sparsi?

Una perturbazione densa, anche se molto piccola per ogni pixel, presuppone che l'attaccante possa modificare tutti i pixel di tutti i fotogrammi. Un attacco sparso pone una domanda più utile: *quanto poco deve poter controllare un avversario per provocare comunque un errore?*

La sparsità è anche uno strumento diagnostico. Un attacco denso mostra che un modello può essere ingannato; uno sparso rivela *dove* è vulnerabile. Questo secondo aspetto si è rivelato il risultato più interessante della tesi (si veda sotto).

## Il problema aperto

I due lavori precedenti più vicini trattano la sparsità in modo diverso, ma nessuno dei due interviene sui pixel:

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/comparison_table.png" alt="Confronto tra sparsità dei fotogrammi, sparsità dei pixel e meccanismi adottati dai diversi attacchi." />
</figure>

Entrambe le baseline minimizzano una funzione obiettivo non vincolata con penalità, nello stile di Carlini e Wagner. Una penalità non può imporre un budget rigido: per questo la sparsità dei fotogrammi viene soltanto indotta o ricercata. Una formulazione basata sul gradiente proiettato può invece imporre il vincolo direttamente per costruzione.

## Approccio

L'attacco è una discesa del gradiente proiettata (PGD) con un insieme ammissibile definito a due livelli.

**1. Selezione adattiva dei fotogrammi.** A ogni iterazione, a ciascun fotogramma viene assegnato un punteggio pari alla norma ℓ₁ della perturbazione corrente; vengono mantenuti soltanto i K fotogrammi con punteggio più alto:

$$a_t = \sum_{h,w,c} |\delta_{t,h,w,c}|, \qquad \Phi_K = \text{top-}K\{a_t\}$$

È un passo di sogliatura rigida. Viene ricalcolato a ogni iterazione a partire dal gradiente: non c'è una maschera fissa né una ricerca esterna.

**2. Proiezione a livello di pixel.** Nei fotogrammi mantenuti, la perturbazione viene proiettata alternativamente:
- sulla palla ℓ₀, mantenendo i k pixel con modulo maggiore e azzerando gli altri;
- sulla palla ℓ₁, con la proiezione basata sull'ordinamento descritta da Duchi et al.

**3. Allocazione del budget.** Ho confrontato due modalità di distribuzione del budget di pixel: *globale*, in cui i fotogrammi competono liberamente per il budget, e *per fotogramma*, in cui ogni fotogramma mantenuto riceve una quota uguale.

**4. Normalizzazione del gradiente.** Senza normalizzazione, il passo efficace variava molto tra i modelli (da circa 1 a circa 10). Riscalando il gradiente tramite la media del suo valore assoluto,

$$\tilde{g} = \frac{\nabla_x \mathcal{L}}{\tfrac{1}{n}\|\nabla_x \mathcal{L}\|_1},$$

un unico passo ($\alpha = 0{,}001$) funziona su tutte e tre le architetture. Non è più garantita la convergenza del passo, ma in pratica l'attacco si arresta alla prima classificazione errata. Su Conv+LSTM con un budget ℓ₀ dell'1%, senza normalizzazione e con $\alpha=1$ l'attacco raggiunge un tasso di errore del 25%; con la normalizzazione arriva al 93%.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/thesis_algorithm.png" alt="Pseudocodice dell'attacco PGD sparso con vincoli ℓ₀ e ℓ₁ e selezione adattiva dei fotogrammi." />
</figure>

## Risultati

Ho valutato i modelli preaddestrati **Conv+LSTM**, **I3D** e **VideoMAE** su sottoinsiemi di UCF101 e Kinetics-400, confrontandoli con mie reimplementazioni PyTorch di entrambe le baseline.

- **Confronto con le baseline.** Gli attacchi superano quello di Wei et al. basato su ℓ₂,₁ e raggiungono il tasso di errore di DeepSAVA soltanto quando è possibile perturbare l'intero video. Con pochi fotogrammi, la ricerca densa e mirata ai fotogrammi di DeepSAVA rimane più efficace.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/fooling_rates.png" alt="Confronto tra i tassi di errore causati dagli attacchi." />
</figure>

- **Costo della perturbazione.** A parità di numero di fotogrammi, i miei attacchi modificano una piccola frazione dei pixel e hanno una perturbazione media assoluta molto inferiore a entrambe le baseline. Il parametro di budget rende visibile il compromesso tra tasso di errore e costo della perturbazione, che le baseline non offrono.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/sparsity.png" alt="Confronto della sparsità delle perturbazioni tra i metodi." />
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/mean_absolute_perturbation.png" alt="Confronto della perturbazione media assoluta (MAP)." />
</figure>

- **Velocità.** Gli attacchi hanno il costo per iterazione più basso tra i metodi confrontati. DeepSAVA richiede meno iterazioni quando si attaccano molti fotogrammi; considerando l'intera esecuzione, il mio framework si colloca tra DeepSAVA e l'attacco ℓ₂,₁ ed è il più veloce dei tre nel regime sparso.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/wall_clock_time.png" alt="Tabelle di confronto dei tempi di esecuzione." />
</figure>

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 40rem;">
  <img src="/performance.png" alt="Confronto delle prestazioni dei metodi." />
</figure>

- **Allocazione globale o per fotogramma.** Le due strategie sono quasi equivalenti per tasso di errore, SSIM e ampiezza della perturbazione, un risultato inatteso. L'allocazione per fotogramma conserva un vantaggio strutturale: limita la quota che può essere assegnata a un singolo fotogramma.

## La sparsità come lente sul modello

Osservare *dove* l'attacco sparso meno costoso interviene rivela schemi chiaramente dipendenti dall'architettura, anche se i tre modelli vengono ingannati con tassi simili:

- **VideoMAE:** le perturbazioni formano una griglia visibile, allineata con la tokenizzazione a patch del modello.
- **Conv+LSTM:** la perturbazione si concentra in pochi fotogrammi iniziali e si propaga attraverso lo stato nascosto ricorrente, in accordo con una precedente osservazione di Wei et al.
- **I3D:** la perturbazione si distribuisce tra i fotogrammi con un marcato andamento oscillatorio, che ipotizzo possa essere legato allo stride temporale delle convoluzioni 3D.

<figure class="prose-figure prose-figure--compact" style="--figure-max-width: 55rem;">
  <img src="/l0global.png" alt="Mappe delle perturbazioni PGD globali con vincolo ℓ₀ per ciascuna architettura." />
</figure>

Queste osservazioni sono qualitative; una caratterizzazione più sistematica resta un problema aperto.

## Limiti e sviluppi futuri

- La valutazione usa sottoinsiemi dei test set, non i dataset completi.
- Gli iperparametri sono stati ottimizzati attaccando tutti i fotogrammi ($K = T$), quindi l'interazione tra il budget a livello di fotogramma e quello a livello di pixel è stata esplorata solo in parte.
- Le mie reimplementazioni di Conv+LSTM e I3D non riproducono esattamente le accuratezze riportate negli articoli originali, a causa delle differenze tra PyTorch e TensorFlow e tra le pipeline di addestramento.

Tra i possibili sviluppi: valutare l'attacco contro difese esistenti, usarlo come generatore di attacchi in un ciclo di addestramento avversario (dove il basso costo per iterazione è utile) ed estenderlo ai modelli video fondamentali usando una loss sulle rappresentazioni interne invece che sull'output di classificazione.

## Ringraziamenti

Ringrazio i Prof. Lamberto Ballan e Marco Fiorucci per la supervisione e Matteo Bergamaschi, PhD, e il Prof. Francesco Rinaldi per i loro consigli.
