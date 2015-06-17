define(["jquery","./Datarow"],function($,Datarow){
	
	return function Class(_id,_config) {
		var id = _id;
		var config = _config ? _config : {};
		var rows = [];
		var _ascending = 'A';
		var _descending = 'D';
		
		function sort(field,direction){
			rows.sort(function(a,b){
				if(config[field] && typeof config[field].compare === 'function'){
					var fieldA = a.getField(field);
					var fieldB = b.getField(field)
					return config[field].compare(fieldA.getValue(),fieldB.getValue());
				}else{
					return compare(a,b,field,direction);
				}
			});
			return rows;
		}
		function compare(a,b,field,direction){
			var fieldA = a.getField(field);
			var fieldB = b.getField(field);
			if(!fieldA || !fieldB) return;
			var result = fieldA.compare(fieldA,fieldB);
			if(direction != _ascending){
				result=result*-1;
			}
			return result;
		}
		function addRow(fields,$element){
			var row = new Datarow(fields,$element,config.fields);
			rows.push(
				row
			);
		}
		function getRows(){
			return rows;
		}
		function filter(field,value){
			return rows.filter(function(row){
				return row.filter(field,value);
			});
		}
		return {
			addRow:addRow,
			sort:sort,
			getRows:getRows,
			filter:filter
		}
	};
});