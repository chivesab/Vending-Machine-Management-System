import os
import subprocess

path = os.getcwd()

# train the new model
hy_train_data = path + "/data/halfyear.csv"
hy_model = "linear_halfyearly"
exec_cmd1 = "python3 " + path + "/train_linear.py " + hy_train_data + " ./data/test.csv " + hy_model
exec_cmd2 = "python3 " + path + "/train_log.py " + hy_train_data + " ./data/test.csv " + hy_model
subprocess.call([exec_cmd1, exec_cmd2], shell=True)