define(["jquery", "jquery-ui.min", "loom/loomAlerts"],function($, jui, Alerts){
        $(function () {
                var searchContext = "",
                    key = "EB31-KZ91-DT89-GG22";

                $("#addressLookup").autocomplete({
                    source: function(request, response) {
                        $.ajax({
                            url: "//services.postcodeanywhere.co.uk/CapturePlus/Interactive/Find/v2.10/json3.ws",
                            dataType: "jsonp",
                            data: {
                                key: key,
                                searchFor: "Everything",
                                Country: "GBR",
                                LanguagePreference: "EN",
                                MaxSuggestions: 25,
                                MaxResults: 100,
                                searchTerm: request.term,
                                lastId: searchContext
                            },
                            success: function(data) {
                                response($.map(data.Items, function(suggestion) {
                                    return {
                                        label: suggestion.Text,
                                        value: "",
                                        data: suggestion
                                    }
                                }));
                            }
                        });
                    },
                    select: function(event, ui) {
                        var item = ui.item.data

                        if (item.Next == "Retrieve") {
                            //retrieve the address
                            retrieveAddress(item.Id);
                        } else {
                            var field = $(this);
                            searchContext = item.Id;

                            //search again
                            window.setTimeout(function() {
                                field.autocomplete("search", item.Id);
                            });
                        }
                    },
                    autoFocus: true,
                    minLength: 1,
                    delay: 100
                }).focus(function() {
                    searchContext = "";
                });

                function retrieveAddress(id) {
                    $.ajax({
                        url: "//services.postcodeanywhere.co.uk/CapturePlus/Interactive/Retrieve/v2.10/json3.ws",
                        dataType: "jsonp",
                        data: {
                            key: key,
                            id: id
                        },
                        success: function (data) {
                            if (data.Items.length)
                                populateAddress(data.Items[0]);
                        }
                    });
                }

                function populateAddress(address) {
                    console.log(address);
                    $("#addressLine1").val(address.Line1);
                    $("#addressLine2").val(address.Line2);
                    $("#addressLine3").val(address.Line3);
                    $("#city").val(address.City);
                    $("#county").val(address.Province);
                    $("#postcode").val(address.PostalCode);
                }
            });
});