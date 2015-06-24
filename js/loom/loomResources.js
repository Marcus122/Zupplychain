define(["jquery"],function($){
    
    /* UNTESTED CODE */

    defaultLanguage = "en-gb";
    var userLangFull = navigator.language || navigator.userLanguage; //e.g. 'en-gb'
    var userLang = userLangFull.substring(0,2); //e.g. 'en'
    
    resourceLookup = { //This is where the resources live. In future we'll probably programmatically populate this maybe via JSON from a server URL, so the resources can live on the server. if we used a script tag the browser will cache it too.
        "OK" : {
            "en-gb" : "OK",
            "fr" : "Oui"
        },
        "AddedToBasket" : {
            "en" : "Added {0} to your basket"
        }
    };

    return {
        getString : function(key) {
            if (key in resourceLookup) {
                var thisResource = resourceLookup[key];
                var theString = key; //absolute fallback;
                if (defaultLanguage in thisResource) {
                    var theString = thisResource[defaultLanguage]; //fallback, this should always succeed.
                }
                if (userLang in thisResource) { //try just language first. e.g. en
                    theString = thisResource[userLang];
                } 
                if (userLangFull in  thisResource) { //override with more specific if it's there e.g. en-gb
                    theString = thisResource[userLangFull];
                }
                return theString;
            } else {
                return key; //if all else fails return the original string.
            }
            
            //helper function needs testing.. TODO: not used at the mo.
            //Format("{0} + {0} = {1}", "one", "two")
            function StringFormat(format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function(match, number) { 
                return typeof args[number] != 'undefined'
                ? args[number] 
                : match;
                });
            }; 
        }
        //TODO: detect multiple args to getString, in which case expect a formatString from the resource lookup which we will load in the arguments to.
    }

});
