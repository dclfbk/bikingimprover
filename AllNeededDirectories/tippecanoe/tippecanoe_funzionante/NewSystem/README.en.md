# How does it work
The newSystemPbfCreation.ipynb script handles the creation of all the files needed to the web-app.
As commented in the first few lines in the code:

Folder and Files Logic:
The first letter of every city needs t be capitalized.
- The "CenterGeojsonCittà" folder contains all the files regarding the central points in geojson format. Every file contains all the centrail points of a city. If the central points of a city weren't previously merged then it is needed to do so with the command "geojson-merge". Every file needs to be called as the associated city.
- The "NodeGeojsonCittà" folder contains all the files regarding the points of interest of the cities. If The nodes aren't all merged in a single file then it is necessary to move them in the folder SingleNodesFiles/"cityName"
- The "SingleNodesFiles" contains all the folders containing all the data of every single node of a certain city. They will be merged later into a single geojson and will be moves in the folder NodeGeojsonCittà. The name of the folders need to have the name of the associated city.
- The "SingleWaysFiles" folder contains all the folder containing the data regarding the ways of a certain city. They will later be merged into a single geojson and will be moved in the "WayGeojsonCittà" folder. The names of the folders need to have the name of the associated city.
- The "WayGeojsonCittà" folder contains all the files regarding the ways of the cities. If the ways of a city aren't in a single file already then it is necessary to move them in the singleWaysFiles/"cityName" folder first.

Before running the script you have to delete the .gitkeep files in every folder, otherwise it won't work.

After running the script the allWaysPbf, allNodesPbf files and all the different CityNameCenter.geojson files and the wayLayers.txt and nodeLayers.txt files will be created. All these files need to be moves isnide the web-app in the [pbfFiles](../../bicycle-osm-app/pbfFiles)  folder.
