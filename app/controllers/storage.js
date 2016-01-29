var Storage = require("../data/storage.js"),
	Warehouse = require("../controllers/warehouses.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.create = function (user,data,cb) {
	var storage = new Storage(data);
	storage.user = user._id;
	storage.save(function(err){
		if (!err) {
			  return cb(null, storage);
		  }else{
			 return cb(err);
		 }
	});
}
exports.updateWithData = function(_data,cb){
	Storage.findOne({ _id : _data._id },function(err,storage){
		if(!err){
			storage.set(_data);
			storage.save(function(err){
				if (!err) {
					  return cb(null, storage);
				  }else{
					 return cb(err);
				 }
			});
		}else{
			return cb(err);
		}
	});
}
exports.deleteStorageByWarehouse = function(warehouse,cb){
	var cbComplete = 0;
	var errOccurred = false;
	var results = [];
	Warehouse.getById(warehouse,function(err,result){
		if(err){
			cb(err);
		}else{
			for (var i = 0; i<warehouse.storage.length; i++){
				warehouse.storage.remove(function(err,result){
					cbComplete ++;
					if(err){
						errOccurred = true;
					}else{
						results.push(result);
					}
					if (cbComplete === warehouse.storage.length){
						cb(errOccurred,results);
					}
				});
			}
		}
	});
}
exports.load = function(req,res,next,id){
	Storage.load(id,function(err,storage){
			if(err) return next(err);
			if(!storage) return next(new Error("not found"))
			req.storage = storage;
		    next();
	});
};
exports.update = function(storage,data,cb){
	storage.set(data);
	storage.save(cb);
}
exports.getStorageName = function(storage,cb){
    Storage.load(storage._id, function(err,chosenStorage){
        storage.name = chosenStorage.name;
        cb();
    });
}
exports.buildStorageNamesAndRenderPage = function(req,res,page){
    var i = 0,
        key,
        x = 0;
    
    var storagesLoop = function (chosenStorage,page){
	if (chosenStorage && chosenStorage.Constructor === Object){
		exports.getStorageName(chosenStorage[x],function(){
			
			x++;
			
			if(x<chosenStorage.length){
				storagesLoop(chosenStorage,page);
			}else if (x===chosenStorage.length){
				i++;
				x=0;
			}
			
			if (i === Object.keys(req.data.quote.storageProfile).length){
				res.render(page,req.data);
			}
			
		});
	}else{
		i++;
		if (i === Object.keys(req.data.quote.storageProfile).length){
			res.render(page,req.data);
		}
	}
    }
    
    for (key in req.data.quote.storageProfile){
        if(req.data.quote.storageProfile.hasOwnProperty(key)){
            storagesLoop(req.data.quote.storageProfile[key].storages,page);
        }
    }
}

exports.sortStoragesByNameAndPalletType = function(storages){
	storages.sort(function(x,y) { 
		// return x.name > y.name || x.palletType > y.palletType;
        if(x.name < y.name) return -1;
        if(x.name > y.name) return 1;
        if(x.palletType < y.palletType) return -1;
        if(x.palletType > y.palletType) return 1;
        return 0;
	});
	return storages;
}