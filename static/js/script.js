$(document).ready(function () {
    $('.button-collapse').sideNav();
    $('select').material_select();

    $('#ingredient_name').on('keyup', function(event) {
        event.preventDefault();
        //check if ingredient exists
        $.ajax({    //create an ajax request to get_ingredients
            data: {
                ingredient_name : $('#ingredient_name').val()
            },
            type : 'POST',
            dataType: 'json',
            url : '/get_ingredients',
            success : function(result,status,xhr){
                console.log('returned data: ', result);
                if(result[0]) { //found ingredient in database
                    console.log('found '+result[0].name);
                }
    //            console.log('result: ',result);
                console.log('result[0]: ',result[0]);
    //            console.log('result[0].COUNT(*): ',result[0].COUNT(*));
            },
            error : function(xhr,status,error){
                console.log("error");
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
