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
    
    googleDistanceMatrixErrText: "Unable to Determine Distance",
    
    document_folder: __dirname + '/../docs/',
	
	upload_folders: [
         __dirname + '/../docs/',
         __dirname + '/../images/warehouse-images/',
         __dirname + '/../tmp/'
    ],
    
    upload_folder_rel_path: [
        '/docs/',
        '/images/'
    ],
    
    test : "test",
    
    userTypes: [
        "user",
        "provider"
    ],
    
    companyDetails : {
        "telephone" : "0161 705 4326",
        "fax" : "01888 888 888",
        "email" : "info@zupplychain.com",
        "addressLine1" : "64-68 Blackburn Street",
        "addressLine2" : "Radcliffe",
        "city" : "Manchester",
        "county" : "county",
        "postcode" : "M26 2JS"
    },
    
    paymentTerms : [
        "7 days",
        "14 days",
        "28 days",
        "Other"
    ],
    
    invoiceFrequency: [
        "Weekly",
        "Monthly"
    ],
    
    prepaymentRequired : [
        "None",
        "1 Week in Advance",
        "2 Weeks in Advance",
    ],
    
    finalPayment : [
        "To Agreed Terms",
        "In Full Before Final Dispatch"
    ],
    
     paymentTypes : [
        "Invoice",
        "Credit card",
        "Direct debit",
        "BACS transfer",
        "PayPal"
    ],
	
	services: [
		"Transport / Distribution",
		"Pallet Network Member",
		"Container De-stuffing",
		"Pick & Pack",
		"Home Delivery",
	],
	specifications: [
        "Perimeter Fencing",
        "24hr Security",
		"CCTV",
		"Sprinklers",
		"Outdoor Storage",
		"Bulk Storage"	
	],
    
    // palletTypes : {
    //     0 : "Any",
    //     1 : "Standard Two way (1mx1.2m)",
    //     2 : "Standard 4 way (1mx1.2m)",
    //     3 : "Euro (0.8mx1.2m)",
    //     4 : "1.2mx1.2m", 
    //     5 : "0.8mx0.6m",
    //     6 : "Other" 
    // },
    
    palletTypes : {
        0 : "0.8w x 1.2d (euro)",
        1 : "1.0w x 1.2d",
        2 : "1.2w x 1.2d"
    },
    
    palletTypesToWidth: {
        "0.8w x 1.2d (euro)" : "0.8",
        "1.0w x 1.2d" : "1.0",
        "1.2w x 1.2d" : "1.2"
    },
    
    temperatures : { // miss out 0 as we'll code for zero being a wild card.
        1 : "Ambient",
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
    },
    
    headers: {
       "addressHeader": "Registered Address:"
    },
    
    contactUsEnquires: [
        'Register For Updates',
        'Offering Storage',
        'Looking For Space',
        'General Feedback',
        'Media Enquiries',
        'Forgot Your Password',
        'Other'
    ],
    
    authorisations:{
        all:{
            tasks:true,
            editCompany:true,
            warehouse:
            {
                warehouseDetails:true,
                storage:true,
                pricing:true,
                availability:true,
                deleteWarehouse:true,
                createWarehouse:true
            },
            contacts:
            {
                masterContacts:true,
                warehouseContacts:{
                    view:true,
                    edit:true
                }
            }
        },
        noPricing:{
            tasks:false,
            editCompany:false,
            warehouse:
            {
                warehouseDetails:true,
                storage:true,
                pricing:false,
                availability:true,
                deleteWarehouse:false,
                createWarehouse:false
            },
            contacts:{
                masterContacts:false,
                warehouseContacts:{
                    view:true,
                    edit:true,
                }
            }
        },
        accountOnly:{
            tasks:false,
            editCompany:false,
            warehouse:false,
            contacts:
            {
                masterContacts:false,
                warehouseContacts:{
                    view:true,
                    edit:false
                }
            },
        }
    },
    
    authorisationsByAccessLvl: {
      0:'all',
      1:'noPricing',
      2:'accountOnly'
    },
    
    dashboardAccessLevel:{
        'masterContact':0,
        'availabilityController':1,
        'enquiresController':1,
        'transportCoordinator':2,
        'goodsIn':2,
        'pickingAndDispatch':2,
        'invoiceController':2,
        'creditController':2   
    },
    
    registerStatus:[
        'Registered',
        'Pending',
        'Expired'   
    ]
};