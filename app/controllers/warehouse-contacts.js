var WarehouseContacts = require("../data/warehouse-contacts.js");
var User = require ("../controllers/users.js");
exports.version = "0.1.0";

exports.updateAvailabilityController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{availabilityController:user}}).exec(cb);	
}

exports.updateEnquiresController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{enquiresController:user}}).exec(cb);	
}

exports.updateTransportCoordinator = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{transportCordinator:user}}).exec(cb);	
}

exports.updateGoodsIn = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{goodsIn:user}}).exec(cb);	
}

exports.updatePickingDispatch = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{pickingDispatch:user}}).exec(cb);	
}

exports.updateInvoiceController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{invoiceController:user}}).exec(cb);	
}

exports.updateCreditController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{creditController:user}}).exec(cb);	
}

exports.createWarehouseContacts = function(data,cb){
	var warehouseContacts = new WarehouseContacts(data);
	warehouseContacts.save(function(err,result){
		if(err){
			cb(err);
		}else{
			cb(null,result);
		}
	});
}

exports.load = function(id,cb){
	WarehouseContacts.load(id,function(err,result){
		if(err){
			cb(err);
		}else{
			cb(null,result);
		}
	})
}