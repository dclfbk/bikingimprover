import csv
import osm2geojson
import json
import pandas as pd
import os
import geojson


#add an element to the list
def initList(myList, myString):
  myList.append(myString)
  return myList


#Initialize the csv file with the elements in the list
def createFile(filename, myList):
  with open(filename, 'w', newline='') as file:
    writer = csv.writer(file, delimiter='|')
    writer.writerows(myList)
    file.close()

def iterateThroughAllTags():
  pass
  # with open(yamlFile) as f:
  #   data = yaml.load(f, Loader=SafeLoader)
  #   for keys,value in data['way-keys'].items():
  #     new_data = data['way-keys'][keys]['tags'].items()
  #     for k,v in new_data:
  #         for i,j in v.items():
  #           print(j)
            
#Function to create the quest, in particular it lets you add an element to the list
def createQuest(answers,node_or_way, question, id, key, key_value, tag, tag_value, verified, mylist, score, tag_answer, validated, icon):
  value = [node_or_way, question, id, key, key_value, tag, tag_value, verified, score,tag_answer, validated,answers, icon];
  mylist = initList(mylist, value)
  return mylist


#Check wheter or not the element ahve value in the must_not_have_tags field inside the yaml file
def checkMustNotHaveTags(must_not, list_element):
  for k,v in must_not.items():
    if v in list_element['tags'] and v is not None:
      return False
  return True


def checkMustHaveValues(must_data, list_element):
  #Get data from the yaml file
  #for keys,value in data['way-keys'].items():
      new_data = must_data
      #Itero per ottenere i dati del campo muyst_have
      for k,v in new_data.items():
        tag_values_have = new_data[k]['values_to_have']
        tag_name = new_data[k]['name']
        tag_discards = new_data[k]['values_to_discard']
        #Check that the tag in the must_have_tab field is also in the list element
        #if it is then continue, else return false
        if tag_name not in list_element['tags'] and tag_name is not None:
          return False
        #if tag_discard is not None:
        #check that for every element inside the field "values_to_have" isn't None, if it is None then continue, if it isn't then make some other checks.
        checkNumber=0
        for i,j in tag_values_have.items():
          if j is not None:
            #Check if the value is the same as one of the values_to_have field
            if j == list_element['tags'][tag_name]:
              checkNumber = 1 #this means that I have an element that is equal, so I can go on
          else:
            checkNumber = 1
        if checkNumber == 0:
          return False
        #Check the tag_discards field, if even only one of this is the same as the element of the list then discard the element
        for i,j in tag_discards.items():
          if j is not None:
            #print("NOT NONE")
            if j == list_element['tags'][tag_name]:
              return False
      return True


#Function to check if the element is already in the list
def alreadyPresent(question_list, question, id):
  for element in question_list:
    if element[1] == question and id==element[2]:
      return True
  return False


#Function used to check if the element contains the key I'm considering
def checkHasMyKey(my_key,i):
  if my_key in i['tags']:
    return True
  return False


#Function to check if the element doesn't contain certain values in the yaml file
def checkValuesNot(my_key,i,values_not_to_have):
  for k,v in values_not_to_have.items():
    #print(v)
    if str(i['tags'][my_key]) == v:
      return False
  return True


def checkValuesYes(my_key,i,values_to_have):
  for k,v in values_to_have.items():
    if v == None:
      return True
    if str(i['tags'][my_key]) == v:
      return True
  return False


def writeInFile(element_to_write, path):
    with open(path, "a") as f:
        f.write(element_to_write)
        f.close()


def AddQuestions(my_list, my_node_path, my_way_path):
    for i in my_list:
        my_id = i[2]
        node_or_way = i[0]
        #answers = i[11]
        if node_or_way == "NODE":
            #print("chimichanga")
            path = my_node_path + "/" + str(my_id) + ".csv"
            my_str = ''.join(str(e) + "|" for e in i)
            writeInFile(my_str,path)
            writeInFile("\n", path)
        else:
            path = my_way_path + "/" +str(my_id) + ".csv"
            my_str = ''.join(str(e) + "|" for e in i)
            writeInFile(my_str,path)
            writeInFile("\n", path)


#Function used to create the query for overpass
def createQuery(fileName, node_or_way, node_or_way_title):
  myQuery = node_or_way + "(id:"
  with open(fileName) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter='|')
    line_count = 0
    for row in csv_reader:
      if line_count == 0:
        line_count += 1
      elif line_count ==1:
        if str(f'{row[0]}') == node_or_way_title:
          myQuery = myQuery + str(f'{row[2]}');
          line_count += 1
      else:
        if str(f'{row[0]}') == node_or_way_title:
          myQuery = myQuery + "," + str(f'{row[2]}');
          line_count += 1
  #myQuery = "[out:json];" + myQuery + ");(._;>;);out geom;"
  myQuery = myQuery + ");(._;>;);out meta;"
  return myQuery


#Function to create the quyery for overpy
def createQueryOverpy(fileName, node_or_way, node_or_way_title):
  myQuery = node_or_way + "(id:"
  with open(fileName) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter='|')
    line_count = 0
    for row in csv_reader:
      if line_count == 0:
        line_count += 1
      elif line_count ==1:
        if str(f'{row[0]}') == node_or_way_title:
          myQuery = myQuery + str(f'{row[2]}');
          line_count += 1
      else:
        if str(f'{row[0]}') == node_or_way_title:
          myQuery = myQuery + "," + str(f'{row[2]}');
          line_count += 1
  myQuery = "[out:json];" + myQuery + ");(._;>;);out meta;"
  return myQuery


def createGeoJson(outputName, folder):
    for i in outputName:
        my_item = osm2geojson.shape_to_feature(i['shape'], i['properties'])
        with open(folder + str(i['properties']['id']) + ".geojson","w") as f:
            json.dump(my_item, f)


def getValue(row, label):
  v = ""
  #print(row)
  #row = row['tags']
  try:
    row = row['tags']
    v = row[label]
  except KeyError as e:
    #print(e)
    v = ""
    pass
  return v


#Take all the points of ways and nodes and sum the ones that have the same id. Put the value in the completed_table
def getAllScores(i, fileName):
    previousId = ""
    allScores = []
    currentId = ""
    with open(fileName) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter='|')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                previousId = row[2]
                currentId = row[2]
                score = row[8]
                element = {
                    "id": currentId,
                    "score": score
                }
                allScores.append(element)
                line_count=line_count+1
            else:
                currentId = row[2]
                score = row[8]
                if(currentId==previousId):
                    #modify existing element in list, do not append
                    previousScore = allScores[len(allScores)-1]['score']
                    newScore = float(score) + float(previousScore)
                    score_to_write = str(newScore)
                    allScores[len(allScores)-1]['score'] = score_to_write
                    line_count = line_count+1
                else:
                    #append element with score
                    score = row[8]
                    previousId = currentId
                    element = {
                        "id": currentId,
                        "score": score
                    }
                    allScores.append(element)
                    line_count = line_count+1

    point_df = pd.DataFrame(allScores)
    return point_df


def createSingleGeojson(inputFolder, outputFolder, node):
    inputFile = os.listdir(inputFolder)
    for i in inputFile:
      cmd = f"geojson-merge {inputFolder}/{i}/*.geojson > {outputFolder}/{i}{'Node' if node else ''}.geojson"
      print(f'MERGE: {cmd}')
      os.system(cmd)


def insertFieldCity(geojsonFileName, filepath):
    fullPath = f'{filepath}/{geojsonFileName}.geojson'
    print(fullPath)
    with open(fullPath, "r") as f:
        data = geojson.load(f)
    for i in range(len(data["features"])):
        data[i]["properties"]["city"] = geojsonFileName
    with open(fullPath, "w") as f:
        geojson.dump(data,f)


def createTextFile(folderName, outputName, node):
  txtFile = open(outputName, "w")
  for i in folderName:
    fileName = i.split('.', 1)[0]
    if node:
      fileName = fileName + ""
    txtFile.write(fileName + "\n")
  txtFile.close()