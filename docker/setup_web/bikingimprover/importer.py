import yaml
from yaml.loader import SafeLoader
import pathlib
import click
import pandas as pd
import sqlite3
import os
import shutil

from bikingimprover.utils import createSingleGeojson, insertFieldCity, createTextFile

class BaseImporter:
    def __init__(self, inputs, settings='resources/settings.yml', *args, **kwargs):
      self.inputs = inputs
      self.input_names = [pathlib.Path(i.name).stem for i in self.inputs]
      self.settings_path = settings or 'resources/settings.yml'
      self._read_settings()
      self.base_dir = pathlib.Path('./out')
      self._setup_directories()
    
    def _read_settings(self):
       with open(self.settings_path) as f:
        self.settings = yaml.load(f, Loader=SafeLoader)

    def _setup_directories(self):
      self.paths = {}
      self.out_way_path = self.base_dir / "WayGeojsonCittà"
      self.out_node_path = self.base_dir /"NodeGeojsonCittà"
      self.center_gjson_path = self.base_dir / "CenterGeojsonCittà"
      self.gjson_path = self.base_dir / "GeojsonFiles"
      self.in_way_path = self.gjson_path / 'singleWaysFiles'
      self.in_node_path = self.gjson_path / 'singleNodesFiles'
      self.center_way_points = self.gjson_path / 'centerWayPoints'

      self.databases = self.base_dir / "databases"
      self.pbf_files = self.base_dir / 'pbfFiles'
      self.db_path = str(self.databases / 'applicationValid.db')

      self.layer_names = self.pbf_files / "LayersNames"
      self.pbf_center = self.pbf_files / "CenterGeojson"
      self.pbf_nodes = self.pbf_files / 'allNodesPbf'
      self.pbf_ways = self.pbf_files / 'allWaysPbf'


      for p in [
        self.out_node_path, 
        self.out_way_path,
        self.center_gjson_path,
        self.center_way_points,
        self.in_node_path,
        self.in_way_path,
        self.layer_names,
        self.databases,
        self.pbf_files,
        self.pbf_center,
      ]:
        p.mkdir(parents=True, exist_ok=True)

      for file in self.input_names:
        self.paths[file] = {
            'nodes_path': str(self.base_dir / 'nodes_question' / file),
            'ways_path': str(self.base_dir / 'ways_question' / file),
            'waysGeoJSON': str(self.in_way_path / file),
            'nodesGeoJSON': str(self.in_node_path / file),
            'overpass': str(self.gjson_path / 'overpass' / file),
            'xml': str(self.base_dir / 'xml' / file),
            'questions': str(self.base_dir / 'questions' / file),
        }
        print(self.paths)

        for p in self.paths[file].values():
          path = pathlib.Path(p)
          path.mkdir(parents=True, exist_ok=True)

    def run_import(self):
      self.process_import()
      self.create_database()
      self.populate_database()
      self.geojson_to_pbf()
      self.cleanup()
    
    def process_import(self):
      raise Exception('Not implemented')
    
    def create_database(self):
      raise Exception('Not implemented')
    
    def cleanup(self):
      raise Exception('Not implemented')

    def populate_database(self):
      click.echo('writing medals, powerups and pins...')

      medals = pd.read_csv("resources/allMedals.csv")
      powerups = pd.read_csv("resources/powerUps.csv")
      pins = pd.read_csv("resources/pin.csv")

      with sqlite3.connect(self.db_path) as conn:
        medals.to_sql('medals_table', conn, if_exists='replace', index = False)
        powerups.to_sql('powerUps_table', conn, if_exists='replace', index = False)
        pins.to_sql('pins_table', conn, if_exists='replace', index = False)

      click.echo('done')

    def geojson_to_pbf(self):
      click.echo('transforming geojson to pbf')

      createSingleGeojson(str(self.in_way_path), str(self.out_way_path), False)
      createSingleGeojson(str(self.in_node_path), str(self.out_node_path), True)

      folderToCycle = os.listdir(self.center_way_points)
      for i in folderToCycle:
        fileName = i.split('.',1)[0]
        insertFieldCity(fileName, str(self.center_way_points))
        fileName = fileName + "Center"
        shutil.move(str(self.center_way_points / i), str(self.pbf_center / (fileName + ".geojson")))

      cmd = f"geojson-merge {str(self.pbf_center)}/*.geojson > {str(self.pbf_files)}/allCenterPoints.geojson"
      os.system(cmd)

      cmd = f"geojson-merge {str(self.out_node_path)}/*.geojson > {str(self.pbf_files)}/allNodesGeojson.geojson"
      os.system(cmd)

      #Create a pbf containing all the data of the ways and one containing all the data of the nodes
      cmd = f"tippecanoe -z20 -e {str(self.pbf_ways)} --drop-densest-as-needed --no-tile-compression {str(self.out_way_path)}/*.geojson"
      os.system(cmd)

      cmd = f"tippecanoe -z20 -e {str(self.pbf_nodes)} --drop-densest-as-needed --no-tile-compression {str(self.out_node_path)}/*.geojson"
      os.system(cmd)

      wayFolderToCycle = os.listdir(self.out_way_path)
      nodeFolderToCycle = os.listdir(self.out_node_path)
      createTextFile(wayFolderToCycle, str(self.layer_names / "wayLayers.txt") ,False)
      createTextFile(nodeFolderToCycle, str(self.layer_names / "nodeLayers.txt"), True)
