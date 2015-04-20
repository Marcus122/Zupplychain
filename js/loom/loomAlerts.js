define(["jquery"],function($){
	
		/*
        
        Super simple alert library that simply shows a message and has it fadeout.
        The styling of the different types of message is obviously handled in the css.
        TODO: add dismissable dialouges and Confirm dialogues that take callbacks.
        
        
        */
        
        function showSuccessMessage(message, options) {
            showMessage("success", message, options);
        }
        
        function showErrorMessage(message, options) {
            showMessage("error", message, options);
        }
		
        function showInfoMessage(message, options) {
            showMessage("info", message, options);
        }
        
        function showMessage(messageClass, message, options) {
            cleanUpDom();
            var defaults = {
                onComplete : $(),
                fadeOutTime : 600,
                preFadeOutTime : 500,
                noFadeOut : false
            }
            var settings = $.extend(defaults, options);
            
            var message = $("<div class='loom-alert " + messageClass + "'><p>" + message + "</p></div>");
            $(document.body).append(message);
            if (settings.noFadeOut) {
                settings.onComplete(message);
                return;
            }
            
            
            setTimeout( function(){
                message.fadeOut(settings.fadeOutTime, function(){settings.onComplete(message);});
            },
            settings.preFadeOutTime);
        }
        
        function cleanUpDom() {
            $(".loom-alert:hidden").remove();
        }
        
		return {
            showSuccessMessage:showSuccessMessage,
            showErrorMessage:showErrorMessage,
            showInfoMessage:showInfoMessage
		}
	
});