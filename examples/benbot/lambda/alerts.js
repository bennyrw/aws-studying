const AWS = require('aws-sdk');

const ses = new AWS.SES();
const sns = new AWS.SNS();

exports.sendAlerts = async (alertLevel) => {
    console.log(`Sending alert at level ${alertLevel}`);

    if (alertLevel.toLowerCase() === 'red') {
        await this.sendEmailAlerts('Red');
        await this.sendTextAlerts('Red');
    } else if (alertLevel.toLowerCase() === 'orange') {
        await this.sendEmailAlerts('Orange');
        await this.sendTextAlerts('Orange');
    } else if (alertLevel.toLowerCase() === 'yellow') {
        await this.sendEmailAlerts('Yellow');
    } else {
        console.log('Alert level not supported, aborting');
    }
}

exports.sendEmailAlerts = async (alertLevel) => {
    const targetEmail = process.env.targetEmail;
    console.log(`Sending email to ${targetEmail}`);

    try {
        const response = await ses.sendEmail({
            Destination: {
                ToAddresses: [targetEmail],
            },
            Message: {
                Subject: {
                    Data: `${alertLevel} alert!`,
                },
                Body: {
                    Text: {
                        Data: `A ${alertLevel} alert has just been reported`,
                    }
                }
            },
            // while in AWS SES sandbox mode, we can only use verified destination and source email addresses
            // so for this example, use targetEmail for both to cut down on number of verifications needing to be done
            Source: targetEmail,
        }).promise();
        console.log(`Successfully sent email, response: ${JSON.stringify(response)}`);
    } catch (e) {
        console.log(`Failed to send email: ${e}`);
    }
}

exports.sendTextAlerts = async (alertLevel) => {
    const targetPhoneNumber = process.env.targetPhoneNumber;
    console.log(`Sending SMS to ${targetPhoneNumber}`);

    try {
        const response = await sns.publish({
            PhoneNumber: targetPhoneNumber,
            Message: `${alertLevel} alert triggered`,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional',
                }
            }
        }).promise();
        console.log(`Successfully sent SMS, response: ${JSON.stringify(response)}`);
    } catch (e) {
        console.log(`Failed to send SMS: ${e}`);
    }
}