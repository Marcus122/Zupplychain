define(["jquery","./Datasource", "./Pager"],function($,Datasource,Pager){

    // MODEL OBJECT
    return function Class($table, _config) {
		
	var config = _config ? _config : {};
	var $tableElement = $table;
    var $rowContainer = $table.find("tbody");
	var datasource;
	var _ascending = 'A';
	var _descending = 'D';
    var pager;
		
    var NUM_PER_PAGE_ATTRIBUTE = "data-loom-num-per-page";
	
	var REMEMBER_SORT = "data-loom-remember-sort";
	
	var DEFAULT_SORT_TYPE = "data-loom-default-sort-type";
	var DEFAULT_SORT_FIELD = "data-loom-default-sort-field"
        
	var DESCENDING_CLASS =  config.descendingClass ? config.descendingClass : 'descending';
	var ASCENDING_CLASS =  config.ascendingClass ? config.ascendingClass : 'ascending';
	var FIRST_SORT = config.firstSort ? config.firstSort : _ascending;
        // Form level config options.
	if(config.fields === undefined) config.fields={};
		
	populateDatasource();
	setEvents();
    setUpPaging();
    sortIfDefaultOrSavedSortOrder();
        
        function sortIfDefaultOrSavedSortOrder() {
            var savedSortOrder = loadLastSortFromLocalStorage();
			var rememberSort = $tableElement.attr(REMEMBER_SORT) == "true";
			var defaultSortType;
			var defaultSortField;
            if (!savedSortOrder || !rememberSort) {
				defaultSortType = $tableElement.attr(DEFAULT_SORT_TYPE);
				defaultSortField = $tableElement.attr(DEFAULT_SORT_FIELD);
				if(defaultSortType && defaultSortField){
					doDefaultSortAndUpdateHeading(defaultSortField, defaultSortType)//If we don't want a saved sort sort by the deafult type if there is one
				}
                return;
            }
            var savedAsObj = JSON.parse(savedSortOrder);
            var sortBy = savedAsObj.sortBy;
            var field = savedAsObj.field;
            sortAndUpdateHeadings(field, sortBy);
        }
        
        function setUpPaging() {
            var numPerPage = getNumPerPage();
            pager = new Pager($rowContainer, $tableElement.parent(), datasource, numPerPage);
        }
        
        function getNumPerPage() {
            var numPerPage = 0;
            var numPerPageValue = $tableElement.attr(NUM_PER_PAGE_ATTRIBUTE);
            numPerPage = numPerPageValue ? parseInt(numPerPageValue) : 0;
            numPerPage = isNaN(numPerPage) ? 0 : numPerPage;
            return numPerPage;
        }
		
	function doDefaultSortAndUpdateHeading(field,sortBy){
		if(sortBy === ASCENDING_CLASS){
			sortBy = _ascending;
		}
		if(sortBy === DESCENDING_CLASS){
			sortBy = _descending;
		};
		sortAndUpdateHeadings(field, sortBy)
	}
        
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
		sortAndUpdateHeadings(field, sortBy)
	}
    function sortAndUpdateHeadings(field, sortBy){
        var $cell = $tableElement.find("th[data-field='" + field + "']");
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
        storeLastSortInLocalStorage(field, sortBy);
		sort(field,sortBy);
        pager.resetToFirstPage();
    }
    function storeLastSortInLocalStorage(field, sortBy) {
        if (!supports_html5_storage) {
            return;
        }
        var tableId = $tableElement.attr("id") ;
        if (!tableId) {
            return;
        }
        var obj = JSON.stringify({"field" : field, "sortBy" : sortBy});
        localStorage.setItem("loomTable#" + tableId ,obj);
    }
    function loadLastSortFromLocalStorage() {
        if (!supports_html5_storage) {
            return;
        }
        var tableId = $tableElement.attr("id") ;
        if (!tableId) {
            return;
        }
        return localStorage.getItem("loomTable#" + tableId);
    }
    
	function setEvents(){
		$table.off("click.loomSort").on("click.loomSort","thead th",function(){
			doSort($(this));
		});
	}
	function sort(field,sortDirection,cb){
		datasource.sort(field,sortDirection);
		var items = datasource.getRows();
		draw(items);
		$table.trigger('loomSort');
		if(cb) cb();
	}
	function filter(field,value,cb){
		var items = datasource.filter(field,value);
		draw(items);
		if(cb) cb();
	        pager.refreshAll();
	}
	function draw(items){
		var $tbody = $rowContainer;
		$tbody.empty();
		for(var i=0;i<items.length;i++){
			$tbody.append(items[i].getElement());
		}
	}
	function reset(){
		draw(datasource.getRows());
	}
    function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }   
	
	return {
		sort:sort,
		filter:filter,
		reset:reset
	}
    }
});
