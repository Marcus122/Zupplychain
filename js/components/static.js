define(["jquery","components/global","jqueryPlugins/jquery.scrollTo.min"],function($,Gloabl,Scroll){
	function Class(){
		
		var global = new Gloabl();
		
		$('button[data-action="view-reg-example"]').click(function(){
			global.showRegistrationExample($(this),true);
		});
		
		$(document).on("click",".popup-window .close",function(){
			$(this).closest('.popup-window').remove();
		});
        
        $(document).on('click','a[data-scroll-to-hash="true"]',function(e){//Change
            e.preventDefault();
            var href = $(this).attr('href');
            $.scrollTo(href, {duration : 600, offset : -110 });
        });
		
	}
	
	return Class;
});