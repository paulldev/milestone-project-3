import os
import pymysql
import json
import pprint
from flask import Flask, render_template, url_for, request, jsonify, redirect

app = Flask(__name__)

# if os.path.exists("env.py"):
#    import env

# print(os.environ)
# Get the username from the Gitpod workspace
username = os.getenv('mysqluser')
password = os.getenv('vmpdbpw')
global connection

@app.route('/')
def index():
    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object

    ingredient = request.form['ingredient_name']

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object

    recipe = request.form['recipe_name']
    
    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object
    ingredient_name = request.form['ingredient_name']
 
    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object
    recipe_name = request.form['recipe_name']
    results = []#results list will contain the results from our queries

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object
    recipe_name = request.form['recipe_name']

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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


@app.route('/delete_item', methods=['POST'])
def delete_item():
    #get data from request object
     
    table = request.form['table']
    column = request.form['column']
    value = request.form['value']

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
    #get data from request object
    recipe_name = request.form['recipe_name']

    try:
        # Connect to the database
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')
        print("=================================================================================================")
        # Run a query (get recipe_id, servings)
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = f"SELECT recipe.ID, recipe.servings, recipeIngredient.ingredientID, recipeIngredient.ingredient_name, recipeIngredient.ingredient_amount, recipeIngredient.ingredient_unit, ingredient.ingredient_amount, ingredient.ingredient_unit FROM recipe AS recipe INNER JOIN recipeIngredient ON recipe.ID=recipeIngredient.recipeID INNER JOIN ingredient ON ingredient.ID=recipeIngredient.ingredientID WHERE recipe.name='{recipe_name}';"
            cursor.execute(sql)
            recipe_data = cursor.fetchall()
            print("===got all the data from the big query.")
            names_to_convert = ['energy', 'carbohydrate', 'fats', 'protein', 'calcium', 'iron', 'zinc']            
            print("===(loop) start processing each individual ingredient from big query")
            
            # process each ingredient in recipe
            for recipe_index in range(len(recipe_data)):
                converted_values = []

                print(f"Current ingredient name. ROW {recipe_index} -> {recipe_data[recipe_index]['ingredient_name']}")
                print("===(loop) start processing each nutritional value: energy, carbohydrate, etc")

                # process each nutrient to be converted
                for item in range(len(names_to_convert)):
                    print(f"Current nutrition item. ROW {item} -> {names_to_convert[item]}")
                    with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                        sql = f"SELECT {names_to_convert[item]} FROM ingredient WHERE ID={recipe_data[recipe_index]['ingredientID']};"
                        cursor.execute(sql)
                        nutrient_data = cursor.fetchall()

                        nutrition_name = names_to_convert[item]
                        nutrition_value = nutrient_data[0][names_to_convert[item]]

                        recipe_ingredient_amount = recipe_data[recipe_index]['ingredient_amount']
                        print(f"*** recipe_ingredient_amount: {recipe_ingredient_amount}")
                        
                        ingredient_amount = recipe_data[recipe_index]['ingredient.ingredient_amount']
                        print(f"*** ingredient_amount: {ingredient_amount}")

                        recipe_ingredient_unit = recipe_data[recipe_index]['ingredient_unit']
                        print(f"*** recipe_ingredient_unit: {recipe_ingredient_unit}")
                        
                        ingredient_unit = recipe_data[recipe_index]['ingredient.ingredient_unit']
                        print(f"*** ingredient_unit: {ingredient_unit}")
                        
                        print(f"{nutrition_name} nutrition value [{nutrition_value}] for [{nutrient_data[0]}]")
                        #print(f"SUM = {1 + nutrition_value}")
                        conversion_value = get_conversion_value(recipe_ingredient_unit, ingredient_unit)
                        print(f"CONVERSION VALUE: {conversion_value}")
                        converted_result = nutrition_value * ((recipe_ingredient_amount * conversion_value)/ingredient_amount)
                        print(f"******* converted amount: {converted_result}")
                        converted_values.append(round(converted_result))
                        print(f"*********** CONVERTED LIST:")
                        print(converted_values)

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    return jsonify('success')


def get_conversion_value(recipe_ingredient_unit, ingredient_unit):
    if recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'teaspoon (tsp.)':
        return 0.24
    elif recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'tablespoon (tbsp.)':
        return 0.07
    elif recipe_ingredient_unit == 'gram (g)' and ingredient_unit == 'millilitre (ml)':
        return 1
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'gram (g)':
        return 4.18
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'tablespoon (tbsp.)':
        return 0.33
    elif recipe_ingredient_unit == 'teaspoon (tsp.)' and ingredient_unit == 'millilitre (ml)':
        return 4.92
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'gram (g)':
        return 17.07
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'teaspoon (tsp.)':
        return 3
    elif recipe_ingredient_unit == 'tablespoon (tbsp.)' and ingredient_unit == 'millilitre (ml)':
        return 14.78
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'gram (g)':
        return 
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'teaspoon (tsp.)':
        return 
    elif recipe_ingredient_unit == 'millilitre (ml)' and ingredient_unit == 'tablespoon (tbsp.)':
        return 
    else:
        return 1


@app.route('/save_recipe', methods=['POST'])
def save_recipe():
    print("TESTING SAVE_RECIPE====================================>")
    received_data = request.form
    #https://www.youtube.com/watch?v=2OYkhatUZmQ
    for key in received_data.keys():
        data=key
    print(f"data: {data}")
    data_dict=json.loads(data)

    print(f"ACTION: {data_dict['action']}")
    action = data_dict['action']
    print(f"RECIPE NAME: {data_dict['recipe_name']}")
    recipe_name = data_dict['recipe_name']
    print(f"SERVINGS: {data_dict['servings']}")
    servings = data_dict['servings']
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
        connection = pymysql.connect(host='localhost',
                                     user=username,
                                     password=password,
                                     db='vmpdb')

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
            print(f"RECIPE ID = {recipe_id}")

        # Run a query (save/update step table)
        for index in range(len(step_number)):
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                #https://chartio.com/resources/tutorials/how-to-insert-if-row-does-not-exist-upsert-in-mysql/
                sql = f"INSERT IGNORE INTO step (recipeID, stepNumber, stepDescription) VALUES ('{recipe_id}', {step_number[index]}, '{step_description[index]}');"
                cursor.execute(sql)
                connection.commit()

        # Run a query (save/update recipeIngredient table)
        for index in range(len(ingredient_name)):
            # Run a query (get ingredient id)
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = f"SELECT ID FROM ingredient WHERE name='{ingredient_name[index]}';"
                print(f"SQL: {sql}")
                cursor.execute(sql)
                result = cursor.fetchone()  #returns a dictionary
                print(f"RESULT: {result}")
                ingredient_id = result['ID']
                print(f"INGREDIENT ID = {ingredient_id}")


#            print(index, ",", ingredient_name[index])
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = f"INSERT IGNORE INTO recipeIngredient (recipeID, ingredientID, ingredient_name, ingredient_amount,ingredient_unit) VALUES ({recipe_id}, {ingredient_id}, '{ingredient_name[index]}', {ingredient_amount[index]}, '{ingredient_unit[index]}');"
                cursor.execute(sql)
                connection.commit()

    finally:
        #  Close the connection, regardless of whether or not the above was successful
        connection.close()

    #return jsonify(result)
    return jsonify("saved recipe")


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
            result = cursor.fetchall()  #returns a dictionary
    finally:
        # Close the connection, regardless of whether or not the above was successful
        connection.close()
    return jsonify(result)


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
