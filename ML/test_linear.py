import os
import sys
import csv
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LinearRegression
import pickle
from joblib import dump, load
from collections import defaultdict
import json

def readCSV(filepath):
    X = [] # features
    y = [] # labels

    with open(filepath) as f:
        reader = csv.reader(f)
        skip_header = True

        for row in reader:
            if skip_header:
                skip_header = False
                continue

            if row[-1][:] == "": # empty data
                continue

            X.append(row[:-1][:])
            y.append(row[-1][:])

    return X, y

def splitData(X, y, val_rate=0.2):
    n = len(X)
    threshold = round(n * val_rate)
    valX, trainX = X[:threshold], X[threshold:]
    valy, trainy = y[:threshold], y[threshold:]
    return trainX, trainy, valX, valy

def showParsedData(X, y):
    for i in range(len(X)):
        print(X[i])
        print(y[i])
    print("Data numbers:", len(X))

def preprocessing(trainX, testX):
    # binary one hot encoding
    enc = OneHotEncoder(handle_unknown='ignore')
    enc.fit(trainX)
    new_trainX = enc.transform(trainX).toarray()
    new_testX = enc.transform(testX).toarray()
    return new_trainX, new_testX

def train(X, y):
    X = np.array(X)
    y = np.array(y)
    reg = LinearRegression().fit(X, y)
    return reg

def saveModel(model, saved_name):
    dump(model, saved_name + ".joblib") 

def loadModel(path):
    return load(path)

def test(model, X):
    X = np.array(X)
    pred_y = model.predict(X)
    return pred_y

def evaluate(y, pred_y):
    pass

def main():
    if len(sys.argv) != 4:
        print("Please run:")
        print("$ python3 read.py train.csv test.csv model_name")
        exit(0)

    train_filepath = sys.argv[1]
    test_filepath = sys.argv[2]
    print("Training CSV file:", train_filepath)
    print("Testing CSV file:", test_filepath)

    # parse data
    trainX, trainy = readCSV(train_filepath)
    testX, testy = readCSV(test_filepath)
    # split data into two parts, training data and validation data
    # trainX, trainy, valX, valy = splitData(X, y, 0.1)
    # showParsedData(valX, valy)

    rawX = trainX
    trainX, testX = preprocessing(trainX, testX)
    # print(X[:10])
    """
    training
    """
    # X = trainX
    # y = trainy
    # reg_model = train(X, y)
    # saveModel(reg_model, "reg_model")

    """
    testing
    """
    X = testX
    y = testy
    model_name = sys.argv[3]
    model = loadModel(model_name)
    pred_y = test(model, X)

    print(len(pred_y))
    for i in range(20):
        print(pred_y[i], y[i])

    # build json outputs
    res = defaultdict(dict)

    for i in range(len(y)):
        shop = rawX[i][6]
        item = rawX[i][7] + "_" + rawX[i][8]
        res[shop][item] = pred_y[i]

    with open("./data/" + model_name + ".json", "w") as out:
        json.dump(res, out)

if __name__ == "__main__":
    main()