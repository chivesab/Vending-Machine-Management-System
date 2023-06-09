import os
import sys
import csv
import numpy as np
import pandas as pd
from sklearn import datasets
from io import StringIO
import matplotlib.pyplot as plt
from pandas import read_csv
import math
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import tensorflow as tf
import collections
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

def readCSV2(filepath):
    x = []
    with open(filepath) as f:
        reader = csv.reader(f)
        skip_header = True

        for row in reader:
            if skip_header:
                skip_header = False
                continue

            if row[-1][:] == "": # empty data
                continue

            x.append(row[:][:])
    return x

def readCSV_history(filepath):
    x = []
    with open(filepath) as f:
        reader = csv.reader(f)
        skip_header = True

        for row in reader:
            if skip_header:
                skip_header = False
                continue

            if row[-1][:] == "": # empty data
                continue

            x.append(row[:][:])
    return x

def showParsedData(X, y):
    for i in range(len(X)):
        print(X[i])
        print(y[i])
    print("Data numbers:", len(X))


# create X, Y dataset, Y is the next quantity
def create_dataset(dataset, look_back=1):
	dataX, dataY = [], []
	for i in range(len(dataset)-look_back-1):
		a = dataset[i:(i+look_back), 0]
		dataX.append(a)
		dataY.append(dataset[i + look_back, 0])
	return np.array(dataX), np.array(dataY)


def preprocess(data):
    # create 90 csv file
    df = pd.DataFrame(data, columns = ['id','date', 'city', 'lat', 'long', 'pop', 'shop', 'brand', 'container', 'capacity', 'price','quantity'])
    row = ['id','date', 'city', 'lat', 'long', 'pop', 'shop', 'brand', 'container', 'capacity', 'price','quantity']
    for i in range(90):
        filename = 'history_' + str(i) + '.csv'
        f = open('training_data/' + filename, 'w')
        writer = csv.writer(f)
        writer.writerow(row)
        f.close()

    for i in range(len(df['id'])):
        n = int(df['id'][i]) % 90
        filename = 'history_' + str(n) + ".csv"
        df2 = df.iloc[i:i+1][['id','date', 'city', 'lat', 'long', 'pop', 'shop', 'brand', 'container', 'capacity', 'price','quantity']]
        df2.to_csv('training_data/' + filename, index = False, mode = 'a', header = False)
        


    
def process(data):
    df = pd.DataFrame(data, columns = ['id','date', 'city', 'lat', 'long', 'pop', 'shop', 'brand', 'container', 'capacity', 'price','quantity'])
    #df = df[['price','container','capacity','brand','shop','quantity']]
    df2 = df[['quantity']]
    df.dropna(subset = ['price'])
    shop_mapping = {
        'shop_1':1,
        'shop_2':2,
        'shop_3':3,
        'shop_4':4,
        'shop_5':5,
        'shop_6':6
    }
    container_mapping = {
        'plastic': 1,
        'can':2,
        'glass':3
    }

    capacity_mapping = {
        '1.5lt':1,
        '500ml':2,
        '330ml':3
    }

    date_mapping = {
        ''
    }

    # mapping shop columns to 1 ~ 6
    df['shop'] = df['shop'].map(shop_mapping)
    df['container'] = df['container'].map(container_mapping)
    df['capacity'] = df['capacity'].map(capacity_mapping)

    # one-hot encoding brand columnsgit
    onehot_encoding = pd.get_dummies(df['brand'], prefix = 'brand')
    df = df.drop('brand', 1)
    df = pd.concat([onehot_encoding, df], axis = 1)

    dataset = df2.values
    dataset = dataset.astype('float32')

    # normalize dataset, set data to be [0..1]
    scaler = MinMaxScaler(feature_range=(0, 1))
    dataset = scaler.fit_transform(dataset)
    
    # 2/3 dataset for training, 1/3 dataset for testing
    train_size = int(len(dataset) * 0.67)
    test_size = len(dataset) - train_size
    train, test = dataset[0:train_size,:], dataset[train_size:len(dataset),:]
    # create X, Y dataset, Y is the next quantity(reshape into X=t and Y=t+1)
    look_back = 1
    trainX, trainY = create_dataset(train, look_back)
    testX, testY = create_dataset(test, look_back)
    # reshape input to be [samples, time steps, features]
    # trainX.shape[0], 1, trainX.shape[1] = (721, 1, 1)
    trainX = np.reshape(trainX, (trainX.shape[0], 1, trainX.shape[1]))
    testX = np.reshape(testX, (testX.shape[0], 1, testX.shape[1]))

    # Build and train LSVM
    model = Sequential()
    model.add(LSTM(4, input_shape=(1, look_back)))
    model.add(Dense(1))
    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(trainX, trainY, epochs=100, batch_size=1, verbose=2)


    # predict
    trainPredict = model.predict(trainX)
    testPredict = model.predict(testX)

    # inverse scaled data to original data form
    trainPredict = scaler.inverse_transform(trainPredict)
    trainY = scaler.inverse_transform([trainY])
    testPredict = scaler.inverse_transform(testPredict)
    testY = scaler.inverse_transform([testY])


    # split the data
    output = split_data(testPredict)

    # calculate root mean squared error
    trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:,0]))
    #print('Train Score: %.2f RMSE' % (trainScore))
    testScore = math.sqrt(mean_squared_error(testY[0], testPredict[:,0]))
    #print('Test Score: %.2f RMSE' % (testScore))

    # draw training data plot
    # shift train predictions for plotting
    trainPredictPlot = np.empty_like(dataset)
    trainPredictPlot[:, :] = np.nan
    trainPredictPlot[look_back:len(trainPredict)+look_back, :] = trainPredict

    # draw testing data plot
    # shift test predictions for plotting
    testPredictPlot = np.empty_like(dataset)
    testPredictPlot[:, :] = np.nan
    testPredictPlot[len(trainPredict)+(look_back*2)+1:len(dataset)-1, :] = testPredict

    # draw original data plot
    # Blue line is the original value, orange line is training value, green line is testing value
    # plot baseline and predictions
    plt.plot(scaler.inverse_transform(dataset))
    plt.plot(trainPredictPlot)
    plt.plot(testPredictPlot)
    #plt.show()


def split_data(prediction):
    output = dict()
    brand_mapping = {
        "brand1" : "kinder-cola_glass",
        "brand2" : "kinder-cola_plastic",
        "brand3" : "kinder-cola_can",
        "brand4" : "adult-cola_plastic",
        "brand5" : "adult-cola_can",
        "brand6" : "orange-power_glass",
        "brand7" : "orange-power_can",
        "brand8" : "gazoza_glass",
        "brand9" : "gazoza_plastic", 
        "brand10" : "gazoza_can",
        "brand11" : "lemon-boost_glass",
        "brand12" : "lemon-boost_plastic",
        "brand13" : "lemon-boost_can",
        "brand14" : "adult-cola_glass",
        "brand15" : "orange-power_plastic"  
    }
    idx = 0
    for i in range(1, 7):
        brands = dict()
        for j in range(1, 16):
            brand = "brand" + str(j)
            brand_name = brand_mapping[brand]
            brands[brand_name] = prediction.item(idx)
            idx += 1
        shop = "shop_" + str(i)
        output[shop] = brands
    json_object = json.dumps(output)
    with open("data/lstm_yearly.json", "w") as outfile:
        outfile.write(json_object)
    outfile.close()
    return output




def main():
    if len(sys.argv) < 2:
        print("Please run:")
        print("$ python3 main.py test_file_path.csv")
        exit(0)

    filepath = sys.argv[1]
    print("CSV file:", filepath)

    #X, y = readCSV(filepath)
    X = readCSV2(filepath)
    #howParsedData(X, y)
    #preprocess(X)
    #X1 = readCSV_history("training_data/history_0.csv")
    process(X)
    
    

if __name__ == "__main__":
    # fix random seed for reproducibility
    tf.random.set_seed(7)
    main()