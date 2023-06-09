import os
import subprocess

path = os.getcwd()

# train the new model
yr_train_data = path + "/data/train.csv"
yr_model = "linear_yearly"
exec_cmd1 = "python3 " + path + "/train_linear.py " + yr_train_data + " ./data/test.csv" + " " + yr_model
exec_cmd2 = "python3 " + path + "/train_log.py " + yr_train_data + " ./data/test.csv" + " " + yr_model
subprocess.call([exec_cmd1, exec_cmd2], shell=True)