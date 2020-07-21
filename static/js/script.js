$(document).ready(function () {
let names = {}; //used to hold result from the ajax call. Materialize autocomplete feature uses the names object.
  $(".button-collapse").sideNav();
  $("select").material_select();

  function getNames(url, table, column) { //get names from the database using an ajax call
    $.ajax({
      //create an ajax request to get_names()
      data: {
        //data that gets sent to python
        table: table,
        column: column
      },
      async:false, //locks browser until request completes
      type: "POST",
      dataType: "json",
      url: url,
      success: function (result, status, xhr) {
        console.log("4. [success:] successful ajax call", result); //this is a js object
        if (result) {
          //found in database
            //https://stackoverflow.com/questions/5223/length-of-a-javascript-object
            for (var i = 0; i < Object.keys(result).length; i++) {
                names[result[i].name] = null;
                console.log("Iteration ("+i+") ", names);
            }
        } else {
          console.log("5. Couldn't find");
        }
      },
      error: function (xhr, status, error) {
        console.log("4. [Error:] Error??", xhr);
      },
      complete: function (result) {
        console.log("AJAX call complete, check NAMES ", names);
      }
    });
  }

  if (location.href.match(/ingredients/)) {
    console.log("1. Found ingredients page");
    getNames("/get_names", "ingredient", "name");

  } else if (location.href.match(/recipes/)) {
    console.log("Found recipes page");
    getNames("ingredient", "name");
  } else {
    console.log("Error, unknown page");
  }

  /*  $("#ingredient_name").on("keyup", function (event) {
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
  });*/

  //names = {applezz: null, orangezz: null};
  //http://archives.materializecss.com/0.100.2/forms.html
  $("input.autocomplete").autocomplete({
    data: names,
    limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function (val) {
      // Callback function when value is autcompleted.
      alert(val);
    },
    minLength: 1 // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});
