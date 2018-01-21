# convertPM10Data.py
# Minor programmeren, Project
# This script preprocesses the data found on https://www.luchtmeetnet.nl/
# to a json file appriopiate to make a linechart.
# The data of the most recent new years eve (2017-2018) has a slightly different
# structure.

import csv
import json

# get files
infile1 = "pm10RawData14-15.csv"
infile2 = "pm10RawData15-16.csv"
infile3 = "pm10RawData16-17.csv"
infile4 = "pm10RawData17-18.csv"
outfile = "pm10.json"

infiles = [infile1, infile2, infile3]
newYearsEves = ["2014-2015", "2015-2016", "2016-2017"]
dataAll = {}

# iterate over the infiles
for i in range(len(infiles)):
    with open(infiles[i]) as csvfile:
        rawData = csv.reader(csvfile)
        dataYear = []

        # iterate over the rows in the infile
        for row in rawData:
            if row[2] == "PM10":
                dataTimeOfDay = {}
                dataTimeOfDay["tijdstip"] = row[0][0:16]
                dataTimeOfDay["waarde"] = float(row[3])
                dataYear.append(dataTimeOfDay)
        dataAll[newYearsEves[i]] = dataYear

# this dataset has a slightly different structure
with open(infile4) as csvfile:
    rawData = csv.reader(csvfile)
    dataYear = []
    firstLine = True
    for row in rawData:
        if not firstLine:
            dataTimeOfDay = {}
            dataTimeOfDay["tijdstip"] = row[0][0:15]
            dataTimeOfDay["waarde"] = float(row[-1])
            dataYear.append(dataTimeOfDay)
        else:
            firstLine = False
    dataAll["2017-2018"] = dataYear

# write to outfile
with open(outfile, 'w') as outfile:
    json.dump(dataAll, outfile, indent = 1, sort_keys = True)
