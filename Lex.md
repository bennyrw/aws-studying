# AWS Lex

> Building conversational interfaces using voice & text

* [AWS Lex developer guide](https://docs.aws.amazon.com/lex/latest/dg/what-is.html)
* [AWS Lex](https://aws.amazon.com/lex/)
* [Serverless chatbox with AWS Lex](linuxAcademy-serverless-alerting-chatbot.pdf)

# Concepts

A conversational app is series of **intents**.

An **intent** performs an action in response to **utterances** (natural language user input).

**Utterances** are exact phrases users speak/type that invoke an **intent**.
* **Lex** uses a trained NLP model to recognise intents from your bot's configuration.
* Missed utterances are recorded in a log and can be fed back into model as further training.

**Slots** are data required to fulfil the **intent**. Slots have a **slot type** (lots of built in `AMAZON.xxx` types but can define own).

**Prompts** are shown to gather data for every slot and optionally for confirmation. **Lex** supports multiple prompts to randomly choose between to make conversation more natural (e.g. __"What time would you like your meeting?"__ and __"When would you like the meeting?"__)

**Lex** maintains **context** by storing data throughout conversation (slot values, prompts, session attributes, etc)

**Fulfilment** is executing the **intent**.

[Lambda](./Lambda.md) is typically used to validate input, guide **Lex** behaviour and to fulfil an intent.

# Dynamic conversations (Branching)

**Lex** supports __switching intents__ from an original intent to another depending upon user input.

__Chaining intents__ is also possible so that one intent continues into another when completed.

# Versioning and aliases

As with [Lambda](./Lambda.md), **Lex** supports a `$LATEST` mutable version of a configuration and the ability to __publish__ immutable copies of that version. __Aliases__ can be configured to refer to specific numbered versions (e.g. `$PROD` -> version 2, `$DEV` -> version 5).

# API calls

* [Example of Lex, Lambda & client API calls during conversation](https://docs.aws.amazon.com/lex/latest/dg/gs-bp-details-after-lambda.html)

Input event format:
* `bot`
* `currentIntent`
* `userId`
* `inputTranscript`
* `invocationSource`
* `outputDialogMode`
* `sessionAttributes` / `requestAttributes` (attributes persisted for session/request)

Response format
* `sessionAttributes`
* `dialogActions` (tell Lex what to do next)
  * `ElicitSlot` - Lex will ask for a slot
  * `ElicitIntent` - Lex will ask what user would like to do
  * `ConfirmIntent` - Lex will ask user to confirm intent
  * `Delegate` - Lex does what it would typically do next (automatic)
  * `Close` - Fulfilment has been done and tells Lex not to expect further responses from user

# Use cases

* [AWS examples](https://docs.aws.amazon.com/lex/latest/dg/additional-exercises.html)
* Employee assistant bot
  * **Intents:** book time off; create expense form; book meeting room
* Customer service bot
  * **Intents**: upgrade plan; book appointment; cancel server
* DevOps bot
  * **Intents**: Update ticket; rollback; deploy