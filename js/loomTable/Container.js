define(["jquery","./Datasource"],function($,Datasource){

	// MODEL OBJECT
	return function Class($container, _config) {
		
		var config = _config ? _config : {};
		var $containerElement = $container;
		var datasource;
		var _ascending = 'A';
		var _descending = 'D';
		
        // Form level config options.
		if(config.fields === undefined) config.fields={};
		
		populateDatasource();
		
		function populateDatasource(){
			datasource = new Datasource($containerElement.attr('id'),config);
			var selector = config.childSelector ? config.childSelector : '';
			$containerElement.children(selector).each(function(){
				var $row = $(this);
				//Set up datarow
				var datarow = {};
				$row.find('*[data-field]').each(function(){
					var $col = $(this);
					if(!$col.data('field')) return; //no field then continue
					datarow[$col.data('field')] = $col;
				});
				datasource.addRow(datarow,$row);
			});
		}	
		function sort(field,sortDirection,cb){
			datasource.sort(field,sortDirection);
			var items = datasource.getRows();
			draw(items);
			if(cb) cb();
		}
		function filter(field,value,cb){
			var items = datasource.filter(field,value);
			draw(items);
			if(cb) cb();
		}
		function draw(items){
			$containerElement.empty();
			for(var i=0;i<items.length;i++){
				$containerElement.append(items[i].getElement());
			}
		}
		function reset(){
			draw(datasource.getRows());
		}
		
		return {
			sort:sort,
			filter:filter,
			reset:reset
		}
	}
});