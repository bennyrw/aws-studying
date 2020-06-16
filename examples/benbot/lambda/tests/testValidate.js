'use strict';

const validate = require('../validate.js');
const chai = require('chai');
const expect = chai.expect;
const testUtils = require('./testUtils.js');

const helpEvent = testUtils.makeTestEvent('Help');
const invalidEvent = testUtils.makeTestEvent('invalid');
const validEvent = testUtils.makeTestEvent('red');

const context = null;

describe('validate', function () {
    it('handles help utterance', async () => {
        const result = await validate.lambdaHandler(helpEvent, context)

        expect(result).to.be.an('object');
        expect(result.sessionAttributes).to.deep.equal({});
        expect(result.dialogAction).to.be.an('object');
        expect(result.dialogAction.type).to.equal('ElicitSlot');
        expect(result.dialogAction.slotToElicit).to.equal('AlertLevel');
        expect(result.dialogAction.message).to.deep.equal({
            contentType: 'PlainText',
            content: validate.detailedMessage,
        });
    });

    it('handles invalid utterance', async () => {
        const result = await validate.lambdaHandler(invalidEvent, context)

        expect(result).to.be.an('object');
        expect(result.sessionAttributes).to.deep.equal({});
        expect(result.dialogAction).to.be.an('object');
        expect(result.dialogAction.type).to.equal('ElicitSlot');
        expect(result.dialogAction.slotToElicit).to.equal('AlertLevel');
        expect(result.dialogAction.message).to.deep.equal({
            contentType: 'PlainText',
            content: validate.helpMessage,
        });
    });

    it('delegates if valid utterance', async () => {
        const result = await validate.lambdaHandler(validEvent, context)

        expect(result).to.be.an('object');
        expect(result.sessionAttributes).to.deep.equal({});
        expect(result.dialogAction).to.be.an('object');
        expect(result.dialogAction.type).to.equal('Delegate');
    });
});
