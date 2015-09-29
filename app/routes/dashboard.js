var warehouses = require("../controllers/warehouses.js");
var warehouseContacts = require("../controllers/warehouse-contacts.js")

var handler = function(app) {
	app.get('/dashboard', checkForLogon, function(req,res){
		req.data.warehouses = warehouses.warehouse_by_user(req.data.user,function(err,warehouses){
			if (!err){
				req.data.warehouses = warehouses;
			}else{
				req.data.warehouses = [];
			}
			console.log(req.data);
			res.render("dashboard",req.data);
		})
	});
	
	app.post('/update-contacts', function(req,res){
		warehouses.load(req,res,function(err,warehouse){
			if (!err){
				warehouseContacts.createWarehouseContacts(warehouse,req.body.masterContacts,req.bosy.contacts,function(err){
					if(!err){
						setResponse('Contacts Saved');
					}else{
						setResponse("Contactts not saved");
					}
				})
			}else{
				setResponse('Warehouse Not Found');
			}
		},req.body['warehouse-id']);
	});
	
};

function checkForLogon(req,res,next){
	if(req.data.user.active) return next();
	res.redirect('/');
}

function setResponse(err,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}

module.exports = handler;