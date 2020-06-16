'use strict';

const fulfilment = require('../fulfilment.js');
const chai = require('chai');
const expect = chai.expect;
const testUtils = require('./testUtils.js');

const event = testUtils.makeTestEvent('red');
const context = null;

describe('fulfilment', function () {
    it('closes the conversation', async () => {
        const result = await fulfilment.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.dialogAction).to.be.an('object');
        expect(result.dialogAction.type).to.equal('Close');
        expect(result.dialogAction.fulfillmentState).to.equal('Fulfilled');
        expect(result.dialogAction.message).to.deep.equal({
            contentType: 'PlainText',
            content: fulfilment.message,
        });
    });
});
