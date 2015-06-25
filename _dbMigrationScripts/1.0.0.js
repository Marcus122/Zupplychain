//Changed the database to use numeric indexes for palletType and Temp
db.storages.update({}, {$set : { "palletType" : 3, "temp" : 1 }}, {"multi" : true});