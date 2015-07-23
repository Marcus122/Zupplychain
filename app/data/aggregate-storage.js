"use strict";
//NOTE still work in progress..
//these could easily be methods on warehouse but I kept them on their own for now.

//An aggregateStorage is just a collection of storages that we treat as a single entity to load pallets into.

var aggregateStorage = function(theStorages) {
    var storages = theStorages;
    var firstWeekProfile = 0; 
    
    function getStorageProfileForWeekCommencing(wcDate, numPallets) {
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        var filledStorageProfile = fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets);
        return filledStorageProfile;
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
                continue;
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
    
    function fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets) {
        var filledStorageProfile = {};
        var storagesUsed = [];
        var numPalletsLeft = numPallets;
        var highestPriceOfAnyStorageUsed = {};
        
        storagesThisWeek.sort(function(x,y) {return x.price.price > y.price.price });
        for (var i in storagesThisWeek) {
            var numPalletsInThisStorage = Math.min(storagesThisWeek[i].numSpaces, numPalletsLeft);
            storagesThisWeek.numPalletsStored = numPalletsInThisStorage;
            numPalletsLeft -= numPalletsInThisStorage;
            highestPriceOfAnyStorageUsed = storagesThisWeek[i].price; //since these are sorted by price, subsequent loops will overwrite this.
            storagesUsed.push(storagesThisWeek[i]);
            if (numPalletsLeft > 0) {
                storagesThisWeek[i].full = true;
            } else {
                storagesThisWeek[i].full = false;
                break;
            }
        }
        filledStorageProfile.numPallets                 = numPallets;
        filledStorageProfile.numPalletsLeft             = numPalletsLeft;
        filledStorageProfile.numPalletsStored           = numPallets - numPalletsLeft;
        filledStorageProfile.storages                   = storagesUsed;
        filledStorageProfile.highestPriceOfAnyStorageUsed = highestPriceOfAnyStorageUsed;
        filledStorageProfile.totalPrice                 = highestPriceOfAnyStorageUsed.price * (numPallets - numPalletsLeft);
        return filledStorageProfile;
    }

    function generateContractStorageProfile(useageProfile) {
        //useageProfile looks like: { WeekCommencingDateISOString : numPallets }
        var weeklyProfilesIndexedByDate = {};
        var firstTimeThrough = true;
        for (var i in useageProfile) {
            var numPallets = useageProfile[i];
            var wcDate = Date.parse(i);
            var thisWeekProfile = getStorageProfileForWeekCommencing(wcDate, numPallets);
            weeklyProfilesIndexedByDate[i] = thisWeekProfile;
            if (firstTimeThrough) {
                firstWeekProfile =  weeklyProfilesIndexedByDate[i]
                firstTimeThrough = false;
            }
        }
        return weeklyProfilesIndexedByDate;   
    }
    
    return {
        generateContractStorageProfile:generateContractStorageProfile,
        palletsWillFitAtThisDate:palletsWillFitAtThisDate,
        getPriceForFirstWeek:getPriceForFirstWeek
    }
    
}

module.exports = aggregateStorage;