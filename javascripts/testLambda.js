var la = require('./lambda.js');


var evt = {
	httpMethod:"GET",
	queryStringParameters: {
		amazon: false,
		limit: 10,
		prefix: 'pc'
	}
}

la.handler(evt, {}, function(e, r){
	console.log(e, r)
})

