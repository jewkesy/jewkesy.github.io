
function buildAmazonParts(doc, id) {
	document.getElementById(id).innerHTML = "Amazon Rating: " + doc.uk.score + " / 5<br>" + "Reviews: " + doc.uk.reviews;
}

function getCountByKey(key, arr) {
	for(var i = 0, len = arr.length; i < len; i++) {
		if( arr[ i ].key === key ) return arr[ i ].count;
	}
	return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}