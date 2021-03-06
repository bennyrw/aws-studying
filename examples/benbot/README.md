# benbot - Serverless AWS Lex bot

Starter for a serverless [AWS Lex](../../Lex.md) alerting bot that is intended to be integrated with Slack so that users can raise alerts (at different severities).

When a user starts a conversation with the bot to raise an alert, Lex gathers information from the user and after input is validated will trigger email notification (and SMS for higher severity alerts).

Essentially comprised of a couple of Lambda functions (one for each of the Lex __validate__ and __fulfilment__ stages), configured and deployed using [AWS SAM](../../SAM.md).

This project was originally created using `sam init` and using the `AWS Quick Start Template`.

Key files and folders:
- `lambda` - Code for the two Lambda functions
- `lambda/tests` - Unit tests for the Lambda function handlers
- `lambda/events` - Example invocation events for the Lambda functions
- `template.yaml` - SAM/CloudFormation definition of the application's resources


# Running unit tests

```bash
benbot $ cd lambda
lambda $ npm i
lambda $ npm run test
```

# Deployment

## Step 1 - Building & deploying the Lambda functions (CloudFormation stack)

Note, you need the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed.

```bash
# setup AWS auth if you haven't already done so
aws configure

# dependencies in `lambda/package.json` installed, deployment package created and stored in `.aws-sam/build` folder
sam build

sam deploy --guided
```

If you choose to save arguments from `sam deploy --guided` to `samconfig.toml` you can then run `sam deploy` next time without needing to re-enter the arguments.

### Test the `Fulfilment` Lambda function

It's worth testing the Lambda function that will fulfil the bot's intent to notify users. You can use the example events in `lambda/events` for this.

```bash
benbot$ sam local invoke FulfilmentFunction --event events/validEvent.json
```

> `Important`: In order to send/receive email while in Sandbox mode you need to send from and deliver to verified email addresses. You can verify the address you want to use like this:
>
> `aws ses verify-email-identity --email-address "email@example.com"`

### Inspecting logs

SAM can gather CloudWatch logs generated by Lambda functions from the command-line:

```bash
benbot$ sam logs -n FulfilmentFunction --stack-name benbot --tail
```

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.


## Step 2 - Build and configure the Lex bot

Currently SAM/CloudFormation doesn't support Lex, so to get the bot running you need to follow a few manual steps.

Essentially we're setting up the following:
- A custom bot, `AlertBot` with no output voice (this is text-only application)
- A single intent, `RaiseAlert`
  - A few utterances to trigger it, e.g. __"Alert the team"__, __"I want to alert the team"__, __"Send an alert"__
  - A custom slot type, `AlertLevel`
    - `Restrict to slot values and synonyms` enabled
    - Supported values of `red`, `orange`, `yellow` and `help`
  - A custom slot (also called `AlertLevel`) using our custom slot type (naming is important as the Lambda code uses this)
    - A prompt to request the level of alert to use
  - Error handling, to handle unrecognised input (e.g. the initially __"Hello"__ etc from user), where a more suitable response is configured, e.g. __"Please say 'send an alert' to send an alert"__.
  - Initialise and validate code hook, pointing to our __validate__ Lambda function. Also need to grant the Lex bot permission to invoke the function.
  - Fulfilment code hook, pointing to our __fulfilment__ Lambda function. Again, need to grant Lex bot permission to invoke the function.

This can be done either via the AWS Lex console or via the [CLI](https://docs.aws.amazon.com/lex/latest/dg/gs-cli.html)

Save and build the bot then this can be tested in the AWS console or via the CLI/API.

Finally, when happy with the bot behaviour, publish it and create an alias.

[Slack integration](https://docs.aws.amazon.com/lex/latest/dg/slack-bot-association.html) or other integrations (__channels__) can then be setup if desired.


# Cleanup

Manually clean up the Lex bot then you can delete the stack resources using this:

```bash
aws cloudformation delete-stack --stack-name benbot
```