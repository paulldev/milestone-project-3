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
				//console.log("4. [success:] successful ajax call", result); //this is a js object
				if (result) {
					//found in database
					//https://stackoverflow.com/questions/5223/length-of-a-javascript-object
					for (var i = 0; i < Object.keys(result).length; i++) {
						if (table == "ingredient") {
							ingredients[result[i].name] = null;
							//console.log("Iteration (" + i + ") ", ingredients);
						} else if (table == "recipe") {
							recipes[result[i].name] = null;
							//console.log("Iteration (" + i + ") ", recipes);
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
				clearRecipeInputs();
				getRecipeData();
			},
			minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
		});
	} else if (location.href.match(/\//)) {
        console.log("Found index page");//xxxxx
   		$("#meals-list li").each(function () {
			recipe_name = $(this).find("span").text().trim();
            console.log('recipe_name', recipe_name);
            updateNutritionSummary(recipe_name)
        });

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
					Materialize.toast("<i class='material-icons delete-item'>delete_forever</i>Deleted ingredient", 4000);
    				getNames("/get_names", "ingredient", "name");
				} else if (table == "recipe") {
					Materialize.toast("<i class='material-icons delete-item'>delete_forever</i>Deleted recipe", 4000);
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
				success: function (result, status, xhr) {
                    if (result == 'saved recipe') {
                        if (action == "save") {
                            Materialize.toast("<i class='material-icons check-mark'>cloud_done</i>Saved recipe", 4000);
                        } else if (action == "update") {
                            Materialize.toast("Updated recipe", 4000);
                        }
                        $("#recipe_name").val(""); //reset recipe name
                        clearRecipeInputs();
                        $(window).scrollTop(0); //scroll window to top
                        updateRecipeStatus();
                    }
				},
				error: function (xhr, status, error) {
					console.log("Database error", error);
				},
      			complete: function (result) {
                    getNames("/get_names", "recipe", "name");
                    updateRecipeNutritionValues(recipe.recipe_name);//update nutrition data for this recipe
	          	},
			});
		} else {
			Materialize.toast("All fields must be filled out", 4000);
			$(window).scrollTop(0); //scroll window to top
		}
	}
	function saveRecipeStatus() {//xnow probably delete
		event.preventDefault();
		var isFormValid = true;

		let recipe = {
			recipe_name: $("#recipe_name").val(),
			servings: parseInt($("#servings").val()),
			ingredient_name_input: $("#ingredient_name").val(),
			ingredient_amount_input: $("#ingredient_amount").val(),
			ingredient_name: [],
			ingredient_amount: [],
			ingredient_unit: [],
			step_number_input: $("#step_number").val(),
			step_description_input: $("#step_description").val(),
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
			//checks if required inputs have a value
			$.ajax({
				//create an ajax request to save_recipe
				data: JSON.stringify(recipe), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/save_recipe_status",
				success: function (result, status, xhr) {
				},
				error: function (xhr, status, error) {
					console.log("Database error", error);
				},
      			complete: function (result) {
	          	},
			});
		} else {
		}
	}
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
			success: function (result, status, xhr) {
				if (result == 'match') {
					//found recipe in database
					matchedRecipe = true;
					getRecipeData();
				} else if (result == "no match") {
					matchedRecipe = false;
					clearRecipeInputs();
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
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
			success: function (result, status, xhr) {
				if (result) {
                    $("#servings").val(result[0].servings);
                    //$("#servings").focus();//xxx bug fix???
					//get ingredients
					if ($("#ingredient-list li").length == 0) {//if zero ingredients in list (stops ingredients being added every keystroke)
						result[1].forEach(function (element) {//process ingredients array
                            console.log("Element: ", element);
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
                                <div class='col s2 valign-wrapper'>
                                    ${ingredient_unit}
                                </div>
                                <div class='col s3 valign-wrapper'>
                                    <i class='material-icons delete_item'>delete_forever</i>
                                </div>
                            </li>`
							);
						});
					}
					//get steps
					if ($("#step-list li").length == 0) {//if zero steps in list (stops steps being added every keystroke)
						result[2].forEach(function (element) {//process steps array
							step_number = element["stepNumber"];
							step_description = element["stepDescription"];
							$("#step-list").append(
								`<li class='row list-item'>
                                    <div class='col s2 valign-wrapper'>
                                        ${step_number}
                                    </div>
                                    <div class='col s7 valign-wrapper'>
                                        ${step_description}
                                    </div>
                                        <div class='col s3 valign-wrapper'>
                                        <i class='material-icons'>delete_forever</i>
                                    </div>
                                </li>`
							);
						});
					}
					Materialize.toast("Loaded recipe data", 4000); // 4000 is the duration of the toast
				} else {
                    console.log("Nothing returned");
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
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
				success: function (result, status, xhr) {
					if (action == "save") {
						Materialize.toast("Saved nutritional data", 4000); // 4000 is the duration of the toast
					} else if (action == "update") {
						Materialize.toast("Updated nutritional data", 4000); // 4000 is the duration of the toast
                    }
					$("#ingredient_name").val(""); //clear ingredient name
					clearIngredientInputs();
					$(window).scrollTop(0); //scroll window to top
					$("#ingredient_name").focus(); //position cursor for next ingredient entry
                    getNames("/get_names", "ingredient", "name");
				},
				error: function (xhr, status, error) {
					console.log("Database error", error);
				},
			});
		} else {
			Materialize.toast("All fields must be filled out", 4000); // 4000 is the duration of the toast
			$(window).scrollTop(0); //scroll window to top
		}
	}
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
	$("#delete-recipe").on("click", function (event) {
		event.preventDefault();
		if (matchedRecipe) {
            let recipe_name = $("#recipe_name").val();
            deleteRecipe(recipe_name);
            $("#recipe_name").val(""); //reset recipe name
            clearRecipeInputs();
            updateRecipeStatus();
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
                if (result == 'deleted recipe') {
                    if (matchedRecipe) {
                        Materialize.toast("Deleted recipe", 4000);
                        getNames("/get_names", "recipe", "name");
                    } else {
                        Materialize.toast("Recipe doesn't exist", 4000);
                    }
                }
			},
		});
	}

	$("#add-step-to-recipe").on("click", function (event) {
		event.preventDefault();
		let step_number = $("#step_number").val();
		let step_description = $("#step_description").val();
		if ((step_number.length > 0) & (step_description.length > 0)) {//if step number and description exist
            addStepToRecipe(step_number, step_description);
            updateRecipeStatus();
		} else {
			Materialize.toast("Please fill out all step fields", 4000);
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
                  <div class='col s7 valign-wrapper'>
                      ${step_description}
                  </div>
                      <div class='col s3 valign-wrapper'>
                      <i class='material-icons delete_item'>delete_forever</i>
                  </div>
              </li>`
		);
		$("#step_number").val(parseInt(step_number) + 1); //increment step number
		$("#step_description").val(""); //reset step description
		$("#step_description").focus(); //position cursor for next step description
		Materialize.toast("Added to step list", 3000); // 4000 is the duration of the toast
	}
	$("#add-to-meal-plan").on("click", function (event) {
		event.preventDefault();
		let recipe_name = $("#recipe_name").val();
		let meal_type = $("#meal_type option:selected").text();
		if (recipe_name.length > 0) {
			if (matchedRecipe) {
                addRecipeToMealPlan(recipe_name, meal_type);
                updateNutritionSummary(recipe_name);
			} else {
				let $toastContent = $("<span>Recipe not found</span>").add(
					$(
						'<button class="btn-flat toast-action">CREATE RECIPE</button>'
					)
				);
				Materialize.toast($toastContent, 10000);
			}
		} else {
			Materialize.toast("Please fill out recipe name", 4000);
		}
	});
	function addRecipeToMealPlan(recipe_name, meal_type) {
		event.preventDefault();
		//add recipe and meal type
		$("#meals-list").append(
			`<li class='row list-item'>
                <div class='col s6 valign-wrapper'>
                    <i class='material-icons'>navigate_next</i>${recipe_name}
                </div>
                <div class='col s2 valign-wrapper'>
                    ${meal_type}
                </div>
                <div class='col s3 valign-wrapper'>
                    <i class='material-icons delete_item'>delete_forever</i>
                </div>
            </li>`
        );
		$("#recipe_name").val(""); //reset recipe name
		Materialize.toast("<i class='material-icons check-mark'>check_circle</i>Added to meal list", 3000); // 4000 is the duration of the toast
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
            },
		});
    }
    function updateNutritionSummary(recipe_name) {
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
                if (result) {
                    console.log("RESULT:", result)

                    rda = parseInt($("#energy_rda").text());
                    total = parseInt($("#energy").text()) + result.energy;
                    $("#energy").text(parseInt($("#energy").text()) + result.energy);//set total energy as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#energy_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#carbohydrate_rda").text());
                    total = parseInt($("#carbohydrate").text()) + result.carbohydrate;
                    $("#carbohydrate").text(parseInt($("#carbohydrate").text()) + result.carbohydrate);//set total carbohydrate as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#carbohydrate_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#fats_rda").text());
                    total = parseInt($("#fats").text()) + result.fats;
                    $("#fats").text(parseInt($("#fats").text()) + result.fats);//set total fats as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#fats_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#protein_rda").text());
                    total = parseInt($("#protein").text()) + result.protein;
                    $("#protein").text(parseInt($("#protein").text()) + result.protein);//set total protein as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#protein_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#calcium_rda").text());
                    total = parseInt($("#calcium").text()) + result.calcium;
                    $("#calcium").text(parseInt($("#calcium").text()) + result.calcium);//set total calcium as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#calcium_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#iron_rda").text());
                    total = parseInt($("#iron").text()) + result.iron;
                    $("#iron").text(parseInt($("#iron").text()) + result.iron);//set total iron as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#iron_bar .determinate").css({"width": percent+'%'});

                    rda = parseInt($("#zinc_rda").text());
                    total = parseInt($("#zinc").text()) + result.zinc;
                    $("#zinc").text(parseInt($("#zinc").text()) + result.zinc);//set total zinc as current value + new added value
                    percent = Math.round((total / rda) * 100);
                    if (percent > 100) {
                        percent = 100;
                    }
                    $("#zinc_bar .determinate").css({"width": percent+'%'});
                }//end of if(result){}
            },
		});
    }
	$("#meals-list").on("click", ".delete_item", function (event) {//xxxxxxx
        $(this).parent().parent().fadeOut('slow', function (event) {
            $(this).remove();
        });
    });
	$("#ingredient-list").on("click", ".delete_item", function (event) {
        $(this).parent().parent().fadeOut('slow', function (event) {
            $(this).remove();
            updateRecipeStatus();
        });
    });
	$("#step-list").on("click", ".delete_item", function (event) {
        $(this).parent().parent().fadeOut('slow', function (event) {
            $(this).remove();
            updateRecipeStatus();
        });
    });
    function updateRecipeStatus() {//xurs
        console.log("==> starting updateRecipeStatus...");
		//event.preventDefault();
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

		$("#ingredient-list li").each(function () {
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
		$("#step-list li").each(function () {
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
        console.log("==> Testing if form is valid...");
		if (isFormValid) {
            console.log("==> form is valid", recipe);
			$.ajax({
				//create an ajax request to update_recipe_status
				data: JSON.stringify(recipe), //data that gets sent to python
				type: "POST",
				dataType: "json",
				url: "/update_recipe_status",
				success: function (result, status, xhr) {
				},
				error: function (xhr, status, error) {
					console.log("Database error", error);
				},
      			complete: function (result) {
	          	},
			});
		} else {
            console.log("Form missing fields");
		}
	}
	$("#add-ingredient-to-recipe").on("click", function (event) {
		event.preventDefault();
		let value = $("#ingredient_name").val();
		let amount = $("#ingredient_amount").val();
		let unit = $("#ingredient-row .select-dropdown").val();//xxx is this correct?

        if (value.length > 0 && amount.length > 0) {//if ingredient name and amount exist
			if (matchedIngredient) {
                addIngredientToRecipe(value, amount, unit);//xaitr
                updateRecipeStatus();//xursc1
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
                <div class='col s2 valign-wrapper'>
                    ${unit}
                </div>
                <div class='col s3 valign-wrapper'>
                    <i class='material-icons delete_item'>delete_forever</i>
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
				if (result == 'match') {
					//found ingredient in database
                    matchedIngredient = true;
					getIngredientNutrition();
				} else if (result == "no match") {
					matchedIngredient = false;
					clearIngredientInputs();
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
			},
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
					Materialize.toast("Loaded nutritional data", 4000);
				}
			},
			error: function (xhr, status, error) {
				console.log("Database error");
			},
		});
	}
});
