English README version: [README.en.md](README.en.md)

# Struttura
- Cartella CityDirectory contiene i file .xml delle città di cui si vogliono ottenere le missioni
- Cartella database_prova contiene il database a cui verranno aggiunte informazioni. Se si vuole avere un nuovo database basterà eliminare quello già presente.
- Cartella tmp contiene tutti file temporanei che verranno creati nonchè file che dovranno essere poi spostati  nella cartella di tippecanoe (per essere convertiti in pbf). Contiene inoltre il file yaml che gestisce la logica di creazione delle domande

# Funzionamento File .yaml
## Il funzionamento del file yaml è descritto all'interno del codice, tuttavia lo riporto anche in questa sezione:
Parte riguardante i campi "way-keys":</br>
- Campo way-keys è costituito da vari campi key, il campo key è costituito dagli elementi name, values, values_not_to_have, tags, questions, must_have_tag, must_not_have_tag.
> - name: Nome della chiave che andremo a cercare (per es. highway)
> - values: costituito da diversi campi value, rappresentano i valori che sono associati alla chiave specificata dal campo name. (per es. motorway). Questo valore dovrà essere quindi presente nella chiave
> - values_not_to_have: costituito da diversi campim value, rappresentano i valori che non possono essere associati alla chiave specificata dal campo name. (per es. motorway). Se la chiave ha questo valore allora verrà scartata
> - tags: costituito da vari campi tag
>> - tag: costituito dai campi name, value, question, score, validating e answers. 
>>> - name: il campo name all'interno del tag rappresenta il tag che abbiamo scelto. Cerchiamo quindi se questo tag è presente nell'elemento selezionato. (per es. bicycle)
>>> - value: rappresenta il valore del tag. (per es. "yes") 
>>> - question: rappresente la domanda da effettuare nel caso l'elemento scelto abbia come tag quello indicato con valore indicato.
>>> - score: rappresenta il punteggio che viene assegnato al giocatore se risponde.
>>> - validating: campo che mostra se la domanda sarà di validazione oppure no.
>>> - answers: campo che indica le possibili risposte che lo user può dare alla domanda. Se il campo è none allora è una missione di validazione e le uniche risposte possibili sono sì o no.
>>> - icon: campo che indica l'icona da associare alla domanda.

> - questions: costituito da vari campi question, rappresentano le domande da effettuare per qualunque elemento avente come chiave quella richiesta. 
>> - question: costituito da campi question, score, tagAnswer e answers.
>>> - question: rappresenta la domanda associata
>>> - score: rappresenta il punteggio associato se lo user risponde alla domanda.
>>> - tagAnswer: rappresenta il tag associato alla risposta.
>>> - answers: rappresenta le risposte che lo user può inserire.
>>> - icon: campo che indica l'icona da associare alla domanda.

> - must_have_tag: Costituito da vari campi tag, rappresenta tutti i tag che la nostra chiave deve avere. Contiene inoltre i valori che il tag può o non può avere
>> - tag: costituito da campi name, values_to_discard, values_to_have
>>> - name: nome del tag (per es. bicycle)
>>> - values_to_discard: i valori associati al campo tag che se posseduti fanno scartare l'elemento (per es. "yes")
>>> - values_to_have: i valori associati al campo tag che devono essere posseduti affinchè l'elemento non venga scartato (per es. "yes")
> - must_not_have_tag: costituito da vari campi tag, rappresentano i nomi dei tag che se presenti nel nostro elemento lo fanno scartare.

Parte riguardante i campo "node-keys":</br>
- Il campo node-keys è costituito da vari campi key, il campo key è costituito dagli elementi name, values, tags, questions.
> - name: nome della chiave che ricerchiamo (per es. amenity)
> - values: costituito da vari campi value
>> - value: campi aventi un elemento name e uno question
>>> - name: costituisce il valore che deve possedere la chaive ricercata (per es. bicycle_parking)
>>> - question: La domanda associata nel caso in cui l'elemento fosse presente
>>> - icon: campo che indica l'icona da associare alla domanda.
> - tags: costituito da vari campi tag, rappresentano i tag che l'elemento deve possedere oltre alla chiave
>> - tag: costituito dai campi name, value e question
>>> - name: il nome del tag ricercato (per es. bicycle)
>>> - value: il valore che deve possedere il tag (per es. yes)
>>> - question: La domanda associata se il tag è presente
>>> - icon: campo che indica l'icona da associare alla domanda.
> - questions: costituito da vari campi question che indicano le domande da effettuare se la chiave viene trovata. Questo campo viene visualizzato indipendentemente dal valore della chiave. 

# Funzionamento codice
- Per creare i file necessari alla applicazione basterà inserire nella cartella CityDirectory i file .xml delle città di cui si vogliono ottenere le missioni; dopodichè avviare il codice python "FBKIterateQuestions.ipynb"
- Inizialmente il codice estrae dal file xml i dati riguardanti le ciclabili basandosi sul file yaml. Questa fase potrebbe anche essere saltata, bisognerebbe quindi estrarre ogni singolo elemento e darlo in pasto alle funzioni successive.
- Dopo aver fatto ciò, ognuno di questi dati viene ciclato e le missioni vengono associate grazie al file .yaml. Se si volesse modificare la logica di creazione delle missioni è qui che bisogna modificare il codice. O attraverso il file yaml ma mantenendo la logica precedentemente creata, oppure modificando la porzione di codice qui descritta.
- Una volta create le missioni vengono effettuate delle chiamate a overpass in modo da ottenere le informazioni riguardanti la geometria.
- Vengono quindi creati dei dataframe, allora viene ricercato il  punto medio delle vie e infine viene creato il database. Ogni operazione è effettuata tante volte quanto il numero delle città scelte. 

# File necessari
una volta eseguito il codice, i file necessari saranno: 
- il database all'interno della cartella database_prova
- i file riguardanti i punti centrali delle vie, presenti all'interno della cartella tmp/GeojsonFiles/centerWayPoints
- Le cartelle contenenti le singole vie e i singoli nodi, di cui il path tmp/GeojsonFiles/singleNodesFiles e tmp/GeojsonFiles/singleWaysFiles
Il database dovrà quindi essere spostato nella web-app con nome "applicationvalid.db", se si volessere aggiungere dati (come per esempio viene fatto nella cartella Ferrara) prima bisognerà spostare il database lì. 
Il resto dei file descritti dovrà essere inserito all'interno della cartella riguardante [tippecanoe}(../
