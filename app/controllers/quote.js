var Quote = require("../data/quote.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
    
exports.addOfferData = function(quoteId, offerData, cb) {
    Quote.update({"_id" : quoteId}, { $set: { "offerData": offerData }}, {},cb);
}

exports.updateTransportData = function(quoteId,transport,cb){
    Quote.update({"_id" : quoteId}, { $set: { "transport": transport }}, {},cb);
}

exports.updateComments = function(quoteId,comment,commentType,cb){
    var $set = {$set:{}};
    $set.$set['comments.' + commentType] = comment;
    Quote.update({"_id" : quoteId}, $set, {},cb);
}

exports.createQuote = function(formData,user,warehouseId,storageProfile,search,cb) {
    var quote = {};
    
    quote.user = user._id;
    quote.warehouse = warehouseId;
    quote.storageProfile = storageProfile;
    quote.search =  mongoose.Types.ObjectId(search._id); //search._id;
    
    quote.userData = {};
    quote.userData.name = formData.name;
    quote.userData.companyName = formData.companyName;
    quote.userData.location = formData.location;
    quote.userData.position = formData.position;
    quote.userData.email = formData.email;
    quote.userData.telephone = formData.telephone;
    quote.userData.mobile = formData.mobile;
    quote.userData.website = formData.website;
    quote.userData.transport = formData.transport;
    
    quote.comments = {};
    quote.comments.quotationRequest = formData["further-comments"];
    
    quote.transport = {};
    quote.transport.type = formData.transport;
    quote.transport.dispatchLocation = formData.dispatchLocation
    
    var myQuote = new Quote(quote);
    //myQuote.markModified('userData');
    myQuote.save(cb);
}

exports.load = function(req,res,next,id) {
	Quote.load(id,function(err,quote){
		if(err || !quote){
            console.log("failed to load quote");
			return next(new Error('not found'));
            
		}else{
			//Check warehouse is for user
			req.quote = quote;
			return next();
		}
	});
};

exports.getById = function(id, cb) {
    Quote.load(id,function(err,quote){
		if(err || !quote){
			return cb(new Error('not found'));
		}else{
			return cb(false, quote);
		}
	});
}
