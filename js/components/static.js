define(["jquery","components/global"],function($,Gloabl){
	function Class(){
		
		var global = new Gloabl();
		
		$('button[data-action="view-reg-example"]').click(function(){
			global.showRegistrationExample($(this),true);
		});
		
		$(document).on("click",".popup-window .close",function(){
			$(this).closest('.popup-window').remove();
		});
		
	}
	
	return Class;
});