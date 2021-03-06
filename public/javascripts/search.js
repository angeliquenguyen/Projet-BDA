$(function () {

    $("#search-query").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/friends/search",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    // Map response values to fiedl label and value
                    response($.map(data, function (el) {
                        return {
                            label: el.username,
                            value: el.username
                        };
                    }));
                }
            });
        },

        minLength: 3,

        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.value = ui.item.label;
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.value = ui.item.label;
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            // Prevent other event from not being execute
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            $('#search-friend').submit();
        }
    });
});
