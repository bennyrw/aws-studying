exports.detailedMessage = "Please enter an AlertLevel such as 'Red', 'Orange', or 'Yellow'."
    + "Red indicates a severe risk"
    + "Orange indicates a high risk"
    + "Yellow indicates a significant risk";

exports.helpMessage = "The alerts are Red, Orange and Yellow. You can also say 'help'";

const supportedAlertLevels = [
    'red',
    'orange',
    'yellow',
]

/**
 * Handler for validating input before fulfilment
 * 
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
exports.lambdaHandler = async (event, context) => {
    console.log(`validation event`);
    console.log(`event: ${JSON.stringify(event)}`);

    const sessionAttributes = event.sessionAttributes || {};
    const intent = event.currentIntent;
    const slots = intent.slots;
    const alertLevel = slots['AlertLevel'] || '';

    if (alertLevel.toLowerCase() === 'help') {
        console.log('Help invoked');
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName: intent.name,
                slots,
                slotToElicit: 'AlertLevel',
                message: {
                    contentType: 'PlainText',
                    content: this.detailedMessage,
                }
            }
        }
    } else if (supportedAlertLevels.indexOf(alertLevel.toLowerCase()) === -1) {
        console.log(`Invalid choice ${alertLevel}`);
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                intentName: intent.name,
                slots,
                slotToElicit: 'AlertLevel',
                message: {
                    contentType: 'PlainText',
                    content: this.helpMessage,
                }
            }
        }
    }
    
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        }
    };
};
