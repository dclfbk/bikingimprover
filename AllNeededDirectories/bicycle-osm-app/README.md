English README version: [README.en.md](README.en.md)

# bicycle-osm-app

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# How Does It Work?

## Language
E' possibile inserire nuovi linguaggi modificando il file translations.js presente in src/utils. Bisogna mantenere la stessa struttura dei linguaggi già presenti, utilizzare quindi lo stesso nome delle variabili e scrivere la traduzione nella lingua scelta. 

## .env Variables
Nella cartella "base" dell'applicazione è necessario inserire un file .env contenente le seguenti variabili: 
- ID_GAME_USER : l'id con il quale viene effettuato il login all'interno della gamification engine
- ID_GAME_ENGINE: l'id della applicazione utilizzata all'interno della gamification engine
- PW_GAME_ENGINE: la password con la quale viene effettuato il login all'interno della gamification-engine
- REST_PASSWORD: la password che dev'essere verificatta per effettuare le chiamate rest. A decisione dle developer
- VUE_APP_EMAIL_JS_SERVICE_ID: l'id del servizio emailjs
- VUE_APP_EMAIL_JS_TEMPLATE_ID: l'id del templace emailjs
- VUE_APP_EMAIL_JS_PUBLIC_KEY: la chiave pubblica data da emailjs
- VUE_APP_EMAIL_JS_USER_ID: l'id dello user iscritto al servizio emailjs
- VUE_APP_REST_PASSWORD: password uguale a REST_PASSWORD.

## Auth0
All'interno della cartella src/utils vi sono i file auth.js e authGuard.js che gestiscono login signup e logout tramite Auth0. Se si vuole modificare i login di redirect e callback tramite nuovi url allora è necessario inserire gli stessi all'intero di Auth0 con l'applicazione associata. Per inserire i nuovi url all'interno di Auth0 bisogna far parte della seguente applicazione: https://manage.auth0.com/dashboard/eu/prova-osm/applications/0jQ1kV47wtmoOUrNJgcvvPCzGPwDxEmk/settings. 
Inoltre quando l'applicazione verrà inserita in un dominio, bisognerà cambiare la variabile $api_url nel file main.js 
In alternativa si può creare una nuova applicazione all'interno di auth0 e configurarla con vue.js (inserire quindi i dati necessari all'interno di auth.config.js).

Se per caso bisognasse ricreare la logica all'interno di auth0:

- Nella DashBoard dell'applicazione collegata a Auth0 bisognerà aggiungere una azione custom che dev'essere chiamata durante il login. Quest'azione   creerà un campo signUpName nello usr in modo da associarlo allo user della gamification engine. Codice su auth0 dashboard action custom:</br>
exports.onExecutePostLogin = async (event, api) => {
  if (event.user.user_metadata.signUpName!=null) {
    console.log(`Skipping the expensive task because it already occurred for ${event.user.email}.`);
    return;
  }
  // do and expensive task
  api.user.setUserMetadata("signUpName", event.user.nickname);
};</br>
Dovrà essere aggiunta quindi una regola che permetta di ottenere la metadata signUpName ogni qualvolta si vogliono ottenere le info dello user. Questa regola ha codice:</br>
function (user, context, callback) {
  const namespace = 'myUserID';
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.signUpName = user.user_metadata.signUpName || null;
  context.idToken[`${namespace}signUpName`] = user.user_metadata.signUpName;
  callback(null, user, context);
}</br>
All'interno della sezione Actions/flow sempre in auth0 andare su login e quindi inserire la regola e la azione creata.

Se si volesse attivare la verifica della mail basterà andare nel file authGuard.js e togliere il commento da riga 9 a riga 28.

## Structure
- La cartella "databases" contiene il database contentente le informazioni delle vie/nodi e quindi delle domande.
- La cartella routes contiene i vari file che gestiscono le chiamate rest.
- La cartella src contiene tutti i file riguardanti la parte frontend della applicazione. All'interno di src/assets/css vi è un file .css contentene parte del css dell'applicazione, nonchè variabili utilizzate per cambiare il tema. All'interno di src/images vi sono le immagini utilizzate.
  - src/views contiene le pagine principali della applicazione
  - src/components contiene i componenti utilizzati dalle pagine principali
  - src/router è il router che permette la navigazione tra le pagine
  - src/utils contiene file che gestiscono Auth0, funzioni globali e oggetti come UserData.
- La cartella pbfFiles contiene i file riguardanti i pbf e i geojson che vengono poi mostrati nella mappa. 

## Database Spatialite
Il database che è stato utilizzato è spatialite, tuttavia le geometrie vengono ora gestite da maplibre e turf, percui lo si potrebbe trasformare in un altor tipo di database e però sarebbero da modificare le chiamate all'interno della cartella routes.
Il database spatialite all'interno della web-app (nella cartella databases) contiene informazioni riguardanti vie/nodi e tabelle riguardanti i potenziamenti acquistati dagli user all'interno del gioco. Le tabelle presenti nel db sono:
- question_table, Contiene i campi:
  - TYPE: campo di di tipo text, contiene il valore WAY oppure NODE
  - QUESTION: campo di tipo text, rappresenta la domanda associata alla via 
  - ID: campo di tipo integer, l'id che identifica la via
  - SCORE: campo di tipo real, rappresenta il punteggio che viene assegnato allo user se risponde alla domanda
  - VALIDATING: campo di tipo text, rappresenta se la domanda è di tipo validazione o meno
  - ANSWERS: campo di tipo text, rappresenta le possibili risposte che lo user può selezionare (separate da una ,) 
  - ANSWER: campo di tipo text, rappresenta la risposta che viene data dallo user
  - USERANSWERED: campo di tipo text, rappresenta il nome dello suer che ha risposto per primo alla domanda
  - NUMBEROFVALIDATIONS: campo di tipo integer, rappresenta il numero di validazioni che ha conseguito la risposta data dallo suer
  - USERSWHOVALIDATED: campo di tipo text, rappresenta la lista degli user che hanno validato la risposta (separati da una ,)
- completed_table, contiene i campi:
  - id: tipo text rappresenta l'id della via le cui domande sono state tutte completate e validate.
  - type: tipo text rappresenta il tipo della geometria, valore "node" o "way"
  - completed: tipo text indica se la via è stata completata o meno
- powerUps_table:
    - POWERNAME: text field, Nome del powerup
    - PRICE: integer field, prezzo da pagare per comprare il pwoerup
    - DESCRIPTION: text field, una variabile il cui nome è associato a uno del file translation.js. Quando viene tradotta allora dà la descrizione del potenziamento
    - IMAGE: text field, immagine associata
- pins_table:
    - IMAGE: text field, immagine associata al pin
    - PRICE: integer field, prezzo da pagare per comprare il pin
- medals_table:
    - MEDALNAME: text field, nome della medaglia
    - COLOR: text field, rappresenta il colore con cui viene visualizzata la medaglia nella web-app
    - DESCRIPTION: text field, descrizione della medaglia
- power ups tables (con nome della tabella uguale allo username dello user a cui appartiene), contiene i campi:
  - POWERNAME: campo varchar(100) che rappresenta il nome del power up comprato dallo user
  - TIME: campo varchar(100) che rappresenta il momento in cui il power up è stato comprato l'ultima volta dallo user
  - LIFETIME: campo varchar(100) che rappresenta la durata del potenziamento (per ora espresso in giorni)

## EmailJS
Nella pagina About per inviare email viene utilizzato il servizio emailjs. Se si volesse modificare la mail a cui arrivano i messaggi allora bisognerebbe cambiare i valori del servizio.

## Pagina Medaglie
Le medaglie sono descritte in maniera statica sulla app, in futuro si potrebbe creare un oggetto che tiene anche tutte le info all'interno della gamification engine(?)

## Pagina TilesVector
Questa pagina è il cuore della applicazione, quando viene montata il componente viene verificato lo user, se questo è nuovo allora viene reindirizzato alla pagine di tutorial. Ogni 5 minuti la pagina verifica se lo user ha ottenuto abbastanza validazioni a una sua domanda. Se sì invia un messaggio. 
La pagina ha il componente MyTiles che è il componente nel quale viene gestita tutta la logica dei livelli e della mappa in generale.

### MyTiles
Quando il componente viene montato vengono prima di tutto verificati quali sono i layer da creare tramite i file .txt wayLayersNames e nodeLayersNames. 
Successivamente vengono verificate quali sono le vie e i nodi completati così da nasconderli. Vengono creati poi dei timer con i quali poter continuare ad aggiornare la mappa e le vie complete ogni 5 minuti. Vengono quindi creati tutti i vari layer, partendo da quello mostrante le vie, i punti centrali,i nodi e i cluster. I cluster sono collegati al layer dei punti centrali che deve essere un geojson. Le vie e i nodi sono mostrati tramite dei pbf. Per decidere quali vie mostrare e quali no viene utilizzata una funzione di maplibre con la quale gli id delle vie vengono confrontati con quelli delle vie completate ottenute precedentemente. Vengono quindi create le funzioni per controllare i click sulla mappa. Le varie funzioni e variabili sono commentate nel codice.
Se si volesse aggiungere la funzione per la quale solo i dati all'interno di un certo poligono vengono mostrati, basterà togliere il commento dove vengono ricercati i punti centrali e i nodi (nel codice è segnato da un commento tutto in maiuscolo, verso riga 163) e togliere il commento dalla funzione findIdInsidePol(). Il poligono in questione per ora è definito all'interno del codice, si può comunque creare un file geonson, effettuare una chiamata rest e quindi poterlo gestire da un file esterno.

## Profilo e Cambio Nome
Per gestire il cambio  del nome è stata implementata una funzione all'interno di auth0 che permette di creare un campo di nome "signUpName" all'interno degli user al momento del signup. I nomi mostrati sono quelli all'interno della variabile nickname nella gamification engine, tuttavia la variabile signupName è uguale all'id dello user all'interno della gamification engine.

## Database Spatialite
Le vie e le loro informazioni associate sono salvate in un db spatialite. Lo stesso vale per i nodi. Inoltre in questo database sono presenti tante tabelle quanti sono il numero di giocatori. Queste tabelle contengono i potenziamenti che vengono comprati dagli user. I potenziamenti hanno nomi specifici e in base al nome hanno effetti diversi. La tabella dei potenziamenti indica il nome (colonna POWERNAME), il momento in cui è stato comprato (TIME) ed infine il tempo di durata in giorni del potenziamento (LIFETIME). 

## UserData
La struttura UserData viene inizializzata nelle pagine che richiedono il login. in UserData sono presenti tutti i dati della gamification engine associati allo user e tutti i potenziamenti che ha acquistato in negozio (i quali sono stati salvati nel database spatialite). Le operazioni che vanno a modificare i dati dell'utente modificano anche la userData, in questo modo la applicazione è responsiva e non c'è bisogno di richiamare sempre la gamification engine per ottenere i dati dello user. 
