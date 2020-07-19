import os
import pymysql
from flask import Flask, render_template, url_for, request, jsonify

app = Flask(__name__)

# if os.path.exists("env.py"):
#    import env

# print(os.environ)
# Get the username from the Gitpod workspace
username = os.getenv('mysqluser')
password = os.getenv('vmpdbpw')


@app.route('/')
def index():
    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT * FROM mealType;"
            cursor.execute(sql)
            result = cursor.fetchall()
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
    return render_template("index.html", result=result)

@app.route('/recipes')
def recipes():
    return render_template("recipes.html")

@app.route('/ingredients')
def ingredients():
    print("*inside ingredients()")
    #get ingredient names for drop down list (return js object)
    #ingredient_list = get_names('ingredient', 'name')
    #print("INDREDIENT LIST (START)")
    #print(ingredient_list)
    #print("INDREDIENT LIST (END)")

    #if ingredient name is defined, get nutritional data
    #exists = name_exists('ingredient', 'name', 'apple')
    #print("exists:")
    #print(exists)
    return render_template("ingredients.html")

@app.route('/ingredient_exists', methods=['POST'])
def get_ingredients():
    #get data from request object
#    ingredient = request.form.to_dict()

    ingredient = request.form['ingredient_name']
    #https://www.tutorialspoint.com/best-way-to-test-if-a-row-exists-in-a-mysql-table#:~:text=To%20test%20whether%20a%20row,false%20is%20represented%20as%200.
    sql_read = "SELECT name, COUNT(*) FROM ingredient WHERE name = '"+ingredient+"'GROUP BY name;"
#    sql = "SELECT EXISTS(SELECT * FROM ingredient WHERE name = '"+ingredient+"');"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql_read)
            result = cursor.fetchall() #returns a dictionary
            #connection.commit();
            if result:
                print('result is:')
                print(result)
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()

#    return jsonify({'found': result}) #dictionary -> json
    return jsonify(result)


@app.route('/get_names', methods=['POST'])
def get_names():
    table = request.form['table']
    column = request.form['column']
    
    sql = f"SELECT {column} FROM {table};"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            result = cursor.fetchall() #returns a dictionary
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
    print("*3.returning result:")
    print(result)
    return jsonify(result)


def name_exists(table, column_name, name):    
    sql_read = f"SELECT {column_name}, COUNT(*) FROM {table} WHERE {column_name} = '{name}' GROUP BY {column_name};"
#    sql = "SELECT EXISTS(SELECT * FROM ingredient WHERE name = '"+ingredient+"');"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql_read)
            result = cursor.fetchall() #returns a dictionary
            #connection.commit();
            if result:
                print('result is:')
                print(result)
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()

#    return jsonify({'found': result}) #dictionary -> json
    return jsonify(result)

if __name__ == '__main__':
    app.run(host=os.environ.get('IP'),
            port=int(os.environ.get('PORT')),
            debug=True)
