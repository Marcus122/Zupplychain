define(["jquery"],function($){
	
		/*
        
        Super simple alert library that simply shows a message and has it fadeout.
        The styling of the different types of message is obviously handled in the css.
        TODO: add dismissable dialouges and Confirm dialogues that take callbacks.
        
        
        */
        
        function showConfirmMessage(message, onConfirm, options) {
            cleanUpDom();
            var message = $("<div class='loom-alert loom-alert-with-controls confirm'><p>" + message + "<br/><br/><b>Are you sure you wish to continue?</b></p></div>");
            var controls = $("<div class='controls'><button class='secondary cancel mini'>cancel</button><button class='primary confirm mini go' >confirm</button></div>");
            message.append(controls);
            $(document.body).append(message);
            $(".loom-alert .controls .confirm").click(function() {onConfirm();message.fadeOut();});
            $(".loom-alert .controls .cancel").click(function() {message.fadeOut();});
        }
        
        //"choices = [ {label : "continue", callback : somefunc}, {label : "continue", callback : somefunc, class : "primary"}  ]  "
        function showChoiceMessage(message, choices) {
            var message = $("<div class='loom-alert confirm loom-alert-with-controls'><p>" + message + "</p></div>");
            var numChoices = choices.length;
            var controls = $("<div class='controls'></div>");
            for (var i = 0; i < numChoices; i++) {
                var cssClass = choices[i]["class"] || "";
                var label = choices[i].label;
                var callback = choices[i].callback;
                var button = "<button class='" + cssClass + "'>" + label + "</button>";
                button.click(function() { callback(); });
                controls.append(button);
            }
            message.append(controls);
            $(document.body).append(message);
        }
        
        function showSuccessMessage(message, options) {
            cleanUpDom();
            showMessage("success", message, options);
        }
        
        function showErrorMessage(message, options) {
            cleanUpDom();
            showMessage("error", message, options);
        }
        
        function showPersistentErrorMessage(message, options) {
            cleanUpDom();
            var message = $("<div class='loom-alert loom-alert-with-controls error'><p>" + message + "</p></div>");
            var controls = $("<div class='controls'><button class='secondary mini' >OK</button></div>");
            message.append(controls);
            $(document.body).append(message);
            //should be controls.find(.confirm)?
            $(".loom-alert .controls button").click(function() {message.fadeOut();});
        }
        
        function showPersistentSuccessMessage(message, options) {
            cleanUpDom();
            var message = $("<div class='loom-alert loom-alert-with-controls success'><p>" + message + "</p></div>");
            var controls = $("<div class='controls'><button class='secondary mini' >OK</button></div>");
            message.append(controls);
            $(document.body).append(message);
            //should be controls.find(.confirm)?
            $(".loom-alert .controls button").click(function() {message.fadeOut();});
        }
		
        function showInfoMessage(message, options) {
            showMessage("info", message, options);
        }
        
        function showMessage(messageClass, message, options) {
            cleanUpDom();
            var defaults = {
                onComplete : function(){;},
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
            $(".loom-alert:not(visible)").not("#wait").remove();
        }
        
		return {
            showSuccessMessage:showSuccessMessage,
            showErrorMessage:showErrorMessage,
            showInfoMessage:showInfoMessage,
            showConfirmMessage:showConfirmMessage,
            showPersistentErrorMessage:showPersistentErrorMessage,
            showPersistentSuccessMessage:showPersistentSuccessMessage
		}
	
});