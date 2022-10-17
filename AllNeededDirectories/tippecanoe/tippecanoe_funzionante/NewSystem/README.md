English README version: [README.en.md](README.en.md)

# Funzionamento
Lo script newSystemPbfCreation.ipynb gestisce la creazione dei file necessari affinchè l'applicazione possa funzionare correttamente. 
Come commentato nelle prime righe del codice:

Logica Gestione Cartelle e File:
L'iniziale delle città deve avere la lettera maiuscola.
- Cartella "CenterGeojsonCittà" contiene i file dei punti centrali delle vie in formato geojson. Ognuno dei file contiene TUTTI i punti centrali. Se i punti centrali di una città non sono stati uniti precedentemente allora è necessario unirli in un unico geojson con il comando "geojson-merge". Ogni file deve avere il nome della città a cui appartiene
- Cartella "NodeGeojsonCittà" contiene i file riguardanti i punti d'interesse delle città. Se i nodi di una città non sono già tutti in un unico file allora è necessario spostarli prima nella cartella SingleNodesFiles/"nomeCittà"
- Cartella "SingleNodesFiles" contiene tutte le cartelle contenenti i dati dei nodi singoli della città. Successivamente verranno uniti in un unico geojson e spostati nella cartella NodeGeojsonCittà. I nomi delle cartelle devono corrispondere al nome della città presa in considerazione.
- Cartella "SingleWaysFiles" contiene tutte le cartelle contenenti i dati delle vie singole della città. Successivamente verranno uniti in un unico geojson e spostati nella cartella WayGeojsonCittà.  I nomi delle cartelle devono corrispondere al nome della città presa in considerazione.
- Cartella "WayGeojsonCittà" contiene i file riguardanti le vie delle città. Se le vie di una città non sono già tutte in un unico file allora è necessario spostarle prima nella cartella singleWaysFiles/"nomeCittà"

Prima di avviare lo script bisogna eliminare i file .gitkeep dalle cartelle  che sennò creano confusione.

Alla fine si otterranno i file allWaysPbf, allNodesPbf i vari NomeCittàCenter.geojson e file di testo wayLayers.txt e nodeLayers.txt. Tutti questi file vanno poi inseriti all'interno della web-app nella cartella [pbfFiles](../../bicycle-osm-app/pbfFiles) 
