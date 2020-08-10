import os
import pymysql
import mysql.connector
import json
import pprint
from os import environ
from flask import Flask, render_template, url_for, request, jsonify, redirect

app = Flask(__name__)

# Get the username from the Gitpod workspace
#username = os.getenv('dbuser')
#password = os.getenv('dbpassword')
username = os.environ.get('DB_USER')
password = os.environ.get('DB_PASSWORD')

print(f"Test <3>")
if os.environ.get('ENVIRONMENT') == 'gitpod':
    print(f"ENVIRONMENT> {os.environ.get('ENVIRONMENT')}")
    print(f"DB_HOST> {os.environ.get('DB_HOST')}")
    print(f"DB_USER> {os.environ.get('DB_USER')}")
    print(f"PORT> {os.environ.get('PORT')}")
    print(f"IP> {os.environ.get('IP')}")
    app.debug = True
else:
    print(f"ENVIRONMENT> {os.environ.get('ENVIRONMENT')}")
    print(f"DB_HOST> {os.environ.get('DB_HOST')}")
    print(f"DB_USER> {os.environ.get('DB_USER')}")
    print(f"PORT> {os.environ.get('PORT')}")
    print(f"IP> {os.environ.get('IP')}")
    app.degug = False
#print(os.environ)
#print("User's Environment variable:") 
#pprint.pprint(dict(os.environ), width = 1)
#print(f"IP: {os.environ.get('IP')}")
#print(f"IP: {int(os.environ.get('PORT'))}")


@app.route('/')
def index():
#    #global connection
#    try:
        # Connect to the database
#        connection = pymysql.connect(host='localhost',
#                                     user=username,
#                                     password=password,
#                                     db='vmpdb')
#        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get meal)
#        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
#            sql = "SELECT * FROM mealType;"
#            cursor.execute(sql)
#            result = cursor.fetchall()
#    finally:
        # Close the connection, regardless of whether or not the above was successful
#        connection.close()
    return render_template("index.html")


@app.route('/recipes')
def recipes():
    print("******** Opening recipes.html")
    return render_template("recipes.html")


@app.route('/ingredients')
def ingredients():
    print("******** Opening ingredients.html")
    return render_template("ingredients.html")



if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    #port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=5005)