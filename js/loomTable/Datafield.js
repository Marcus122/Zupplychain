define(["jquery"],function($){
	
	function Datafield(_name,_$element,_config){
		this.name = _name;
		this.$element = _$element;
		this.config = _config ? _config : {};
	};
	
	Datafield.prototype.compare = function(a,b){
		if(a.getValue() < b.getValue()) return -1;
		if(a.getValue() > b.getValue()) return 1;
	}
	
	Datafield.prototype.getValue = function(){
		if(this.config.getValue && typeof this.config.getValue === "function" ){
			return this.config.getValue(this.$element);
		}else{
			return this.$element.text();
		}
	}
	Datafield.prototype.filter = function(value){
		if(this.config.filter && typeof this.config.filter === "function"){
			return this.config.filter(this.$element,value);
		}else{	
			return this.getValue().toLowerCase().indexOf(value.toLowerCase()) >= 0;
		}
	}
	// helper to handle the inheritance.   
	function inherit(o1, o2){
		o1.prototype =  new o2(); //Object.create(o2.prototype);//ie 8 falls over on create
		o1.prototype.constructor = o1;
	}
	
	 function Numeric(_name,_$element,_config) {
		Datafield.call(this,_name,_$element,_config);
	 }
	 inherit(Numeric,Datafield);
	 
	 Numeric.prototype.compare = function(a,b){
		 return Number(a.getValue())-Number(b.getValue());
	 }
	 
	 function date(_name,_$element,_config){
		Datafield.call(this,_name,_$element,_config);
	 }
	 inherit(date,Datafield);
	 date.prototype.compare = function(a,b){
		 return a.getDateObject()-b.getDateObject();
	 }
	 date.prototype.getDateObject = function(){
		  var format = this.config.format ? this.config.format : this.$element.data('format');
		  if(!format) format = 'dd/mm/yyyy';
		  var indexDay = format.indexOf('dd');
		  var indexMonth = format.indexOf('mm');
		  var indexYear = format.indexOf('yyyy');
		  var day = this.getValue().substring(indexDay,indexDay+2);
		  var month = this.getValue().substring(indexMonth,indexMonth+2);
		  var year = this.getValue().substring(indexYear,indexYear+4);
		  return new Date(year,month,day,0,0,0,0);
	 }
	 
	 function Input(_name,_$element,_config){
		Datafield.call(this,_name,_$element,_config);
	 }
	 inherit(Input,Datafield);
	 Input.prototype.getValue = function(){
		 return this.$element.find('input').val();
	 }
	
	function getDataField(_name,_$element,_config){
		
		var name = _name;
		var $element = _$element;
		var config = _config ? _config : {};
		
		var DEFAULT_TYPE = 'string';
		
		var typesToConstructors = {
			'string': Datafield,
			'date' : date,
			'number' : Numeric,
			'input': Input
		}
		var Class = typesToConstructors[DEFAULT_TYPE]; //set a default as fallback
		var type = determineType();
		if (type in  typesToConstructors) {
			Class = typesToConstructors[type];
		}
		
		var formField = new Class(_name,_$element,_config);
		return formField;
		
		function determineType(){
			if(config.type){
				return config.type;
			}
			if($element.data('type')){
				return $element.data('type');
			}
		}
	}
	return getDataField;
});