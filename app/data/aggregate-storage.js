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
    
    function getStorageProfileForWeekCommencing(wcDate, numPallets, numLastWeek) {
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        var filledStorageProfile = fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets, numLastWeek);
        return filledStorageProfile;
    }
    
    function getStorages(){
        return storages;
    }
    
    function getVolumeDiscount(){
        return volumeDiscounts;
    }
    
    function palletsWillFitAtThisDate(wcDate, numPallets) {
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        var totalSpace = 0;
        for (var i in storagesThisWeek) {
            totalSpace += storagesThisWeek[i].numSpaces;
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
                price : storages[i].getPriceAtDate(wcDate), 
                numSpaces : freeSpaces,  
                full : false, 
                numPalletsStored : 0
            });
        }
        return storagesThisWeek;
    }
    
    function getPriceForFirstWeek() {
        if (!firstWeekProfile) {
            throw "generateContractStorageProfile needs to be called first to generate the pricing index";
        }
        //note, we should probably check for individual highest per week and in/out prices, at the mo just assuming that highest per week also has highest in out.
        return firstWeekProfile.highestPriceOfAnyStorageUsed;
    }
    
    function fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets, numLastWeek) {
        var filledStorageProfile = {};
        var storagesUsed = [];
        var numPalletsLeft = numPallets;
        var highestPriceOfAnyStorageUsed = {};
        var storageRemoved = false;
        var increaseInPallets = Math.max( 0, numPallets - numLastWeek);
        
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
            var numPalletsInThisStorage = Math.min(storagesThisWeek[i].numSpaces, numPalletsLeft);
            storagesThisWeek[i].numPalletsStored = numPalletsInThisStorage;
            numPalletsLeft -= numPalletsInThisStorage;
            highestPriceOfAnyStorageUsed = storagesThisWeek[i].price; //since these are sorted by price we are filling from the cheapest, so subsequent loops will overwrite this leaving us with the highest price.
            storagesUsed.push(storagesThisWeek[i]);
            if (numPalletsLeft > 0) {//Remove alny storages with no pricing
                storagesThisWeek[i].full = true;
            } else {
                storagesThisWeek[i].full = false;
                break;
            }
        }
        var totalHandlingCharge = increaseInPallets * highestPriceOfAnyStorageUsed.charge;
        filledStorageProfile.numPallets                 = numPallets;
        filledStorageProfile.numPalletsLeft             = numPalletsLeft;
        filledStorageProfile.numPalletsStored           = numPallets - numPalletsLeft;
        filledStorageProfile.storages                   = storagesUsed;
        filledStorageProfile.highestPriceOfAnyStorageUsed = highestPriceOfAnyStorageUsed;
        filledStorageProfile.volumeDiscount             = getVolumeDiscount(numPallets);
        filledStorageProfile.totalHandlingCharge        = totalHandlingCharge;
        var weeklySubTotal                              = (highestPriceOfAnyStorageUsed.price * (numPallets));//even if the storage doesn't fit, calc the price as if it did as an estimate.
        var weeklySubTotalWithDiscount                  = weeklySubTotal * (1 - (filledStorageProfile.volumeDiscount / 100));
        filledStorageProfile.totalPrice                 = (weeklySubTotalWithDiscount + totalHandlingCharge);
        //console.log("storage Profile for week: #####################################");
        //console.log(filledStorageProfile);
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
        for (var i in useageProfile) {
            var numPallets = useageProfile[i];
            var wcDate = Date.parse(i);
            var thisWeekProfile = getStorageProfileForWeekCommencing(wcDate, numPallets, palletsRequiredLastWeek);
            weeklyProfilesIndexedByDate[i] = thisWeekProfile;
            if (firstTimeThrough) {
                firstWeekProfile =  weeklyProfilesIndexedByDate[i]
                firstTimeThrough = false;
            }
            palletsRequiredLastWeek = numPallets;
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