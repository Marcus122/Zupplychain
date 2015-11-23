"use strict";
//NOTE still work in progress..
//these could easily be methods on warehouse but I kept them on their own for now.

//An aggregateStorage is just a collection of storages that we treat as a single entity to load pallets into.

var aggregateStorage = function(theStorages, VolumeDiscounts) {
    var storages = theStorages;
    var volumeDiscounts = VolumeDiscounts;
    var firstWeekProfile = 0; 
    
    function getAvailableStorageTemps() {
        var availableTemps = [];
        for (var i=0;i<theStorages.length;i++) {
            for (var j=0;j<availableTemps.length;j++) {
                var seenThisOne = false;
                if (availableTemps[j] == theStorages[i].temp) {
                    seenThisOne = true;
                }
            }
            if (!seenThisOne) {
                availableTemps.push(theStorages[i].temp);
            }
        }
        return availableTemps;
    }
    
    function willStorageFitThisWeek(storagesThisWeek,numPallets){
        var willFit;
        var spacesRunningTotal = 0;
        storagesThisWeek.sort(function(x,y) { return x.price.price > y.price.price });
        for (var i in storagesThisWeek) {
            if (storagesThisWeek[i].numSpaces < numPallets){
                willFit = false;
            }else{
                willFit = true;
            }
            spacesRunningTotal += storagesThisWeek[i].numSpaces;
        }
        
        if(spacesRunningTotal < numPallets){
            willFit = false;
        }else{
            willFit = true;
        }
        
        return willFit;
    }
    
    function getStorageProfileForWeekCommencing(wcDate, numPallets, numLastWeek, lastWeekProfile) {
        var willFit;
        var filledStorageProfile;
        var storagesLastWeek;
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        
        willFit = willStorageFitThisWeek(storagesThisWeek,numPallets);
        if (!willFit){
            storagesLastWeek = lastWeekProfile.storagesThisWeek;
        }
        
        filledStorageProfile = fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets, numLastWeek, lastWeekProfile, willFit,storagesLastWeek);
        filledStorageProfile.storagesThisWeek = storagesThisWeek;
        return filledStorageProfile;
    }
    
    function getStorages(){
        return storages;
    }
    
    function getVolumeDiscount(){
        return volumeDiscounts;
    }
    
    function palletsWillFitAtThisDate(wcDate, numPallets, palletType) {
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        var totalSpace = 0;
        storagesThisWeek.sort(function(x,y) { return x.name > y.name })//Ensure they are sorted by name at this point as it will be easier to index below.
        for (var i in storagesThisWeek) {
            //Do pallets fit method instead of below - This is checked in data/waehouse.js
            if(i>0){
                if(storagesThisWeek[i].name !== storagesThisWeek[i-1].name){
                    totalSpace += storagesThisWeek[i].numSpaces;
                }
            }else{
                totalSpace += storagesThisWeek[i].numSpaces;
            }
            if (totalSpace >= numPallets) {
                return true;
            }
        }
        return totalSpace >= numPallets;
    }
    
    function getStoragesAsTheyAreThisWeek(wcDate) {
        var storagesThisWeek = [];
        for (var i in storages) {
            var freeSpaces = storages[i].getFreeSpacesAtDate(wcDate);
            if (freeSpaces == 0) {
                //continue;
            }
            storagesThisWeek.push({
                _id : storages[i]._id,
                name: storages[i].name,
                price : storages[i].getPriceAtDate(wcDate), 
                numSpaces : freeSpaces,  
                full : false, 
                numPalletsStored : 0,
                palletType: storages[i].palletType
            });
        }
        storagesThisWeek.sort(function(x,y) { return x.name > y.name })
        return storagesThisWeek;
    }
    
    function getPriceForFirstWeek() {
        if (!firstWeekProfile) {
            throw "generateContractStorageProfile needs to be called first to generate the pricing index";
        }
        //note, we should probably check for individual highest per week and in/out prices, at the mo just assuming that highest per week also has highest in out.
        return firstWeekProfile.highestPriceOfAnyStorageUsed;
    }
    
    function fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets, numLastWeek, lastWeekProfile, willFit) {
        var filledStorageProfile = {};
        var storagesUsed = [];
        var numPalletsLeft = numPallets;
        var highestPriceOfAnyStorageUsed = {};
        var storageRemoved = false;
        var increaseInPallets = Math.max( 0, numPallets - numLastWeek);
        var continueLoop = true;
        var counter = -1;
        var netSpaces = 0;
        
        if (numPallets == 0) { //this lets us still do a price calculation even for weeks where useage = 0;
            highestPriceOfAnyStorageUsed = { price: 0, charge: 0, reserve: 0}; 
        }
        for (var i = 0; i < storagesThisWeek.length; i++){
            if (storageRemoved === true){
                i--;
                storageRemoved = false;
            }
            if(storagesThisWeek[i].price.toObject().price === undefined){
                storageRemoved = true;
                storagesThisWeek.splice(i,1);
            }
        }
        storagesThisWeek.sort(function(x,y) { return x.price.price > y.price.price });
        for (var i in storagesThisWeek) {
            counter = parseInt(i);
            continueLoop = true;
            while(continueLoop){
                if(counter>0){
                    for(var j = counter-1; j>=0; j--){
                        if(storagesThisWeek[i].name === storagesThisWeek[j].name){
                            continueLoop =false;
                            break;
                        }
                    }
                }
                if (continueLoop){
                    //Also check whether pallets will fit and then insert as many pallets as we can in the available space - This is done in data/warehouse
                    var numPalletsInThisStorage = Math.min(storagesThisWeek[i].numSpaces, numPalletsLeft);
                    storagesThisWeek[i].numPalletsStored = numPalletsInThisStorage;
                    numPalletsLeft -= numPalletsInThisStorage;
                    highestPriceOfAnyStorageUsed = storagesThisWeek[i].price; //since these are sorted by price we are filling from the cheapest, so subsequent loops will overwrite this leaving us with the highest price.
                    storagesUsed.push(storagesThisWeek[i]);
                    netSpaces += storagesThisWeek[i].numSpaces;
                    if (numPalletsLeft > 0) {//Remove alny storages with no pricing
                        storagesThisWeek[i].full = true;
                    } else {
                        storagesThisWeek[i].full = false;
                        break;
                    }
                    continueLoop = false;
                }
            }
        }
        var totalHandlingCharge = increaseInPallets * highestPriceOfAnyStorageUsed.charge;
        filledStorageProfile.numPallets                 = numPallets;
        filledStorageProfile.numPalletsLeft             = numPalletsLeft;
        filledStorageProfile.numPalletsStored           = numPallets - numPalletsLeft;
        filledStorageProfile.storages                   = storagesUsed;
        filledStorageProfile.volumeDiscount             = getVolumeDiscount(numPallets);
        filledStorageProfile.netSpaces                  = netSpaces;
        var weeklySubTotal                              = (highestPriceOfAnyStorageUsed.price * (numPallets));//even if the storage doesn't fit, calc the price as if it did as an estimate.
        var weeklySubTotalWithDiscount                  = weeklySubTotal * (1 - (filledStorageProfile.volumeDiscount / 100));
        if(!willFit && Object.keys(lastWeekProfile).length > 0){
            if(!lastWeekProfile.totalHandlingCharge){
                lastWeekProfile.totalHandlingCharge = 0;
            }
            if(filledStorageProfile.numPallets < lastWeekProfile.numPallets){
                filledStorageProfile.totalPrice = (lastWeekProfile.totalPrice - lastWeekProfile.totalHandlingCharge) / (lastWeekProfile.numPallets / filledStorageProfile.numPallets);
            }else if(filledStorageProfile.numPallets > lastWeekProfile.numPallets){
                filledStorageProfile.totalPrice = (lastWeekProfile.totalPrice - lastWeekProfile.totalHandlingCharge) * (filledStorageProfile.numPallets / lastWeekProfile.numPallets);
                totalHandlingCharge = increaseInPallets * lastWeekProfile.highestPriceOfAnyStorageUsed.charge
                filledStorageProfile.totalHandlingCharge        = totalHandlingCharge;
                filledStorageProfile.totalPrice += totalHandlingCharge;
            }else{
                filledStorageProfile.totalPrice = lastWeekProfile.totalPrice - lastWeekProfile.totalHandlingCharge;
                //filledStorageProfile.totalHandlingCharge = lastWeekProfile.totalHandlingCharge;
            }
            filledStorageProfile.highestPriceOfAnyStorageUsed = lastWeekProfile.highestPriceOfAnyStorageUsed;
        }else{
            filledStorageProfile.totalPrice                 = (weeklySubTotalWithDiscount + totalHandlingCharge);
            filledStorageProfile.totalHandlingCharge        = totalHandlingCharge;
            filledStorageProfile.highestPriceOfAnyStorageUsed = highestPriceOfAnyStorageUsed;
        }
        return filledStorageProfile;
        
        function getVolumeDiscount(numPallets) {
            var applicableVolumeDiscount = 0.0;
            for (var i=0;i<volumeDiscounts.length;i++) {
                if (volumeDiscounts[i].from <= numPallets && volumeDiscounts[i].to >= numPallets) {
                    return volumeDiscounts[i].perc;
                } else if (volumeDiscounts[i].from <= numPallets) { //this makes sure that the 'last' volume discount applies, even if the 'to' isn't set to the max number of pallets.
                    applicableVolumeDiscount = volumeDiscounts[i].perc;
                }
            }
            return applicableVolumeDiscount;
        }
        
    }

    function generateContractStorageProfile(useageProfile) {
        //useageProfile looks like: { WeekCommencingDateISOString : numPallets }
        var weeklyProfilesIndexedByDate = {};
        var firstTimeThrough = true;
        var palletsRequiredLastWeek = 0;
        var lastWeekProfile ={};
        for (var i = 0; i<useageProfile.length; i++){
            for (var key in useageProfile[i]) {
                var numPallets = useageProfile[i][key];
                var wcDate = Date.parse(key);
                var thisWeekProfile = getStorageProfileForWeekCommencing(wcDate, numPallets, palletsRequiredLastWeek, lastWeekProfile);
                weeklyProfilesIndexedByDate[key] = thisWeekProfile;
                if (firstTimeThrough) {
                    firstWeekProfile =  weeklyProfilesIndexedByDate[key]
                    firstTimeThrough = false;
                }
                palletsRequiredLastWeek = numPallets;
                lastWeekProfile = thisWeekProfile;
            }
        }
        return weeklyProfilesIndexedByDate;   
    }
    
    return {
        generateContractStorageProfile:generateContractStorageProfile,
        palletsWillFitAtThisDate:palletsWillFitAtThisDate,
        getPriceForFirstWeek:getPriceForFirstWeek,
        getAvailableStorageTemps:getAvailableStorageTemps,
        getStorages:getStorages,
        getVolumeDiscount:getVolumeDiscount
    }
    
}

module.exports = aggregateStorage;