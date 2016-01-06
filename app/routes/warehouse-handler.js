"use strict";
var user = require("../controllers/users.js"),
warehouse = require("../controllers/warehouses.js"),
storage = require("../controllers/storage.js"),
local = require("../local.config.js"),
search = require("../controllers/search.js"),
quote = require("../controllers/quote.js"),
async = require("async"),
Utils = require("../utils.js"),
fh = require("../controllers/file-handler.js"),
multiparty = require('multiparty'),
company = require('../controllers/company'),
contacts = require('../controllers/warehouse-contacts.js');

var handler = function(app) {
	app.param('warehouse_id', warehouse.load);
	
	app.get('/warehouse/:warehouse_id', setResponse);
	
	app.get('/warehouse-profile/:warehouse_id', warehouseProfile );
	
	app.post('/warehouse/:warehouse_id', warehouseAuth, updateWarehouse );
	
	app.post('/warehouse', function(req, res) {
		if(req.data.user._id){ //If user is not logged in then create user
			createWarehouse(req,res,function(err,result){
				if(err){
					setErrorResponse(err,res);
				}else{
					req.warehouse = result;
					company.updateWarehouses(req.data.user.company.toObject()._id,result._id,function(err,result){
						if(err){
							setErrorResponse(err,res);
							//Maybe delete the user, warehouse and the company
						}else{
							company.updateContactsReminderSent(req.data.user.company.toObject()._id,false,function(err){
								setResponse(req,res);
							});
						}
					});
				}
			});
		}else{
			createUserAndCompany(req,res);
		}
	});
	app.post('/warehouse/:warehouse_id/storage',createStorage);
	app.post('/warehouse/:warehouse_id/storage/batch',batchStorage);
	app.param('storage_id', storage.load);
	app.post('/warehouse/:warehouse_id/storage/:storage_id', warehouseAuth,  updateStorage);
	app.get('/storage/:storage_id', setStorageResponse );
    app.post('/warehouse/:warehouse_id/volumeDiscount',updateVolumeDiscount);
    app.get("/warehouse-registration-complete/:warehouse_id", warehouseRegistrationComplete)
	app.post('/documents/upload/:warehouse_id',uploadDocument);
	app.post('/documents/delete/:warehouse_id',deleteDocumentsAndEmptyDir);
	app.post('/images/upload/:warehouse_id',uploadImage);
	app.post('/images/delete/:warehouse_id',deleteImagesAndEmptyDir);
};

var POSTCODE_NOT_FOUND = 'Postcode not Found';


function warehouseRegistrationComplete(req,res) {
    res.render("registration-complete",req.data);
}

function uploadImage(req,res){
	var form = new multiparty.Form();
	var numSuccessfullCb = 0;
	var photos = [];
	var imageExists = false;
	if (req.warehouse.photos !== undefined){
		photos = req.warehouse.photos;
	}
	fh.createDir(local.config.upload_folders[1] + req.warehouse.id,function(err){
		if(!err){
			form.parse(req, function(err,fields,files){
				for (var i in files){
					for (var j in files[i]){
						fh.renameFile(fields.tempLocation[i],local.config.upload_folders[1] + req.warehouse.id + '/' + files[i][j].originalFilename,function(err){
							if(err && err.code !== 'ENOENT'){
								//Todo some form of error handling
								setErrorResponse('Image Upload Error',res);
							}else{
								imageExists = false;
								for (var k = 0; k<photos.length; k++){
									if(photos[k].path === req.warehouse.id + '/' + files[numSuccessfullCb][j].originalFilename){
										imageExists = true;
									}
								}
								if (imageExists === false){
									photos.push({'path':req.warehouse.id + '/' + files[numSuccessfullCb][j].originalFilename})
								}
								numSuccessfullCb ++;
								if (numSuccessfullCb === Object.keys(files).length){
									warehouse.updateWarehousePhoto(req.warehouse.id,photos,function(err){
										setResponse(req,res);
									});
								}
							}
						});
					}
				}
			});
		}
	});
}

function uploadDocument(req,res){
	var form = new multiparty.Form();
	var numSuccessfulCbs = 0;
	var documents = [];
	var documentExists = false;
	if (req.warehouse.documents !== undefined){
		documents = req.warehouse.documents;
	}
	fh.createDir(local.config.upload_folders[0] + req.warehouse.id,function(err){
		if(!err){
			form.parse(req, function(err,fields,files){
				req.files - files[0];
				req.fields - fields;
				for (var i in files){
					for (var j in files[i]){
						fh.renameFile(fields.tempLocation[i], local.config.upload_folders[0] + req.warehouse.id + '/' + files[i][j].originalFilename,function(err){
							if(err && err.code !== 'ENOENT'){
								if ((req.warehouse.storage === undefined || req.warehouse.storage.length === 0)){
									fh.deleteFolderRecursive(local.config.upload_folders[0] + req.warehouse.id);
									warehouse.removeWarehouse(req.warehouse._id);//Remove this warehouse we are in step1 so it will create another later
								}
								setErrorResponse('Document Upload Error',res);
							}else{
								documentExists = false;
								for (var k = 0; k<documents.length; k++){
									if(documents[k].title === fields.title[numSuccessfulCbs] && documents[k].path === local.config.upload_folder_rel_path[0] + req.warehouse.id + '/' + files[numSuccessfulCbs][j].originalFilename){
										documentExists = true;
									}
								}
								if (documentExists === false){
									documents.push({"title":fields.title[numSuccessfulCbs],"path":local.config.upload_folder_rel_path[0] + req.warehouse.id + '/' + files[numSuccessfulCbs][j].originalFilename});
								}
								numSuccessfulCbs ++;
								if (numSuccessfulCbs === Object.keys(files).length){
									warehouse.updateWarehouseDocuments(req.warehouse.id,documents,function(err){
										if (!err){
											setResponse(req,res);
										}else{
											if ((req.warehouse.storage === undefined || req.warehouse.storage.length === 0)){
												fh.deleteFolderRecursive(local.config.upload_folders[0] + req.warehouse.id);
												warehouse.removeWarehouse(req.warehouse._id);//Remove this warehouse we are in step1 so it will create another later
											}
											setErrorResponse('Document Upload Error',res);
										}
									})
								}
							}
						});
					}
				}
			});
		}else{
			setErrorResponse('Document Upload Error',res);
		}
	})
}

function deleteDocumentsAndEmptyDir(req,res){
	var form = new multiparty.Form();
	var documents = [];
	var successfullCbs = 0
	var file;
	var docSpliced = false;
	if (req.warehouse.documents !== undefined){
		documents = req.warehouse.documents;
	}
	form.parse(req, function(err,fields,files){
		for (var i in fields){
			file = JSON.parse(fields[i]);
			fh.deleteFile(__dirname + '/../../',file.path,function(){
				if(err && err.code !== 'ENOENT'){
					setErrorResponse('Document Delete Error',res);
				}else{
					successfullCbs ++;
					if (successfullCbs === Object.keys(fields).length){
						fh.readDir(local.config.upload_folders[0] + req.warehouse.id,function(err,files){
							if (err && err.code !== 'ENOENT'){
								setErrorResponse('Document Delete Error',res);
							}else if (files && files.length === 0){
								fh.deleteDir(local.config.upload_folders[0] + req.warehouse.id,function(err){
									if (err && err.code !== 'ENOENT'){
										setErrorResponse('Document Delete Error',res);
									}
								});
							}
						});
						for (var j = 0; j<documents.length; j++){
							if (docSpliced === true){
								j --;
							}
							if (documents[j].title === file.title && documents[j].path === file.path){
								documents.splice(j,1);
								docSpliced = true;
							}
						}
						warehouse.updateWarehouseDocuments(req.warehouse.id,documents,function(err){
							if (!err){
								setResponse(req,res);
							}else{
								setErrorResponse('Document Delete Error',res);
							}
						});
					}
				}
			});
		}
	});
}

function deleteImagesAndEmptyDir(req,res){
	var form = new multiparty.Form();
	var photos = [];
	var successfullCbs = 0
	var photoSpliced = false;
	if (req.warehouse.photos !== undefined){
		photos = req.warehouse.photos;
	}
	form.parse(req, function(err,fields,files){
		for (var i in fields){
			fh.deleteFile(local.config.upload_folders[1],fields[i][0],function(){
				if(err && err.code !== 'ENOENT'){
					setErrorResponse('Photo Delete Error',res);
				}else{
					successfullCbs ++;
					if (successfullCbs === Object.keys(fields).length){
						fh.readDir(local.config.upload_folders[1] + req.warehouse.id,function(err,files){
							if (err && err.code !== 'ENOENT'){
								setErrorResponse('Photo Delete Error',res);
							}else if (files){
                                if (files.length === 0){
                                    fh.deleteDir(local.config.upload_folders[1] + req.warehouse.id,function(err){
                                        if (err && err.code !== 'ENOENT'){
                                            setErrorResponse('Photo Delete Error',res);
                                        }
                                    });
                                }
							}
						});
						for (var j = 0; j<photos.length; j++){
							if (photoSpliced === true){
								j --;
							}
							if (photos[j].path === fields[i][0]){
								photos.splice(j,1);
								photoSpliced = true;
							}
						}
						warehouse.updateWarehousePhoto(req.warehouse.id,photos,function(err){
							if (!err){
								setResponse(req,res);
							}else{
								setErrorResponse('Photo Delete Error',res);
							}
						});
					}
				}
			});
		}
	});
}

function updateVolumeDiscount(req,res) {
    var volumeDiscountData = {}
    volumeDiscountData.noDiscount = req.body.noDiscount;
    volumeDiscountData.discounts = req.body.discounts;
    req.data.warehouse = req.warehouse;
    warehouse.updateVolumeDiscount(req.warehouse, volumeDiscountData, function(err, result){
        if (err) {
            console.log("failed to update volume discount");
            setErrorResponse(err,res);
        } else {
            setResponse(req,res,result);
        }
    });

    
}

function warehouseProfile (req,res){
    req.data.warehouse = req.warehouse;
    if ((req.query.fromSearch && req.session.search && Object.keys(req.session.search).length > 0) || (req.header('referer').indexOf(req.hostname) > -1 && req.header('referer').indexOf('/dashboard') > -1)) {
        req.data.minDurationOptions = local.config.minDurationOptions;
        req.data.temperatures = local.config.temperatures;
		req.data.page = 'warehouse-profile';
		req.data.palletWidths = local.config.palletTypes;
        search.getFromSession(req, function(err, query){
            if (!err) {
				req.data.query = query;
            }else{
                req.data.query = search.buildDefaultSearchByWarehouse(req.data.warehouse);
            }
             req.data.warehouse.generateStorageProfile(req.data.query);
            res.render("warehouse-profile",req.data);
        });
    }
}

function createUserAndCompany(req,res){
	var usr = {};
	createCompany(req,res,function(err,newCompany){
		if (err){
			setErrorResponse(err,res);
		}else{
			usr.company = newCompany;
			usr.dashboardAccessLvl = 0;//Master Contact
			user.create(req,res,usr,function(err,newUser){
				if(err){
					setErrorResponse(err,res);
					//Maybe delete the company
				}else{
					company.updateMasterContacts(newCompany._id,newUser._id,function(err,result){
						if(err){
							setErrorResponse(err,res);
							//Maybe delete the company and user
						}else{
							createWarehouse(req,res,function(err,Warehouse){
								if (err){
									setErrorResponse(err,res);
									//Maybe delete the user and the company
								}else{
									req.warehouse = Warehouse;
									company.updateWarehouses(newCompany._id,Warehouse._id,function(err,result){
										if(err){
											setErrorResponse(err,res);
											//Maybe delete the user, warehouse and the company
										}else{
											setResponse(req,res);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}
function createCompany(req,res,cb){
	var data = {};
	data.name = req.body.company;
	data.warehouses = [];
	data.masterContacts = [];
	company.create(req,res,data,function(err,company){
		cb(err,company);
	});
}
function warehouseAuth(req,res,next){
	if(req.warehouse.user._id.equals( req.data.user._id) ) return next();
	setResponse(req,res,next);
}
function createWarehouse(req,res,cb){
	var contactsData = {};
	var updateWarehouse = {};
	Utils.getLatLong(req.body.postcode,function(err,latlng){
		if (latlng.lat === null && latlng.lng === null){
			if (err){
				setErrorResponse('Geolocation Error',res);
			}else{
				setPostcodeNotFoundResponse(POSTCODE_NOT_FOUND,res);
			}
		}else if(err){
			setErrorResponse('Geolocation Error',res);
		}else if (!err){
			req.body.geo = latlng;
			req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
			var whData = Utils.convertHyphenJSONDataToCC(req.body);
			warehouse.create(req.data.user,whData,function(err,Warehouse){
				if(err){
					cb('Data Error');
				}else{
					contactsData.warehouse = Warehouse._id;
					contacts.createWarehouseContacts(contactsData,function(err,contactsRes){
						if(err){
							cb('Data Error');
							//Maybe delete some stuff
						}else{
							updateWarehouse = Warehouse.toObject();
							updateWarehouse.contacts = contactsRes._id;
							warehouse.update(Warehouse,updateWarehouse,function(err){
								if(err){
									cb('Data Error');
									//Maybe delete some stuff
								}else{
									cb(false,Warehouse);
								}
							})
						}
					})
				}
			});
		}
	});
}
function storageAuth(req,res,next){
	if(req.storage.user._id.equals( req.data.user._id) ) return next();
	setStorageResponse(req,res,next);
}
function createStorage(req,res,next){
	if(!req.warehouse) next("Warehouse not found");
	storage.create(req.data.user, req.body,function(err,storage){
		if(err){
			setErrorResponse(err,res);
		}else{
			req.storage = storage;
			req.warehouse.storage.push(storage._id);
			req.warehouse.save(function(){
				setStorageResponse(req,res,next);
			});
		}
	});
}
function updateStorage(req,res,next){
	storage.update(req.storage,req.body,function(err){
		if(err){
			setErrorResponse(err,res);
		}else{
			setStorageResponse(req,res);
		}
	});
}
function batchStorage(req,res){
	if(!req.warehouse) next();
	var idsMatch = Utils.checkUserSameAgainstLoadedWarehouse(req.warehouse,req.data.user);
	if (!idsMatch){
		user.logout(req,res,function(err,cb){
			setErrorResponse("Users do not Match",res);
		});
	}else{
		var storageArr=[];
		var sortOrder = 0;
		async.each(req.body, function(_storage,callback){
			console.log("saving a storage");
			sortOrder++;
			_storage.sortOrder = sortOrder;
			if(!_storage._id){ //if no id, create a new storage.
				console.log("creating storage: " + _storage._id);
				delete _storage._id;
				storage.create(req.data.user,_storage,function(err,Storage){
					if(err){
						console.log(err);
						callback(err);
					}else{
						storageArr.push(Storage._id);
						callback();
					}
				});
			}else{ //otherwise update it.
				_storage.user=req.data.user._id;
				delete _storage.__v;
				storage.updateWithData(_storage,function(err,Storage){
					console.log("updating storage: " + _storage._id);
					if(!err){
						storageArr.push(Storage._id);
						callback();
					}else{
						console.log(err);
						callback(err);
					}
				});
			}
			
		},function(err){
			if(!err){	
				req.warehouse.storage=storageArr;
				req.warehouse.active=true;
				req.warehouse.save(function(){
					setResponse(req,res);
				});
			}else{
				setErrorResponse(err,res);
			}
		});
	}
}
function updateWarehouse(req,res){
	async.waterfall([
		//Any data request go here
		function(callback){
			if(req.body.postcode != req.warehouse.postcode){
				Utils.getLatLong(req.body.postcode,function(error,latlng){
					if (latlng.lat === null || latlng.lng === null){
						if (error){
							callback('Geolocation Error',res);
						}else{
							callback(POSTCODE_NOT_FOUND,res);
						}
					}else if(error){
						callback('Geolocation Error',res);
					}else{
						req.body.geo=latlng;
						req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
						callback(null);
					}
				});
			}else{
				callback(null);
			}
		}

	],function (err, result) {
		if (!err || err === '' || err === null || err === "" || err === undefined){
			var whData = Utils.convertHyphenJSONDataToCC(req.body);
			warehouse.update(req.warehouse,whData,function(err){
				if(err){
					setErrorResponse(err,res);
				}else{
					setResponse(req,res);
				}
			});
		}else{
			 if (err === POSTCODE_NOT_FOUND){
				 setPostcodeNotFoundResponse(POSTCODE_NOT_FOUND,res);
			 }else{
			 	setErrorResponse(err,res);
			 }
		 }
	});
}

function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse.toObject({
		versionKey:false
	}) };
    res.end(JSON.stringify(output) + "\n");
}
function setPostcodeNotFoundResponse(err,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
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
