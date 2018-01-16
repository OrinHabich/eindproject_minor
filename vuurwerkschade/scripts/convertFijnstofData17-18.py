# convertFijnstofData17-18.py
# Minor programmeren, Project
# This script preprocesses the data found on http://samenmeten.rivm.nl/dataportaal/
# to a csv file appriopiate to make a linechart.
# This is just a small variant of convertFijnstofData.py

import csv

# Get files
infile = 'fijnstof17-18rawdata.csv'
outfile = 'fijnstof17-18.csv'

with open(infile) as csvfile:
    raw_data = csv.reader(csvfile)
    with open(outfile, 'w') as outfile:

        # Write first line to file with names of data quantities
        outfile.write("tijdstip,waarde\n")

        # Iterate over lines in infile
        for row in raw_data:

            # Copy relevant parts of lines to outfile
            if row[0][0] == '2':
                dataPoint = row[0][0:15] + "," + row[2] + "\n"
                outfile.write(dataPoint)
