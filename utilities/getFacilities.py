import requests
import pandas as pd
import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv('../.env')
MONGOPASS = os.getenv("MONGOPASS")
client = MongoClient(f"mongodb+srv://shaunntan:{MONGOPASS}@cluster0.r0vqb.mongodb.net/playpalDB?retryWrites=true&w=majority")
db = client.playpalDB
facilities = db.facilities

try:
    facilities.drop()
except:
    raise Exception

data = requests.get('https://geo.data.gov.sg/sportsg-sport-facilities/2019/12/17/geojson/sportsg-sport-facilities.geojson')

table = pd.DataFrame()

for i in data.json()['features']:
    entry = pd.read_html(i['properties']['Description'])[0].set_index('Attributes').transpose().reset_index(drop=True)
    entry['latitude'] = np.average(np.squeeze(i['geometry']['coordinates']), axis = 0)[1]
    entry['longitude'] = np.average(np.squeeze(i['geometry']['coordinates']), axis = 0)[0]
    table = table.append(entry)
table = table.reset_index(drop=True)

for row in table.iterrows():
    name = row[1]['ROAD_NAME']
    latitude = row[1]['latitude']
    longitude = row[1]['longitude']
    facilityInfo = {
      "name": name,
      "latitude": latitude,
      "longitude": longitude
    }
    facilities.insert_one(facilityInfo)

print("Facilities loaded!")