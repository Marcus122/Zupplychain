define(["jquery"], function($) {
    //
    //  Filters for the template engine, invoke with "@myobject.myproperty | someFilter@"  within a script type=template tag
    //  Filters take a single string input and return the correctly formatted string.  
    //
    return {
	    currency : function(input) {
		   var asFloat = parseFloat(input,10);
		   if (isNaN(asFloat)) { return input ;}
		   return asFloat.toFixed(2);
	    },
	    toUpperCase : function(input) {
            return String(input).toUpperCase();
	    },
	    toLowerCase : function(input) {
            return String(input).toLowerCase();
	    },
        dateFormat : function(input) {
            var date = new Date(input);
            var dateString = date.toISOString();
            var yyyy = dateString.substr(0,4);
            var mm = dateString.substr(5,2);
            var dd = dateString.substr(8,2);
            return dd + "/" + mm + "/" + yyyy;            
        }
	}
});
