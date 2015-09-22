// var mongoose = require('mongoose'),
// 	Schema = mongoose.Schema,
// 	ObjectId = Schema.ObjectId;
// 	
// var fields = {
// 	user: { type: Schema.ObjectId, ref: 'users' },
// 	warehouse: { type: Schema.ObjectId, ref: 'warehouse' },
// 	finalPayment: { type: Number },
// 	prepaymentRequired: { type: Number },
// 	paymentType: { type: Number },
// 	manualPayment: { type: String },
// 	paymentTerms: { type: Number }
// }
// 
// var userWhPaymentDefSchema = new Schema(fields);
// 
// userWhPaymentDefSchema.statics = {
// 	load: function(id, cb)
// }