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
				getIngredientNutrition();//??? maybe not needed
				console.log(
					"MATCHED INGREDIENT: ",
					matchedRecipe,
					matchedIngredient
				);
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
		//http://archives.materializecss.com/0.100.2/forms.html
		$("input#recipe_name").autocomplete({
			data: recipes,
			limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
			onAutocomplete: function (val) {
				// Callback function when value is autcompleted.
				matchedRecipe = true;
				getRecipeData();
				console.log(
					"MATCHED RECIPE: ",
					matchedRecipe,
					matchedIngredient
				);
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
				getRecipeData();
				console.log(
					"MATCHED RECIPE: ",
					matchedRecipe,
					matchedIngredient
				);
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else {
		console.log("Page not found");
	}

	$("#recipe_name").on("keyup", function (event) {//rrr
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
					console.log("FOUND RECIPE >>>> ", result);
					matchedRecipe = true;
					getRecipeData();
					console.log(
						"Found Recipe. keyup MATCHES: ",
						matchedRecipe,
						matchedIngredient
					);
				} else {
					matchedRecipe = false;
					console.log(
						"Didn't find Recipe. keyup MATCHES: ",
						matchedRecipe,
						matchedIngredient
					);
				}
			},
			error: function (xhr, status, error) {
				console.log("Error");
			},
		});
	});

	$("#ingredient_name").on("keyup", function (event) {
		//yyy
        event.preventDefault();
        console.log("--ONKEYUP. Sending ingredient name to python (/ingredient_exists): ", $("#ingredient_name").val());
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
                console.log("--Successfully received data from server: ", result);
				if (result[0]) {
					//found ingredient in database
					matchedIngredient = true;
					getIngredientNutrition();
					console.log(
						"--Found Ingredient. Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				} else {
					matchedIngredient = false;
					console.log(
						"--Didn't find Ingredient. Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				}
			},
			error: function (xhr, status, error) {
				console.log("Error");
			},
		});
	});

	function getIngredientNutrition() {
		//yyy
		event.preventDefault();
		$.ajax({
			//create an ajax request to get_ingredient_nutrition
			data: {
				//data that gets sent to python
				ingredient_name: $("#ingredient_name").val(),
			},
			type: "POST",
			dataType: "json",
			url: "/get_ingredient_nutrition",
			success: function (result, status, xhr) {
				if (result[0]) {
					console.log("--getIngredientNutrition returns: ", result);
					console.log("--ingredient_unit: ", result[0].ingredient_unit);//zzz
                    
                    $("#ingredient_amount").val(result[0].ingredient_amount);
                    $('#ingredient_unit').val(result[0].ingredient_unit);
                    //https://stackoverflow.com/questions/30341095/change-value-of-materialize-select-box-by-jquery/35934475
                    $("#ingredient_unit").material_select(); //needs to be re-initialized
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

	$("#save-nutrition-data").on("click", function (event) {
		//sss
		event.preventDefault();
		saveIngredientNutrition();
	});

	$("#delete-nutrition-data").on("click", function (event) {//ddd
		event.preventDefault();
		let value = $("#ingredient_name").val();
        deleteItem("ingredient", "name", value);
        clearIngredientInputs();
	});

	$("#delete-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#recipe_name").val();
		deleteItem("recipe", "name", value);
	});

	function deleteItem(table, column, value) {//ddd
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
				if (result) {
                    console.log("Deleted: ", result);
              		getNames("/get_names", "ingredient", "name");
				} else {
					console.log("ELSE Deleted: ", result);
				}
			},
			complete: function () {
				if (table == "ingredient") {
					Materialize.toast("Deleted ingredient", 4000); // 4000 is the duration of the toast
				} else if (table == "recipe") {
					Materialize.toast("Deleted recipe", 4000); // 4000 is the duration of the toast
				}
			},
		});
	}


	function getRecipeData() {//rrr
		event.preventDefault();
		$.ajax({
			//create an ajax request to get_recipe_data
			data: {
				//data that gets sent to python
				recipe_name: $("#recipe_name").val(),
			},
			type: "POST",
			dataType: "json",
			url: "/get_recipe_data",
			success: function (result, status, xhr) {
				if (result[0]) {
					console.log("RECIPE DATA >>>>>>>>>>>>>: ", result);
					//$("#servings").val(result[0].servings);
					Materialize.toast("Loaded recipe data", 4000); // 4000 is the duration of the toast
				} else {
				}
			},
			error: function (xhr, status, error) {
				console.log("Error:(");
			},
		});
	}

	function saveIngredientNutrition() {
		//sss
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
			console.log(
				"TEST INGREDIENT UNIT: ",
				$("#ingredient_unit").val(),
				matchedRecipe,
				matchedIngredient
			);
			//checks if all required inputs have a value
			$.ajax({
				//create an ajax request to save_ingredient_nutrition
				data: {
					//data that gets sent to python
					action: action,
					ingredient_name: $("#ingredient_name").val(),
					ingredient_amount: $("#ingredient_amount").val(),
					ingredient_unit: $("#ingredient_unit").val(),
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
						getNames("/get_names", "ingredient", "name");
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

	function saveRecipe() {
		event.preventDefault();
		let action = "save"; //action determines whether to use INSERT or UPDATE in our database
		if (matchedRecipe) {
			action = "update";
		}

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

	$("#add-ingredient-to-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		let amount = $("#ingredient_amount").val();
		let unit = $("#ingredient_unit option:selected").text(); //xxx
		if (value.length > 0 && amount.length > 0 && unit.length > 0) {
			if (matchedIngredient) {
				addIngredientToRecipe(value, amount, unit);
			} else {
				let $toastContent = $("<span>Ingredient not found</span>").add(
					$(
						'<button class="btn-flat toast-action">CREATE INGREDIENT</button>'
					)
				);
				Materialize.toast($toastContent, 10000);
			}
		} else {
			Materialize.toast("Please fill out all ingredient fields", 4000); // 4000 is the duration of the toast
		}
	});

	$("#add-step-to-recipe").on("click", function (event) {
		event.preventDefault();
		let step_number = $("#step_number").val();
		let step_description = $("#step_description").val();
		if ((step_number.length > 0) & (step_description.length > 0)) {
			addStepToRecipe(step_number, step_description);
		} else {
			Materialize.toast("Please fill out all step fields", 4000); // 4000 is the duration of the toast
		}
	});

	$("#add-to-meal-plan").on("click", function (event) {
		event.preventDefault();
		let name = $("#recipe_name").val();
		let type = $("#meal_type option:selected").text(); //xxx
		if (name.length > 0) {
			if (matchedRecipe) {
				console.log("NAME, TYPE >>> ", name, type);
				addRecipeToMealPlan(name, type);
			} else {
				let $toastContent = $("<span>Recipe not found</span>").add(
					$(
						'<button class="btn-flat toast-action">CREATE RECIPE</button>'
					)
				);
				Materialize.toast($toastContent, 10000);
			}
		} else {
			Materialize.toast("Please fill out recipe name", 4000); // 4000 is the duration of the toast
		}
	});

	function clearIngredientInputs() {
		$("input[required]").val(""); //reset all requred inputs
		$(window).scrollTop(0); //scroll window to top
	}

	function addStepToRecipe(step_number, step_description) {
		event.preventDefault();
		//add step details
		$("#step-list").append(
			`<li class='row list-item'>
                  <div class='col s2'>
                      ${step_number}
                  </div>
                  <div class='col s7'>
                      ${step_description}
                  </div>
                      <div class='col s3'>
                      <i class='material-icons prefix'>delete_forever</i>
                  </div>
              </li>`
		);

		$("#step_number").val(parseInt(step_number) + 1); //increment step number
		$("#step_description").val(""); //reset step description
		$("#step_description").focus(); //position cursor for next step description
		Materialize.toast("Added to steps list", 3000); // 4000 is the duration of the toast
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
	}

	function addRecipeToMealPlan(name, type) {
		event.preventDefault();
		//add recipe and meal type
		$("#meals-list").append(
			`<li class='row list-item'>
                <div class='col s6'>
                    <i class='material-icons prefix'>navigate_next</i>${name}
                </div>
                <div class='col s1'>
                    ${type}
                </div>
            </li>`
		);
		$("#recipe_name").val(""); //reset recipe name
		Materialize.toast("Added to meal list", 3000); // 4000 is the duration of the toast
	}
});
