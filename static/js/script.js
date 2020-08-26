$(document).ready(function () {
	let ingredients = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the ingredients object.
	let recipes = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the recipes object.
	let matchedIngredient = false;
	let matchedRecipe = false;
	$(".button-collapse").sideNav();
	$("select").material_select();

    function getNames(url, table, column) {
		//get names (recipes or ingredients) from the database using an ajax call
		$.ajax({
			//create an ajax request to get_names()
			data: {
				//data that gets sent to python
				table: table,
				column: column,
			},
			async: false,
			type: "POST",
			dataType: "json",
			url: url,
			success: function (result) {
				if (result) {
					//found in database
					//https://stackoverflow.com/questions/5223/length-of-a-javascript-object
					for (var i = 0; i < Object.keys(result).length; i++) {
						if (table == "ingredient") {
							ingredients[result[i].name] = null;
						} else if (table == "recipe") {
							recipes[result[i].name] = null;
						}
					}
				}
			},
			error: function (error) {
				console.log("Database error", error);
			},
			complete: function () {
				console.log("AJAX call complete");
			},
		});
	}

	if (location.href.match(/ingredients/)) {//if you are currently viewing the ingredients page
		getNames("/get_names", "ingredient", "name");
		//http://archives.materializecss.com/0.100.2/forms.html
		$("input.autocomplete").autocomplete({
			data: ingredients,
			limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
			onAutocomplete: function () {
				// Callback function when value is autcompleted.
				matchedIngredient = true;
				getIngredientNutrition();
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else if (location.href.match(/recipes/)) {//if you are currently viewing the recipes page
		getNames("/get_names", "ingredient", "name");
		getNames("/get_names", "recipe", "name");
		$("input#ingredient_name").autocomplete({
			data: ingredients,
			limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
			onAutocomplete: function () {
				// Callback function when value is autcompleted.
                matchedIngredient = true;
				Materialize.toast("<i class='material-icons positive'>check_circle</i>Found ingredient", 3000);
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
		$("input#recipe_name").autocomplete({
			data: recipes,
			limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
			onAutocomplete: function () {
                // Callback function when value is autcompleted.
				matchedRecipe = true;
				clearRecipeInputs();
				getRecipeData();
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else if (location.href.match(/\//)) {//if you are currently viewing the home (index) page
   		$("#meals-list li").each(function () {//update the nutritional data for each recipe in meals list
			recipe_name = $(this).find("span").text().trim();
            updateNutritionSummary(recipe_name, 'add')
        });

		getNames("/get_names", "recipe", "name");
		$("input#recipe_name").autocomplete({
			data: recipes,
			limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
			onAutocomplete: function () {
				// Callback function when value is autcompleted.
				matchedRecipe = true;
				getRecipeData();
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else {
		console.log("Page not found");
	}
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
			success: function () {
				if (table == "ingredient") {
					Materialize.toast("<i class='material-icons negative'>delete_forever</i>Deleted ingredient", 3000);
    				getNames("/get_names", "ingredient", "name");
				} else if (table == "recipe") {
					Materialize.toast("<i class='material-icons negative'>delete_forever</i>Deleted recipe", 3000);
    				getNames("/get_names", "recipe", "name");
				}
			},
		});
	}
	$("#save-recipe").on("click", function (event) {
		event.preventDefault();
		saveRecipe();
	});
	function saveRecipe() {
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

		$("#ingredient-list li").each(function () {//process all the ingredients in the ingredients list
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
		$("#step-list li").each(function () {//process all the steps in the steps list
			recipe.step_number.push(
				parseInt($(this).find("div:eq(0)").text().trim())
			);
			recipe.step_description.push(
				$(this).find("div:eq(1)").text().trim()
			);
		});

		if ($("#recipe_name").val().length == 0 || $("#servings").val().length == 0) {
			isFormValid = false;
		} else {
		}

		if (isFormValid) {
			//checks if required inputs have a value
			$.ajax({
				//create an ajax request to save_recipe
				data: JSON.stringify(recipe), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/save_recipe",
				success: function (result) {
                    if (result == 'saved recipe') {
                        if (action == "save") {
                            Materialize.toast("<i class='material-icons positive'>cloud_done</i>Saved recipe", 3000);
                        } else if (action == "update") {
                            Materialize.toast("<i class='material-icons positive'>cloud_done</i>Updated recipe", 3000);
                        }
                        $("#recipe_name").val(""); //reset recipe name
                        clearRecipeInputs();
                        $(window).scrollTop(0); //scroll window to top
                        updateRecipeStatus();
                    }
				},
				error: function (error) {
					console.log("Database error", error);
				},
      			complete: function () {
                    getNames("/get_names", "recipe", "name");
                    updateRecipeNutritionValues(recipe.recipe_name);//update nutrition data for this recipe
	          	},
			});
		} else {
			Materialize.toast("<i class='material-icons neutral'>warning</i>All fields must be filled out", 3000);
			$(window).scrollTop(0); //scroll window to top
		}
	}
	function clearIngredientInputs() {
		$("#ingredient_amount").val("");
		$("#ingredient_unit").val("gram (g)");
		$("#ingredient_unit").material_select(); //re-initialized
		$("#energy_amount").val("");
		$("#carbohydrate_amount").val("");
		$("#fats_amount").val("");
		$("#protein_amount").val("");
		$("#calcium_amount").val("");
		$("#iron_amount").val("");
		$("#zinc_amount").val("");
	}
	function clearRecipeInputs() {
		$("#servings").val("");
		$("#ingredient_name").val("");
		$("#ingredient_amount").val("");
		$("#ingredient_units").val("gram (g)"); //reset ingredient unit
		$("#ingredient_units").material_select(); //re-initialized
		$("#ingredient-list").empty();
		$("#step_number").val("");
		$("#step_description").val("");
		$("#step-list").empty();
		$(window).scrollTop(0); //scroll window to top
	}
	$("#recipe_name").on("keyup", function (event) {
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
			success: function (result) {
				if (result == 'match') {
					//found recipe in database
					matchedRecipe = true;
					getRecipeData();
				} else if (result == "no match") {
					matchedRecipe = false;
					clearRecipeInputs();
				}
			},
			error: function (error) {
				console.log("Database error", error);
			},
		});
	});
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
			success: function (result) {
				if (result) {
                    $("#servings").val(result[0].servings);
                    Materialize.updateTextFields();//re-initialized
					//get ingredients list
					if ($("#ingredient-list li").length == 0) {//if zero ingredients in list (stops ingredients being added every keystroke)
						result[1].forEach(function (element) {//process ingredients array
                            ingredient_name = element["ingredient.name"];
							ingredient_amount = element["ingredient_amount"];
							ingredient_unit = element["ingredient_unit"];
							$("#ingredient-list").append(
								`<li class='row list-item'>
                                <div class='col s6 valign-wrapper'>
                                    <i class='material-icons'>navigate_next</i><span>${ingredient_name}</span>
                                </div>
                                <div class='col s1 valign-wrapper'>
                                    ${ingredient_amount}
                                </div>
                                <div class='col s4 valign-wrapper'>
                                    ${ingredient_unit}
                                </div>
                                <div class='col s1 valign-wrapper'>
                                    <i class='material-icons delete_item'>delete_forever</i>
                                </div>
                            </li>`
							);
						});
					}
					//get steps list
					if ($("#step-list li").length == 0) {//if zero steps in list (stops steps being added every keystroke)
						result[2].forEach(function (element) {//process steps array
							step_number = element["stepNumber"];
							step_description = element["stepDescription"];
							$("#step-list").append(
								`<li class='row list-item'>
                                    <div class='col s2 valign-wrapper'>
                                        ${step_number}
                                    </div>
                                    <div class='col s9 valign-wrapper'>
                                        ${step_description}
                                    </div>
                                        <div class='col s1 valign-wrapper'>
                                        <i class='material-icons delete_item'>delete_forever</i>
                                    </div>
                                </li>`
							);
						});
					}
					Materialize.toast("<i class='material-icons positive'>check_circle</i>Loaded recipe data", 3000);
				} else {
                    console.log("Nothing returned");
				}
			},
			error: function (error) {
				console.log("Database error", error);
			},
		});
	}
	$("#save-nutrition-data").on("click", function (event) {
		event.preventDefault();
		saveIngredientNutrition();
	});
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
				success: function () {
					if (action == "save") {
						Materialize.toast("<i class='material-icons positive'>cloud_done</i>Saved nutritional data", 3000);
					} else if (action == "update") {
						Materialize.toast("<i class='material-icons positive'>cloud_done</i>Updated nutritional data", 3000);
                    }
					$("#ingredient_name").val(""); //clear ingredient name
					clearIngredientInputs();
					$(window).scrollTop(0); //scroll window to top
                    getNames("/get_names", "ingredient", "name");
				},
				error: function (error) {
					console.log("Database error", error);
				},
			});
		} else {
			Materialize.toast("<i class='material-icons neutral'>warning</i>All fields must be filled out", 3000);
			$(window).scrollTop(0); //scroll window to top
		}
	}
	$("#delete-nutrition-data").on("click", function (event) {
		event.preventDefault();
		if (matchedIngredient) {
            let value = $("#ingredient_name").val();
            deleteItem("ingredient", "name", value);
            delete ingredients[value];//also delete property from ingredients object
            $("#ingredient_name").val(""); //clear ingredient name
            clearIngredientInputs();
            $(window).scrollTop(0); //scroll window to top
		} else {
            Materialize.toast("<i class='material-icons neutral'>warning</i>Ingredient doesn't exist", 3000);
            $(window).scrollTop(0); //scroll window to top
        }
	});
	$("#delete-recipe").on("click", function (event) {
		event.preventDefault();
		if (matchedRecipe) {
            let recipe_name = $("#recipe_name").val();
            deleteRecipe(recipe_name);
            delete recipes[recipe_name];//also delete property from recipes object
            $("#recipe_name").val(""); //reset recipe name
            clearRecipeInputs();
            updateRecipeStatus();
            $(window).scrollTop(0); //scroll window to top
        } else {
            Materialize.toast("<i class='material-icons neutral'>warning</i>Recipe doesn't exist", 3000);
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
			success: function (result) {
                if (result == 'deleted recipe') {
                    if (matchedRecipe) {
                        Materialize.toast("<i class='material-icons negative'>delete_forever</i>Deleted recipe", 3000);
                        getNames("/get_names", "recipe", "name");
                    } else {
                        Materialize.toast("<i class='material-icons neutral'>warning</i>Recipe doesn't exist", 3000);
                    }
                }
			},
		});
	}

	$("#add-step-to-recipe").on("click", function (event) {
		event.preventDefault();
		let step_number = $("#step_number").val();
		let step_description = $("#step_description").val();
		if ((step_number.length > 0) && (step_description.length > 0) && (step_description.length < 145)) {//if step number and description are filled in
            addStepToRecipe(step_number, step_description);
            updateRecipeStatus();
		} else {
            if (step_description.length > 144) {
    			Materialize.toast("<i class='material-icons neutral'>warning</i>Step description is too long. Must be less than 145 characters.", 4000);
            } else {
                Materialize.toast("<i class='material-icons neutral'>warning</i>Please fill out all step fields", 3000);
            }
		}
	});
	function addStepToRecipe(step_number, step_description) {
		event.preventDefault();
		//add step details
		$("#step-list").append(
			`<li class='row list-item'>
                  <div class='col s2 valign-wrapper'>
                      ${step_number}
                  </div>
                  <div class='col s9 valign-wrapper'>
                      ${step_description}
                  </div>
                      <div class='col s1 valign-wrapper'>
                      <i class='material-icons delete_item'>delete_forever</i>
                  </div>
              </li>`
		);
		$("#step_number").val(parseInt(step_number) + 1); //increment step number
		$("#step_description").val(""); //reset step description
		Materialize.toast("<i class='material-icons positive'>check_circle</i>Added to step list", 3000);
	}
	$("#add-to-meal-plan").on("click", function (event) {
		event.preventDefault();
		let recipe_name = $("#recipe_name").val();
		let meal_type = $("#meal_type option:selected").text();
		if (recipe_name.length > 0) {//if recipe name is filled in
			if (matchedRecipe) {
                addRecipeToMealPlan(recipe_name, meal_type);
                updateNutritionSummary(recipe_name, 'add');
                updateHomeStatus();
			} else {
                //allow user to navigate to another page and take the value with them
                Materialize.toast(`<i class='material-icons neutral'>warning</i><span>Recipe not found</span>
                <form action="/recipes" method='POST'><button class="btn-flat toast-action recipe-toast" name="recipe_name" value="${$("#recipe_name").val()}">CREATE RECIPE</button></form>`, 10000);
			}
		} else {
			Materialize.toast("<i class='material-icons neutral'>warning</i>Please fill out recipe name", 3000);
		}
    });
    function updateHomeStatus() {
		var isFormValid = true;

		let meal = {
			recipe_name: $("#recipe_name").val(),
			recipe_name_list: [],
            meal_type_list: []
        };
        if (meal.recipe_name.length == 0) {
            meal.recipe_name='';
        }

		$("#meals-list li").each(function () {//updates the meal object using recipes from our meals list
			meal.recipe_name_list.push(
				$(this).find("span").text().trim()
			);
			meal.meal_type_list.push(
				$(this).find("div:eq(1)").text().trim()
			);
		});

		if ($("#recipe_name").val().length == 0) {
			//isFormValid = false;
		} else {
		}
		if (isFormValid) {
			$.ajax({
				//create an ajax request to update_recipe_status
				data: JSON.stringify(meal), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/update_home_status",
				error: function (error) {
					console.log("Database error", error);
				}
			});
		} else {
            console.log("Form missing fields");
		}
    }
	function addRecipeToMealPlan(recipe_name, meal_type) {
		event.preventDefault();
		//add recipe and meal type
		$("#meals-list").append(
			`<li class='row list-item'>
                <div class='col s6 valign-wrapper'>
                    <i class='material-icons'>navigate_next</i><span>${recipe_name}</span>
                </div>
                <div class='col s4 valign-wrapper'>
                    ${meal_type}
                </div>
                <div class='col s2 valign-wrapper'>
                    <i class='material-icons delete_item'>delete_forever</i>
                </div>
            </li>`
        );
		$("#recipe_name").val(""); //reset recipe name
		Materialize.toast("<i class='material-icons positive'>check_circle</i>Added to meal list", 3000);
	}
    function updateRecipeNutritionValues(recipe_name) {
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
		});
    }
    function updateNutritionSummary(recipe_name, operation) {
		$.ajax({
			//create an ajax request to update_recipe_nutrition_values
			data: {
				//data that gets sent to python
                recipe_name: recipe_name
            },
			type: "POST",
			dataType: "json",
			url: "/update_nutrition_summary",
			success: function (result) {
                if (result) {
                    rda = parseInt($("#energy_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#energy").text()) + result.energy;
                        $("#energy").text(parseInt($("#energy").text()) + result.energy);//set total energy as current value + new added value
                    } else {
                        total = parseInt($("#energy").text()) - result.energy;
                        $("#energy").text(parseInt($("#energy").text()) - result.energy);//set total energy as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {//prevent percentage going over 100%
                        percent = 100;
                    }
                    $("#energy_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#carbohydrate_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#carbohydrate").text()) + result.carbohydrate;
                        $("#carbohydrate").text(parseInt($("#carbohydrate").text()) + result.carbohydrate);//set total carbohydrate as current value + new added value
                    } else {
                        total = parseInt($("#carbohydrate").text()) - result.carbohydrate;
                        $("#carbohydrate").text(parseInt($("#carbohydrate").text()) - result.carbohydrate);//set total carbohydrate as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#carbohydrate_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#fats_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#fats").text()) + result.fats;
                        $("#fats").text(parseInt($("#fats").text()) + result.fats);//set total fats as current value + new added value
                    } else {
                        total = parseInt($("#fats").text()) - result.fats;
                        $("#fats").text(parseInt($("#fats").text()) - result.fats);//set total fats as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#fats_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#protein_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#protein").text()) + result.protein;
                        $("#protein").text(parseInt($("#protein").text()) + result.protein);//set total protein as current value + new added value
                    } else {
                        total = parseInt($("#protein").text()) - result.protein;
                        $("#protein").text(parseInt($("#protein").text()) - result.protein);//set total protein as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#protein_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#calcium_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#calcium").text()) + result.calcium;
                        $("#calcium").text(parseInt($("#calcium").text()) + result.calcium);//set total calcium as current value + new added value
                    } else {
                        total = parseInt($("#calcium").text()) - result.calcium;
                        $("#calcium").text(parseInt($("#calcium").text()) - result.calcium);//set total calcium as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#calcium_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#iron_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#iron").text()) + result.iron;
                        $("#iron").text(parseInt($("#iron").text()) + result.iron);//set total iron as current value + new added value
                    } else {
                        total = parseInt($("#iron").text()) - result.iron;
                        $("#iron").text(parseInt($("#iron").text()) - result.iron);//set total iron as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#iron_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#zinc_rda").text());
                    if (operation == 'add') {
                        total = parseInt($("#zinc").text()) + result.zinc;
                        $("#zinc").text(parseInt($("#zinc").text()) + result.zinc);//set total zinc as current value + new added value
                    } else {
                        total = parseInt($("#zinc").text()) - result.zinc;
                        $("#zinc").text(parseInt($("#zinc").text()) - result.zinc);//set total zinc as current value + new added value
                    }
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#zinc_bar .determinate").css({"width": percent+'%'});
                }//end of if(result){}
            },
		});
    }
	$("#meals-list").on("click", ".delete_item", function () {
//   		$("#meals-list li").each(function () {

            //recipe_name = $(this).find("span").text().trim();
            
            recipe_name = $(this).parent().parent().find('span').text();
            
            console.log('<<recipe_name>>', recipe_name);
            updateNutritionSummary(recipe_name, 'subtract');
//        });
        $(this).parent().parent().fadeOut('slow', function () {
            $(this).remove();
            updateHomeStatus();//xyz
            //updateNutritionSummary();
        });
    });
    //uses event delegation for an element that may not exist yet
	$("#ingredient-list").on("click", ".delete_item", function () {
        $(this).parent().parent().fadeOut('slow', function () {
            $(this).remove();
            updateRecipeStatus();
        });
    });
	$("#step-list").on("click", ".delete_item", function () {
        $(this).parent().parent().fadeOut('slow', function () {
            $(this).remove();
            updateRecipeStatus();
        });
    });
    function updateRecipeStatus() {
		var isFormValid = true;

		let recipe = {
			recipe_name: $("#recipe_name").val(),
			servings: parseInt($("#servings").val()),
			ingredient_name: $("#ingredient_name").val(),
			ingredient_amount: $("#ingredient_amount").val(),
			ingredient_name_list: [],
			ingredient_amount_list: [],
			ingredient_unit_list: [],
			step_number: $("#step_number").val(),
			step_description: $("#step_description").val(),
			step_number_list: [],
			step_description_list: [],
        };
        if (recipe.recipe_name.length == 0) {
            recipe.recipe_name='';
        }
        if (typeof(recipe.servings) != 'number') {
            recipe.servings='NULL';
        }
        if (recipe.ingredient_name.length == 0) {
            recipe.ingredient_name='';
        }
        if (typeof(recipe.ingredient_amount) != 'number') {
            recipe.ingredient_amount='NULL';
        }
        if (typeof(recipe.step_number) != 'number') {
            recipe.step_number='NULL';
        }
        if (recipe.step_description.length == 0) {
            recipe.step_description='';
        }

		$("#ingredient-list li").each(function () {//process ingredients list
			recipe.ingredient_name_list.push(
				$(this).find("span").text().trim()
			);
			recipe.ingredient_amount_list.push(
				parseInt($(this).find("div:eq(1)").text().trim())
			);
			recipe.ingredient_unit_list.push(
				$(this).find("div:eq(2)").text().trim()
			);
		});
		$("#step-list li").each(function () {//process steps list
			recipe.step_number_list.push(
				parseInt($(this).find("div:eq(0)").text().trim())
			);
			recipe.step_description_list.push(
				$(this).find("div:eq(1)").text().trim()
			);
		});

		if (
			$("#recipe_name").val().length == 0 ||
			$("#servings").val().length == 0
		) {
			//isFormValid = false;
		} else {
		}
		if (isFormValid) {
			$.ajax({
				//create an ajax request to update_recipe_status
				data: JSON.stringify(recipe), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/update_recipe_status",
				error: function (error) {
					console.log("Database error", error);
				}
			});
		} else {
            console.log("Form missing fields");
		}
	}
	$("#add-ingredient-to-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		let amount = $("#ingredient_amount").val();
		let unit = $("#ingredient-row .select-dropdown").val();

        if (value.length > 0 && amount.length > 0) {//if ingredient name and amount exist
			if (matchedIngredient) {
                addIngredientToRecipe(value, amount, unit);
                updateRecipeStatus();
			} else {
                Materialize.toast(`<i class='material-icons neutral'>warning</i><span>Ingredient not found</span>
                <form action="/ingredients" method="POST"><button class="btn-flat toast-action ingredient-toast" name="ingredient_name" value="${$("#ingredient_name").val()}">CREATE INGREDIENT</button></form>`, 10000);
			}
		} else {
			Materialize.toast("<i class='material-icons neutral'>warning</i>Please fill out all ingredient fields", 3000);
		}
	});

    function addIngredientToRecipe(value, amount, unit) {
		event.preventDefault();
		//add ingredient details
		$("#ingredient-list").append(
			`<li class='row list-item'>
                <div class='col s6 valign-wrapper'>
                    <i class='material-icons'>navigate_next</i><span>${value}</span>
                </div>
                <div class='col s1 valign-wrapper'>
                    ${amount}
                </div>
                <div class='col s4 valign-wrapper'>
                    ${unit}
                </div>
                <div class='col s1 valign-wrapper'>
                    <i class='material-icons delete_item'>delete_forever</i>
                </div>
            </li>`
		);
		$("#ingredient_name").val(""); //reset ingredient name
		$("#ingredient_amount").val(""); //reset ingredient amount
		$("#ingredient_units").val("gram (g)"); //reset ingredient unit
		$("#ingredient_units").material_select(); //re-initialized
		Materialize.toast("<i class='material-icons positive'>check_circle</i>Added to ingredient list", 3000);
	}
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
			success: function (result) {
				if (result == 'match') {
					//found ingredient in database
                    matchedIngredient = true;
                    getIngredientNutrition();
				} else if (result == "no match") {
					matchedIngredient = false;
					clearIngredientInputs();
				}
			},
			error: function (error) {
				console.log("Database error", error);
			}
		});
	});
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
			success: function (result) {
				if (result) {
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
                    //prevent ingredient amount being filled in on any page, except ingredients page
                    if (location.href.match(/ingredients/)) {
                        $("#ingredient_amount").val(result[0].ingredient_amount);
    					Materialize.toast("<i class='material-icons positive'>check_circle</i>Loaded nutritional data", 3000);
                    } else {
                        $("#ingredient_amount").val();
    					Materialize.toast("<i class='material-icons positive'>check_circle</i>Found ingredient", 3000);
                    }
                    Materialize.updateTextFields();
				}
			},
			error: function (error) {
				console.log("Database error", error);
			},
		});
	}
});
