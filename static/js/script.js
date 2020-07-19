$(document).ready(function () {
    $('.button-collapse').sideNav();
    $('select').material_select();

    $('#ingredient_name').on('keyup', function(event) {
        event.preventDefault();
        //check if ingredient exists
        $.ajax({    //create an ajax request to get_ingredients
            data: { //data that gets sent to python
                ingredient_name : $('#ingredient_name').val()
            },
            type : 'POST',
            dataType: 'json',
            url : '/ingredient_exists',
            success : function(result,status,xhr){
//                console.log('returned data: ', result);
                if(result[0]) { //found ingredient in database
                    console.log('Found '+result[0].name);
                } else {
                    console.log('Couldn\'t find ingredient');
                }
            },
            error : function(xhr,status,error){
                console.log("Error");
            }
        })
    });
/*    let mydata = {
      "aa": null,
      "ab": null,
      "abc": 'https://placehold.it/250x250'
    }

    //http://archives.materializecss.com/0.100.2/forms.html
    $('input.autocomplete').autocomplete({
    data: mydata,
    limit: 200, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
      // Callback function when value is autcompleted.
      alert(val);
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });*/
});
