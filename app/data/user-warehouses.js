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
			.populate('user')
			.populate('warehouse')
			
	       .exec(cb);
	},
	loadByUser: function(user,cb){
		this.find({'user': user._id})
			.exec(cb);
	},
	loadByWarehouse: function(warehouse,cb){
		this.find({'warehouse':warehouse._id})
			.populate('user')
			.populate('warehouse')
			
			.exec(cb);
	}
}

module.exports = mongoose.model('userWarehouses', userWarehouseSchema);