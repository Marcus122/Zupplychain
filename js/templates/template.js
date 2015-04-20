define(["jquery"],function($){
	
	return function Class(_$script,_config) {
        var $script = _$script;
		var config = _config;
		var $template = $($script.html());
		var $attrElements = $();
		var $textElements = $();
		
		function bind(data){
			//Bind all data
			//Wrap template in tag
			var $wrapper = $('<wrap>');
			$wrapper.append($script.html());
			//First attributes
			$attrElements = getAttributeBindables($wrapper);
			$attrElements.each(function(){
				var $this = $(this);
				for (var property in $this.data()) {
					if (property.indexOf(config.bind) == 0) {
						if(passesCondition($this,property,data)){
							var attribute = property.replace(config.bind ,'').toLowerCase();
							var bind = $this.data(property);
							var value = getBindValue(data,bind);
							$this.attr(attribute,value);
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
					$this.text($this.text().replace("@" + bind + "@",value));
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
		function getBindValue(_data,text){
			var data=_data;
			//For nested object attributes
			var attrs = text.split(".");
			for( i in attrs ){
				if(Number(i)===attrs.length-1){
					return data[attrs[i]];
				}else{
					data = data[attrs[i]];
				}
			}
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