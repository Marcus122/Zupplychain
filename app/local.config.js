exports.config = {
    db_config: {
        host: "localhost",
        // use default "port"
        poolSize: 20,
		database:"ZupplyChain"
    },
	cookie_config: {
		maxAge: 259200, // 72 hours * 60 mins * 60s
		httpOnly:false,
		secure:false
	},

    static_content: "../static/",
	
	upload_folder: __dirname + '/../images/',
	
	services: [
		"Transport / Distribution",
		"Pallet Network Member",
		"Container De-stuffing",
		"Pick & Pack",
		"Home Delivery",
		"Product Disposal",
		"Additional Insurance",
		"Bonded Warehouse"
	],
	specifications: [
        "Perimeter Fencing",
        "24hr Security",
		"CCTV",
		"Sprinklers",
		"Narrow Aisle Racking",
		"Outdoor Storage",
        "Roll in Roll out storage",
		"Bulk Storage"	
	],
    
    palletTypes : { //maps a numeric ID to the string.
        0 : "Any",
        1 : "Standard Two way (1mx1.2m)",
        2 : "Standard 4 way (1mx1.2m)",
        3 : "Euro (0.8mx1.2m)",
        4 : "1.2mx1.2m", 
        5 : "0.8mx0.6m",
        6 : "Other" 
    },
    
    minDurationOptions : { // numDays : textDescription
        7 : "1 week",
        14 : "2 weeks",
        21 : "3 weeks",
        28 : "1 month",
        56 : "2 months",
        84 : "3 months",
        180 : "6 months",
        365 : "12 months"
    }
};