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
							console.log("Iteration (" + i + ") ", ingredients);
						} else if (table == "recipe") {
							recipes[result[i].name] = null;
							console.log("Iteration (" + i + ") ", recipes);
						}
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
				getIngredientNutrition();
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
					getIngredientNutrition();
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

	$("#save-nutrition-data").on("click", function (event) {
		event.preventDefault();
		saveIngredientNutrition();
	});

	$("#delete-nutrition-data").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		deleteItem("ingredient", "name", value);
	});

	function deleteItem(table, column, value) {
		event.preventDefault();
		$.ajax({
			//create an ajax request to delete_item
			data: {
				//data that gets sent to python
				table: table,
				column: column,
				value: value,
			},
			type: "POST",
			dataType: "json",
			url: "/delete_item",
			success: function (result, status, xhr) {
				if (result[0]) {
					console.log("NUTRITION: ", result);
				} else {
				}
			},
			complete: function () {
				Materialize.toast("Deleted ingredient", 4000); // 4000 is the duration of the toast
			},
		});
	}

	function getIngredientNutrition() {
        event.preventDefault();
		$.ajax({
			//create an ajax request to get_ingredient_nutrition
			data: {
				//data that gets sent to python
                ingredient_name: $("#ingredient_name").val()
			},
			type: "POST",
			dataType: "json",
			url: "/get_ingredient_nutrition",
			success: function (result, status, xhr) {
				if (result[0]) {
					console.log("NUTRITION: ", result);
					$("#energy_amount").val(result[0].energy);
					$("#carbohydrate_amount").val(result[0].carbohydrate);
					$("#fats_amount").val(result[0].fats);
					$("#protein_amount").val(result[0].protein);
					$("#calcium_amount").val(result[0].calcium);
					$("#iron_amount").val(result[0].iron);
					$("#zinc_amount").val(result[0].zinc);
					Materialize.toast("Loaded nutritional data", 4000); // 4000 is the duration of the toast
				} else {
				}
			},
			error: function (xhr, status, error) {
				console.log("Error:(");
			},
		});
	}

	function saveIngredientNutrition() {
		event.preventDefault();
        let action = "save"; //action determines whether to use INSERT or UPDATE in our database
        if (matchedIngredient) {
            action = "update";
        }

		//https://stackoverflow.com/questions/18465508/check-if-inputs-form-are-empty-jquery
		var isFormValid = true;

		$("input[required]").each(function () {
			if ($.trim($(this).val()).length == 0) {
				isFormValid = false;
			} else {
			}
		});

		if (isFormValid) {
			//checks if all required inputs have a value
			$.ajax({
				//create an ajax request to save_ingredient_nutrition
				data: {
                    //data that gets sent to python
                    action: action,
					ingredient_name: $("#ingredient_name").val(),
					ingredient_amount: $("#ingredient_amount").val(),
					energy_amount: $("#energy_amount").val(),
					carbohydrate_amount: $("#carbohydrate_amount").val(),
					fats_amount: $("#fats_amount").val(),
					protein_amount: $("#protein_amount").val(),
					calcium_amount: $("#calcium_amount").val(),
					iron_amount: $("#iron_amount").val(),
					zinc_amount: $("#zinc_amount").val(),
				},
				type: "POST",
				//dataType: "json",
				url: "/save_ingredient_nutrition",
				success: function (result, status, xhr) {
                    if (action == "save") {
					    Materialize.toast("Saved nutritional data", 4000); // 4000 is the duration of the toast
                        clearIngredientInputs();
                    } else if (action == "update") {
					    Materialize.toast("Updated nutritional data", 4000); // 4000 is the duration of the toast
            			$(window).scrollTop(0); //scroll window to top
                    }
				},
				error: function (xhr, status, error) {
					console.log("Error:(", error);
				},
			});
		} else {
			Materialize.toast("All fields must be filled out", 4000); // 4000 is the duration of the toast
			$(window).scrollTop(0); //scroll window to top
		}
	}



//*************************************************************************** */
	function saveRecipe() {
		event.preventDefault();
        let action = "save"; //action determines whether to use INSERT or UPDATE in our database
        if (matchedRecipe) {
            action = "update";
        }

		//https://stackoverflow.com/questions/18465508/check-if-inputs-form-are-empty-jquery
		var isFormValid = true;

		$("input[required]").each(function () {
			if ($.trim($(this).val()).length == 0) {
				isFormValid = false;
			} else {
			}
		});

		if (isFormValid) {
			//checks if all required inputs have a value
			$.ajax({
				//create an ajax request to save_ingredient_nutrition
				data: {
                    //data that gets sent to python
                    action: action,
					ingredient_name: $("#ingredient_name").val(),
					ingredient_amount: $("#ingredient_amount").val(),
					energy_amount: $("#energy_amount").val(),
					carbohydrate_amount: $("#carbohydrate_amount").val(),
					fats_amount: $("#fats_amount").val(),
					protein_amount: $("#protein_amount").val(),
					calcium_amount: $("#calcium_amount").val(),
					iron_amount: $("#iron_amount").val(),
					zinc_amount: $("#zinc_amount").val(),
				},
				type: "POST",
				//dataType: "json",
				url: "/save_ingredient_nutrition",
				success: function (result, status, xhr) {
                    if (action == "save") {
					    Materialize.toast("Saved nutritional data", 4000); // 4000 is the duration of the toast
                        clearIngredientInputs();
                    } else if (action == "update") {
					    Materialize.toast("Updated nutritional data", 4000); // 4000 is the duration of the toast
            			$(window).scrollTop(0); //scroll window to top
                    }
				},
				error: function (xhr, status, error) {
					console.log("Error:(", error);
				},
			});
		} else {
			Materialize.toast("All fields must be filled out", 4000); // 4000 is the duration of the toast
			$(window).scrollTop(0); //scroll window to top
		}
	}
//''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''


    $("#add-ingredient-to-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		let amount = $("#ingredient_amount").val();
		let unit = $("#ingredient_units option:selected").text();
		console.log("Running function...");
		addIngredientToRecipe(value, amount, unit);
	});

	function clearIngredientInputs() {
		$("input[required]").val(""); //reset all requred inputs
		$(window).scrollTop(0); //scroll window to top
	}

	function addIngredientToRecipe(value, amount, unit) {
		event.preventDefault();
		//add ingredient details
		$("#ingredient-list").append(
            `<li class='row list-item'>
                <div class='col s6'>
                    <i class='material-icons prefix'>navigate_next</i>${value}
                </div>
                <div class='col s1'>
                    ${amount}
                </div>
                <div class='col s2'>
                    ${unit}
                </div>
                <div class='col s3'>
                    <i class='material-icons prefix'>delete_forever</i>
                </div>
            </li>`
        );
		$("#ingredient_name").val(""); //reset ingredient name
		$("#ingredient_amount").val(""); //reset ingredient amount
    	Materialize.toast("Added to ingredient list", 3000); // 4000 is the duration of the toast

		/*    $.ajax({
      //create an ajax request to delete_item
      data: {
        //data that gets sent to python
        value: value,
        amount: amount,
        unit: unit
      },
      type: "POST",
      dataType: "json",
      url: "/add_ingredient_to_recipe",
      success: function (result, status, xhr) {
        if (result[0]) {
          console.log("NUTRITION: ", result);
        } else {
        }
      },
      complete: function () {
        Materialize.toast('Added ingredient to list', 4000) // 4000 is the duration of the toast
      }
    });
    */
	}
});
