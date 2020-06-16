// https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html
exports.makeTestEvent = (alertLevel) => {
    return {
        "messageVersion": "1.0",
        "invocationSource": "DialogCodeHook",
        "userId": "John",
        "sessionAttributes": {},
        "bot": {
            "name": "BenBot",
            "alias": "$LATEST",
            "version": "$LATEST"
        },
        "outputDialogMode": "Text",
        "currentIntent": {
            "name": "AnyIntent",
            "slots": {
                "AlertLevel": alertLevel,
            },
            "confirmationStatus": "None"
        }
    }
}