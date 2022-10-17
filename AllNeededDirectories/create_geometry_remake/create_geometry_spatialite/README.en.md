# Structure
- The CityDirectory folder contains the .xml files of the cities of which we want to create missions.
- The database_prova folder contains the database to which the data is going to be added. If we want to create a new database we just need to delete the existing one.
- The tmp folder contains all the temporary files that are going to be created, along with those that needs to be moved to the tippecanoe folder (in order to be converted in pbf). It also contains the yaml file that handles the logic of the mission creation.

# How does the .yaml file work
## How the .yaml work is written inside the code, but we'll write it also here if needed:
way-key section: </br>
- The way-keys field is characterized by different keys fields, the key field is characterized by name, value, values_not_to_have, tags, questions, must_have_tag, must_not_have_tag.
> - name: The name associated to the key that we are going to search (for example. highway)
> - values: characterized by different value fields that represent the values that can be associated to the specified key in the name field. (For example. motorway). This value has to be present in the key.
> - values_not_to_have: characterized by various value fields, they represent the values that cannot be associated with the specified key in the name field. (for example: motorway). If the key has this value then it is discarded
> - tags: characterized by various tag fields
>> - tag: caracterized by the name, value, question, score, validating and answers fields.
>>> - name: the name field inside the tag field represent the tag that we chose. We check if the tag is indeed in the selected element (for example. bicycle)
>>> - value: it represents the value fo the tag (for example. yes)
>>> - question: it represents the questions to ask to the user when the chosen element has the tag previously specified.
>>> - score: represents the points that are assigned to the user if he answers to the question
>>> - validating: this field represents whether or not a question is a validation one or not.
>>> - answers: it represents all the possibleanswers that the user can give to the question. If the field is "none" then it is a validation misson and the only possible answers are yes or no.
>>> - icon: the icon associated to the question

> - questions: characterized by various question fields, they represent the questions to ask whenever the selected element has the specified key.
>> - question: characterizedby the question, score, tagAnswer and answers fields.
>>> - question: represents the question associated
>>> - score: represents the points given to the user if he answers the question
>>> - tagAnswer: represents the tag associated to the answer
>>> - answers: represents the answers that the user can choose from
>>> - icon: represents the icon associated to the question

> - must_have_tag: Characterized by various tag fields, represents all the tags that our key must have to be considered. It also contains the tag that the key must or mustn't have. 
>> - tag: characterized by name, values_to_discard,values_to_have fields
>>> - name: the name of the tag (for example. bicycle)
>>> - values_to_discard: the values associated to the tag field, if they are present in the element then it is discarded. (for example. yes)
>>> - values_to_have: the values associated to the tag field that must be present in the element in order to not discard it (for exaple yes)
> - must_not_have_tab: characterized by different tag fields, it represents the name of the tag that make our element discardable.

node-keys section:</br>
- The field node-keys is described by various key fields. The key field is characterized by the name, value, tags and questions fields.
> - name: the name of the key that we are searching for (for example. amenity)
> - values: characterized by various value fields
>> - value: characterized by the name, icon and question field
>>> - name: it represents the value that the key needs to have (for example. bicycle_parking)
>>> - question: the question associated to the element
>>> - icon: the icon associated to the element
> - tags: characterized by various tag fields. They represent the tags that the element needs to have along with the previously specified key.
>> - tag: characterized by the name,value and question fields
>>> - name: the name of the searched tag (for example. bicycle)
>>> - value: the value that the tag needs to have (for example. yes)
>>> - question: the question associated to the tag 
>>> - icon: the associated icon
> - questions: characterized by variouys question fields that represent the questions to give if the key is found. This field is always checked

# How does the script work
- In order to create the necessary files for the web-app all you have to do is to put the .xml files of the cities of which you want to have missions inside the CityDirectory folder. Be sure to call the files with the name of the city associated. Once that's done just run the FBKIterateQuestions.ipynb script
- At the beginning the code extracts from the xml file the data regarding the cycleways. You can decide to skip this phase, but then you'll have to check every single element in the next functions.
- After that the code cycle through all these data and the missions are created thanks to the .yaml file. If you want to change the logic of the mission creations it is there you have to look at. You can change the .yaml file to create new missions but you'll have to mantain the logic of it or you can change this portion of code and create a whole new idea for the misssion creation.
- Once the missions are created then some calls to overpass are made in order to get the infos regarding the geometry of the ways and nodes.
- After that some dataframes are created. Then we search for the central point of each way and finally we create the database. Every operation is carried out as many times as the number of cities chosen.

# Necessary Files
Once the script has finished running, the necessary files will be:
- the database inside the database_prova folder
- the files regarding the central points of the ways, that can be found in the tmp/GeojsonFiles/centerWaypoints folder
- the folders containing all the single ways and single nodes that can be found in tmp/GeojsonFiles/singleNodesFiles and tmp/GeojsonFiles/singleWaysFiles
The database needs to be moved inside the folder CreateOtherTables. Once there youll have to run the script. All the other files described here needs to be moved in tippecanoe.

