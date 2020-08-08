$(document).ready(function () {
	let ingredients = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the ingredients object.
	let recipes = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the recipes object.
	let matchedIngredient = false;
	let matchedRecipe = false;
	$(".button-collapse").sideNav();
	$("select").material_select();
	//gns
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
				} else {
					console.log("5. Couldn't find");
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error", error);
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
				//getredientNutrition(); //??? maybe not needed
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
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else {
		console.log("Page not found");
	}
	//dit
	function deleteItem(table, column, value) {
		//ddd
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
				if (table == "ingredient") {
					Materialize.toast("Deleted ingredient", 4000);
    				getNames("/get_names", "ingredient", "name");
				} else if (table == "recipe") {
					Materialize.toast("Deleted recipe", 4000);
    				getNames("/get_names", "recipe", "name");
				}
			},
		});
	}
	//srec
	$("#save-recipe").on("click", function (event) {
		event.preventDefault();
		saveRecipe();
	});
	//srec
	function saveRecipe() {//plucey
		event.preventDefault();
		let action = "save"; //action determines whether to use INSERT or UPDATE in our database
		if (matchedRecipe) {
			action = "update";
		}

		var isFormValid = true;

		let recipe = {
			action: action,
			recipe_name: $("#recipe_name").val(),
			servings: parseInt($("#servings").val()),
			ingredient_name: [],
			ingredient_amount: [],
			ingredient_unit: [],
			step_number: [],
			step_description: [],
		};

		$("#ingredient-list li").each(function () {
			recipe.ingredient_name.push(
				$(this).find("span").text().trim()
			);
			recipe.ingredient_amount.push(
				parseInt($(this).find("div:eq(1)").text().trim())
			);
			recipe.ingredient_unit.push(
				$(this).find("div:eq(2)").text().trim()
			);
		});
		$("#step-list li").each(function () {
			recipe.step_number.push(
				parseInt($(this).find("div:eq(0)").text().trim())
			);
			recipe.step_description.push(
				$(this).find("div:eq(1)").text().trim()
			);
		});

		if (
			$("#recipe_name").val().length == 0 ||
			$("#servings").val().length == 0
		) {
			isFormValid = false;
		} else {
		}

		if (isFormValid) {
            console.log("(1) Save Recipe(). Form is valid. Recipe oject state: ", recipe);
			//checks if required inputs have a value
			$.ajax({
				//create an ajax request to save_recipe
				data: JSON.stringify(recipe), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/save_recipe",
				success: function (result, status, xhr) {
					if (action == "save") {
    					Materialize.toast("Saved recipe", 4000); // 4000 is the duration of the toast
						$("#recipe_name").val(""); //reset recipe name
						clearRecipeInputs();
						$(window).scrollTop(0); //scroll window to top
					} else if (action == "update") {
						Materialize.toast("Updated recipe", 4000); // 4000 is the duration of the toast
						$(window).scrollTop(0); //scroll window to top
                    }//xxxxx

				},
				error: function (xhr, status, error) {
					console.log("Database error", error);
				},
      			complete: function (result) {
                    getNames("/get_names", "recipe", "name");
                    console.log("***** RECIPE NAME YO: ", recipe.recipe_name)
                    updateRecipeNutritionValues(recipe.recipe_name);//plucey update nutrition data for this recipe
	          	},
			});
		} else {
			Materialize.toast("All fields must be filled out", 4000); // 4000 is the duration of the toast
			$(window).scrollTop(0); //scroll window to top
		}
	}
	//cii
	function clearIngredientInputs() {
		//$("#ingredient_name").val("");
		$("#ingredient_amount").val("");
		$("#ingredient_unit").val("gram (g)");
		$("#ingredient_unit").material_select(); //needs to be re-initialized
		$("#energy_amount").val("");
		$("#carbohydrate_amount").val("");
		$("#fats_amount").val("");
		$("#protein_amount").val("");
		$("#calcium_amount").val("");
		$("#iron_amount").val("");
		$("#zinc_amount").val("");
		//$(window).scrollTop(0); //scroll window to top
	}
	//cri
	function clearRecipeInputs() {
		//$("#recipe_name").val(""); //reset inputs
		$("#servings").val("");
		$("#ingredient_name").val("");
		$("#ingredient_amount").val("");
		$("#ingredient_units").val("gram (g)"); //reset ingredient unit
		$("#ingredient_units").material_select(); //needs to be re-initialized
		$("#ingredient-list").empty();
		$("#step_number").val("");
		$("#step_description").val("");
		$("#step-list").empty();
		$(window).scrollTop(0); //scroll window to top
	}
	//rn
	$("#recipe_name").on("keyup", function (event) {
		//rrr
		event.preventDefault();
		//check if recipe exists
		$.ajax({
			//create an ajax request to recipe_exists
			data: {
				//data that gets sent to python
				recipe_name: $("#recipe_name").val(),
			},
			type: "POST",
			dataType: "json",
			url: "/recipe_exists",
			success: function (result, status, xhr) {
				console.log(
					"--Server reponse: ",
					result
				);
				if (result == 'match') {
					//found recipe in database
					matchedRecipe = true;
					getRecipeData();
					console.log(
						"--Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				} else if (result == "no match") {
					matchedRecipe = false;
					clearRecipeInputs();
					console.log(
						"--Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
			},
		});
	});
	//grd
	function getRecipeData() {
		let ingredient_name = "";
		let ingredient_amount = "";
		let ingredient_unit = "";
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
                console.log(":::::::RESULT getRecipeData(): ", result);
				if (result) {
                    $("#servings").val(result[0].servings); //???buggy
                    $("#servings").focus();//bug fix???
                    //$("#recipe_name").focus();
					//get ingredients
					if ($("#ingredient-list li").length == 0) {//if zero ingredients in list (stops ingredients being added every keystroke)
						result[1].forEach(function (element) {
							ingredient_name = element["ingredient.name"];
							ingredient_amount = element["ingredient_amount"];
							ingredient_unit = element["ingredient_unit"];
							$("#ingredient-list").append(
								`<li class='row list-item'>
                                <div class='col s6 myclass'>
                                    <i class='material-icons prefix'>navigate_next</i><span>${ingredient_name}</span>
                                </div>
                                <div class='col s1'>
                                    ${ingredient_amount}
                                </div>
                                <div class='col s2'>
                                    ${ingredient_unit}
                                </div>
                                <div class='col s3'>
                                    <i class='material-icons prefix'>delete_forever</i>
                                </div>
                            </li>`
							);
						});
					}
					//get steps
					if ($("#step-list li").length == 0) {//if zero steps in list (stops steps being added every keystroke)
						result[2].forEach(function (element) {
							step_number = element["stepNumber"];
							step_description = element["stepDescription"];
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
						});
					}
					Materialize.toast("Loaded recipe data", 4000); // 4000 is the duration of the toast
				} else {
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
			},
		});
	}
	//snd
	$("#save-nutrition-data").on("click", function (event) {
		event.preventDefault();
		saveIngredientNutrition();
	});
	//sin
	function saveIngredientNutrition() {
		event.preventDefault();
		let action = "save"; //action determines whether to use INSERT or UPDATE in our database
		if (matchedIngredient) {
			action = "update";
		}
		//https://stackoverflow.com/questions/18465508/check-if-inputs-form-are-empty-jquery
		var isFormValid = true;

        //checks if all required inputs have a value
		$("input[required]").each(function () {
			if ($.trim($(this).val()).length == 0) {
				isFormValid = false;
			}
		});
		if (isFormValid) {
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
				dataType: "json",
				url: "/save_ingredient_nutrition",
				success: function (result, status, xhr) {
					if (action == "save") {
						Materialize.toast("Saved nutritional data", 4000); // 4000 is the duration of the toast
						$("#ingredient_name").val(""); //clear ingredient name
						clearIngredientInputs();
						$(window).scrollTop(0); //scroll window to top
						$("#ingredient_name").focus(); //position cursor for next ingredient entry
						getNames("/get_names", "ingredient", "name");
					} else if (action == "update") {
						Materialize.toast("Updated nutritional data", 4000); // 4000 is the duration of the toast
						$(window).scrollTop(0); //scroll window to top
						$("#ingredient_name").focus(); //position cursor for further editing
                    }
                    getNames("/get_names", "ingredient", "name");
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
	//dnd
	$("#delete-nutrition-data").on("click", function (event) {
		event.preventDefault();
		if (matchedIngredient) {
            let value = $("#ingredient_name").val();
            deleteItem("ingredient", "name", value);
            $("#ingredient_name").val(""); //clear ingredient name
            clearIngredientInputs();
            $(window).scrollTop(0); //scroll window to top
		} else {
            Materialize.toast("Ingredient doesn't exist", 4000);
            $(window).scrollTop(0); //scroll window to top
        }
        
	});
	//drec
	$("#delete-recipe").on("click", function (event) {
		event.preventDefault();
		if (matchedRecipe) {
            let recipe_name = $("#recipe_name").val();
            deleteRecipe(recipe_name);
            $("#recipe_name").val(""); //reset recipe name
            clearRecipeInputs();
            $(window).scrollTop(0); //scroll window to top
        } else {
            Materialize.toast("Recipe doesn't exist", 4000);
            $(window).scrollTop(0); //scroll window to top
        }
    });

	function deleteRecipe(recipe_name) {
		event.preventDefault();
		$.ajax({
			//create an ajax request to delete_item
			data: {
				//data that gets sent to python
                recipe_name: recipe_name
            },
			type: "POST",
			dataType: "json",
			url: "/delete_recipe",
			success: function (result, status, xhr) {
                if (matchedRecipe) {
                    Materialize.toast("Deleted recipe", 4000); // 4000 is the duration of the toast
            		getNames("/get_names", "recipe", "name");
                } else {
                    Materialize.toast("Recipe doesn't exist", 4000);
                }
			},
		});
	}

	//astr
	$("#add-step-to-recipe").on("click", function (event) {
		event.preventDefault();
		let step_number = $("#step_number").val();
		let step_description = $("#step_description").val();
		if ((step_number.length > 0) & (step_description.length > 0)) {//if step number and description exist
			addStepToRecipe(step_number, step_description);
		} else {
			Materialize.toast("Please fill out all step fields", 4000);
		}
	});
	//astr
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
		Materialize.toast("Added to step list", 3000); // 4000 is the duration of the toast
	}
	//atmp
	$("#add-to-meal-plan").on("click", function (event) {
		event.preventDefault();
		let name = $("#recipe_name").val();
		let type = $("#meal_type option:selected").text();
		if (name.length > 0) {
			if (matchedRecipe) {
                addRecipeToMealPlan(name, type);
                updateNutritionSummary(name);
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
	//artmp
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
    function updateRecipeNutritionValues(recipe_name) {
        console.log("Inside updateRecipeNutritionValues", recipe_name);
		event.preventDefault();
		$.ajax({
			//create an ajax request to update_recipe_nutrition_values
			data: {
				//data that gets sent to python
                recipe_name: recipe_name
            },
			type: "POST",
			dataType: "json",
			url: "/update_recipe_nutrition_values",
			success: function (result, status, xhr) {
//plucey finish this?
            },
		});
    }
    function updateNutritionSummary(recipe_name) {
		event.preventDefault();
		$.ajax({
			//create an ajax request to update_recipe_nutrition_values
			data: {
				//data that gets sent to python
                recipe_name: recipe_name
            },
			type: "POST",
			dataType: "json",
			url: "/update_nutrition_summary",
			success: function (result, status, xhr) {
                console.log("xxxxx RESULT:", result)

                rda = parseInt($("#energy_rda").text());
                total = parseInt($("#energy").text()) + result.energy;
                $("#energy").text(parseInt($("#energy").text()) + result.energy);//set total energy as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("energy_percent: ", percent);
                $("#energy_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#carbohydrate_rda").text());
                total = parseInt($("#carbohydrate").text()) + result.carbohydrate;
                $("#carbohydrate").text(parseInt($("#carbohydrate").text()) + result.carbohydrate);//set total carbohydrate as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("carbohydrate_percent: ", percent);
                $("#carbohydrate_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#fats_rda").text());
                total = parseInt($("#fats").text()) + result.fats;
                $("#fats").text(parseInt($("#fats").text()) + result.fats);//set total fats as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("fats_percent: ", percent);
                $("#fats_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#protein_rda").text());
                total = parseInt($("#protein").text()) + result.protein;
                $("#protein").text(parseInt($("#protein").text()) + result.protein);//set total protein as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("protein_percent: ", percent);
                $("#protein_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#calcium_rda").text());
                total = parseInt($("#calcium").text()) + result.calcium;
                $("#calcium").text(parseInt($("#calcium").text()) + result.calcium);//set total calcium as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("calcium_percent: ", percent);
                $("#calcium_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#iron_rda").text());
                total = parseInt($("#iron").text()) + result.iron;
                $("#iron").text(parseInt($("#iron").text()) + result.iron);//set total iron as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("iron_percent: ", percent);
                $("#iron_bar .determinate").css({"width": percent+'%'});

                rda = parseInt($("#zinc_rda").text());
                total = parseInt($("#zinc").text()) + result.zinc;
                $("#zinc").text(parseInt($("#zinc").text()) + result.zinc);//set total zinc as current value + new added value
                percent = Math.round((total / rda) * 100);
                console.log("zinc_percent: ", percent);
                $("#zinc_bar .determinate").css({"width": percent+'%'});
            },
		});
    }
	//aitr
	$("#add-ingredient-to-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		let amount = $("#ingredient_amount").val();
		let unit = $("#ingredient-row .select-dropdown").val();

        if (value.length > 0 && amount.length > 0) {//if ingredient name and amount exist
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
	//aitr
	function addIngredientToRecipe(value, amount, unit) {
		event.preventDefault();
		//add ingredient details
		$("#ingredient-list").append(
			`<li class='row list-item'>
                <div class='col s6 myclass'>
                    <i class='material-icons prefix'>navigate_next</i><span>${value}</span>
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
		$("#ingredient_units").val("gram (g)"); //reset ingredient unit
		$("#ingredient_units").material_select(); //needs to be re-initialized
		$("#ingredient_name").focus(); //position cursor for next ingredient entry
		Materialize.toast("Added to ingredient list", 3000); // 4000 is the duration of the toast
	}
	//inkup
	$("#ingredient_name").on("keyup", function (event) {
		event.preventDefault();
		//check if ingredient exists
		$.ajax({
			//create an ajax request to ingredient_exists
			data: {
				//data that gets sent to python
				ingredient_name: $("#ingredient_name").val(),
			},
			type: "POST",
			dataType: "json",
			url: "/ingredient_exists",
			success: function (result, status, xhr) {
				console.log(
					"--Server reponse: ",
					result
				); //array
				if (result == 'match') {
					//found ingredient in database
					matchedIngredient = true;
					getIngredientNutrition();
					console.log(
						"--Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				} else if (result == "no match") {
					matchedIngredient = false;
					clearIngredientInputs();
					console.log(
						"--Matched (recipe, ingredient): ",
						matchedRecipe,
						matchedIngredient
					);
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
			},
		});
	});
	//gin
	function getIngredientNutrition() {
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
				if (result) {
					$("#ingredient_amount").val(result[0].ingredient_amount);
					$("#ingredient_unit").val(result[0].ingredient_unit);
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
				console.log("Database error");
			},
		});
	}
});
