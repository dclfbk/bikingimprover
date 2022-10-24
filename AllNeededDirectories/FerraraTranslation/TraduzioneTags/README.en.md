# New_createMissions.ipynb Code
The new_createMissions.ipynb code takes the shp files, selects the elments that have value "None" on some tags (the elements that the public administration lack data of). Then it deletes the elements that have value None on the geometry field (because they couldn't be seen on the map otherwise). After that the code deletes some of the columns because it would require too much time to process (this part can be removed since was added only for the purpose of testing).
The create_Ferrara_quest.yaml file contains all the logic used to create the missions about the public administration data.
The data inside the geodataframe needs to be in the epsg4326 format, for that reason a portion of the code converts data from 3857 to 4326. 
The information are then added to the database. 
If you'd like to use data from other public administration, if they have a similar structure of those of Ferrara then this code can be reused. In fact you'll only need to change the yaml file and the input data. 
If the data has a different structure then the code can be revisited in order to handle that type of data. 

# convertiTags.ipynb code
This code can be used for any type of data of a public administration. It lets you convert the data from a public administration language to OSM and the other way around (for example the tag "sidewalk" of a public administration can be translated in highway=cycleway/footway/path + bicycle=designated + foot=designated + segregated=yes + sidewalk=yes/both/separate/right/left for OSM)
The code takes the public administration's data (in this case Ferrara"), it extracts the tag's name and it puts them in a csv.</br>
Inside the code you can read how the association phase works. We'll write how it works here too:
## Tags Association Phase

- Once the csv (that ccan be found in the "FerraraFiles/csvFiles/nodeTags" and "FerraraFiles/csvFiles/wayTags") for every Ferrara's data have been created, we need to fill the tables with the translations.

- This phase is a translation phase. The translations have to be put in an excel file so that they can be easily converted in csv.

- Then the code loads the converted csv in python and makes the association of Ferrara's tags with those of OSM

- The exel files can be seen in the excelFiles folder.

The standard to read the csv and to write the excel file in order to make the associations is:
- The first cell of the excel file (cell 0,0) needs to be empty. The second column of the first row (cell 0,1) needs to contain the name of the public administration key (for example.: level)
- The csv/excel file name needs to have the considered key inside its name (for example.: ferraraTagslighting.csv has the lighting tag)
- In the excel/csv file the first column represents the value that can be assigned to the pubic administration key (for example.: yes), the next columns  show the translation of the considered key and tag ( for example.: key=lighting, tag = yes, translation=lighting=yes)
- If there's no translation you can leave the field empty, be aware that if you do so the fields with no translation will be ignored and deleted. If you want to keep the tags without a translation then you have to put a 0 in the translation field.
- If the element can be translated in multiple ways, write the translations column by column
- Don't make new lines in the cells
- If a tag can have multiple values then it is necessary to separate them with a slash ("/"), for example.: bicycle=yes/no/...
- If an element needs to be translated with the association of multipletags, separate them with a +. For example.: on sidewalk ---> highway=cycleway/footway/path + bicycle=designated + foot=designated + segregated=yes + sidewalk=yes/both/separate/right/left
- The file needs to be read line by line to see all the various associations about all the different tags.
