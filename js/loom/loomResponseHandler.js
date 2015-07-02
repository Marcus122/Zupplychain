define(["jquery", "loom/loomAlerts"], function($, alerts){
    
    
    return function Class(theForm) {
        //under development, commented out so not accidentally used in a production environment,
        
        /*
        var form = theForm;

        function processServerReponse(response) {
            if (shouldIgnoreResponse(response)){         
               return response;
            }
            var res = response.response;
            if (!res) { 
                return processHardError(response);
            }
            
            if (res.error) {
                res.errorType = "soft_error"; //In the case of a soft error, we still continue and process the response.
            }

            processHTML(res);
            processFieldErrors(res.meta);
            processMessage(res);
            processRedirect(res.meta);
            return res;
        }
        
        //For now we don't bother trying to handle XML responses, although this would be possible I think.
        // TODO: in future we'll have something as a flag in the config file e.g. bypass responseHandler.
        function shouldIgnoreResponse(response) {
            if (form.dataType != "json") {
                return true;
            }
        }

        function processSoftError(response){
            if (!rersponse.error) {
                return;
            }
            //this error shouldn't need any special handling, we just need to make sure that the caller knows that this is a soft_error.
        }
        
        function processHardError(response){
            var status = "";
            if (response.error == "parsererror") {
                console.log("Loom Error: error parsing the response from the server.. check your server response is well formed. Response from server should be type: " + theForm.dataType);
                
            } else if (response.error == "timeout") {
                console.log("Loom Error: the server took too long to respond and the request timed out.");
            } else if (response.error == "abort") {
                console.log("");//this could be intentional so no error logging.
            } else if (response.error == "error") {
                //there was an error on the server (401,404, 500 etc.);
                status = response.xhr.status;
                console.log("Loom Error: the server returned an error for the form post ajax request, error code was: " + status.toString() + " for URL: " + form.url.toString());
                
            } else {
                response.error = "loom_response_format_error";
                console.log("Loom response format error: no 'response' at root of object");
                
            }
            var ourErrorResponse = {};
            ourErrorResponse.error = response.error;
            ourErrorResponse.errorType = "hard_error";
            ourErrorResponse.code = status;
            return ourErrorResponse;
        }

        function processHTML(response) {
            if (!response.html || !response.meta.html_meta_entries) {
                return;
            }
            var $html = $("<div>" + response.html + "</div>");
            if($html.length > 0 && response.meta.html_meta_entries) {
               var htmlMetaEntries = response.meta.html_meta_entries;
               var lim = htmlMetaEntries.length;
               for (var i =0; i<lim;i++) {
                    var thisMetaEntry = htmlMetaEntries[i];
                    var sourceSelector = thisMetaEntry.source_selector;
                    var targetSelector = thisMetaEntry.target_selector;
                    var method = thisMetaEntry.method || "replace";
                    if (!targetSelector || !sourceSelector) {
                        console.log("Loom: error processing HTML meta entries in server response, the expected values were not present.");
                        return;
                    }
                    var $source = $html.find(sourceSelector);
                    if (thisMetaEntry.innerHTML && thisMetaEntry.innerHTML != "false"){
                        $source = $source.html();
                    }
                    var $target = $(document).find(targetSelector);
                    if (method == "replace") {
                        $target.html("");
                        $target.append($source);
                    } else {
                        if (!(method == "append" || method == "prepend")) {
                            console.log("Loom: error processing HTML meta entries in server response, invalid method name");
                            return;
                        }
                        $target[method]($source);
                    }
               }
            }
        }

        function processFieldErrors(meta) {
            if (!meta) {
                return;
            }
            var fieldErrors = meta.field_errors;
            if (!fieldErrors || fieldErrors.length < 1) {
                return;
            }
            var lim = fieldErrors.length;
            for (var i =0; i<lim;i++) {
                var thisFieldErrors = fieldErrors[i];
                fieldName = thisFieldErrors.field;
                message = thisFieldErrors.message;
                if (!fieldName || !message) {
                    continue;
                }
                var formField = form.getFieldByName(fieldName);
                if (!formField) {
                    continue;
                }
                var $messageContainer = formField.validationElement.find(".server-error");
                formField.validationElement.addClass("server-error");
                $messageContainer.html(message);
            }
        }


        function processMessage(res) {
            if (!res.meta || !res.meta.message) { return; }
            var meta = res.meta;
            //for now we just alert the message;
            var isPersistent = (meta.message.message_type == "persistent");
            var content = meta.message.content;
            if (res.error) {
                if (!isPersistent) {
                    alerts.showErrorMessage(content);
                } else {
                    alerts.showPersistentErrorMessage(content);
                }
            } else {
                if (!isPersistent) {
                    alerts.showSuccessMessage(content);
                } else {
                    alerts.showPersistentErrorMessage(content);
                    
                }
            } 
        }

        function processRedirect(meta) {
            if (!meta) { return; }
            //for now just alert the URL
            if (!meta.redirect_url) {
                return;
            }
            alert("In future you would be redirected to  " + meta.redirect_url);
        }
        
        //API
        return {
            //takes the response, and processes. Returns the response.
            processServerReponse:processServerReponse,
        }*/
    
    }

});
