# Buonastrada 2.0 Dashboard

Buonastrada 2.0 Dashboard è un'applicazione web per la gestione dei punti di interesse, comuni, categorie e tour. Questa applicazione è stata creata utilizzando [Create React App](https://github.com/facebook/create-react-app).

## Requisiti

- Node.js (versione 14 o superiore)
- npm (versione 6 o superiore)

## Installazione

1. Clona il repository:

    ```sh
    git clone https://github.com/tuo-username/buonastrada2_0_dashboard.git
    ```

2. Naviga nella directory del progetto:

    ```sh
    cd buonastrada2_0_dashboard
    ```

3. Installa le dipendenze:

    ```sh
    npm install
    ```

## Scripts Disponibili

Nel progetto, puoi eseguire i seguenti script:

### `npm start`

Esegue l'app in modalità sviluppo.\
Apri [http://localhost:3000](http://localhost:3000) per visualizzarla nel browser.

La pagina si ricaricherà quando apporti modifiche.\
Potresti anche vedere eventuali errori di lint nel console.

### `npm test`

Avvia il test runner in modalità interattiva.\
Consulta la sezione su [running tests](https://facebook.github.io/create-react-app/docs/running-tests) per ulteriori informazioni.

### `npm run build`

Compila l'app per la produzione nella cartella `build`.\
Bundle React in modalità produzione e ottimizza la build per le migliori performance.

La build è minificata e i nomi dei file includono gli hash.\
L'app è pronta per essere distribuita!

## Struttura del Progetto

- public: Contiene i file statici e l'index.html.
- src: Contiene il codice sorgente dell'applicazione.
   - components/: Contiene i componenti riutilizzabili.
   - context/: Contiene i contesti per la gestione dello stato globale.
   - screen/: Contiene le pagine principali dell'applicazione.
   - utils: Contiene le funzioni di utilità.

## API
L'applicazione interagisce con le seguenti API:

- /api/comuni: Endpoint per la gestione dei comuni.
- /api/categorie: Endpoint per la gestione delle categorie.
- /api/tours: Endpoint per la gestione dei tour.
- /api/pdi: Endpoint per la gestione dei punti di interesse.

## Licenza

Questo progetto è concesso in licenza sotto la licenza MIT. Consulta il file LICENSE per ulteriori dettagli.