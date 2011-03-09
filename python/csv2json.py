#!/usr/bin/python

import csv
import os
import simplejson
import sys

def main(filename):
    input = open(filename, 'rU')
    dict = csv.DictReader(input)
    dict = [item for item in dict]
    
    output = open(os.path.splitext(filename)[0] + '.json', 'w')
    output.write(simplejson.dumps(dict, indent=4))
    
    output.close()
    input.close()

if __name__ == '__main__':
    main(sys.argv[1])