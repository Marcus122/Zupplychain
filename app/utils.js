var googleDistance = require('google-distance');
var cron = require('node-schedule');
var Company = require('./controllers/company.js');
var Warehouse = require('./controllers/warehouses.js');
var emailer = require("./controllers/emailer.js");
var Users = require("./controllers/users.js");
var local = require("./local.config.js");
function addDaysToDate(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

module.exports.test = function() {
    console.log("test");
}

//distance between two points on the earth's surface, in meters
module.exports.distanceInMiles = function(point1, point2) {
            function toRadians(degrees) { return degrees * Math.PI / 180; }
            var lat1 = point1.lat, lat2 = point2.lat, lon1 = point1.lng, lon2 = point2.lng;
            var φ1 = toRadians(lat1), φ2 = toRadians(lat2), Δλ = toRadians(lon2-lon1), R = 6371000; // gives d in metres
            var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
            return Math.round(d * 0.0006213711);
}

module.exports.addDays = function(date, days) {
    return addDaysToDate(date, days);
}

module.exports.formatDate = function(date) {
    return date.toISOString().substr(0,10);
}

module.exports.getEndOfNextYear = function (date) {
    date.setYear(date.getFullYear() + 1);
    date.setMonth(11);
    date.setDate(31);
    return date;
}

module.exports.printFormatDate = function(date) {
    var dateString = date.toISOString();
    var yyyy = dateString.substr(0,4);
    var mm = dateString.substr(5,2);
    var dd = dateString.substr(8,2);
    return dd + "/" + mm + "/" + yyyy;
}

module.exports.getClosestPreviousMonday = function(inDate) {
    var dayOfWeek = inDate.getDay();
    var retDate = new Date(inDate.getTime());
        //We 'pull' the start day back to the closest monday.
    if (dayOfWeek > 1) {
        addDaysToDate(retDate, -(dayOfWeek-1));
    } else if (dayOfWeek == 0) {
        addDaysToDate(retDate, -6);
    }
    return retDate;
}
        

module.exports.getLatLong = function(postcode, cb) {
    var extra = {
        apiKey : '',
        formatter: null
    };
    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
    
    var geo = {
            lat:52.00,
            lng:-2.00
        };
        if(!postcode) return cb(null,geo);
		
		geocoder.geocode(postcode, function(error, result){
			if(!error){
                if (result.length > 0){
                    geo.lat = result[0].latitude;
                    geo.lng = result[0].longitude;
                }else{
                    geo.lat = null;
                    geo.lng = null;
                }
			}else{
				console.log ("in utils.js");
                console.log("error in Google Geolocation module:");
                console.log(error);
			}
			return cb(error,geo);
		});
    
}

module.exports.checkUserSameAgainstLoadedWarehouse = function(warehouse,user){
    if (warehouse !== undefined){
        if (warehouse.user._id.equals( user._id)){
            return true;
        }else{
            return false;
        }
    }else{
        return false;//The user must be a customer, they need to log in as a provider
    }
}

module.exports.calculateQuickestRoadDistanceBetweenPoints = function(origin,destination,cb){
    googleDistance.get(
        {
        origin: origin,
        destination: destination,
        units: 'imperial',
        },
        function(err,data){
            if (err){
                cb(err);
            }else{
            cb(null,data.distance);
            console.log(data);
            }
        }
    )
}

module.exports.convertHyphenArrayDataToCC = function(data){
    var newData = [];
    for (var i = 0; i<data.length; i++){
        if (typeof data[i] == 'object' && data[i].constructor !== Array){
            newData[i] = exports.convertHyphenJSONDataToCC(data[i]);
        }else if(data[i].constructor === Array){
            newData[i] = exports.convertHyphenArrayDataToCC(data[i]);
        }else if(typeof data[i] === 'string' && data[i] !== ''){
            newData[i] = data[i].replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        }else{
            newData[i] = data[i];
        }
    }
    return newData;
}

module.exports.convertHyphenJSONDataToCC = function(data){
    var newData = {}
    for (var i in data){
        if(data.hasOwnProperty(i)){
            if (typeof data[i] == 'object' && data[i].constructor !== Array){
               newData[i] = exports.convertHyphenJSONDataToCC(data[i]);
            }else if(data[i].constructor === Array){
                newData[i] = exports.convertHyphenArrayDataToCC(data[i]);
            }else if(typeof data[i] === 'string' && data[i] !== ''){
                newData[i.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })] = data[i];
            }else{
                newData[i] = data[i];
            }
        }
    }
    return newData;
}

module.exports.startCronJob = function(date,func){
    cron.scheduleJob(date,function(){
       func();
    });
}

module.exports.checkContactsSetupCompleteByCompanyBySevenDays = function(company,cb){
    var masterContacts = true;
    var warehouseContacts = true;
    var cbCompleted = 0;
    var ccDateDif;
    var cdDateDif;
    var mcDateDif = Date.now() - Date.parse(company.created);
    mcDateDif = Math.floor(mcDateDif/(1000*60*60*24));
    if(company.created && (mcDateDif > 7) && company.masterContacts.length <2 ){
        masterContacts = false;
    }
    
    for (var i = 0; i<company.warehouses.length; i++){
        Warehouse.getById(company.warehouses[i],function(err,result){
            var now = new Date();
            if(result.contacts && result.contacts.contactsDeletedAt === undefined){
                result.contacts.contactsDeletedAt = now.toISOString();
            }
            ccDateDif = Date.now() - Date.parse(result.created);
            ccDateDif = Math.floor(ccDateDif/(1000*60*60*24));
            if(result.contacts){
                cdDateDif = Date.now() - Date.parse(result.contacts.contactsDeletedAt);
                cdDateDif = Math.floor(cdDateDif/(1000*60*60*24));
            }else{
                cdDateDif = 1;
            }
            if(result.email && result.contacts && ((ccDateDif > 7) || (cdDateDif > 7))){
                var contacts = result.toObject().contacts;
                for (var j in contacts){
                    if (contacts[j].constructor === Array){
                        if (contacts[j].length < 2){
                            warehouseContacts = false;
                        }
                    }
                }
                cbCompleted ++;
                if (cbCompleted === company.warehouses.length){
                    if(masterContacts === true && warehouseContacts === true){
                        cb(false,true,company);
                    }else{
                        cb(false,false,company);
                    }
                }
            }else{
                cbCompleted ++;
                if (cbCompleted === company.warehouses.length){
                    if(masterContacts === true && warehouseContacts === true){
                        cb(false,true,company);
                    }else{
                        cb(false,false,company);
                    }
                }
            }
        });
    }
}

module.exports.startProviderContactListReminderCronJob = function(app){
    var rule = {hour:18, minute:6};//Execute everyday at 8 in the morning
    var contactsReminderSent;
    var companyArr = []
    var k;
    exports.startCronJob(rule,function(){
        Company.loadAllCompanies(function(err,results){
            if(err){
                console.log(new Date());
                console.log('#####CRON JOB ERROR#####');
                console.log(err);
                console.log('#####CRON JOB ERROR#####');
            }else{
                for (var i = 0; i<results.length; i++){
                    companyArr.push(results[i].toObject());
                }
                contactsReminderSent = false;
                for (k = 0; k<companyArr.length; k++){
                    if (companyArr[k].contactsReminderSent === undefined || companyArr[k].contactsReminderSent === false){
                        exports.checkContactsSetupCompleteByCompanyBySevenDays(companyArr[k],function(err,result,company){
                            if(err || !result){
                                app.render('emails/task-reminder',local,function(err,template){
                                    if (!err){
                                        for (var j = 0; j<company.masterContacts.length; j++){
                                            Users.user_by_id(company.masterContacts[j],function(err,result){
                                                if(err){
                                                    //Try again tomorrow
                                                }else{
                                                    emailer.sendMail({},{},template,result.email,'info@zupplychain.com','Task Reminder',function(err){
                                                        if(!err && !contactsReminderSent && !company.contactsReminderSent){
                                                            contactsReminderSent = true;
                                                            Company.updateContactsReminderSent(company._id,true,function(err,result){
                                                                //Do Nothing
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    });
}