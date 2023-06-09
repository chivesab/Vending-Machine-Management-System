from flask import Flask
import json 

app = Flask(__name__)

@app.route("/linear_yearly", methods=['GET'])
def linear_yearly():
    # reading result from json file
    with open("data/linear_yearly.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object

@app.route("/linear_semiannually", methods=['GET'])
def linear_semiannually():
    with open("data/linear_semiannually.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object


@app.route("/linear_quarterly", methods=['GET'])
def linear_quarterly():
    with open("data/linear_quarterly.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object


@app.route("/log_yearly", methods=['GET'])
def log_yearly():
    # reading result from json file
    with open("data/log_yearly.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object

@app.route("/log_semiannually", methods=['GET'])
def log_semiannually():
    with open("data/log_semiannually.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object


@app.route("/log_quarterly", methods=['GET'])
def log_quarterly():
    with open("data/log_quarterly.joblib.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object

@app.route("/lstm_yearly", methods=['GET'])
def lstm_yearly():
    # reading result from json file
    with open("data/lstm_yearly.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object

@app.route("/lstm_semiannually", methods=['GET'])
def lstm_semiannually():
    with open("data/lstm_semiannually.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object


@app.route("/lstm_quarterly", methods=['GET'])
def lstm_quarterly():
    with open("data/lstm_quarterly.json", "r") as openfile:
        json_object = json.load(openfile)
    openfile.close()
    return json_object


if __name__ == "__main__":
    app.run(host = '127.0.0.1', port = 4455, debug = True)