"use strict";
var user = require("../controllers/users.js"),
warehouse = require("../controllers/warehouses.js"),
storage = require("../controllers/storage.js"),
local = require("../local.config.js"),
search = require("../controllers/search.js"),
quote = require("../controllers/quote.js"),
async = require("async"),
Utils = require("../utils.js"),
userWarehouse = require("../controllers/user-warehouses.js"),
emailer = require("../controllers/emailer.js")

var handler = function(app) {
	app.param('warehouse_id', warehouse.load);
    app.param('quote_id', quote.load);
	
    app.get("/quotation-request/:warehouse_id", quotationRequest);
    app.get("/quotation-request-confirm/:quote_id", createQuoteConfirm);
    app.post("/quotation-request/", createQuote);
    
    app.get("/provider-offer/:quote_id", providerOffer);
    app.post("/provider-offer", updateQuote);
    app.get("/provider-offer-confirm/:quote_id", providerOfferConfirm);
    
    app.get("/provider-offer-reply/:quote_id", providerOfferReply);
    app.post("/provider-offer-reply", updateQuoteReply);
    app.get("/provider-offer-reply-confirm", providerOfferConfirmReply);
    
    app.get("/provider-confirm-contract/:quote_id", providerConfirmContract);
    app.post("/provider-confirm-contract", confirmContract);
    app.get("/contract-confirmed", contractConfirmed);
};

function providerOfferConfirmReply(req,res) {
    var quoteId = req.params.quote_id;
    //at this point we can send the email.
    res.render("provider-offer-reply-confirm", req.data);
}

function updateQuoteReply(req,res) {
    //update the quote.
    var quoteId = req.body.quoteId;
    var offerData = {};
    var transport = {};
    offerData.paymentTerms = req.body.paymentTerms;
    if (offerData.paymentTerms === '3'){//Other
        offerData.manualPaymentTerms = req.body["other-payment-terms"];
    }else{
        offerData.manualPaymentTerms = "";
    }
    offerData.paymentType = req.body.paymentType;
    offerData.prepaymentRequired = req.body.prepaymentRequired;
    offerData.finalPayment = req.body.finalPayment;
    offerData.paymentTermsAccepted = 'true';
    offerData.invoiceFrequency = req.body['invoice-frequency'];
    quote.addOfferData(quoteId,offerData, function(err) {
            if (!err) {
                transport.type = req.body.transportType;
                transport.dispatchLocation = req.body.dispatchLocation;
                transport.distance = req.body.distance;
                transport.quote = req.body.transportQuote;
                if (req.body["transport-terms-accepted"] === 'true'){
                    transport.transportTermsAccepted = 'true';
                }else if (req.body["transport-terms-declined"] === 'true'){
                    transport.transportTermsAccepted = 'false';
                }
                transport.providerDeclined = req.body["decline-transport-request"];
                quote.updateTransportData(quoteId,transport,function(err,transport){
                    if (!err){
                        quote.updateComments(quoteId,req.body['further-comments'],'providerOfferReply',function(err,result){
                            if(!err){
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({"error" : false, "redirectURL" : "/provider-offer-reply-confirm"})); 
                            }else{
                                console.log("error updating comments");
                                setErrorResponse(err,res);
                            }
                        });
                    }else{
                        console.log("error updating transport");
                        setErrorResponse(err,res);
                    }
                });
            }else{
                console.log("error creating quote");
                setErrorResponse(err,res);
            }
    }); 
}

function providerOfferReply(req,res) {
    req.data.config = local.config;
    req.data.page = 'provider-offer-reply';
    req.data.quote = req.quote.toObject();
    req.data.temperatures = local.config.temperatures;
    warehouse.load(req,res,function(){
        req.warehouse.generateStorageProfile(req.data.quote.search);
        req.data.quote.warehouse.storageTemps = req.warehouse.storageTemps;
        req.data.quote.warehouse.distanceFromSearch = Utils.distanceInMiles(req.data.quote.search.geo,req.data.quote.warehouse.geo)
        res.render("provider-offer-reply",req.data);
    },req.data.quote.warehouse._id);
}


function providerOfferConfirm(req,res) {
    var quoteId = req.params.quote_id;
    //at this point we can send the email.
    //emailer.sendMail(req,res,"","matthew.alton@weaveability.com","Provider Offer",function(err){
     //   if(err){
            //do something
     //   }else{
           // res.render("provider-offer-confirm", req.data);
      //  }
    //});
    res.render("provider-offer-confirm", req.data);
}

function updateQuote(req,res) {
    var quoteId = req.body.quoteId;
    var offerData = {};
    var transport = {};
    offerData.paymentTerms = req.body.paymentTerms;
    if (offerData.paymentTerms === '3'){//Other
        offerData.manualPaymentTerms = req.body["other-payment-terms"];
        if(offerData.manualPaymentTerms.substring(offerData.manualPaymentTerms.length - 4) !== 'Days' || 
        offerData.manualPaymentTerms.substring(offerData.manualPaymentTerms.length - 4) !== 'days'){
            offerData.manualPaymentTerms = offerData.manualPaymentTerms + ' days';
        }
    }else{
        offerData.manualPaymentTerms = "";
    }
    offerData.paymentType = req.body.paymentType;
    offerData.prepaymentRequired = req.body.prepaymentRequired;
    offerData.finalPayment = req.body.finalPayment;
    offerData.invoiceFrequency = req.body["invoice-frequency"];
    quote.addOfferData(quoteId,offerData, function(err) {
            if (!err) {
                transport.type = req.body.transportType;
                transport.dispatchLocation = req.body.dispatchLocation;
                transport.distance = req.body.distance;
                transport.quote = req.body.transportQuote;
                transport.providerDeclined = req.body["decline-transport-request"];
                quote.updateTransportData(quoteId,transport,function(err,transport){
                    if (!err){
                        quote.updateComments(quoteId,req.body['further-comments'],'providerOffer',function(err,result){
                            if(!err){
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({"error" : false, "redirectURL" : "/provider-offer-confirm/" + quoteId }) + "\n"); 
                            }else{
                                console.log("error updating comments");
                                setErrorResponse(err,res);
                            }
                        });
                    }else{
                        console.log("error updating transport");
                        setErrorResponse(err,res);
                    }
                });
            }else{
                console.log("error creating quote");
                setErrorResponse(err,res);
            }
    }); 
}

function providerOffer(req,res) {
        
    req.data.config = local.config;
    req.data.quote = req.quote.toObject();
    req.data.page = 'provider-offer';
    if(req.data.quote.transport.dispatchLocation){
        Utils.calculateQuickestRoadDistanceBetweenPoints(req.data.quote.transport.dispatchLocation,req.data.quote.warehouse.postcode,function(err,distance){
            if(err){
                req.data.distance = local.config.googleDistanceMatrixErrText;
            }else{
                req.data.distance = distance
            }
            storage.buildStorageNamesAndRenderPage(req,res,"provider-offer");
        });
    }else{
        storage.buildStorageNamesAndRenderPage(req,res,"provider-offer");
    } 

}

function createQuote(req,res) {
    warehouse.getById(req.body.warehouseId, function(err, warehouse){
        if (err) {
             setErrorResponse(err,res);
             return;
        }
            req.data.warehouse = warehouse;
            if (!warehouse) {
                console.log("no warehouse");
            }
            if (req.session.search && Object.keys(req.session.search).length > 0) {
                req.data.minDurationOptions = local.config.minDurationOptions;
                req.data.temperatures = local.config.temperatures;
                var query = search.getFromSession(req, function(err, query){
                    if (!err) {
                        req.data.query = query;
                        req.data.warehouse.generateStorageProfile(query);
                        var storageProfile = req.data.warehouse.storageProfile
                        search.getFromSession(req, function(err, searchFromSession) {
                            if (!err) {
                                quote.createQuote(req.body, req.data.user, req.body.warehouseId, storageProfile,  searchFromSession, function(err, result){
                                    if (!err) {
                                      if (req.session.search.chosenWHs === undefined){
                                          req.session.search.chosenWHs = [req.data.warehouse.id];
                                      }else{
                                          req.session.search.chosenWHs.push(req.data.warehouse.id);
                                        }
                                        createUserWarehouse(req.data.user.id,req.body.warehouseId,storageProfile);
                                       res.writeHead(200, {"Content-Type": "application/json"});
                                        var quoteId = result._id;
                                        res.end(JSON.stringify({"error" : false, "redirectURL" : "/quotation-request-confirm/" + quoteId }) + "\n");  
                                    } else {
                                        console.log("error creating quote");
                                        setErrorResponse(err,res);
                                    }
                                });
                            } else {
                                console.log("error creating quote, no search");
                                setErrorResponse(err,res);
                                return;
                            }
                        });
                    } else {
                         console.log("error creating quote");
                         setErrorResponse(err,res);
                    }
                    
                });
            }
    });    
}

function createUserWarehouse(userId,warehouseId,storageProfile){
    var i = 0,
        validFrom,
        validFromDate,
        validTo,
        validToDate,
        len = Object.keys(storageProfile).length;
    
    for(var key in storageProfile){
        if(storageProfile.hasOwnProperty(key)){
            if (i === 0){
                validFrom = key;
            }else if ((i+1) === len ){
                validTo = key;
            }
            i++;
        }
    }
    
    validFromDate = new Date(validFrom);
    validToDate = new Date(validTo);
    validToDate.setDate(validToDate.getDate() + 6);
    validToDate.setHours(23);
    validToDate.setMinutes(59);
    validToDate.setSeconds(59);
    
    userWarehouse.createUserWarehouse(userId,warehouseId,validToDate,validFromDate,function(err,result){
        if(err){
            console.log("Failed to create a user warehouse record");
        }else{
        }
    });
}

function quotationRequest(req,res) {
    req.data.warehouse = req.warehouse;
    req.data.page = 'quotation-request';
    if (req.session.search && Object.keys(req.session.search).length > 0) {
        req.data.minDurationOptions = local.config.minDurationOptions;
        req.data.temperatures = local.config.temperatures;
        var query = search.getFromSession(req, function(err, query){
            if (!err) {
                req.data.query = query;
                req.data.warehouse.generateStorageProfile(query);
                req.data.warehouse.distanceFromSearch = Utils.distanceInMiles(query.geo,req.data.warehouse.geo)
            }
            res.render("quotation-request",req.data);
        });
    }
}

function providerConfirmContract(req,res){
    req.data.quote = req.quote.toObject();
    req.data.page = 'provider-confirm-contract';
    req.data.config = local.config;
    storage.buildStorageNamesAndRenderPage(req,res,"provider-confirm-contract");
}

function confirmContract(req,res) {
    //update the quote.
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({"error" : false, "redirectURL" : "/contract-confirmed" }));  
}

function contractConfirmed(req,res) {
    res.render("contract-confirmed", req.data);
}

function createQuoteConfirm(req,res) {
    var quoteId = req.params.quote_id;
    //at this point we can send the email.
    res.render("quotation-request-confirm", req.data);
}

function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse.toObject({
		versionKey:false
	}) };
    res.end(JSON.stringify(output) + "\n");
}
function setStorageResponse(req,res,next){
	if(!req.storage) next();
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.storage.toObject({versionKey:false})};
    res.end(JSON.stringify(output) + "\n");
}
function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;
