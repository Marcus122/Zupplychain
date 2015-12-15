define(["jquery","loom/loom","loom/loomAlerts","templates/templates"], function ($,Loom,Alerts,Templates) {
	
    function Class() {
		var templates = new Templates();
		
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
		
		return {
			show403Popup:show403Popup,
			centerPopup:centerPopup,
			disableButtonsOnAjax:disableButtonsOnAjax,
			enableButtonsOnAjaxCompletion:enableButtonsOnAjaxCompletion,
			showRegistrationExample:showRegistrationExample
		}
	}
	
	return Class;
	
});