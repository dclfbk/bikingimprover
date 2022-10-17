English README version: [README.en.md](README.en.md)

# Logica
Il codice prende i file csv, li traduce in dataframe e li inserisce come tabelle all'interno di un database esistente con nome applicationValid.db
</br>

Per creare nuove medaglie aggiungere i dati all'interno del csv allMedals.csv. La tabella è costituita dalle colonne MEDALNAME, COLOR, DESCRIPTION.
- MEDALNAME: nome della medaglia che si vuole aggiungere
- COLOR: colore con il quale la applicazione mostrerà la medaglia
- DESCRIPTION: la descrizione della medaglia
All'interno della applicazione quindi aggiungere la traduzione della medaglia nel file translation.js. In particolare il campo avrà il nome stesso della medaglia e la traduzione sarà la descrizione.
Se si volessero creare delle nuove medaglie sarebbe necessario anche cambiare la logica all'interno della gamification engine... Bisogna quindi avere l'accesso a quest'ultima.

</br>

Per creare nuovi power-up aggiungere i dati all'interno del csv powerUps.csv. I power up che vengono aggiunti devono però essere gestiti anche all'interno della web-app, è quindi necessario modificare anche il codice della app stessa, altrimenti i power up verranno solo visualizzati nello shop ma non avranno alcun effetto.  La tabella è costituita dalle colonne POWERNAME, PRICE, DESCRIPTION, IMAGE.
- POWERNAME: Il nome assegnato al power up
- PRICE: Il prezzo che l'utente deve pagare per ottenere il power up
- DESCRIPTION: una variabile che permette poi nella app di inserire la descrizione del power up nelle deiverse lingue. La descrizione va inserita all'interno del file [translations.js](../bicycle-osm-app/src/utils/translations.js)
- IMAGE: l'immagine associata al power up. Deve essere presente nella web-app all'interno della cartella [images](../bicycle-osm-app/src/assets/images).
<!-- -->
I power up che per ora hanno effetto sono "seeEverything" e "PointBonuses", i quali permettono rispettivamente di: 
- vedere solo le vie e i nodi con assegnati punteggi maggiori 
- ottenere +1 punto per ogni missione completata

</br>

Per creare nuovi pin aggiungere i dati all'interno del csv pin.csv. La tabella è costituita dalle colonne IMAGE, PRICE.
- IMAGE: l'immagine assegnata al pin, deve essere presente nella web-app all'interno della cartella [images](../bicycle-osm-app/src/assets/images).
- PRICE: Il prezzo che l'utente deve pagare per ottenere il pin


