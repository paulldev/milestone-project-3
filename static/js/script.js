$(document).ready(function () {
  let ingredients = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the ingredients object.
  let recipes = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the recipes object.
  let matchedIngredient = false;
  let matchedRecipe = false;
  $(".button-collapse").sideNav();
  $("select").material_select();

  
  function getNames(url, table, column) {
    //get names from the database using an ajax call
    $.ajax({
      //create an ajax request to get_names()
      data: {
        //data that gets sent to python
        table: table,
        column: column,
      },
      async: false, //locks browser until request completes
      type: "POST",
      dataType: "json",
      url: url,
      success: function (result, status, xhr) {
        console.log("4. [success:] successful ajax call", result); //this is a js object
        if (result) {
          //found in database
          //https://stackoverflow.com/questions/5223/length-of-a-javascript-object
          for (var i = 0; i < Object.keys(result).length; i++) {
            if (table == "ingredient") {
              ingredients[result[i].name] = null;
            } else if (table == "recipe") {
              recipes[result[i].name] = null;
            }
            console.log("Iteration (" + i + ") ", ingredients);
          }
          /*            if (table == 'ingredient') {
                matchedIngredient = true;
            } else if (table == 'recipe') {
                matchedRecipe = true;
            }*/
        } else {
          console.log("5. Couldn't find");
        }
      },
      error: function (xhr, status, error) {
        console.log("4. [Error:] Error??", xhr);
      },
      complete: function (result) {
        console.log("AJAX call complete, check NAMES ", ingredients);
      },
    });
  }

  if (location.href.match(/ingredients/)) {
    console.log("1. Found ingredients page");
    getNames("/get_names", "ingredient", "name");
    //http://archives.materializecss.com/0.100.2/forms.html
    $("input.autocomplete").autocomplete({
      data: ingredients,
      limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function (val) {
        // Callback function when value is autcompleted.
        matchedIngredient = true;
        console.log("MATCHED INGREDIENT: ", matchedIngredient);
        console.log("MATCHED RECIPE: ", matchedRecipe);
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  } else if (location.href.match(/recipes/)) {
    console.log("Found recipes page");
    getNames("/get_names", "ingredient", "name");
    getNames("/get_names", "recipe", "name");
    //http://archives.materializecss.com/0.100.2/forms.html
    $("input#ingredient_name").autocomplete({
      data: ingredients,
      limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function (val) {
        // Callback function when value is autcompleted.
        matchedIngredient = true;
        console.log("MATCHED INGREDIENT: ", matchedIngredient);
        console.log("MATCHED RECIPE: ", matchedRecipe);
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
    //http://archives.materializecss.com/0.100.2/forms.html
    $("input#recipe_name").autocomplete({
      data: recipes,
      limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function (val) {
        // Callback function when value is autcompleted.
        matchedIngredient = true;
        console.log("MATCHED INGREDIENT: ", matchedIngredient);
        console.log("MATCHED RECIPE: ", matchedRecipe);
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  } else if (location.href.match(/\//)) {
    console.log("Found index page");
    getNames("/get_names", "recipe", "name");
    //http://archives.materializecss.com/0.100.2/forms.html
    $("input#recipe_name").autocomplete({
      data: recipes,
      limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function (val) {
        // Callback function when value is autcompleted.
        matchedRecipe = true;
        console.log("MATCHED INGREDIENT: ", matchedIngredient);
        console.log("MATCHED RECIPE: ", matchedRecipe);
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  } else {
    console.log("Page not found");
  }

  $("#recipe_name").on("keyup", function (event) {
    event.preventDefault();
    //check if recipe exists
    $.ajax({
      //create an ajax request to get_recipes
      data: {
        //data that gets sent to python
        recipe_name: $("#recipe_name").val(),
      },
      type: "POST",
      dataType: "json",
      url: "/recipe_exists",
      success: function (result, status, xhr) {
        if (result[0]) {
          //found recipe in database
          console.log("Found " + result[0].name);
          matchedRecipe = true;
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        } else {
          matchedRecipe = false;

          console.log("Couldn't find recipe");
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        }
      },
      error: function (xhr, status, error) {
        console.log("Error");
      },
    });
  });

  $("#ingredient_name").on("keyup", function (event) {
    event.preventDefault();
    //check if ingredient exists
    $.ajax({
      //create an ajax request to get_ingredients
      data: {
        //data that gets sent to python
        ingredient_name: $("#ingredient_name").val(),
      },
      type: "POST",
      dataType: "json",
      url: "/ingredient_exists",
      success: function (result, status, xhr) {
        //                console.log('returned data: ', result);
        if (result[0]) {
          //found ingredient in database
          console.log("Found " + result[0].name);
          matchedIngredient = true;
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        } else {
          matchedIngredient = false;

          console.log("Couldn't find ingredient");
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        }
      },
      error: function (xhr, status, error) {
        console.log("Error");
      },
    });
  });

  function getIngredientNutrition() {
    event.preventDefault();
    $.ajax({
      //create an ajax request to get_ingredient_nutrition
      data: {
        //data that gets sent to python
        energy_amount: $("#energy_amount").val(),
        carbohydrate_amount: $("#carbohydrate_amount").val(),
        fats_amount: $("#fats_amount").val(),
        protein_amount: $("#protein_amount").val(),
        calcium_amount: $("#calcium_amount").val(),
        zinc_amount: $("#zinc_amount").val(),
      },
      type: "POST",
      dataType: "json",
      url: "/recipe_exists",
      success: function (result, status, xhr) {
        if (result[0]) {
          //found recipe in database
          console.log("Found " + result[0].name);
          matchedRecipe = true;
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        } else {
          matchedRecipe = false;

          console.log("Couldn't find recipe");
          console.log("MATCHED INGREDIENT: ", matchedIngredient);
          console.log("MATCHED RECIPE: ", matchedRecipe);
        }
      },
      error: function (xhr, status, error) {
        console.log("Error");
      },
    });
  });

});
