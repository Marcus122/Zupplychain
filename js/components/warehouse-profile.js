"use strict";
define(["jquery","loom/loom","templates/templates","loom/loomAlerts",'async!https://maps.googleapis.com/maps/api/js','components/global'], function ($,Loom,Templates,Alerts,GM,Global) {
	
    function Class() {
		var templates = new Templates();
        var global = new Global();
		var lm = new Loom();
        var indexOfInputThatWasFocused;
		
		function initialize() {	
			$('.popup').on("click",function(){
                $(this).toggleClass("show").toggleClass("hide");
                var id = $(this).data("id");
                $(".pricing-and-availability-" + id).toggle();
            });
            initAllAvailabilityBars();
            initUseageProfileChange()
            $('.see-on-map').on("mouseover",showMap);

            
            $(document).on("focus", "input", function() {
                indexOfInputThatWasFocused = $(this).closest("tr").index();
                console.log(indexOfInputThatWasFocused);
            });
            
            $(document).on("click",".popup-window .close",function(){
				$(this).closest('.popup-window').addClass('hidden');
			});
            
            $("#choose-this-warehouse").click(function(e){
                // e.preventDefault();
                // var $popup = $("#choose-this-warehouse-popup");
                // $popup.css({position:"absolute", top:$('#estimated-total-cost').offset().top-400 });
                // $popup.removeClass('hidden);
            });
            
            $("#choose-this-warehouse-popup .close").click(function(){
                $("#choose-this-warehouse-popup").addClass('hidden');
            });
            
            //world's simplest image gallery :)
            $(".thumbnails img").click( function(evt) {
                $(".placeholder").attr("src", $(this).attr("src"));
            });
            
            if ($("#quotation-request-form").length > 0) {
                lm.addOnSuccessCallback("quotation-request-form", function(response) {
                    if (response.error) {
                        quotationRequestError();
                    } else {
                        quotationRequestSuccess(response);
                    }
                });
            }
            
            if ($("#provider-offer-form").length > 0) {
                lm.addOnSuccessCallback("provider-offer-form", function(response) {
                    if (response.error) {
                        providerOfferError();
                    } else {
                        providerOfferSuccess(response);
                    }
                });
            }
            
            if ($("#provider-confirm-contract").length > 0) {
                lm.addOnSuccessCallback("provider-confirm-contract", function(response) {
                    if (response.error) {
                        providerOfferError();
                    } else {
                        providerOfferSuccess(response);
                    }
                });
            }
			
			if ($(".search-result-info-box").length > 0){
				var $searchResInfoBox = $(".search-result-info-box");
                $searchResInfoBox.fadeIn().removeClass('hidden');
				$searchResInfoBox.find('.controls').addClass('hidden');
			}
            
            if ($("#provider-offer-reply-form").length > 0) {
                lm.addOnSuccessCallback("provider-offer-reply-form", function(response) {
                    if (response.error) {
                        providerOfferReplyError();
                    } else {
                        providerOfferReplySuccess(response);
                    }
                });
            }
            
            initWarehouseProfileRowChanger();
            initTransport();
            initPaymentTerms();
            initComments();
            
		}
        
        function rebindFormByJqueryObj($form,addSuccessCb){
            lm.rebind($form);
            if(addSuccessCb === true){
                if ($form.length > 0) {
                    lm.addOnSuccessCallback($form.attr('id'), function(response) {
                        if (response.error) {
                            providerOfferError();
                        } else {
                            providerOfferSuccess(response);
                        }
                    });
                }
            }
        }
        
        function initComments(){
            $('div[data-content="comment"] a').click(function(e){
                e.preventDefault();
                var $this = $(this);
                $this.parent().addClass('hidden').siblings().removeClass('hidden');
            });
            
            $('button[name="view-conversation"]').click(function(){
               $('.popup-window.provider-user-conversation').removeClass('hidden'); 
               global.centerPopup($('.popup-window.provider-user-conversation'));
            });
        }
        
        function initWarehouseProfileRowChanger(){
            $('.change-warehouse-profile-row-number .view-less').addClass('hidden');
            $('.change-warehouse-profile-row-number .view-more').addClass('hidden');
            if ($('.pricing-container form table > tbody > tr').length > 12){
                $('.change-warehouse-profile-row-number .view-more').removeClass('hidden');
                $('.pricing-container form table > tbody > tr').addClass('hidden').slice(0,12).removeClass('hidden');
                $('.change-warehouse-profile-row-number .view-less').addClass('hidden');
                $('.change-warehouse-profile-row-number .view-more').click(function (){
                    $(".pricing-container form table > tbody > tr").removeClass('hidden');
                    $('.change-warehouse-profile-row-number .view-less').removeClass('hidden');
                    $('.change-warehouse-profile-row-number .view-more').addClass('hidden');
                });
                $('.change-warehouse-profile-row-number .view-less').click(function (){
                    $('.pricing-container form table > tbody > tr').addClass('hidden').slice(0,12).removeClass('hidden');
                    $('.change-warehouse-profile-row-number .view-more').removeClass('hidden');
                    $('.change-warehouse-profile-row-number .view-less').addClass('hidden');
                });
            }
        }
        
        function initTransport(){
            
            if ($('select[name="transport"]').val() === "1"){
                $('.input-field[data-field="dispatch-location"]').removeClass('hidden');
                $('input[name="dispatchLocation"]').attr("required","required")
            }
            
            $('button[name="open-transport-fields"]').click(function(){
                $(this).parent('.main.row.transport').find('.six.columns').removeClass('hidden');
                $(this).addClass('hidden');
            });
            $('button[name="close-transport-fields"]').click(function(){
                $(this).parent('.six.columns').addClass('hidden');
                $(this).parent('.six.columns').next('.six.columns').addClass('hidden');
                $('button[name="open-transport-fields"]').removeClass('hidden');
            });
            $('select[name="transport"]').change(function(){
                if($(this).val() === "1"){
                    $('.input-field[data-field="dispatch-location"]').removeClass('hidden');
                    $('input[name="dispatchLocation"]').attr("required","required")
                }else{
                    $('.input-field[data-field="dispatch-location"]').addClass('hidden');
                    $('input[name="dispatchLocation"]').removeAttr("required")
                    $('input[name="dispatchLocation"]').val("");
                }
            });
            
            // $('input[name="paymentTermsAccepted"], input[name="transportTermsAccepted"]').change(function(){
            //     if($(this).is(":checked")){
            //         $('button[name="accept"]').removeClass('hidden');
            //         $('button[name="decline"]').addClass('hidden');
            //     }else if (!$('input[name="paymentTermsAccepted"]').is(":checked") && !$('input[name="transportTermsAccepted"]').is(":checked")){
            //         $('button[name="accept"]').addClass('hidden');
            //         $('button[name="decline"]').removeClass('hidden');
            //     }
            // });
            
            if($('input[name="transport-terms-accepted"]') > 0 && $('input[name="transport-terms-declined"]') > 0 &&
            !$('input[name="transport-terms-accepted"]').is(":checked") && !$('input[name="transport-terms-declined"]').is(":checked")){
                $('.submit-request-container').find('button[name="accept"]').prop('disabled',true);
                $('.submit-request-container').find('button[name="decline"]').prop('disabled',true);
            }
            
            $('input[name="transport-terms-accepted"], input[name="transport-terms-declined"]').change(function(){
                if($(this).is(":checked")){
                    $(this).parent('.input-field').siblings('.input-field').find('input[type="checkbox"]').attr('checked',false);
                }
                
                if(!$(this).is(':checked') && !$(this).parent('.input-field').siblings('.input-field').find('input[type="checkbox"]').is(':checked')){
                    $('.submit-request-container').find('button[name="accept"]').prop('disabled',true);
                    $('.submit-request-container').find('button[name="decline"]').prop('disabled',true);
                }else{
                    if($('.submit-request-container').find('button[name="accept"]').is(':disabled')){
                        $('.submit-request-container').find('button[name="accept"]').prop('disabled',false);
                    }
                    
                    if($('.submit-request-container').find('button[name="decline"]').is(':disabled')){
                        $('.submit-request-container').find('button[name="decline"]').prop('disabled',false);
                    }
                }
                
            });
        }
        
        function initPaymentTerms(){
            $('select[name="paymentTerms"]').change(function(){
                if ($(this).val() === '3'){
                    $(this).parent().next('.input-field').removeClass('hidden');
                    $(this).parent().next('.input-field').find('input').prop("required",true);
                    rebindFormByJqueryObj($(this).closest('form'),true);
                }else{
                    $(this).parent().next('.input-field').addClass('hidden');
                    $(this).parent().next('.input-field').find('input').val("");
                    $(this).parent().next('.input-field').find('input').removeAttr("required");
                    rebindFormByJqueryObj($(this).closest('form'),true);
                }
            })
        }
        
        function providerOfferReplySuccess(response) {
            var redirectTo = response.redirectURL;
            if (!redirectTo) {
                ProviderOfferReplyError();
                return;
            }
            Alerts.showSuccessMessage("redirecting...")
            window.location.href = redirectTo;
        }
        
        function providerOfferReplyError() {
            Alerts.showPersistantErrorMessage("There was an error processing your confirmation");
        }
        
        function providerOfferSuccess(response) {
            var redirectTo = response.redirectURL;
            if (!redirectTo) {
                ProviderOfferError();
                return;
            }
            Alerts.showSuccessMessage("redirecting...")
            window.location.href = redirectTo;
        }
        
        function providerOfferError() {
            Alerts.showPersistantErrorMessage("There was an error processing your offer");
        }
        
        function quotationRequestSuccess(response) {
            var redirectTo = response.redirectURL;
            if (!redirectTo) {
                quotationRequestError();
                return;
            }
            Alerts.showSuccessMessage("redirecting...")
            window.location.href = redirectTo;
        }
        
        function quotationRequestError() {
            Alerts.showPersistantErrorMessage("There was an error processing your quote");
        }
        
        function initAllAvailabilityBars(){
            var $theTables = $("#useageProfile-form table");
            $theTables.each(function() {
               initAvailabilityBars($(this));
            });

            var onQuotePage =  $theTables.find("input").length < 1;
            if (!onQuotePage) {
            $(document).on("click", ".bar-container .bar", function(evt) {
                    //get the offset from the bar's left;
                    var mouseX = evt.pageX;
                    var divX = $(evt.target).offset().left;
                    var leftOffset = mouseX - divX;
                    var maxPossibleOffset = $(evt.target).width();
                    //convert the offset relative to the maxPallets (100% bar width);
                    var ratio = leftOffset / maxPossibleOffset;
                    var maxPallets = $(evt.target).closest("table").data("max-pallets");
                    var selectedValue = Math.round(ratio * maxPallets);
                    var $tr = $(evt.target).closest("tr");
                    var $useageMarker = $tr.find(".useage-marker");
                    $useageMarker.data("palletsRequired", selectedValue);
                    $tr.find("input").val(selectedValue);
                    var $theTable = $(".warehouse-pricing table");
                    $tr.find("input").trigger("change");
                    if ($(this).parent('td').closest('tr').parent('tbody').parent('table').find('button.refresh').length === 0){
                        $tr.find("input").after('<button class="refresh highlight tiny"/>');
                    }
                });
            }            
        }
        
        
        
        
        function initAvailabilityBars($theTable) {
            var palletsWontFit = false;
            var maxValue = parseInt($theTable.data("max-pallets"), 10); //the max value is what value a bar would need to have to be 100%;
            var $barTds = $theTable.find("td.bar-container");
            var barWidth = $barTds.width();
            var runningTotal = 0;
            $barTds.each(function() {
                var thisBar = $(this).find(".bar");
                var baseLeft = thisBar.offset().left - $barTds.offset().left;
                var thisValue = parseInt(thisBar.data("value"),10);
                if (!isNaN(thisValue) && thisBar.is(".not-full")){
                    thisBar.css("width", (barWidth / maxValue)  * thisValue);
                    palletsWontFit = true;
                }
                var $theMarker = thisBar.closest("tr").find(".useage-marker");
                var markerValue = parseInt($theMarker.data("pallets-required"), 10);
                var markerLeft = (barWidth /maxValue) * markerValue + baseLeft;
                $theMarker.css("left", markerLeft);
            });

            if (palletsWontFit) {
                $(".choose-warehouse-button-container").addClass("invalid"); //hide the button
            } else {
                $(".choose-warehouse-button-container").removeClass("invalid");
            }
        }
        
        var focussedInputWCdate;
        
        function initUseageProfileChange() {
            $(document).on("keyup", ".warehouse-pricing table input",function(evt){
                if ($(this).closest('td').parent('tr').parent('tbody').parent('table').find('button.refresh').length === 0){
                    var newNum = parseInt($(this).val()),
                        $parentTd = $(this).closest('td.input-field'),
                        $refresh = $parentTd.find('.refresh');
                    if (isNaN(newNum) || $refresh.length > 0) {
                        return;
                    }
                    $(this).after('<button class="refresh highlight tiny"/>');
                }
            });
            
            $(document).on("click", ".warehouse-pricing table tr td .refresh", function(evt){
                changeUsageProfile($(this));
            });
            
            function changeUsageProfile($this){
                var $tr = $this.closest("tr"),
                    $input = $tr.find("input"),
                    wcDate = $tr.data("week-commencing"),
                    newNum = parseInt($input.val()),
                    warehouseId = $("#warehouse-id").val(),
                    numPallets = $input.val(),
                    wcDate = $tr.find(".week-commencing").data("week-commencing");
                focussedInputWCdate = $tr.next().find(".week-commencing").data("week-commencing");
                if (isNaN(newNum)) {
                    return;
                }
                // we chuck up the ajax request to get the result back from the server.
                $.post("/useage-profile",
                        {
                            wcDate :  wcDate,
                            numPallets : numPallets,
                            "warehouse-id" : warehouseId
                        },
                        function (result) {
                            populatePricingTable(result, wcDate);
                            focusInputThatWasFocussed();
                });
            }
            
        }
        
        function focusInputThatWasFocussed(){
            $("#useageProfile-form").find("table tbody tr").eq(indexOfInputThatWasFocused).find("input").focus();
        }
        
        function printFormatDate(date) {
            var dateString = date.toISOString();
            var yyyy = dateString.substr(0,4);
            var mm = dateString.substr(5,2);
            var dd = dateString.substr(8,2);
            return dd + "/" + mm + "/" + yyyy;
        }
        
        function calculateAndDisplayTotal(storageProfile) {
            var runningTotal = 0.0;
            var palletsInLastWeek = 0;
            for (var wcDateString in storageProfile) {
                var sp = storageProfile[wcDateString];
                var storedPalletsSuccesfully = sp.numPallets <= sp.numPalletsStored;
                var palletIncreaseThisWeek = Math.max(sp.numPallets - palletsInLastWeek, 0);
                runningTotal += parseFloat(sp.totalPrice);
                palletsInLastWeek = sp.numPallets;
            }
            var totalToDisplay = runningTotal ? (runningTotal).toFixed(2) : "N/A";
            $("#estimated-total-cost .price").html(totalToDisplay);
            //if running total is NaN set some global so that we can't get to the next page.
        }
        
        function populatePricingTable(storageProfile, wcDateOfRowThatChanged) {
            var newLargestRequiredValue = 0;
            var $theTable = $(".warehouse-pricing table");
            var template = templates.getTemplate("warehouse-pricing-row");
            for (var wcDateString in storageProfile) {
                var rowObject = {}
                var sp = storageProfile[wcDateString];
                rowObject["wcDate"] = wcDateString;
                rowObject["palletsRequired"] = sp.numPallets;
                if (sp.totalPrice === null || sp.totalPrice === undefined || isNaN(sp.totalPrice)){
                    rowObject["totalPrice"] = 'N/A'
                } else {
                    rowObject["totalPrice"] = sp.totalPrice;
                }
                newLargestRequiredValue = Math.max(newLargestRequiredValue, sp.numPallets);
                rowObject["numPalletsStored"] = sp.numPalletsStored;
                var fits = rowObject["palletsRequired"] <= rowObject["numPalletsStored"];
                var extraCSSClass = fits ? "full " : "not-full ";
                rowObject["barText"] = fits ? "OK" : rowObject["numPalletsStored"];
                rowObject["cssClass"] = "bar " + extraCSSClass;
                rowObject["price"] = sp.highestPriceOfAnyStorageUsed.price ? Number(sp.highestPriceOfAnyStorageUsed.price).toFixed(2) : "N/A";
                if (sp.totalHandlingCharge > 0) {
                    rowObject["charge"] = sp.highestPriceOfAnyStorageUsed.charge ? Number(sp.highestPriceOfAnyStorageUsed.charge).toFixed(2) : "N/A";
                } else {
                    rowObject["charge"] = "";
                }
                
                var $tr = $(".warehouse-pricing table").find("td[data-week-commencing='" + wcDateString + "']").closest('tr');
                var row = template.bind(rowObject);
                if (wcDateOfRowThatChanged == wcDateString) {
                    row.addClass("animated");
                }
                row.insertAfter($tr);
                $tr.remove();
                
               
            }
            $theTable.data("max-pallets", Math.round(newLargestRequiredValue * 1.5));
            calculateAndDisplayTotal(storageProfile);
            initAvailabilityBars($theTable);
            lm.rebind($("#useageProfile-form"));
        }
        
        function showMap(){
            var $map = $('#profile-map');
            var highlightIcon = { url  : "/images/map-icon-highlight.png" };
            if(!$map.hasClass('loaded')){
                var loc1 = new google.maps.LatLng($map.data('lat'),$map.data('lng'));
                var mapOptions = {
                    center: loc1,
                    zoom: 14
                };
                var map = new google.maps.Map( $map[0], mapOptions);
                
                var markerOptions = {
                    icon: highlightIcon,
                    map:map,
                    position:loc1,
                    animation:'DROP'
                };
                var thisMarker = new google.maps.Marker(markerOptions);
                $map.addClass('loaded');
            }
        }
        
        
		initialize();
        
        $('.quote-request').find('textarea[data-loom-validators="complexTelephoneNumberNotInInput"]').blur(function(){
			if($(this).closest('.input-field').hasClass('error-complexTelephoneNumberNotInInput')){
				$(this).parent().attr('data-hint','This field cannot contain phone numbers');
			}else if(!$(this).closest('input-field').hasClass('error-complexTelephoneNumberNotInInput')){
				$(this).parent().removeAttr('data-hint');
			}
			
		});
		$('.quote-request').find('textarea[data-loom-validators="complexTelephoneNumberNotInInput"]').keyup(function(){
			if(!$(this).closest('input-field').hasClass('error-complexTelephoneNumberNotInInput')){
				$(this).parent().removeAttr('data-hint');
			}
			
		});
    }
    return Class;
});

