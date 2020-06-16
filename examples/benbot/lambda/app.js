const validate = require('./validate.js');
const fulfilment = require('./fulfilment.js');

exports.validateLambdaHandler = validate.lambdaHandler;
exports.fulfilmentLambdaHandler = fulfilment.lambdaHandler;