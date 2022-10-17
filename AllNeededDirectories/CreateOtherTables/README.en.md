# Logic
The code takes the csv files, it translates them into a dataframe and inserts them as tables inside an existing database named applicationValid.db
</br>

In order to create new Medals you have to add the data inside the allMedals.csv file. The table is characterized by the columns MEDALNAME,COLOR,DESCRIPTION.
- MEDALNAME: the name of the medal that we want to add
- COLOR: The color with which the app will show the medal
- DESCRIPTION: The description of the medal
Inside the app you have to add the translation of the medal in the different languages in the file translation.js. 
In order to be able to acquire the medals you have to change the logic inside the gamification engine... But in order to do so you'll have to have access to it.

</br>

In order to create new power-ups you have to add the data inside the powerUps.csv file. The power ups that are added need to be handled also by the web-app. It is necessary to modify the code inside the web-app itself in order to create new power-ups, otherwise the power-ups will be only visualized but will have no effects. 
The table is characterized by the columns POWERNAME, PRICE, DESCRIPTION, IMAGE.
- POWERNAME: the name assigned to the power up
- PRICE: the price that the user needs to pay in order to buy the power up
- DESCRIPTION: A variable that is read by the app in order to show the description of the power up in all the different languages. The description has to be written in the file [translations.js](../bicycle-osm-app/src/utils/translations.js)
- IMAGE: the image associated to the power up. It has to be present in the web-app inside of the folder [images](../bicycle-osm-app/src/assets/images).
<!-- -->
The power ups that are used in the web-app for now are "seeEverything" and "PointBonuses", which gives the power to:
- see only the ways and nodesthat have the higher scores.
- obtain +1 point for every mission completed.

</br>

In order to create new pins you have to add data inside the pin.csv file. The table is characterized by the columns IMAGE, PRICE.
- IMAGE: the image associated with the pin, it has to be present inside the web-app in the folder [images](../bicycle-osm-app/src/assets/images).
- PRICE: the price that the user has o pay in order to buy the pin