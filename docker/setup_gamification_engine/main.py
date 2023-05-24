import os, json
from time import sleep
import requests
from requests.auth import HTTPBasicAuth
import pathlib


if __name__ == '__main__':
  print('running setup of the gamification engine...')
  HOST = os.environ.get('GAMIFICATION_LINK')
  USER = os.environ.get('ID_GAME_USER')
  PASS = os.environ.get('PW_GAME_ENGINE')
  BASIC = HTTPBasicAuth(USER, PASS)

  RULES = list()

  if not HOST or not USER or not PASS:
    print('missing environement variables, cannot proceed')
    exit(1)


  CURRENT_DIR = pathlib.Path(__file__).parent.resolve()
  RULES_DIR = CURRENT_DIR / 'rules'

  print(f'searching rules in {str(RULES_DIR)}')

  for f in RULES_DIR.iterdir():
    if f.is_file():
      with  open(f, mode='r') as c:
        print(f'adding rule {f.stem}')
        RULES.append({'name': f.stem, 'content': c.read() })

  success = False
  failed = 50
  while not success:
    try:
      r = requests.get(f'{HOST}/gamification/userProfile/', auth=BASIC)
      print(r.status_code)
      if r.status_code == 200:
        success = True
    except:
      print('connection failed')
      sleep(5)
    
    if failed < 0:
      print('timeout')
      exit(1)

    failed -= 1



  res = requests.post(f'{HOST}/gamification/console/game/', auth=BASIC, json={"name":"mygame","settings":{"challengeSettings":{}}})
  data = res.json()
  GAME_ID = data['id']
  print(f'created game with ID {GAME_ID}')

  with open('config.json', mode='r') as f:
    config = json.load(f)

    data["actions"] = config['actions']
    data["pointConcept"] = list([{'name': p, 'id': idx, 'periods': {}} for idx, p in enumerate(config['points'])])
    data["badgeCollectionConcept"] = list([{'name': p, 'id': idx, 'periods': {}} for idx, p in enumerate(config['badges'])])
    requests.post(f'{HOST}/gamification/console/game/', auth=BASIC, json=data)
    print('saved actions, points and badges')

  for rule in RULES:
    print(f'saving rule {rule["name"]}')
    r = requests.post(f'{HOST}/gamification/console/game/{GAME_ID}/rule/db', auth=BASIC, json=rule)
    print(r.status_code)

  print('done')



