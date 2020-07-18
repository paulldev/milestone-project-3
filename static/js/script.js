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
            url : '/get_ingredients'
        })
        .done(function(data) {
            console.log('returned data: ', data);
            if(data[0]) { //found ingredient in database
                console.log('found '+data[0].name);
            }
//            console.log('data: ',data);
            console.log('data[0]: ',data[0]);
//            console.log('data[0].COUNT(*): ',data[0].COUNT(*));
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("error");
        });
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
