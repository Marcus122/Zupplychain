var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	user: { type: Schema.ObjectId, ref: 'users' },
	warehouse: { type: Schema.ObjectId, ref: 'warehouse' },
	validTo: { type: Date },
	validFrom: { type: Date }
}

var userWarehouseSchema = new Schema(fields);

userWarehouseSchema.statics = {
	load: function (id,cb){
		this.findOne({ _id : id })
			
	       .exec(cb);
	},
	loadByUser: function(user,cb){
		this.find({'user': user._id}, function (err,docs){
			cb(err,docs);
		})
	},
	loadByWarehouse: function(warehouse,cb){
		this.find({'warehouse':warehouse._id})
			
			.exec(cb);
	},
	removeByUser: function(user,cb){
		this.find({'user': user._id}).remove().exec(cb);
	},
	remove: function(id,cb){
		this.find({_id: id}).remove()
			.exec(cb);
	}
}

module.exports = mongoose.model('userWarehouses', userWarehouseSchema);