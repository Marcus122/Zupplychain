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