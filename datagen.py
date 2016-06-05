#!/usr/bin/env python

from pymongo import MongoClient
import string, random
from bson.son import SON
import argparse

hostsList = '10.0.3.138:27017,10.0.3.146:27017,10.0.3.17:27017'
replName = 'rpl0'

def randString(size,chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def randNum(size,chars=string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def dbconn(thisdb,thiscollection):
    client = MongoClient(hostsList,replicaSet=replName,readPreference='secondaryPreferred',connect=False)
    db = client[thisdb]
    collection = db[thiscollection]
    return collection

def loadData(numRows):
    db = dbconn(thisdb='mydb',thiscollection='mycollection')
    db.drop()
    print("Inserting {0} records in {1}.{2}".format(numRows,thisdb,thiscollection))
    for i in range(numRows):
        db.insert({'a':randString(10),'b':randString(12),'c':randNum(15),'d':randNum(20)})
    print("Task done. Collection count: {}".format(db.count()))

def randomRead(iterations):
    db = dbconn(thisdb='mydb',thiscollection='mycollection')
    print("Running find() on {0}.{1}".format(thisdb,thiscollection))
    rowCount = db.count()
    for i in range(iterations):
        rand = random.randint(1,rowCount)
        pipe = [{"$sample":{"size":rand}}]
        list(db.aggregate(pipe))
    print("Task done.")

parser = argparse.ArgumentParser()
parser.add_argument("-l", "--load", type=int, help="Number of rows to insert (default 1000)", default=1000)
parser.add_argument("-i", "--iterations", type=int, help="Number of iterations during Read (default 1000)", default=1000)
args = parser.parse_args()

if args.load and not args.iterations:
    loadData(args.load)
elif args.iterations and not args.load:
    randomRead(args.iterations)

