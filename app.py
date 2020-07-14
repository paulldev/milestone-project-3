import os
import pymysql
from flask import Flask, render_template, url_for

app = Flask(__name__)

if os.path.exists("env.py"):
    import env

# print(os.environ)
# Get the username from the Gitpod workspace
username = os.getenv('mysqluser')
password = os.getenv('vmpdbpw')

# Connect to the database
connection = pymysql.connect(host='localhost',
                             user=username,
                             password=password,
                             db='vmpdb')

@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(host=os.environ.get('IP'),
            port=int(os.environ.get('PORT')),
            debug=True)
