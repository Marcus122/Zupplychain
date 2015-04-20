define(["jquery", "./template"],function($, Template){
	
    //singleton.
    var instance;
    
	return function Class(_config) {
		var config = _config;
		if(!config) config = {};
        if (instance) {
            return instance;
        }
		var defaultConfig = {
			bind: 'bind',
			textRegex: '@.*@'
		}
		//Set any default config that is not been set
		for( i in defaultConfig ){
			if(!config[i]){
				config[i] = defaultConfig[i];
			}
		}
        
		function getTemplate(id){
			var $script = $('#' + id);
			if(!$script.length) return false;
			return new Template($script,config);
		}
        
		instance = {
			getTemplate:getTemplate
		}
        return instance;
	}
	
});