import os
import pymysql
import json
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
    print("******** Opening recipes.html")
    return render_template("recipes.html")


@app.route('/ingredients')
def ingredients():
    print("******** Opening ingredients.html")
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
    #ingredient = request.form.to_dict()

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
            result = cursor.fetchall()  #returns a dictionary
            #connection.commit();
            if result:
                print('result is:')
                print(result)
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    #  return jsonify({'found': result}) #dictionary -> json
    return jsonify(result)


@app.route('/recipe_exists', methods=['POST'])
def get_recipes():
    #get data from request object

    recipe = request.form['recipe_name']
    sql = "SELECT name, COUNT(*) FROM ingredient WHERE name = '"+recipe+"'GROUP BY name;"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
            if result:
                print('result is:')
                print(result)
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(result)


@app.route('/get_ingredient_nutrition', methods=['POST'])
def get_ingredient_nutrition():
    #get data from request object
     
    ingredient_name = request.form['ingredient_name']
    #energy_amount = request.form['energy_amount']
    #carbohydrate_amount = request.form['carbohydrate_amount']
    #fats_amount = request.form['fats_amount']
    #protein_amount = request.form['protein_amount']
    #calcium_amount = request.form['calcium_amount']
    #zinc_amount = request.form['zinc_amount']

    print(ingredient_name)
#    sql = "SELECT  energy_amount, carbohydrate_amount, fats_amount, protein_amount, calcium_amount, zinc_amount FROM ingredient;"
    sql = f"SELECT energy, carbohydrate, fats, protein, calcium, iron, zinc FROM ingredient WHERE name='{ingredient_name}';"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
            if result:
                print('result is:')
                print(result)
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(result)


@app.route('/save_ingredient_nutrition', methods=['POST'])
def save_ingredient_nutrition():
    #get data from request object
     
    ingredient_name = request.form['ingredient_name']
    energy_amount = request.form['energy_amount']
    carbohydrate_amount = request.form['carbohydrate_amount']
    fats_amount = request.form['fats_amount']
    protein_amount = request.form['protein_amount']
    calcium_amount = request.form['calcium_amount']
    iron_amount = request.form['iron_amount']
    zinc_amount = request.form['zinc_amount']

#    sql = "SELECT  energy_amount, carbohydrate_amount, fats_amount, protein_amount, calcium_amount, zinc_amount FROM ingredient;"
    sql = f"INSERT INTO ingredient (name, energy, carbohydrate, fats, protein, calcium, iron, zinc) VALUES ('{ingredient_name}', {energy_amount}, {carbohydrate_amount}, {fats_amount}, {protein_amount}, {calcium_amount}, {iron_amount}, {zinc_amount});"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
            if result:
                print('result is:')
                print(result)
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(result)


@app.route('/get_names', methods=['POST'])
def get_names():
    table = request.form['table']
    column = request.form['column']
    print('----------jQuery: page has loaded-----------')

    sql = f"SELECT {column} FROM {table};"
    print(f"MySQL query: {sql}")

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            print('Running SQL query...')
            result = cursor.fetchall()  #returns a dictionary
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
        print(f'RAW query result: {result}')
        if type(result) is dict:
            print(f'RESULT is a dictionary: {result}')
        else:
            print(f'RESULT is NOT a dictionary: {result}')
        print(f'jsonify query result. return this > {jsonify(result)}')
    return jsonify(result)
    #return json.dumps(result)


def name_exists(table, column_name, name):
    sql = f"SELECT {column_name}, COUNT(*) FROM {table} WHERE {column_name} = '{name}' GROUP BY {column_name};"

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql_read)
            result = cursor.fetchall()  #returns a dictionary
            #connection.commit();
            if result:
                print('result is:')
                print(result)
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()

    print("*** 3. result from python:")
    print(result)
    print("*** 4. jsonify(result):")
    print(jsonify(result))
    return jsonify(result)


if __name__ == '__main__':
    app.run(host=os.environ.get('IP'),
            port=int(os.environ.get('PORT')),
            debug=True)
