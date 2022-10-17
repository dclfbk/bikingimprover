# Codice New_createMissions.ipynb
Il codice new_createMissions.ipynb prende i file shp, seleziona gli elementi che hanno valore None su alcuni tag (quelli di cui il comune non ha info quindi).
Successivamente elimnina i valori che hanno None o NaN sul campo geometria (che non potrebbero quindi essere visti sulla mappa altrimenti). 
Dopodichè vengono eliminate alcune colonne (altrimenti il codice ci meterebbe troppo tempo a creare le missioni...)
Il file create_Ferrara_quest.yaml contiene la logica per creare le missioni associate ai dati del comune. Vengono quindi create le missioni e il geodataframe. 
I dati all'interno del geodataframe devono essere riproiettati per essere scritti secondo la epsg 4326 siccome i dati di Ferrara utilizzano 3857 come epsg.
Le informazioni vengono infine aggiunte al database già esistente. 
Se si volessero usare dati  di altri comuni, se hanno una struttura simile a quelli di Ferrara questo codice può essere riciclato. Basterà infatti cambiare il file yaml e i dati in input.

# Codice convertiTags.ipynb
Questo codice può essere utilizzato per qualunque tipo di dati di un comune. Permette di convertire i dati dal linguaggio del comune (tag come  per esempio "marciapiede" in linguaggio OSM e viceversa).
Il codice per prima cosa prende i dati di Ferrara, estrae i nomi dei tag utilizzati e li inserisce in un file csv.</br>
Nel codice vi è scritto come funziona la fase di associazione tags. La riporto qui:
## Fase di Associazione Tags

- Una volta creati i csv per ogni dato di Ferrara (che si trovano nelle cartelle "FerraraFiles/csvFiles/nodeTags" e "FerraraFiles/csvFiles/wayTags"), devo riempire le tabelle con le traduzioni.

- Purtroppo questa fase è da compilare a mano in quanto è di traduzione. Ho inserito le traduzioni in file excel che possono essere facilmente convertiti in csv

- Carico i file convertiti in csv qui su python e effettuo le associazioni dei tag di Ferrara con quelli di OSM

- I file excel possono essere consultati nella cartella excelFiles. Un esempio può essere visto nell'immagine [excelExample](/doc/excelExample.png) 

Lo standard per leggere i csv e scrivere il file excel al fine di fare le associazioni è il seguente:
- La prima cella del file excel (cella 0,0) deve essere vuota. La seconda colonna prima riga (cella 0,1) deve contenere il nome della chiave del comune (es.: livello)
- Nome del File csv/excel deve avere all'interno la chiave presa in considerazione del comune/ente (per es.: ferraraTagsilllumnaz.csv ha come chiave il tag illuminaz)
- Nel file csv/excel la prima colonna rappresenta i valori che possono essere assegnati alla chiave del comune (per es.: si), le colonne successive mostrano la traduzione della chiave e del tag considerato(per es.: chiave=illuminaz, tag=si, traduzione=lighting=yes)
- Se non vi è una traduzione si può lasciare il campo excel vuoto, tuttavia Se non viene inserito nulla i campi senza traduzione verranno ignorati e quindi eliminati. Se si vogliono tenere almeno i tag senza una traduzione allora inserire 0 nel campo traduzione
- Se può essere tradotto in più modi, scrivere le traduzioni di colonna in colonna
- non andare a capo all'interno delle celle
- Se un tag può avere più valori è necessario separarli con uno slash ("/"), per es.: bicycle=yes/no/...
- Se un elemento deve essere tradotto tramite la composizione di più tag, separare questi con un +. Per es.: su marciapiede ----> highway=cycleway/footway/path + bicycle=designated + foot=designated + segregated=yes + sidewalk=yes/both/separate/right/left
- Il file va quindi letto di riga in riga per vedere le varie associazioni riguardanti i vari tag

