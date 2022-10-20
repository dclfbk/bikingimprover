The instructions below need to be executed in the current directory.

First of all you need to create a folder called "AllNeededDirectories" containing the files:
- bicycle-osm-app 
- create_geometry_spatialite
- FerraraTranslation
- tippecanoe
The files can be found in the repository on github.

Check that the folder AllNeededDirectories/bicycle-osm-app/pbfFiles contains the directories: "CenterGeojson", "LayersNames". Also check that these directories are empty. If this directories are not there then create them.

IMPORTANT: Delete all the .gitignore files from the AllNeededDirectories/tippecanoe/tippecanoe_funzionante/NewSystem subfolders.

0) Use the command "sudo docker volume create --name DataVolume1" in order to create the volume that will later contains useful data
1) Use the command "sudo docker compose build ubuntu" in order to create the image containing ubuntu and the necessary scripts
2) Use the command "sudo docker run -d --name systemContainer dockercomposelogic_ubuntu" in order to create the container containing the created image
3) Use the command "sudo docker cp systemContainer:/datavolume datavolume" to copy datavolume in the current directory
4) Use the command "sudo chmod -R o+rw datavolume" to give all the permission to the datavolume folder
5) Use the command "sudo docker compose build web" to create the image of the web-app
6) Use the command "sudo docker run -dp 8080:8080 compose_from_repository_web" to start the application
7) Go to the page "localhost:8080" in order to see the web-app.

the files saved in the volume will later be found in the folder "/var/lib/docker/volumes/DataVolume1/_data"
Since we are moving this files with the command used in 3) we can find the data of datavolume directly in the current directory inside of datavolume.

In order to understand how to change the files and how the program works just visit the project repository and read the README.
Some scripts are also explained inside the code itself.