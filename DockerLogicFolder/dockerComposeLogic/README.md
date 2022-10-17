English README version: [README.en.md](README.en.md)

I comandi di seguito vanno eseguiti nella cartella corrente.
Se il docker non ha bisogno di sudo come comando allora lo si può tralasciare (penso)

Creare una cartella chiamata AllNeededDirectories e inserirci i file: 
- bicycle-osm-app 
- create_geometry_spatialite
- FerraraTranslation
- tippecanoe
I File possono essere ottenuti dalla repository su git
(Magari in futuro li aggrego io nella cartella su github cosi si può evitare questo passaggio)

Controllare che nella cartella AllNeededDirectories/bicycle-osm-app/pbfFiles ci siano le seguenti cartelle:"CenterGeojson, LayersNames" e che siano vuote. se non si sono allora crearle.

0) Lanciare il comando "sudo docker volume create --name DataVolume1" per creare il volume per tenere dati utili
1) Lanciare il comando "sudo docker compose build ubuntu" per creare l'immagine contenente ubuntu e gli script necessari
2) Lanciare il comando "sudo docker run -d --name systemContainer compose_from_repository_ubuntu" per creare il container contenente l'immagine creata
3) Lanciare il comando "sudo docker cp systemContainer:/datavolume datavolume" per copiare nella directory corrente la cartella datavolume
# 2) Lanciare comando "sudo docker container ls -a" per ottenere la lista dei container creati
# 3) Utilizzando l'id del container generato lanciare il comando "sudo docker cp &ltcontainerID&mt:/datavolume datavolume"
4) Usare il comando "sudo chmod -R o+rw datavolume" per dare i permessi alla cartella datavolume
5) Lanciare il comando "sudo docker compose build web" per creare l'immagine dell'applicazione
6) Lanciare il comando "sudo docker run -dp 8080:8080 compose_from_repository_web" per lanciare l'applicazione
6) Navigare alla pagina localhost:8080 e visualizzare il sito.

I file che vengono salvati nel volume si troveranno poi nella cartella "/var/lib/docker/volumes/DataVolume1/_data"
Siccome muoviamo i file tramite il comando a punto 3. possiamo trovare i dati salvati direttamente nella directory corrente all'interno della cartella datavolume



Per sapere come modificare i file e il funzionamento del programma visitare la repository github e leggere il readme.
Alcuni script sono in ogni caso spiegati all'interno del codice stesso.


Tempo richiesto all'incirca 1600 sec + 200 sec + 60 sec + 600 sec + 100 sec(exporting image and layers...). Mezz'ora circa.
