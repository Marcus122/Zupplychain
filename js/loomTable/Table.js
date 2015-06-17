define(["jquery","./Datasource"],function($,Datasource){

	// MODEL OBJECT
	return function Class($table, _config) {
		
		var config = _config ? _config : {};
		var $tableElement = $table;
		var datasource;
		var _ascending = 'A';
		var _descending = 'D';
		
		var DESCENDING_CLASS =  config.descendingClass ? config.descendingClass : 'descending';
		var ASCENDING_CLASS =  config.ascendingClass ? config.ascendingClass : 'ascending';
		var FIRST_SORT = config.firstSort ? config.firstSort : _ascending;
        // Form level config options.
		if(config.fields === undefined) config.fields={};
		
		populateDatasource();
		setEvents();
		
		function populateDatasource(){
			datasource = new Datasource($table.attr('id'),config);
			$tableElement.find('tbody tr').each(function(){
				var $row = $(this);
				//Set up datarow
				var datarow = {};
				$row.find('td').each(function(){
					var $col = $(this);
					if(!$col.data('field')) return; //no field then continue
					datarow[$col.data('field')] = $col;
				});
				datasource.addRow(datarow,$row);
			});
		}
		function doSort($cell){
			var field = $cell.data('field');
			if(!field) return;
			var sortBy = FIRST_SORT;
			if($cell.hasClass(DESCENDING_CLASS)){
				sortBy = _ascending;
			}
			if($cell.hasClass(ASCENDING_CLASS)){
				sortBy = _descending;
			};
			$table.find('thead th').removeClass(ASCENDING_CLASS);
			$table.find('thead th').removeClass(DESCENDING_CLASS);
			switch(sortBy){
				case _ascending:
					$cell.addClass(ASCENDING_CLASS);
					break;
				case _descending:
					$cell.addClass(DESCENDING_CLASS);
					break;
			}
			sort(field,sortBy);
		}
		function setEvents(){
			$table.on("click","thead th",function(){
				doSort($(this));
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
			var $tbody = $table.find('tbody');
			$tbody.empty();
			for(var i=0;i<items.length;i++){
				$tbody.append(items[i].getElement());
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