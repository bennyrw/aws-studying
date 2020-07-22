# Key concepts

* Hosted, HA queues for sending messages between servers.
* Allows creation of distributed/decoupled application components.
* Messages between servers are retrieved through **polling**.
  * _Short polling_ - Samples a subset of servers and returns messages from just those servers. Will not return all possible messages, but does return very quickly. Consumers need to continuously poll (messages reappear after the _visiblity timeout_).
  * _Long polling_ - SQS waits a user-specific period until a message is on the queue before sending a response. Returns all messages from all SQS services, but takes longer.
* Messages can contain up to 256kb. Larger messages stored in [S3](S3.md), referenced in the message.
* Different queue types.
  * _Standard queue_ - Guaranteed delivery at least one for each message, but does not guarantee order or that no duplicates will be received. Scales very well.
  * _FIFO queue_ - Guaranteed delivery exactly once and in the order added to the queue. Limits on how many operations/messages can be handled per second.
* If you don't explicitly delete a message from the queue, it will be added back to it after a duration known as the _visibility timeout_. This also allows a basic form of retry.
* Can redirect failed messages to a _dead letter queue_, e.g. for logging.
* Messages can be encrypted using [KMS](KMS.md)

# CLI

```
aws sqs send-message --queue-url ... --message-body "test"

# short poll
aws sqs receive-message --queue-url ...

# long poll
aws sqs receive-message --queue-url ... --wait-time-seconds 20

# delete a message
aws sqs delete-message --queue-url ... --receipt-handle ...
```