# Nutriplan

### Live website: https://ci-milestone-project-3.herokuapp.com/

### Repository: https://github.com/paulldev/milestone-project-3

### Project wireframe and flowcharts: https://github.com/paulldev/milestone-project-3/blob/master/documentation/wireframe-flowcharts-milestone-3.pdf
NOTE: It doesn't display the flowcharts properly in Github, please download pdf first and then open the pdf file. 

## Introduction

Nutriplan is a web app which allows users to get an overview of the nutrition they get from their daily meals. After entering your daily meal plan, you will instantly see what nutrients (if any) you are deficient in. You can then tweak your daily meal plan accordingly for optimum health.
Even though the web app can be used by anyone, reguardless of what diet you follow, it is primarily aimed at people who eat a vegan diet. Therefore, the nutritional summary data has a strong focus on nutrients that vegans might traditionally be deficient in.

All code produced is my own. Any sources I used as a reference are included as a link in my code. All solutions are based on course material, official documentation, and lots of trial and error.

## UX

### Strategy Plane

> What are you aiming to achieve and for whom?

I want my web app to make it easy for people to see, at a glance, if they are achieving their daily nutritional needs from their diet. My main focus is on people who eat a vegan diet, although the web app will work for all diets.
I joined the Challenge 22 Facebook group to learn more about veganism. I also researched https://nutritionfacts.org/ to learn more about nutrition.
The topic of nutrition is very complex and detailed, and I wanted to simplify it so that users feels less overwhelmed.

### Scope Plane

> Which features (based on information from the strategy plane) do you want to include in your design?

I want the web app to have 3 main pages:
- **Daily meal plan (home):** this is where you can add recipes to your daily meal plan. What will you eat for breakfast? What will you eat for lunch? What will you eat for dinner?
As you add eacg recipe to your list of meals, you will get an updated, visual, overview of your daily nutrition. The values used are based on the RDA for each nutrient.
- **Recipes:** this is where you can search for recipes or add your own recipes. Once you save a recipe, it will be available to use from the meal planner page (home page).
- **Ingredients:** this is where you can search for ingredients or add your own ingredients. You need to fill in the nutritional data for an ingredient before it can be saved. This information can be found by searching for the ingredient in https://cronometer.com/.

### Structure Plane

> How is the information structured and how is it logically grouped.

The data will be stored in a MySQL database with the following structure:
![EER diagram](https://github.com/paulldev/milestone-project-3/blob/master/documentation/EER_diagram.png?raw=true)

The web app is divided into 3 main pages as is seen from the wireframe:
![Wireframe](https://github.com/paulldev/milestone-project-3/blob/master/documentation/wireframe.png?raw=true)


The information is logically grouped into 3 main groups:

**1. Ingredients:**
- Each ingredient has the following nutritional data:
  - amount
  - unit of measurement
  - energy value
  - carbohydrate value
  - fats value
  - protein value
  - calcium value
  - iron value
  - zinc value

**2. Recipes:**
- Each recipe has the following data:
  - servings (the amount of people the recipe feeds)
  - energy value
  - carbohydrate value
  - fats value
  - protein value
  - calcium value
  - iron value
  - zinc value

The nutritional values in each recipe, are based on the servings, the amount of the ingredient used in the recipe, and the unit measurement used in the recipe. They are accumilitive totals.
If a recipe lists a certain ingredient using a different measurement unit than the ingredient itself, the nutritional values will be converted by the app.

Each recipe contains a list of ingredients used, and a list of steps used to make the recipe.

- **3. Meals:**
Each meal has the following data:
- The recipe used
- The meal type (breakfast, lunch, dinner, etc)
- The list of meals
- The visual representation of your total nutrient intake for the day

### Skeleton Plane

> How will our information be represented, and how will the user navigate to the information and features?

The information is represented as 3 web pages:
- **Home:**
The home page will be represented as a form which can be populated by searching for an existing recipe to add to the meals list.
The nutritional summary section will dynamically respond to recipes being added and/or deleted from the meals list.

- **Recipes:**
The recipes page will be represented as a form which can be filled out and saved, or populated by searching for an existing recipe.

- **Ingredients:**
The ingredients page will be represented as a form which can be filled out and saved, or populated by searching for an existing ingredient.

Navigation will be done with the navbar links.
Another navigation scenario is when the user tries to add an ingredient/recipe that doesn't exist. This will prompt the user to navigate to the recipe/ingredient page where they can create recipe/ingredient. The name will be brought from the sending page to the landing page, where it will be awaiting the rest of the form to be filled in.


### Surface Plane

> What will our finished product look like?

The finished product will be a responsive web app which allows users to:
  - create ingredients, recipes, and meals
  - load and display data from the database
  - update existing data
  - delete existing data

The navbar will be responsive and contain links to the 3 main pages (home, recipes, ingredients).

The **home** page will allow the user to search for an existing recipe and add it to the daily list of meals beneath. Each list item can be deleted by clicking the delete icon beside each list item.

The nutritional summary summary section will be updated as the user adds (or deletes) a meal from the list of daily meals.

The **recipes** page will allow the user to search for an existing recipe and populate the form with the data returned from the database.

If the recipe is new, the user will be able to search for existing ingredients and add them to the ingredients list.
The user will also be able to add recipe steps to the steps list.
Once all the recipe data has been filled out, the recipe can be saved to the database.

For existing recipes, once a matching recipe is found, the form will be populated with data returned from the database (ingredients list, steps list, etc). An existing recipe can then be edited and saved, or deleted.

The **ingredients** page will allow the user to search for an existing ingredient and populate the form with the relevant nutritional data returned from the database. This ingredient can then be deleted if required.

If the ingredient is new, the user must fill out the form and then save it to the database.


## Features
- Status tables allow users to navigate to different pages without losing their data. If you are creating a new recipe and you are entering an ingredient that doesn't exist in the database, you can navigate to the ingredients page, create the ingredient, and return to the recipe page an continue where you left off.
- When searching for a recipe or an ingredient, the Materialize autocomplete feature is used (https://materializecss.com/autocomplete.html). A local object is kept up-to-date, which is used to populate the drop down list based on your search text.

## Future features to implement

- add user logins (covered in next course modules). This will prevent users' recipes and ingredients being overwritten or deleted.

## Technologies used

| Name                   | Type      | Site url                                                       | Why use it?                                                                           |
| :--------------------- | :-------- | :------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| HTML5                  | Language  | https://www.w3.org/TR/html52/                                  | To structure the website                                                              |
| CSS3                   | Language  | https://www.w3.org/Style/CSS/Overview.en.html                  | To style and layout the website                                                       |
| Javascript             | Language  | https://developer.mozilla.org/en-US/docs/Web/JavaScript        | To create responsive, interactive elements for web pages                              |
| jQuery                 | Library   | https://jquery.com/                                            | To make DOM traversal, manipulation, event handling, animation, and Ajax much simpler |
| Materialize              | Framework | https://materializecss.com/                                      | To make layout easier                                                                 |
| Croppola               | Tool      | https://croppola.com/                                          | To crop my images                                                                     |
| Reduce Images          | Tool      | https://www.reduceimages.com/                                  | To reduce the size of my images                                                       |
| Real favicon generator | Tool      | https://realfavicongenerator.net                               | To generate favicons from an image    
| MySQL Workbench | Tool      | https://www.mysql.com/products/workbench/                               | To create EER diagram, run queries. 
| ClearDB | Heroku 3rd party add-on      | https://www.cleardb.com/                               | To allow a MySQL database to be used.                                                    |

## Testing

**Manual testing was recorded in the following table:**
From inside **DevTools > Sources > Watch**, we add each variable to be tested as we run the app.

| Page                                              | Actions                          | Test results                                                                                                                                                                                                                       | Result |
| :------------------------------------------------ | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
|index.html|load page|All fields empty|Pass|
|index.html|load page (status tables contain data)|populate page with current status values|Pass|
|index.html|recipe_name (onkeyup)|display relevant recipes from drop down list|Pass|
|index.html|recipe_name (onkeyup), match found|display toast message "loaded recipe data"|Pass|
|index.html|recipe_name (click autocomplete suggestion)|display toast message "loaded recipe data"|Pass|
|index.html|Click add button (recipe exists)|Add to meal list & update nutrition progress bars|Pass|
|index.html|Click add button (recipe does not exist)|display toast message "recipe not found [CREATE RECIPE]"|Pass|
|index.html|Click [CREATE RECIPE] (from above toast message)|Redirect to recipes.html with unmatched recipe name filled in for us|Pass|
|index.html|Click delete button, if visible (for a single meal in our list)|Delete meal from list & update nutrition progress bars|Pass|
|recipes.html|load page|All fields empty|Pass|
|recipes.html|load page (status tables contain data)|populate page with current status values|Pass|
|recipes.html|load Page > redirect from 'index.html'|recipe_name filled in from value in 'index.html'|Pass|
|recipes.html|recipe_name (onkeyup)|display relevant recipes from drop down list|Pass|
|recipes.html|recipe_name (onkeyup), match found|populate form|Pass|
|recipes.html|recipe_name (onkeyup), match found|display toast message "loaded recipe data"|Pass|
|recipes.html|recipe_name (onkeyup), no match found|clear form|Pass|
|recipes.html|recipe_name (click autocomplete suggestion)|populate form|Pass|
|recipes.html|click save button (recipe exists & form is valid)|save to database (UPDATE)|Pass|
|recipes.html|click save button (recipe exists & form is valid)|display toast message "updated recipe"|Pass|
|recipes.html|click save button (recipe does not exist & form is valid)|save to database (INSERT)|Pass|
|recipes.html|click save button (recipe does not exist & form is valid)|display toast message "saved recipe"|Pass|
|recipes.html|click save button (recipe does not exist & form is not valid)|display toast message "all fields must be filled out"|Pass|
|recipes.html|click save button (recipe does not exist & form is valid)|clear form once save is complete|Pass|
|recipes.html|click delete button (recipe exists)|delete from database (DELETE)|Pass|
|recipes.html|click delete button (recipe exists)|display toast message "deleted recipe"|Pass|
|recipes.html|click delete button (recipe exists)|clear form once delete is complete|Pass|
|recipes.html|click delete button (recipe does not exist)|display toast message "recipe doesn't exist"|Pass|
|recipes.html|ingredient_name (onkeyup)|display relevant ingredients from drop down list|Pass|
|recipes.html|ingredient_name (onkeyup), match found|display toast message "loaded ingredient data"|Pass|
|recipes.html|ingredient_name (onkeyup), no match found|clear form|Pass|
|recipes.html|ingredient_name (click autocomplete suggestion)|display toast message "found ingredient"|Pass|
|recipes.html|ingredient_name (onkeyup)|display relevant ingredients from drop down list|Pass|
|recipes.html|ingredient_name (click autocomplete suggestion)|Do nothing|Pass|
|recipes.html|Click add button (ingredient exists & form valid)|Add ingredient to ingredient list|Pass|
|recipes.html|Click add button (ingredient exists & form valid)|display toast message "added to ingredient list"|Pass|
|recipes.html|Click add button (ingredient exists & form not valid)|display toast message "please fill out all ingredient fields"|Pass|
|recipes.html|Click add button (ingredient does not exist & form is not valid)|display toast message "please fill out all ingredient fields"|Pass|
|recipes.html|Click add button (ingredient does not exist & form is valid)|display toast message "ingredient not found [CREATE INGREDIENT]"|Pass|
|recipes.html|Click [CREATE INGREDIENT] (from above toast message)|Redirect to ingredients.html with unmatched ingredient name filled in for us|Pass|
|recipes.html|Click delete button, if visible (for a single ingredient in our list)|Delete ingredient from list|Pass|
|recipes.html|Click delete button, if visible (for a single step in our list)|Delete step from list|Pass|
|ingredients.html|load page|All fields empty|Pass|
|ingredients.html|load page|ingredient_unit set to 'gram (g)'|Pass|
|ingredients.html|load page|ingredient_name filled in from value in 'recipe.html', otherwise blank|Pass|
|ingredients.html|load Page > redirect from 'recipes.html'|ingredient_name filled in from value in 'recipe.html'|Pass|
|ingredients.html|ingredient_name (onkeyup)|display relevant ingredients from drop down list|Pass|
|ingredients.html|ingredient_name (onkeyup), match found|populate nutrient fields|Pass|
|ingredients.html|ingredient_name (onkeyup), match found|display toast message "loaded nutritional data"|Pass|
|ingredients.html|ingredient_name (onkeyup), no match found|clear nutrient fields|Pass|
|ingredients.html|ingredient_name (click autocomplete suggestion)|populate nutrient fields|Pass|
|ingredients.html|click save button (ingredient exists & form is valid)|save to database (UPDATE)|Pass|
|ingredients.html|click save button (ingredient exists & form is valid)|display toast message "updated nutritional data"|Pass|
|ingredients.html|click save button (ingredient does not exist & form is valid)|save to database (INSERT)|Pass|
|ingredients.html|click save button (ingredient does not exist & form is valid)|display toast message "saved nutritional data"|Pass|
|ingredients.html|click save button (ingredient does not exist & form is not valid)|display toast message "all fields must be filled out"|Pass|
|ingredients.html|click save button (ingredient does not exist & form is valid)|clear form once save is complete|Pass|
|ingredients.html|click delete button (ingredient exists)|delete from database (DELETE)|Pass|
|ingredients.html|click delete button (ingredient exists)|display toast message "deleted ingredient"|Pass|
|ingredients.html|click delete button (ingredient exists)|clear form once delete is complete|Pass|
|ingredients.html|click delete button (ingredient does not exist)|display toast message "ingredient doesn't exist"|Pass|

## Deployment

All development was done using Gitpod as the IDE. Regular commits were made, which were then pushed to GitHub.
When working on certain features, a new branch was created, which was then merged with the master branch after it was tested to be working.

The project is hosted on **Heroku** at the following url: https://ci-milestone-project-3.herokuapp.com/
The project **repository** is located at the following url: https://github.com/paulldev/milestone-project-3

### Deployment to Heroku:
- Create a repository using the template from https://github.com/Code-Institute-Org/gitpod-full-template
- Install Flask: `pip3 install flask`
- Create app.py. This is our Python app.
- Create a templates folder which will contain our html template files.
- Add base.html to our templates folder. Then add index.html which will extend base.html.
- Add Materialize framework.
- Create a Heroku app ci-milestone-project-3
- Login to Heroku from Gitpod: `heroku login`
- Test that Heroku app has been created successfully: `heroku apps`
- Create a new Git repository: `git init`
- Create our requirements.txt file: `pip3 freeze --local > requirements.txt`
- Create our Procfile: echo web: `python app.py > Procfile`
- Add all our files to our repository: `git add .`
- Commit: `git commit -m “’Initial commit”`
- Associate our Heroku app as our remote master branch:
- `heroku git:remote -a ci-milestone-project-3`
- Push to Heroku: `git push heroku master`
- From Heroku website (Settings tab), specify IP (0.0.0.0) and PORT (5000).
- From Heroku website (Deploy tab), link our Github with Heroku.
- Our app can now be viewed at https://ci-milestone-project-3.herokuapp.com/
- Install our mysql database “vmpdb”. Also create all the tables.
- Install PyMySQL library using: `pip3 install pymysql`
- Store database credentials in environment variables.
- Add 3rd party add-on 'ClearDB' to Heroku to enable app to use a MySQL database.

## Credits

### Media

Image beside 'Nutriplan' (royalty free): https://pixabay.com/photos/casserole-dish-vegetable-tomato-2776735/

## Acknowledgements

Special thanks to my mentor, Aaron Sinnott. I appreciated his insight, advice, and his time.
