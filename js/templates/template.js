define(["jquery", "./filters"],function($, Filters){
	
	return function Class(_$script,_config) {
        var $script = _$script;
		var config = _config;
		var $template = $($script.html());
		var $attrElements = $();
		var $textElements = $();
	        var filters = Filters;
		
		
		function bind(data){
			//Bind all data
			//Wrap template in tag
			var $wrapper = $('<wrap>');
			$wrapper.append($script.html());
			//Remove anything that does not pass a display condition
			$wrapper.find('*').each(function(){
				var $this = $(this);
				if(!passesCondition($this,"display",data)){
					$this.remove();
				}
			});
			//First attributes
			$attrElements = getAttributeBindables($wrapper);
			$attrElements.each(function(){
				var $this = $(this);
				for (var property in $this.data()) {
					if (property.indexOf(config.bind) == 0) {
						if(passesCondition($this,property,data)){
							var attribute = property.replace(config.bind ,'');
                            //data-bind-data-my-value comes out as dataMyValue... here we just convert it back to data-my-value
                            var attributeCamelCaseToDashed = attribute.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
							var bind = $this.data(property);
							var value = getBindValue(data,bind);
							if(value != undefined){
								$this.attr(attributeCamelCaseToDashed,value);
							}
						}
					}
				}
			});
			//Now text
			$textElements = getTextBindables($wrapper);
			var regex = new RegExp(config.textRegex,"g");
			$textElements.each(function(){
				var $this = $(this);
				var binds = $this.text().match(regex);
				for(var i=0;i<binds.length;i++){
					var bind = binds[i].replace(/@/g,"");
					var value = getBindValue(data,bind);
					$this.html($this.html().replace("@" + bind + "@",value));
				}
			});
			return $wrapper.children();
			
		}
		function passesCondition($element,bind,data){
			var condition = $element.data(bind+'-condition');
			if(!condition) return true; //no condition then passes
			var value = getBindValue(data,condition);
			return value ? true : false;
		}
		function getBindValue(_data,_text){
			var data=_data;
			var text = _text;
		        var inverse = getInverse(text);
		        text = removeInverse(text);
		        var thisFilter = getFilter(text);
		        text = removeFilter(text);
			//For nested object attributes
			var attrs = text.split(".");
			for( i in attrs ){
				if(Number(i)===attrs.length-1){
					var retVal = inverse ? !data[attrs[i]] : data[attrs[i]];
					return thisFilter(retVal);
				}else{
					data = data[attrs[i]];
				}
			}
		}
		function getInverse(text){
		    return text.substring(0,1) == "!";
		}
		function removeInverse(text){
		    if (text.substring(0,1) == "!"){
			return text.substring(1,text.length);
		    }
		    return text;
		}
		function getFilter(text) {
		    var nonFilter = function(input) { return input;};
		    var pipeLocation = text.indexOf("|"); 
		    if (pipeLocation == -1) {
			return nonFilter;
		    }
		    var filterString = text.substr(pipeLocation + 1, text.length - (pipeLocation + 1)).replace(/ /g,'');
		    if (filterString in filters) {
			return filters[filterString];
			}
		    return nonFilter;
		}
		function removeFilter(text) {
		    var pipeLocation = text.indexOf("|");
		    if (pipeLocation == -1) {
			return text;
		    }
		    return text.substr(0, pipeLocation).replace(/ /g,'');
		}
		function getAttributeBindables($container){
			return $container.find('*').filter(function(){
				for (var property in $(this).data()) {
					if (property.indexOf(config.bind) == 0) {
						return true;
					}
				  }
				return false;
			});
		}
		function getTextBindables($container){
			var regex = new RegExp(config.textRegex);
			return $container.find('*').filter(function(){
				var $this = $(this);
				var text = $this.clone().children().remove().end().text(); //Get only element text
				if(regex.test(text)){
					return true;
				}
				return false;
			});
		}
		function getElement(){
			return $($script.html());
		}
		return{
			bind:bind,
			getElement:getElement
		}
		
	}
});
