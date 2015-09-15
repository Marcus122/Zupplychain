var fs = require('fs'),
	FILE_ALREADY_EXISTS = 'File Already Exists';

exports.version = "0.1.0";

exports.createDir = function(dir,cb){
	fs.mkdir(dir,0755,function(err){
		if (err){
			if (err.coder === 'EEXIST'){
				 cb(null) //The folder already exists, that's fine
			}else{
				cb(err) //Something else has gone wrong, we need to report this
			}
		}else{
			cb(null) //The folder has been created
		}
	});
}

exports.renameFile = function(oldPath, newPath, cb){
	fs.rename(oldPath,newPath,function(err){
		if(err){
			cb(err);
		}else{
			cb(null);
		}
	});
}

exports.writeFile = function(path,data,cb){
	fs.access(path, fs.F_OK, function(err){
		if (!err){
			cb(FILE_ALREADY_EXISTS);
		}else{
			fs.writeFile(path,data,function(err){
				if(err){
					cb(err);
				}else{
					cb(null);
				}
			});
		}
	});
}

