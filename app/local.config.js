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
		"Container Destaffing",
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
        "Roll in Roll out unit storage",
		"Bulk Storage"	
	],
};