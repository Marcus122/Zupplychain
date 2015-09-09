// "use strict";
// var user = require("../controllers/users.js"),
// warehouse = require("../controllers/warehouses.js"),
// storage = require("../controllers/storage.js"),
// local = require("../local.config.js"),
// search = require("../controllers/search.js"),
// quote = require("../controllers/quote.js"),
// async = require("async"),
// Utils = require("../utils.js");
// 
// var handler = function(app) {
// 	app.param('warehouse_id', warehouse.load);
//     app.param('quote_id', quote.load);
// 	
//     app.get("/quotation-request/:warehouse_id", quotationRequest);
//     app.get("/quotation-request-confirm/:quote_id", createQuoteConfirm);
//     app.post("/quotation-request/", createQuote);
//     
//     app.get("/provider-offer/:quote_id", providerOffer);
//     app.post("/provider-offer", updateQuote);
//     app.get("/provider-offer-confirm/:quote_id", providerOfferConfirm);
//     
//     app.get("/provider-offer-reply/:quote_id", providerOfferReply);
//     app.post("/provider-offer-reply", updateQuoteReply);
//     app.get("/provider-offer-reply-confirm", providerOfferConfirmReply);
//     
//     app.get("/provider-confirm-contract/:quote_id", providerConfirmContract);
//     app.post("/provider-confirm-contract", confirmContract);
//     app.get("/contract-confirmed", contractConfirmed);
// };
// 
// function providerOfferConfirmReply(req,res) {
//     var quoteId = req.params.quote_id;
//     //at this point we can send the email.
//     res.render("provider-offer-reply-confirm", req.data);
// }
// 
// function updateQuoteReply(req,res) {
//     //update the quote.
//     res.writeHead(200, {"Content-Type": "application/json"});
//     res.end(JSON.stringify({"error" : false, "redirectURL" : "/provider-offer-reply-confirm"}));  
// }
// 
// function providerOfferReply(req,res) {
//     req.data.config = local.config;
//     req.data.page = 'provider-offer-reply';
//     req.data.quote = req.quote.toObject();
//     res.render("provider-offer-reply",req.data);
// }
// 
// 
// function providerOfferConfirm(req,res) {
//     var quoteId = req.params.quote_id;
//     //at this point we can send the email.
//     res.render("provider-offer-confirm", req.data);
// }
// 
// function updateQuote(req,res) {
//     var quoteId = req.body.quoteId;
//     var offerData = {};
//     offerData.paymentTerms = req.body.paymentTerms;
//     offerData.paymentType = req.body.paymentType;
//     offerData.prepaymentRequired = req.body.prepaymentRequired;
//     offerData.finalPayment = req.body.finalPayment;
//     quote.addOfferData(quoteId,offerData, function(err, quote) {
//             if (!err) {
//                 res.writeHead(200, {"Content-Type": "application/json"});
//                 res.end(JSON.stringify({"error" : false, "redirectURL" : "/provider-offer-confirm/" + quoteId }) + "\n");  
//             } else {
//                 console.log("error creating quote");
//                 setErrorResponse(err,res);
//             }
//     }); 
// }
// 
// function providerOffer(req,res) {
//     
//     req.data.config = local.config;
//     req.data.quote = req.quote.toObject();
//     req.data.page = 'provider-offer';
//     console.log("quote that was loaded:");
//     console.log(req.data.quote);
//     // req.data.quote.storages = [];
//     // var storage = {};
//     // for (var key in req.data.quote.storageProfile){
//     //     if(req.data.quote.storageProfile.hasOwnProperty(key)){
//     //         storage.key = [];
//     //         for (var i = 0; i<req.data.quote.storageProfile[key].storages.length; i++){
//     //             var chosenStorage = storage.load(req,res,null,req.data.quote.storageProfile[key].storages[i]._id)
//     //              storage.key.push(storage.load(req,res,null,req.data.quote.storageProfile[key].storages[i]._id));
//     //         }
//     //     }
//     // }
//     res.render("provider-offer",req.data);
// }
// 
// function createQuote(req,res) {
//     warehouse.getById(req.body.warehouseId, function(err, warehouse){
//         if (err) {
//              setErrorResponse(err,res);
//              return;
//         }
//             req.data.warehouse = warehouse;
//             if (!warehouse) {
//                 console.log("no warehouse");
//             }
//             if (req.session.whSC && req.session.whSC.sc && req.session.whSC.sc.length > 0) {
//                 req.data.minDurationOptions = local.config.minDurationOptions;
//                 req.data.temperatures = local.config.temperatures;
//                 var query = search.getFromSession(req, function(err, query){
//                     if (!err) {
//                         req.data.warehouse.generateStorageProfile(query);
//                         var storageProfile = req.data.warehouse.storageProfile
//                         search.getFromSession(req, function(err, searchFromSession) {
//                             if (!err) {
//                                 quote.createQuote(req.body, req.data.user, req.body.warehouseId, storageProfile,  searchFromSession, function(err, result){
//                                     if (!err) {
//                                       if (req.session.whSC.chosenWHs === undefined){
//                                           req.session.chosenWHs = [req.data.warehouse.id];
//                                       }else{
//                                           req.session.whSC.chosenWHs.push(req.data.warehouse.id);
//                                         }
//                                        res.writeHead(200, {"Content-Type": "application/json"});
//                                         var quoteId = result._id;
//                                         res.end(JSON.stringify({"error" : false, "redirectURL" : "/quotation-request-confirm/" + quoteId }) + "\n");  
//                                     } else {
//                                         console.log("error creating quote");
//                                         setErrorResponse(err,res);
//                                     }
//                                 });
//                             } else {
//                                 console.log("error creating quote, no search");
//                                 setErrorResponse(err,res);
//                                 return;
//                             }
//                         });
//                     } else {
//                          console.log("error creating quote");
//                          setErrorResponse(err,res);
//                     }
//                     
//                 });
//             }
//     });    
// }
// 
// function quotationRequest(req,res) {
//     req.data.warehouse = req.warehouse;
//     req.data.page = 'quotation-request';
//     if (req.session.whSC && req.session.whSC.sc && req.session.whSC.sc.length > 0) {
//         req.data.minDurationOptions = local.config.minDurationOptions;
//         req.data.temperatures = local.config.temperatures;
//         var query = search.getFromSession(req, function(err, query){
//             if (!err) {
//                 req.data.warehouse.generateStorageProfile(query);
//             }
//             res.render("quotation-request",req.data);
//         });
//     }
// }
// 
// function providerConfirmContract(req,res){
//     req.data.quote = req.quote.toObject();
//     req.data.page = 'provider-confirm-contract';
//     req.data.config = local.config;
//     res.render("provider-confirm-contract",req.data);
// }
// 
// function confirmContract(req,res) {
//     //update the quote.
//     res.writeHead(200, {"Content-Type": "application/json"});
//     res.end(JSON.stringify({"error" : false, "redirectURL" : "/contract-confirmed" }));  
// }
// 
// function contractConfirmed(req,res) {
//     res.render("contract-confirmed", req.data);
// }
// 
// function createQuoteConfirm(req,res) {
//     var quoteId = req.params.quote_id;
//     //at this point we can send the email.
//     res.render("quotation-request-confirm", req.data);
// }
// 
// function setResponse(req,res){
// 	res.writeHead(200, {"Content-Type": "application/json"});
//     var output = { error: null, data: req.warehouse.toObject({
// 		versionKey:false
// 	}) };
//     res.end(JSON.stringify(output) + "\n");
// }
// function setStorageResponse(req,res,next){
// 	if(!req.storage) next();
// 	res.writeHead(200, {"Content-Type": "application/json"});
//     var output = { error: null, data: req.storage.toObject({versionKey:false})};
//     res.end(JSON.stringify(output) + "\n");
// }
// function setErrorResponse(err,res){
// 	res.writeHead(500, {"Content-Type": "application/json"});
//     var output = { error: true, data: err };
//     res.end(JSON.stringify(output) + "\n");
// }
// module.exports = handler;
