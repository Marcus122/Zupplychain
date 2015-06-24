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
							var attribute = property.replace(config.bind ,'').toLowerCase();
							var bind = $this.data(property);
							var value = getBindValue(data,bind);
							if(value != undefined){
								$this.attr(attribute,value);
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
			var inverse=false;
			if(text.substring(0,1) === "!"){
				text = text.substring(1,text.length);
				inverse=true;
			}
			//For nested object attributes
			var attrs = text.split(".");
			for( i in attrs ){
				if(Number(i)===attrs.length-1){
					return inverse ? !data[attrs[i]] : data[attrs[i]];
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