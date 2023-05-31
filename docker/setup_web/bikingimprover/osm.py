import click
import osmium
import pathlib
import overpy
import requests
import osm2geojson
import geopandas as gpd
import sqlite3
import pandas as pd
import shutil
import os

from bikingimprover.importer import BaseImporter
from bikingimprover.utils import (
    checkHasMyKey, checkValuesNot, checkValuesYes, 
    checkMustHaveValues, checkMustNotHaveTags,
    alreadyPresent, createQuest, createFile,
    createGeoJson, createQueryOverpy, getValue,
    getAllScores
)


def elementAlreadyHere(name_way, my_list):
  return any(map(lambda i: i == name_way, my_list))


class BicycleHandler(osmium.SimpleHandler):
    def __init__(self):
        super(BicycleHandler, self).__init__()
        self.ways = []
        self.nodes = []
        nodeKeyName = []
        wayKeyName = []
    
    def node(self, n):
        tags = {}
        if len(n.tags) > 0:
            for tag in n.tags:
                tags[tag.k] = tag.v

        _node = {
                  'id':        n.id,
                  'version':   n.version,
                  'uid':       n.uid,
                  'timestamp': n.timestamp,
                  'changeset': n.changeset,
                  'tags':      tags,
                  'lat':       n.location.lat,
                  'lon':       n.location.lon,
                }
        for k in self.nodeKeyName:
          if n.tags.get(k) != "no" and n.tags.get(k) is not None:
            self.nodes.append(_node)


    def way(self, w):
      tags = {}
      if len(w.tags) > 0:
            for tag in w.tags:
                tags[tag.k] = tag.v

      _way = {
                  'id':        w.id,
                  'version':   w.version,
                  'uid':       w.uid,
                  'timestamp': w.timestamp,
                  'changeset': w.changeset,
                  'tags':      tags,
                }
      
      for k in self.wayKeyName:
        if w.tags.get(k) != "no" and w.tags.get(k) is not None:
          self.ways.append(_way)


class OSMImporter(BaseImporter):
  def _createQuestList(self, waylistname, nodelistname, question_list):
    for i in waylistname:
      for keys,value in self.settings['way-keys'].items():
        new_data = self.settings['way-keys'][keys]['tags']
        values_not_to_have = self.settings['way-keys'][keys]['values_not_to_have']
        values_to_have = self.settings["way-keys"][keys]["values"]
        questions_data = self.settings['way-keys'][keys]['questions']
        must_data = self.settings['way-keys'][keys]['must_have_tag']
        must_not_data = self.settings['way-keys'][keys]['must_not_have_tag']
        my_key = self.settings["way-keys"][keys]["name"]

        #Check that it contains my key
        if checkHasMyKey(my_key,i):
          #Check that my key doesn't have values contained in the values_not_to_have field inside the yaml file
          if checkValuesNot(my_key,i,values_not_to_have):
            #Check that my key contains the value inside the values section, if it does then go on. If there aren't value to check then continue
            if checkValuesYes(my_key,i,values_to_have):
              #check if the element has the must_have_tag
              if checkMustHaveValues(must_data, i) and checkMustNotHaveTags(must_not_data, i):
              #cycle through all the various tags in the tags section of the yaml file in order to create the questions
                for k,v in new_data.items():
                  tag_value = new_data[k]['value']
                  tag_name = new_data[k]['name'] #THIS IS ALSO THE TAG THAT I HAVE TO SEARCH IN THE FUTURE.
                  tag_question = new_data[k]['question']
                  tag_score = new_data[k]['score']
                  validate_bool = new_data[k]['validating']
                  #print(new_data[k])
                  #possible_answers = ""
                  possible_answers = new_data[k]['answers']
                  icon = new_data[k]["icon"]
                  #If the value is none then I can instantly generate the question
                  if tag_value == 'None':
                    #Check that in b.ways there's not the attribute tag_name, if there isn't then I can create the question
                    if tag_name not in i['tags']:
                      #Check if the question is already in the list
                      if alreadyPresent(question_list, tag_question, str(i['id'])) == False: 
                        question_list = createQuest(possible_answers,'WAY', tag_question, str(i['id']), my_key, str(i['tags'][my_key]), tag_name, 'NONE', 'NO', question_list, tag_score, tag_name, validate_bool, icon)
                  else:
                    #Check whether or not the tag and the value inside the yaml file are also in the element, if they are then add the element to the questions
                    if tag_name in i['tags'] and tag_value == str(i['tags'][tag_name]):
                      #Check if the questions is already contained in the question list
                      if alreadyPresent(question_list, tag_question, str(i['id'])) == False: 
                        question_list = createQuest(possible_answers,'WAY', tag_question, str(i['id']), my_key, str(i['tags'][my_key]), tag_name, str(i['tags'][tag_name]), 'NO', question_list, tag_score, tag_name, validate_bool,icon)
              #Now I can add the question that are in the questions section of the yamls file. This questions do not need any verification process
                for k,v in questions_data.items():
                  if v is not None:
                    question_value = questions_data[k]['question']
                    score_value = questions_data[k]['score']
                    answer_value = questions_data[k]['tagAnswer']
                    question_answers = questions_data[k]['answers']
                    icon = questions_data[k]["icon"]
                    if question_value is not None:
                      if alreadyPresent(question_list, question_value, str(i['id'])) == False:
                        question_list = createQuest(question_answers,"WAY", question_value, str(i['id']), my_key, str(i['tags'][my_key]), 'NONE', 'NONE', 'NO', question_list, score_value, answer_value,"no",icon)

    #Same thing for the node questions
    for i in nodelistname:
      for keys,value in self.settings['node-keys'].items():
        new_data = self.settings['node-keys'][keys]['tags']
        questions_data = self.settings['node-keys'][keys]['questions']
        my_key = self.settings["node-keys"][keys]["name"]
        my_values = self.settings["node-keys"][keys]["values"]
        if checkHasMyKey(my_key,i):
          #Check the values field, my key needs to have the value written in the name field and then I create the mission associated
          for k,v in my_values.items():
            value_name = my_values[k]['name']
            value_question = my_values[k]['question']
            value_score = my_values[k]['score']
            value_answer = my_values[k]['tagAnswers']
            value_validating = my_values[k]['validating']
            possible_answers = my_values[k]['answers']
            icon = my_values[k]['icon']
            #print(possible_answers)
            if value_name is not None:
              #Create the mission if it contains the value
              if value_name == i['tags'][my_key]:
                if alreadyPresent(question_list, value_question, str(i['id'])) == False: 
                  question_list = createQuest(possible_answers,"NODE", value_question, str(i['id']), my_key, str(i['tags'][my_key]),'NONE', 'NONE','NO',question_list, value_score, value_answer, value_validating,icon)

          #Cycle through all the various tags in the tags section of the yaml file in order to create the questions
          for k,v in new_data.items():
            tag_value = new_data[k]['value']
            tag_name = new_data[k]['name']
            tag_question = new_data[k]['question']
            tag_score = new_data[k]['score']
            validating_value = new_data[k]['validating']
            #print(new_data[k])
            tag_answers = new_data[k]['answers']
            icon = new_data[k]["icon"]
            #tag_answer = new_data["tagAnswers"]
            #If the value is None then you can create the question
            if tag_value == 'None':
              #Check that there's no attribute tag_name in the b.ways, if there isn't then create the question
              if tag_name not in i['tags']:
                #Check that the questions isn't already in the list
                if alreadyPresent(question_list, tag_question, str(i['id'])) == False: 
                  question_list = createQuest(tag_answers ,'WAY', tag_question, str(i['id']), my_key, str(i['tags'][my_key]), tag_name, 'NONE', 'NO', question_list, tag_score, tag_name, validating_value,icon)
            else:
              #Check if the tag and the value in the yaml file are also in the element in the list, if they are then add the element to the questions
              if tag_name in i['tags'] and tag_value == str(i['tags'][tag_name]):
                #Check if the way already contains the question I'm creating
                if alreadyPresent(question_list, tag_question, str(i['id'])) == False: 
                  question_list = createQuest(tag_answers ,'WAY', tag_question, str(i['id']), my_key, str(i['tags'][my_key]), tag_name, str(i['tags'][tag_name]), 'NO', question_list, tag_score, tag_name,validating_value,icon)
        
          #Now I can add the question that are in the questions section of the yaml file, these don't need any verification
          for k,v in questions_data.items():
            if v is not None:
              question_value = questions_data[k]['question']
              score_value = questions_data[k]['score']
              question_answers = questions_data[k]['answers']
              icon = questions_data[k]["icon"]
              if question_value is not None:
                if alreadyPresent(question_list, question_value, str(i['id'])) == False:
                  question_list = createQuest(question_answers,"WAY", question_value, str(i['id']), my_key, str(i['tags'][my_key]), 'NONE', 'NONE', 'NO', question_list, score_value, my_key,"no",icon)
    return question_list     
      
    
  def process_import(self, *args, **kwargs):
    click.echo('Starting import using OSM Importer')
    outWayKeyNames = []
    outNodeKeyNames = []
    for keys, value in self.settings['way-keys'].items():      
      if self.settings["way-keys"][keys]["name"]!="None":
        if not elementAlreadyHere(self.settings["way-keys"][keys]["name"], outWayKeyNames):
          outWayKeyNames.append(self.settings["way-keys"][keys]["name"])
    
    for keys, value in self.settings['node-keys'].items():
      if self.settings['node-keys'][keys]['name']is not None:
        if not elementAlreadyHere(self.settings["node-keys"][keys]["name"], outNodeKeyNames):
          outNodeKeyNames.append(self.settings["node-keys"][keys]["name"])

    allWayKeyNames = []
    allNodeKeyNames = []

    for i in self.inputs:
      b = BicycleHandler()
      b.wayKeyName = outWayKeyNames
      b.nodeKeyName = outNodeKeyNames
      b.apply_file(i.name)
      allWayKeyNames.append(b.ways)
      allNodeKeyNames.append(b.nodes)

    j = 0
    question_list = [["NODE OR WAY", "QUESTION", "ID", "KEY", "KEY_VALUE", "TAG", "TAG_VALUE", "VERIFIED","SCORE","TAGANSWER", "VALIDATING","ANSWERS","ICON"]]
    for i in allWayKeyNames:
      # nodes_path = self.paths[self.input_names[j]]['nodes_path']
      # ways_path = self.paths[self.input_names[j]]['ways_path']
      question_list = self._createQuestList(i,allNodeKeyNames[j],question_list)
      filename = f"{self.paths[self.input_names[j]]['questions']}/wayQuests.csv"
      not_sorted = f"{self.paths[self.input_names[j]]['questions']}/wayQuestsNotSorted.csv"
      question_list_sorted = sorted(question_list, key=lambda x:x[2])
      question_list_sorted = question_list_sorted[:-1]
      createFile(filename, question_list_sorted)
      createFile(not_sorted, question_list)
      #AddQuestions(question_list_sorted, nodes_path, ways_path)
      j += 1

    xml = []
    nodeXml = []
    nodeResult = []
    api = overpy.Overpass()
    url = "https://overpass-api.de/api/interpreter?"
    #make the calls to overpass in order to extract the elements that have questions. 
    for i in self.input_names:
      file_to_use = f"{self.paths[i]['questions']}/wayQuestsNotSorted.csv"
      myQuery = createQueryOverpy(file_to_use, "way", "WAY")
      myNodeQuery = createQueryOverpy(file_to_use, "node", "NODE")
      s = myQuery
      p = {'data':s}
      myNodeBody = {'data':myNodeQuery}
      r = requests.post(url,data=p)
      nodeResult = requests.post(url, data = myNodeBody)
      xml.append(r.text)
      nodeXml.append(nodeResult.text)

    #save the answer to some xml files
    for j, i in enumerate(self.input_names):
      with open(f"{self.paths[i]['xml']}/myXml.xml", "w") as f:
        f.write(xml[j])
      with open(f"{self.paths[i]['xml']}/myNodeXml.xml", "w") as f:
        f.write(nodeXml[j])

    g = []
    nodeGeo = []
    for i in self.input_names:
      file_to_use = f"{self.paths[i]['questions']}/wayQuestsNotSorted.csv"
      myQuery = createQueryOverpy(file_to_use, "way", "WAY")
      myNodeQuery = createQueryOverpy(file_to_use, "node", "NODE")
      s = myQuery
      g.append(osm2geojson.overpass_call(s))
      nodeGeo.append(osm2geojson.overpass_call(myNodeQuery))

    for j, i in enumerate(self.input_names):
      with open(f"{self.paths[i]['overpass']}/myOverpass_call.geojson", "w") as f:
        f.write(g[j])
      with open(f"{self.paths[i]['overpass']}/myNodeCall.geojson", "w") as f:
        f.write(nodeGeo[j])

    geojson_output = []
    geojson_node_output = []
    for i, _ in enumerate(self.input_names):
        geojson_output.append(osm2geojson.json2shapes(g[i]))
        geojson_node_output.append(osm2geojson.json2shapes(nodeGeo[i]))

    j = 0
    for i in self.input_names:
      createGeoJson(geojson_output[j], f"{self.paths[i]['waysGeoJSON']}/")
      createGeoJson(geojson_node_output[j], f"{self.paths[i]['nodesGeoJSON']}/")
      j = j + 1

    tutto = []
    node_all = []
    j=0
    for i in self.input_names:
      tutto.append(gpd.GeoDataFrame(geojson_output[j]))
      node_all.append(gpd.GeoDataFrame(geojson_node_output[j]))
      j=j+1

    j=0
    for i in self.input_names:
      newTutto = tutto[j]
      newTutto['way'] = newTutto.properties.apply(lambda x: x['type'])
      newTutto['id'] = newTutto.properties.apply(lambda x: x['id'])
      tutto[j] = newTutto
      newNode = node_all[j]
      newNode['node'] = newNode.properties.apply(lambda x: x['type'])
      newNode['id'] = newNode.properties.apply(lambda x: x['id'])
      node_all[j] = newNode
      j = j+1

    labels = []
    node_labels = []

    j=0
    for i in self.input_names:
      toIter = tutto[j]
      for index, row in toIter.iterrows():
        try:
          node_key = row['properties']['tags'].keys()
          chiave = row['properties']['tags'].keys() 
          for c in chiave:
            if c not in labels:
              labels.append(c)
          for k in node_key:
            if k not in node_labels:
              node_labels.append(k)
        except KeyError as e:
          print(e) 
      j = j+1

    j=0
    for i in self.input_names:
      tuttoNew = tutto[j]
      nodeNew = node_all[j]
      for label in labels:
        tuttoNew[label] = tuttoNew.properties.apply(lambda x: getValue(x,label))
        tutto[j] = tuttoNew
      for label in node_labels:
        nodeNew[label] = nodeNew.properties.apply(lambda x: getValue(x,label))
        node_all[j] = nodeNew
      j=j+1

    j=0
    for i in self.input_names:
      tuttoNew = tutto[j]
      tuttoNew['id'] = tuttoNew.properties.apply(lambda x: x['id'])
      tuttoNew['type'] = tuttoNew.properties.apply(lambda x: x['type'])
      tutto[j] = tuttoNew
      nodeNew = node_all[j]
      nodeNew['id'] = nodeNew.properties.apply(lambda x: x['id'])
      nodeNew['type'] = nodeNew.properties.apply(lambda x: x['type'])
      node_all[j] = nodeNew
      j=j+1


    #this is necessary to find all the centroids
    gdf_center = []
    j=0
    for i in self.input_names:
      gdf_c = tutto[j].copy()
      my_center_points = []
      for k in tutto[j]['shape']:
          centerPoint = k.representative_point()
          my_center_points.append(centerPoint)
      gdf_c = gdf_c.drop(['shape'], axis = 1)
      gdf_c['geometry'] = my_center_points #DATAFRAME WITH THE CENTERPOINT, I CAN REMOVE THE SHAPE SINCE I DON'T USE IT ANYMORE
      gdf_c.drop(gdf_c.columns.difference(['id','type','geometry','name', 'highway']), axis=1 ,inplace=True)
      gdf_center.append(gdf_c)
      j=j+1
    
    j=0
    for i in self.input_names:
      tutto[j].drop(tutto[j].columns.difference(['shape','type','id']), axis=1, inplace=True)
      node_all[j].drop(node_all[j].columns.difference(['shape','type','id']), axis=1, inplace=True)
      j=j+1

    for j, name in enumerate(self.input_names):
      with open(f"{str(self.center_way_points)}/{name}.geojson","w") as f:
          f.write(gdf_center[j].to_json())
          f.write("\n")
    
    self.completed_data = tutto
    self.completed_node = node_all

  def create_database(self):
    click.echo(f'creating a database at {self.db_path}')

    if(os.path.exists(self.db_path)):
        databaseAlreadyExists = True
    else:
        databaseAlreadyExists = False

    for i in self.input_names:
        my_data = pd.read_csv(f"{self.paths[i]['questions']}/wayQuestsNotSorted.csv", index_col=False, delimiter='|')
        my_data = my_data.rename(columns={'NODE OR WAY':'TYPE'})#########
        columns_to_drop = my_data.columns.difference(['TYPE','QUESTION','ID','SCORE','VALIDATING','ANSWERS','ICON', 'TAGANSWER'])
        my_data.drop(columns_to_drop, axis=1, inplace=True)
        my_data["ANSWER"] = ""
        my_data["USERANSWERED"] = ""
        my_data["NUMBEROFVALIDATIONS"] = 0
        my_data["USERSWHOVALIDATED"] = ""
        print(my_data.head())

        with sqlite3.connect(self.db_path) as conn: 
            df_sql = my_data.to_sql('question_table_tmp', conn, if_exists='append', index = False)

    if(databaseAlreadyExists):
        query= """
            SELECT TYPE, QUESTION, ID FROM question_table_tmp 
            EXCEPT 
            SELECT TYPE, QUESTION, ID FROM question_table;
        """
    else:
        query= """
            SELECT TYPE, QUESTION, ID, SCORE, VALIDATING, ANSWERS, ICON, TAGANSWER, ANSWER, USERANSWERED, NUMBEROFVALIDATIONS, USERSWHOVALIDATED  FROM question_table_tmp 
        """

    with sqlite3.connect(self.db_path) as conn: 
        new_entries = pd.read_sql(query, conn)

    with sqlite3.connect(self.db_path) as conn: 
        df_sql = new_entries.to_sql('question_table', conn, if_exists='append', index = False)


    with sqlite3.connect(self.db_path) as conn:
        conn.enable_load_extension(True)
        conn.load_extension("mod_spatialite")
        conn.execute("SELECT InitSpatialMetaData(1);")
        conn.execute("""SELECT ID FROM question_table ORDER BY ID""")
        conn.execute("""DROP TABLE IF EXISTS question_table_tmp """)
    
    query="""SELECT ID, TYPE FROM question_table""" #if you want to get the total score too then you can add the column SCORE there

    with sqlite3.connect(self.db_path) as conn: 
        idsScoresTypes = pd.read_sql(query, conn)


    #create dataframe holding the sum of all the scores
    sumDF = pd.DataFrame(idsScoresTypes)

    sumDF = sumDF.groupby(['ID', "TYPE"]).sum()

    sumDF.reset_index(inplace=True)

    sumDF["ID"].astype(int)

    sumDF["completed"] = "no"
    sumDF.rename(columns = {'ID':'id', "TYPE":"type"}, inplace = True)
    sumDF['type'] = sumDF['type'].apply(str.lower)

    #If the database already exists then I have to update it, otherwise just create a new one.
    if(databaseAlreadyExists):
        #If all the questions about a way or node have 5 validations then they are completed, else set completed to false.
        query = """SELECT ID FROM question_table WHERE ID IN (select ID from question_table group by ID having NUMBEROFVALIDATIONS=5)"""
        with sqlite3.connect(self.db_path) as conn:
            allCompletedDF = pd.read_sql(query, conn)
        
        allCompletedDF["completed"] = "yes"
        allCompletedDF.rename(columns = {'ID':'id'}, inplace = True)
        sumDF.loc[sumDF['id'].isin(allCompletedDF['id']), 'completed'] = allCompletedDF['completed']

        with sqlite3.connect(self.db_path) as conn:
            df_completed = sumDF.to_sql('completed_table',conn,if_exists="replace", index = False)
    else:
        with sqlite3.connect(self.db_path) as conn:
            df_completed = sumDF.to_sql('completed_table',conn,if_exists="replace", index = False)

    click.echo(f'Finished Creating database.')


  def cleanup(self):
    shutil.rmtree(str(self.gjson_path))
    shutil.rmtree(str(self.base_dir / 'questions'))
    shutil.rmtree(str(self.base_dir / 'xml'))
    shutil.rmtree(str(self.base_dir / 'nodes_question'))
    shutil.rmtree(str(self.base_dir / 'ways_question'))
    shutil.rmtree(str(self.out_node_path))
    shutil.rmtree(str(self.out_way_path))
    shutil.rmtree(str(self.center_gjson_path))