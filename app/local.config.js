exports.config = {
    db_config: {
        host: "localhost",
        // use default "port"
        poolSize: 20,
		database:"ZupplyChain"
    },
	cookie_config: {
		maxAge: 900000,
		httpOnly:false,
		secure:false
	},

    static_content: "../static/",
	
	upload_folder: __dirname + '../../images/',
	
	services: [
		"Transport / Distribution",
		"Pallet network",
		"Container Palletisation",
		"Pick & Pack",
		"Home Delivery",
		"Product Disposal",
		"Add. Product Insurance",
		"Bunded Warehouse"
	],
	specifications: [
		"Perimeter Fencing",
		"24hr security",
		"CCTV",
		"Sprinklers",
		"Narrow .. racking",
		"Outdoor storage",
		"Bulk Storage",
		"Roll in Roll unit storage"
	]
	
};