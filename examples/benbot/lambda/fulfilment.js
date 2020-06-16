const alerts = require('./alerts.js');

exports.message = "Thanks, I have started the configured alerting procedures for the alert";

exports.lambdaHandler = async (event, context) => {
    console.log(`fulfilment event`);
    console.log(`event: ${JSON.stringify(event)}`);

    const intent = event.currentIntent;
    const slots = intent.slots;
    const alertLevel = slots['AlertLevel'];
    console.log(`Alert level: ${alertLevel}`);

    await alerts.sendAlerts(alertLevel);
    console.log('Alerts sent');

    return {
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: this.message,
            }
        }
    };
};
