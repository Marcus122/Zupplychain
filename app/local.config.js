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
    
    document_folder: __dirname + '/../docs/',
	
	upload_folders: [
         __dirname + '/../docs/',
         __dirname + '/../images/'
    ],
    
    test : "test",
    
    userTypes: [
        "user",
        "provider"
    ],
    
    companyDetails : {
        "telephone" : "01888 888 888",
        "fax" : "01888 888 888",
        "addressLine1" : "64-68 Blackburn Street",
        "addressLine2" : "Radcliffe",
        "city" : "Manchester",
        "county" : "county",
        "postcode" : "M26 2JS"
    },
    
    paymentTerms : [
        "7 days",
        "14 days",
        "28 days"
    ],
    
    prepaymentRequired : [
        "None",
        "1 Week in Advance",
        "2 Weeks in Advance",
        "4 Weeks in Advance"
    ],
    
    finalPayment : [
        "To Agreed Terms",
        "Unknown",
        "In Full"
    ],
    
     paymentTypes : [
        "Invoice",
        "credit card",
        "BACS transfer"
    ],
	
	services: [
		"Transport / Distribution",
		"Pallet Network Member",
		"Container De-stuffing",
		"Pick & Pack",
		"Home Delivery",
		"Additional Insurance"
	],
	specifications: [
        "Perimeter Fencing",
        "24hr Security",
		"CCTV",
		"Sprinklers",
		"Outdoor Storage",
		"Bulk Storage"	
	],
    
    palletTypes : {
        0 : "Any",
        1 : "Standard Two way (1mx1.2m)",
        2 : "Standard 4 way (1mx1.2m)",
        3 : "Euro (0.8mx1.2m)",
        4 : "1.2mx1.2m", 
        5 : "0.8mx0.6m",
        6 : "Other" 
    },
    
    temperatures : { // miss out 0 as we'll code for zero being a wild card.
        1 : "Ambient",
        2 : "Chilled",
        3 : "Frozen",
        4 : "Outside",
        5 : "Bonded"
    },
    
    minDurationOptions : { // numWeeks : textDescription
        1   : "1 week",
        2  : "2 weeks",
        3  : "3 weeks",
        4  : "1 month",
        6  : "6 weeks",
        8  : "2 months",
        12 : "3 months",
        16 :  "4 months",
        20 : "5 months",
        26 : "6 months",
        38 : "9 months",
        52 : "12 months"
    },
    
    transport : [
        "Arrange Own Transport",
        "Get Quote From Storage Provider"
    ],
    
    acceptStatus : {
        true : "Accepted",
        false : "Declined"
    }
};