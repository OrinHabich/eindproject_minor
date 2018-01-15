# convertFijnstofData.py
# Minor programmeren

import csv

infile = 'fijnstof14-15rawdata.csv'
outfile = 'fijnstof14-15.csv'

# this array will contain per data-point a dictionary
data = []

with open(infile) as csvfile:
    raw_data = csv.reader(csvfile)
    with open(outfile, 'w') as outfile:
        outfile.write("tijdstip,waarde\n")
        for row in raw_data:
            #print(row)
            if row[2] == 'PM10':
                dataPoint = row[0] + "," + row[3] + "\n"
                print(dataPoint)
                outfile.write(dataPoint)
