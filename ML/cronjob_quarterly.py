import os
import subprocess

path = os.getcwd()

# train the new model
qu_train_data = path + "/data/quarterly.csv"
qu_model = "linear_quarterly"
exec_cmd1 = "python3 " + path + "/train_linear.py " + qu_train_data + " ./data/test.csv " + qu_model
exec_cmd2 = "python3 " + path + "/train_log.py " + qu_train_data + " ./data/test.csv " + qu_model
subprocess.call([exec_cmd1, exec_cmd2], shell=True)