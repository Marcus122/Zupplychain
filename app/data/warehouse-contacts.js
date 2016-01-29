'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	warehouse: { type: Schema.ObjectId, ref: 'warehouse' },
	enquiresController: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0}
	}],
	transportCoordinator: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0}
	}],
	goodsIn: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0}
	}],
	pickingDispatch: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0}
	}],
	invoiceController: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0}
	}],
	creditController: [{ 
		user: {type: Schema.ObjectId, ref: 'users'},
		sortOrder:{type:Number,default:0} 
	}],
	contactsDeletedAt: {type: Date},
};

var warehouseContactsSchema = new Schema(fields,{ collection: 'warehouseContacts' });

warehouseContactsSchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	},
	loadWarehousesContactsByACOrEC: function(userId,cb){
    	this.find({"enquiresController.user":{$in:[userId]}}).exec(cb);
  	},
	removeByWarehouse: function(warehouse,cb){
		this.find({warehouse: warehouse}).remove().exec(cb);
	},
	loadByUser: function(userId,cb){
		this.find({$or:[{"enquiresController.user":{$in:[userId]}},{"creditController.user":{$in:[userId]}},{"invoiceController.user":{$in:[userId]}},{"pickingDispatch.user":{$in:[userId]}},{"goodsIn.user":{$in:[userId]}},{"transportCoordinator.user":{$in:[userId]}}]})
		.exec(cb);
	},
	deleteWhContact: function(id,users,contactType,cb){
		// var object = {};
		// object[contactType] = user;
		// this.update({_id:id},{$pull:object}).exec(cb);
		this.findOne({_id:id},function(err,result){
			var deletedCounter = 0;
			var deleteIndexes = [];
			if(err){
				cb(err);
			}else{
                for (var i = 0; i<users.length; i++){
                    for (var j = 0; j<result[contactType].length; j++){
                        if (result[contactType][j]['user'].equals(mongoose.Types.ObjectId(users[i]))){
                            //result[contactType].splice(index,1);
                            deleteIndexes.push(j);
                            deletedCounter ++;
                        }else{
                            result[contactType][j]['sortOrder'] -= deletedCounter;
                        }
                    }
                }
				for (var i = 0; i<deleteIndexes.length; i++){
					result[contactType].splice(deleteIndexes[i],1);
				    if (deleteIndexes[i+1] > deleteIndexes[i]){
                        deleteIndexes[i+1] --;
                    }
                }
				//result[contactType].pull(user);
				if (result.contactsDeletedAt === undefined || (Date.now() - Date.parse(result.contactsDeletedAt)) > 7){
					result.contactsDeletedAt = Date.now();
				}
				result.save(function(err,result){
					cb(err,result);
				});
			}
		})
		
	},
	updateContactsdeletedAt: function(id,cb){
		this.update({_id:id},{contactsDeletedAt:Date.now()}).exec(cb);
	}
}

module.exports = mongoose.model('warehouseContacts',warehouseContactsSchema);