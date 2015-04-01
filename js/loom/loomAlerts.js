define(["jquery"],function($){
	
		/*
        
        Super simple alert library that simple shows a message and has it fadeout.
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
            var onComplete = options ? options.onComplete : function(){;};
            var fadeOutTime = options ? options.fadeOutTime : 2300;
            var message = $("<div class='loom-alert " + messageClass + "'><p>" + message + "</p></div>");
            $(document.body).append(message);
            message.fadeOut(fadeOutTime, function(){onComplete(message);});
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