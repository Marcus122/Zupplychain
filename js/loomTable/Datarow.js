define(["jquery","./Datafield"],function($,Datafield){
	
	return function Class(_fields,_$element,_config){
		var fields = _fields;
		var $element = _$element;
		var dataFields = [];
		var config = _config ? _config : {};
		
		populateFields();
		
		function populateFields(){
			for(var i in fields ){
				var dataField = new Datafield(i,fields[i],config[i]);
				dataFields[i] = dataField;
			}
		}
		function getField(name){
			return dataFields[name];
		}
		function getElement(){
			return $element;
		}
		function filter(field,value){
			return getField(field).filter(value);
		}
		return {
			getField:getField,
			getElement:getElement,
			filter:filter
		}
	};
});