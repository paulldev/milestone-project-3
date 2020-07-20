$(document).ready(function () {
  $(".button-collapse").sideNav();
  $("select").material_select();

  if (location.href.match(/ingredients/)) {
    console.log("0. Found ingredients page");
    console.log("1. Calling getNames() ");
//      debugger;

    mydata = getNames("ingredient", "name");
    console.log("Back from calling allNames() >>>>>>", mydata);
  } else if (location.href.match(/recipes/)) {
    console.log("Found recipes page");
  } else {
    console.log("Error, unknown page");
  }

  $("#ingredient_name").on("keyup", function (event) {
    event.preventDefault();
    //check if ingredient exists
    $.ajax({
      //create an ajax request to get_ingredients
      data: {
        //data that gets sent to python
        ingredient_name: $("#ingredient_name").val()
      },
      type: "POST",
      dataType: "json",
      url: "/ingredient_exists",
      success: function (result, status, xhr) {
        //                console.log('returned data: ', result);
        if (result[0]) {
          //found ingredient in database
          console.log("Found " + result[0].name);
        } else {
          console.log("Couldn't find ingredient");
        }
      },
      error: function (xhr, status, error) {
        console.log("Error");
      }
    });
  });

  function getNames(table, column) {
    console.log("2. inside getNames(). AJAX call starting");
    //get names of ingredients/recipes
    $.ajax({
      //create an ajax request to get_names()
      data: {
        //data that gets sent to python
        table: table,
        column: column,
      },
      type: "POST",
//      dataType: "json",
      url: "/get_names",
      success: function (result, status, xhr) {
        console.log("3. successful ajax call");
//        console.log("4. ajax type returned (result): ", typeof result);
//        console.log("5. ajax type returned (result[0]): ", typeof result[0]);
//        console.log("6. ajax result (stringify): ", JSON.stringify(result));
        if (result) {
          //found in database
          console.log("7. Return result:", result); //object
          //return JSON.parse(result);
          return result;
        } else {
          console.log("Couldn't find");
        }
      },
      error: function (xhr, status, error) {
        console.log("Error??", xhr);
      }
    });
  }

  var names = {};
  console.log("populating autocomplete object");
  for (var i = 0; i < 5; i++) {
    names["ape"] = null;
  }
  console.log("8. autocomplete object: ", names);
  //http://archives.materializecss.com/0.100.2/forms.html
  $("input.autocomplete").autocomplete({
    data: names,
    limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function (val) {
      // Callback function when value is autcompleted.
      alert(val);
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});
