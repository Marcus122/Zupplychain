define(["jquery","loom/loom","loom/loomAlerts","templates/templates","jqueryPlugins/jquery.placeholder.min"], function ($,Loom,Alerts,Templates,Placeholder) {
	
    function Class() {
		var templates = new Templates();
        
        events();
        
        $(document).find('input, textarea').placeholder();
		
		function show403Popup(){
			var template = templates.getTemplate('403-popup');
			var $popup = template.bind({});
			$('body').append($popup);
			centerPopup($popup);
			
		}
		
        $(document).find('textarea').blur(function(){
            if($(this).closest('.input-field').hasClass('error-complexTelephoneNumberNotInInput')){
                $(this).parent().attr('data-hint','The description cannot contain phone numbers');
            }else if(!$(this).closest('input-field').hasClass('error-complexTelephoneNumberNotInInput')){
                $(this).parent().removeAttr('data-hint');
                if($(this).closest('.input-field').hasClass('error-emailNotInInput')){
                    $(this).parent().attr('data-hint','The description cannot contain email addresses');
                }else if(!$(this).closest('.input-field').hasClass('error-emailNotInInput')) {
                    $(this).parent().removeAttr('data-hint');
                }
            }
        });
        
        function events(){//Change
            if($(document).find(".static .open-tray-link").length > 0){
                var eve = $._data($(document).find('.static .open-tray-link')[0], 'events')
                if (!eve){
                    $(document).find(".static .open-tray-link").on("click", function(evt){//Change
                        openTray($(this));
                        if(evt.stopPropagation) evt.stopPropagation();
                        if(evt.cancelBubble!=null) evt.cancelBubble = true;
                        evt.preventDefault();
                    });
                }
            }
            $('button[name="agree-cookie-policy"]').click(function(){
                var err;
                var url = '/agree-cookie-policy';
                var $this = $(this);
                $.ajax({
                    url:url,
                    type: 'POST',
                    dataType: 'json',
                    headers: {'csrf-token':$('meta[name="csrf-token"]').attr("content")},
                    success:function(response){
                        $this.parent().remove();
                    },
                    error:function(jqXHR,textStatus,errThrown){
                        if(jqXHR.status === 403){
                            show403Popup();
                        }else{
                            err = JSON.parse(jqXHR.responseText);
                            Alerts.showErrorMessage(err);
                        }
                    }
                });
            });
        }
        
        function getQueryVariable(variable){//Change
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i<vars.length; i++){
                var pair = vars[i].split("=");
                if (pair[0] == variable) return pair[1];
            }
        }
        
        function readJSCookieVal(valName){
            var name = valName + "=";
            var cookieParts = document.cookie.split(';');
            for (var i=0; i<cookieParts.length; i++){
                var val = cookieParts[i];
                //while (val.charAt(0)==='')val = val.substring(1);
                if(val.indexOf(name)===0)return val.substring(name.length,val.length);
            }
            return '';
        }
		
		function centerPopup($element){
			var top;
			var $window = $(window);
			var diff = $window.height() - $element.height();
			var top = diff < 0 ? $window.scrollTop() + 25 : $window.scrollTop() + diff/2;
			//var top = (screen.height/2) - (window.screen.availHeight/2);
			if(top > 100){
				top-=50;
			}					
			$element.css({
				top:top
			});
		}
        
        function fileAPISupported(){ //Change
            return $("<input type='file'>").get(0).files !== undefined;
        }
		
		function showRegistrationExample($this,shouldCenterPopup){
			var template = templates.getTemplate('video-popup');
			var $popup = template.bind({});
			$('body').append($popup);
			if(centerPopup){
				centerPopup($popup);
			}
			$($popup).removeClass('hidden');
			$popup.find('source').attr('src', $this.data('url'));
			$popup.find('source').attr('type', 'video/' + $this.data('url').split('.')[1]);
			if($this.attr('id') === 'reg-help-bubble' ){
				$this.addClass('hidden');
			}
		}
		
		function disableButtonsOnAjax(){
			var buttons = $('button[data-disabled-on-ajax="true"]');
			for (var i=0; i<buttons.length; i++){
				$(buttons[i]).attr('disabled','disabled');
			}
		}
		
		function enableButtonsOnAjaxCompletion(){
			var buttons = $('button[data-disabled-on-ajax="true"]');
			for (var i=0; i<buttons.length; i++){
				$(buttons[i]).removeAttr('disabled');
			}
		}
        
        function openTray($linkThatWasClicked) {//Change
            $($linkThatWasClicked.parent().find(".tray")[0]).toggleClass("open");
            $linkThatWasClicked.toggleClass("open");
            $($linkThatWasClicked.parent().find(".tray")[0]).find('div.main').removeClass('hidden');
            //scrollToPos('.trays');
        }
		
		return {
			show403Popup:show403Popup,
			centerPopup:centerPopup,
			disableButtonsOnAjax:disableButtonsOnAjax,
			enableButtonsOnAjaxCompletion:enableButtonsOnAjaxCompletion,
			showRegistrationExample:showRegistrationExample,
            openTray:openTray,//Change
            getQueryVariable:getQueryVariable,//Change
            fileAPISupported:fileAPISupported,//Change
            readJSCookieVal:readJSCookieVal//Change
		}
	}
	
	return Class;
	
});