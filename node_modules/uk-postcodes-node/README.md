[![Build Status](https://travis-ci.org/cblanc/uk-postcodes-node.png)](https://travis-ci.org/cblanc/uk-postcodes-node) 
[![Code Climate](https://codeclimate.com/repos/52d51cfd69568074fd000a23/badges/d8c14564623fcc2d63ad/gpa.png)](https://codeclimate.com/repos/52d51cfd69568074fd000a23/feed)
[![Dependency Status](https://gemnasium.com/cblanc/uk-postcodes-node.png)](https://gemnasium.com/cblanc/uk-postcodes-node)


# UK-Postcodes Node.js Wrapper

This is a API wrapper for uk-postcodes.com, a free lookup API for UK postcodes

## Installation

```
npm install uk-postcodes-node
```

## Getting Started

**Looking up a postcode**

```
var postcode = "SW1A 2AA";

UKPostcodes.getPostcode(postcode, function (error, data) {
	console.log(data);
	// {
	//   "postcode": "SW1A 2AA",
	//   "geo": {
	//     "lat": 51.503539898875815,
	//     "lng": -0.12768084037293415,
	//     "easting": 530047,
	//     "northing": 179951,
	//     "geohash": "http://geohash.org/gcpuvpgjbgdq"
	//   },
	//   "administrative": {
	//     "council": {
	//       "title": "City of Westminster",
	//       "uri": "http://statistics.data.gov.uk/id/statistical-geography/E09000033",
	//       "code": "E09000033"
	//     },
	//     "ward": {
	//       "title": "St. James's",
	//       "uri": "http://statistics.data.gov.uk/id/statistical-geography/E05000644",
	//       "code": "E05000644"
	//     },
	//     "constituency": {
	//       "title": "Cities of London and Westminster",
	//       "uri": "http://statistics.data.gov.uk/id/statistical-geography/E14000639",
	//       "code": "E14000639"
	//     }
	//   }
	// }
});
```

**Lookup nearest postcode for point**

UKPostcodes#nearestPostcode(latlon, callback);

- latlng is a string indicating a geolocation within the UK, e.g. "52.22331,-0.215323"

```
UKPostcodes.nearestPostcode(latlng, function (error, data) {
	// Returns postcode object as above
})
```

**Looking up within X miles of postcode**

UKPostcodes#nearestPostcodes(postcode, radius, callback);

```
// What are the nearest postcodes within a 12 mile radius of NW1 9HZ?

UKPostcodes.nearestPostcodes("AB42 2BN", 12, function (error, postcodes) {
	// Returns an array of postcodes
})
```

**Looking up postcodes within X miles of point**

- latlng is a string indicating a geolocation within the UK, e.g. "52.22331,-0.215323"

UKPostcodes#nearestPostcodes(latlon, radius, callback);

```
// What are the nearest postcodes within a 12 mile radius of 52.9667,-1.1667?

UKPostcodes.nearestPostcodes("52.9667,-1.1667", 12, function (error, postcodes) {
	// Returns an array of postcodes
})
```

## Test

```
npm test
```

## License

MIT
