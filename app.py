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

print(f"Test <1>")
print(f"DB_USER> {os.environ.get('DB_USER')}")
print(f"DB_HOST> {os.environ.get('DB_HOST')}")
print(f"ENVIRONMENT> {os.environ.get('ENVIRONMENT')}")
print(f"PORT> {os.environ.get('PORT')}")

#print("User's Environment variable:") 
#pprint.pprint(dict(env_var), width = 1)
#print(f"IP: {os.environ.get('IP')}")
#print(f"IP: {int(os.environ.get('PORT'))}")


@app.route('/')
def index():
#    #global connection
    try:
        # Connect to the database
#        connection = pymysql.connect(host='localhost',
#                                     user=username,
#                                     password=password,
#                                     db='vmpdb')
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get meal)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT * FROM mealType;"
            cursor.execute(sql)
            result = cursor.fetchall()
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
    return render_template("index.html", meal_type=result)


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
def ingredient_exists():
    #global connection
    #get data from request object

    ingredient = request.form['ingredient_name']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            #https://www.tutorialspoint.com/best-way-to-test-if-a-row-exists-in-a-mysql-table#:~:text=To%20test%20whether%20a%20row,false%20is%20represented%20as%200.
            sql = f"SELECT name, COUNT(*) FROM ingredient WHERE name='{ingredient}' GROUP BY name;"
            cursor.execute(sql)
            result = cursor.fetchone()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    if result:
        return jsonify('match')
    else:
        return jsonify('no match')

@app.route('/recipe_exists', methods=['POST'])
def recipe_exists():
    #global connection
    #get data from request object

    recipe = request.form['recipe_name']
    
    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT name, COUNT(*) FROM recipe WHERE name = '{recipe}' GROUP BY name;"
            cursor.execute(sql)
            result = cursor.fetchone()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    if result:
        return jsonify('match')
    else:
        return jsonify('no match')


@app.route('/get_ingredient_nutrition', methods=['POST'])
def get_ingredient_nutrition():
    #global connection
    #get data from request object
    ingredient_name = request.form['ingredient_name']
 
    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT ingredient_amount, ingredient_unit, energy, carbohydrate, fats, protein, calcium, iron, zinc FROM ingredient WHERE name='{ingredient_name}';"
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(result)


@app.route('/get_recipe_data', methods=['POST'])
def get_recipe_data():
    #global connection
    #get data from request object
    recipe_name = request.form['recipe_name']
    results = []#results list will contain the results from our queries

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get servings)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT servings FROM recipe WHERE name='{recipe_name}';"
            cursor.execute(sql)
            servings = cursor.fetchone()  #returns a dictionary
            results.append(servings) #add servings to our results array (to be read by jquery)

        # Run a query (get list of ingredients)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:#plucey do I need so many columns returned?
            sql = f"SELECT recipe.name, recipeIngredient.ingredient_amount, recipeIngredient.ingredient_unit, recipeIngredient.ingredientID, ingredient.name FROM recipe AS recipe INNER JOIN recipeIngredient ON recipe.ID=recipeIngredient.recipeID INNER JOIN ingredient ON ingredient.ID=recipeIngredient.ingredientID WHERE recipe.name='{recipe_name}';"
            cursor.execute(sql)
            ingredients = cursor.fetchall()  #returns a dictionary
            results.append(ingredients) #add ingredients to our results array (to be read by jquery)

        # Run a query (get list of steps)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT recipe.name, step.recipeID, step.stepNumber, step.stepDescription FROM step AS step INNER JOIN recipe ON recipe.ID=step.recipeID WHERE recipe.name='{recipe_name}';"
            cursor.execute(sql)
            steps = cursor.fetchall()  #returns a dictionary
            results.append(steps) #add steps to our results array (to be read by jquery)

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(results) #returns list: servings (value), ingredients (list), steps (list)


@app.route('/delete_recipe', methods=['POST'])
def delete_recipe():
    #global connection
    #get data from request object
    recipe_name = request.form['recipe_name']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get recipeID)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT ID FROM recipe WHERE name='{recipe_name}';"
            cursor.execute(sql)
            result = cursor.fetchone()
            recipe_id=result['ID']
        # Run a query (delete from recipeIngredient table)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM recipeIngredient WHERE recipeID = {recipe_id};"
            cursor.execute(sql)
            connection.commit()
        # Run a query (delete from step table)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM step WHERE recipeID = {recipe_id};"
            cursor.execute(sql)
            connection.commit()
        # Run a query (delete from recipe table)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM recipe WHERE ID = {recipe_id};"
            cursor.execute(sql)
            connection.commit()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify("deleted")


@app.route('/update_nutrition_summary', methods=['POST'])
def update_nutrition_summary():
    #global connection
    #get data from request object
    recipe_name = request.form['recipe_name']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get nutrition summary)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"select * from recipe where name='{recipe_name}';"
            cursor.execute(sql)
            result = cursor.fetchone()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify(result)


@app.route('/delete_item', methods=['POST'])
def delete_item():
    #global connection
    #get data from request object
     
    table = request.form['table']
    column = request.form['column']
    value = request.form['value']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM {table} WHERE {column} = '{value}';"
            cursor.execute(sql)
            connection.commit()
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify("deleted")


@app.route('/save_ingredient_nutrition', methods=['POST'])
def save_ingredient_nutrition():
    #global connection
    #get data from request object
    action = request.form['action']
    ingredient_name = request.form['ingredient_name']
    ingredient_amount = request.form['ingredient_amount']
    ingredient_unit = request.form['ingredient_unit']
    energy_amount = request.form['energy_amount']
    carbohydrate_amount = request.form['carbohydrate_amount']
    fats_amount = request.form['fats_amount']
    protein_amount = request.form['protein_amount']
    calcium_amount = request.form['calcium_amount']
    iron_amount = request.form['iron_amount']
    zinc_amount = request.form['zinc_amount']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            if action == "save":
                sql = f"INSERT INTO ingredient (name, ingredient_amount, ingredient_unit, energy, carbohydrate, fats, protein, calcium, iron, zinc) VALUES ('{ingredient_name}', {ingredient_amount}, '{ingredient_unit}', {energy_amount}, {carbohydrate_amount}, {fats_amount}, {protein_amount}, {calcium_amount}, {iron_amount}, {zinc_amount});"
            elif action == "update":
                sql = f"UPDATE ingredient SET ingredient_amount={ingredient_amount}, ingredient_unit='{ingredient_unit}', energy={energy_amount}, carbohydrate={carbohydrate_amount}, fats={fats_amount}, protein={protein_amount}, calcium={calcium_amount}, iron={iron_amount}, zinc={zinc_amount} WHERE name='{ingredient_name}';"
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
            connection.commit()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify('success')


@app.route('/update_recipe_nutrition_values', methods=['POST'])
def update_recipe_nutrition_values():
    #global connection
    #get data from request object
    recipe_name = request.form['recipe_name']

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (get recipe_id, servings)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT recipe.ID, recipe.servings, recipeIngredient.ingredientID, recipeIngredient.ingredient_name, recipeIngredient.ingredient_amount, recipeIngredient.ingredient_unit, ingredient.ingredient_amount, ingredient.ingredient_unit FROM recipe AS recipe INNER JOIN recipeIngredient ON recipe.ID=recipeIngredient.recipeID INNER JOIN ingredient ON ingredient.ID=recipeIngredient.ingredientID WHERE recipe.name='{recipe_name}';"
            cursor.execute(sql)
            recipe_data = cursor.fetchall()
            
            names_to_convert = ['energy', 'carbohydrate', 'fats', 'protein', 'calcium', 'iron', 'zinc']
            converted_values = []#xxx
            print("========================================================================================================")
            print("=================================== START ==============================================================")
            print("========================================================================================================")
            
            # process each ingredient in recipe
            for recipe_index in range(len(recipe_data)):
                print(f"=== FOR EACH INGREDIENT (Processing ingredient {recipe_index}) =========================================")
                print(f"Converted_values[] : {converted_values}")

                servings = recipe_data[recipe_index]['servings']
                #print(f"**** SERVINGS: {servings}")
                recipe_id = recipe_data[recipe_index]['ID']
                #print(f"**** RECIPE ID: {recipe_id}")

                #print(f"Current ingredient name. ROW {recipe_index} -> {recipe_data[recipe_index]['ingredient_name']}")
                #print("===(loop) start processing each nutritional value: energy, carbohydrate, etc")

                # process each nutrient to be converted
                for nutrient_index in range(len(names_to_convert)):
                    print(f"\tConverted_values[] : {converted_values}")
                    print(f"\t=== FOR EACH NUTRIENT (Processing {names_to_convert[nutrient_index]}) =========================================")
                    #print(f"Current nutrition item. ROW {nutrient_index} -> {names_to_convert[nutrient_index]}")
                    with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                        sql = f"SELECT {names_to_convert[nutrient_index]} FROM ingredient WHERE ID={recipe_data[recipe_index]['ingredientID']};"
                        cursor.execute(sql)
                        nutrient_data = cursor.fetchall()

                        nutrition_name = names_to_convert[nutrient_index]
                        nutrition_value = nutrient_data[0][names_to_convert[nutrient_index]]

                        recipe_ingredient_amount = recipe_data[recipe_index]['ingredient_amount']
                        #print(f"*** recipe_ingredient_amount: {recipe_ingredient_amount}")
                        
                        ingredient_amount = recipe_data[recipe_index]['ingredient.ingredient_amount']
                        #print(f"*** ingredient_amount: {ingredient_amount}")

                        recipe_ingredient_unit = recipe_data[recipe_index]['ingredient_unit']
                        #print(f"*** recipe_ingredient_unit: {recipe_ingredient_unit}")
                        
                        ingredient_unit = recipe_data[recipe_index]['ingredient.ingredient_unit']
                        #print(f"*** ingredient_unit: {ingredient_unit}")
                        
                        print(f"\t\t{nutrition_name} > {nutrition_value}")
                        conversion_value = get_conversion_value(recipe_ingredient_unit, ingredient_unit)
                        #print(f"CONVERSION VALUE: {conversion_value}")
                        converted_result = (nutrition_value * ((recipe_ingredient_amount * conversion_value)/ingredient_amount))/servings
                        print(f"\t\t{nutrition_name} > {converted_result} (converted)")
                        #print(f"******* converted amount: {converted_result}")
                        #print(f"Recipe index - {recipe_index}")
                        #print(f"Nutrient index - {nutrient_index}")
                        print(f"\t\tConverted_values[] : {converted_values}")
                        print(f"??? nutruent index : {nutrient_index}")
                        if recipe_index == 0:
                            print(f"\t\t(IF)")
                            converted_total = converted_result
                            converted_values.append(round(converted_total))
                            print(f"\t\tConverted_values[] : {converted_values}")
                        else:
                            print(f"\t\t(ELSE)")
                            print(f"\t\tConverted_values[] : {converted_values}")

                            converted_total = converted_result + converted_values[nutrient_index]
                            print(f"??? nutrient index : {nutrient_index}")
                            print(f"??? converted total : {converted_total}")
                            print(f"??? lsit[] : {converted_values}")
                            converted_values[nutrient_index] = round(converted_total)
    
                        if nutrient_index == len(names_to_convert)-1:
                            print("**********************TIME TO WRITE TO DATABASE**********************")
                            # Run a query
                            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                                #https://www.mysqltutorial.org/mysql-insert-or-update-on-duplicate-key-update/
                                print(f"?????? RECIPE ID : {recipe_id}")
                                sql = f"UPDATE recipe SET {names_to_convert[0]} = {converted_values[0]}, {names_to_convert[1]} = {converted_values[1]}, {names_to_convert[2]} = {converted_values[2]}, {names_to_convert[3]} = {converted_values[3]}, {names_to_convert[4]} = {converted_values[4]}, {names_to_convert[5]} = {converted_values[5]}, {names_to_convert[6]} = {converted_values[6]} WHERE ID = {recipe_id};"
                                cursor.execute(sql)
                                connection.commit()
    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify('success')


def get_conversion_value(recipe_ingredient_unit, ingredient_unit):
    if recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'teaspoon (tsp.)':
        print(f"found conversion unit for (1)")
        return 0.24
    elif recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'tablespoon (tbsp.)':
        print(f"found conversion unit for (2)")
        return 0.07
    elif recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'millilitre (ml)':
        print(f"found conversion unit for (3)")
        return 1
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'gram (g)':
        print(f"found conversion unit for (4)")
        return 4.18
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'tablespoon (tbsp.)':
        print(f"found conversion unit for (5)")
        return 0.33
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'millilitre (ml)':
        print(f"found conversion unit for (6)")
        return 4.92
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'gram (g)':
        print(f"found conversion unit for (7)")
        return 17.07
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'teaspoon (tsp.)':
        print(f"found conversion unit for (8)")
        return 3
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'millilitre (ml)':
        print(f"found conversion unit for (9)")
        return 14.78
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'gram (g)':
        print(f"found conversion unit for (9)")
        return 1
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'teaspoon (tsp.)':
        print(f"found conversion unit for (10)")
        return 0.2
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'tablespoon (tbsp.)':
        return 0.067
    else:
        return 1


@app.route('/save_recipe', methods=['POST'])
def save_recipe():
    #global connection
    print("TESTING SAVE_RECIPE====================================>")
    received_data = request.form
    #https://www.youtube.com/watch?v=2OYkhatUZmQ
    for key in received_data.keys():
        data=key
    print(f"data: {data}")
    data_dict=json.loads(data)

    action = data_dict['action']
    print(f"ACTION: {action}")
    recipe_name = data_dict['recipe_name']
    print(f"RECIPE NAME: {recipe_name}")
    servings = data_dict['servings']
    print(f"SERVINGS: {servings}")
    ingredient_name = data_dict['ingredient_name']
    print(f"INGREDIENT NAMES: {ingredient_name}")
    ingredient_amount = data_dict['ingredient_amount']
    print(f"INGREDIENT AMOUNTS: {ingredient_amount}")
    ingredient_unit = data_dict['ingredient_unit']
    print(f"INGREDIENT UNITS: {ingredient_unit}")
    step_number = data_dict['step_number']
    print(f"STEP NUMBERS: {step_number}")
    step_description = data_dict['step_description']
    print(f"STEP DESCRIPTIONS: {step_description}")
    #print("*************MY DICT**********************")
    # Prints the nicely formatted dictionary
    #pprint.pprint(data_dict)

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query (save/update recipe table)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            if action == "save":
                sql = f"INSERT INTO recipe (name, servings) VALUES ('{recipe_name}', {servings});"
            elif action == "update":
                sql = f"UPDATE recipe SET servings={servings} WHERE name='{recipe_name}';"
            cursor.execute(sql)
            connection.commit()

        # Run a query (get recipeID)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT ID FROM recipe WHERE name='{recipe_name}';"
            cursor.execute(sql)
            result = cursor.fetchone()#returns a dictionary
            recipe_id = result['ID']

        # Run a query (delete current recipe steps)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM step WHERE recipeID = {recipe_id};"
            cursor.execute(sql)
            connection.commit()

        # Run a query (save steps)
        for index in range(len(step_number)):
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = f"INSERT INTO step (recipeID, stepNumber, stepDescription) VALUES ({recipe_id}, {step_number[index]}, '{step_description[index]}');"
                cursor.execute(sql)
                connection.commit()

        # Run a query (delete current ingredients)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"DELETE FROM recipeIngredient WHERE recipeID = {recipe_id};"
            cursor.execute(sql)
            connection.commit()

        # Run a query (save/update recipeIngredient table)
        for index in range(len(ingredient_name)):
            # Run a query (get ingredient id)
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = f"SELECT ID FROM ingredient WHERE name='{ingredient_name[index]}';"
                cursor.execute(sql)
                result = cursor.fetchone()
                ingredient_id = result['ID']

            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = f"INSERT INTO recipeIngredient (recipeID, ingredientID, ingredient_name, ingredient_amount,ingredient_unit) VALUES ({recipe_id}, {ingredient_id}, '{ingredient_name[index]}', {ingredient_amount[index]}, '{ingredient_unit[index]}');"
                cursor.execute(sql)
                connection.commit()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify("saved recipe")


@app.route('/get_names', methods=['POST'])
def get_names():
    #global connection
    table = request.form['table']
    column = request.form['column']
    print('----------jQuery: page has loaded-----------')

    sql = f"SELECT {column} FROM {table};"
    print(f"MySQL query: {sql}")

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()  #returns a dictionary
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
    return jsonify(result)


def name_exists(table, column_name, name):
    #global connection
    sql = f"SELECT {column_name}, COUNT(*) FROM {table} WHERE {column_name} = '{name}' GROUP BY {column_name};"

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

        # Run a query
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql)
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


def get_value(table, column, name):
    #global connection
    sql = f"SELECT {column_name}, COUNT(*) FROM {table} WHERE {column_name} = '{name}' GROUP BY {column_name};"

    try:
        # Connect to the database
        connection = mysql.connector.connect(host='eu-cdbr-west-03.cleardb.net', user=username, password=password, db='heroku_9e225f5dce339fd')

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
    app.run(host='0.0.0.0', debug=True)
