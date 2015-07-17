//NOTE still work in progress..
//these could easily be methods on warehouse but I kept them on their own for now.

//TODO add 
//getPriceAtDate(wcDate)
//getFreeSpacesAtDate(wcDate)
//functions to the storage class.

//An aggregateStorage is just a collection of storages that we treat as a single entity to load pallets into.

aggregateStorage = function(theStorages) {
    storages = theStorages
    
    getStorageProfileForWeekCommencing(wcDate, numPallets) {
        var storagesThisWeek = getStoragesAsTheyAreThisWeek(wcDate);
        var filledStorageProfile = fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets);
        return filledStorageProfile;
    }
    
    function getStoragesToAsTheyAreThisWeek(wcDate) {
        var storagesThisWeek = [];
        for (i in storages) {
            var freeSpaces = storages[i].getFreeSpacesAtDate(wcDate);
            totalSpace += freeSpace;
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
    
    function fillStoragesThisWeekMostCheaply(storagesThisWeek, numPallets) {
        var filledStorageProfile = {};
        var storagesUsed = [];
        storagesThisWeek.sort(function(x,y) {return x.price > y.price });
        var numPalletsLeft = numPallets;
        var highestPriceOfAnyStorageUsed = 0.00
        for (i in storagesThisWeek) {
            var numPalletsInThisStorage = Math.MIN(storagesThisWeek[i].numSpaces, numPalletsLeft);
            storagesThisWeek.numPalletsStored = numPalletsInThisStorage;
            numPalletsLeft -= numPalletsInThisStorage;
            if (numPalletsLeft > 0) {
                storagesThisWeek[i].full = true;
                storagesUsed.push(storagesThisWeek[i]);
            } else {
                //we know this is the most expensive storage so use this price;
                highestPriceOfAnyStorageUsed = storagesThisWeek[i].price;
                storagesUsed.push(storagesThisWeek[i]);
                //Note, we may need to return even the unused storages to allow client side price calculations, or we could share this code between server and client.
                break;
            }
        }
        filledStorageProfile.numPalletsLeft     = numPalletsLeft;
        filledStorageProfile.numPalletsStored   = numPallets - numPalletsLeft;
        filledStorageProfile.storages           = storagesUsed;
        filledStorageProfile.highestPriceOfAnyStorageUsed = highestPriceOfAnyStorageUsed;
        filledStorageProfile.totalPrice         = highestPriceOfAnyStorageUsed * (numPallets - numPalletsLeft);
        return filledStorageProfile.totalPrice;  
    }
    
    

    generateContractStorageProfile(useageProfile) {
        //assume the useageProfile looks as follows.
        // { WeekCommencingDateISOString : numPallets }
        weeklyProfilesIndexedByDate = {};
        for (i in useageProfile) {
            var numPallets = useageProfile[i].numPallets;
            var wcDate = Date.parse(i);
            weeklyProfilesIndexedByDate[i] = getStorageProfileForWeekCommencing(wcDate, numPallets);
        }
        return weeklyProfilesIndexedByDate;   
    }
    
}