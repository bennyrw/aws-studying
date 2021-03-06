# Lambda - Function-as-a-Service

* Backend-as-a-Service (BaaS) is where common backend functionality (auth, database, api gateway) are in the cloud.
* **Lambda** is function-as-a-Service (FaaS), which goes further than BaaS. Application only lives while executing and is triggered.
  * Event-sourced/event-driven architecture.
  * Applcation is ephemeral. Runs on a seemingly ethereal phantom infrastructure.
* Benefits of serverless
  * Less to worry about and leverage experience of others (e.g. provider's security team)
  * Less infrastructure to manage
  * Built-in scaling
  * Low start-up costs and reduced operational costs
  * Simplified deployments
  * Cheaper for burst-y traffic
  * Faster infrastructure issue resolution (__Can we fix infrastructure problems better than cloud provider's experts?__)
  * Less code - avoiding writing entire chunks of application, which are offloaded to service provider
* Drawbacks of serverless
  * Must keep FaaS apps 'warmed up'. Will be fully stopped if left idle.
  * Other approaches (e.g. AWS ECS or EC2) may be cheaper for large, heavily-used applications.
  * Easy to become vendor-locked
  * Multi-tenancy concerns (data security/resource segmentation)
  * Difficult to optimise infrastructure (e.g. latency experienced)
  * Can be harder to monitor (and may cost money to perform monitoring checks)
  * Giving up control (e.g. limited levels of configuration)
  * Limited issue resolution (can only solve own bugs)

# Useful links

* LinuxAcademy's 'Lambda Deep Dive' course resources
  * [LucidChart course notes](https://app.lucidchart.com/documents/view/4ec7e6c2-e99c-44f2-aad6-7fb7fbceb988/fB.lPxz788ce)
  * [Lab resources, including sample functions and events](https://github.com/bennyrw/content-lambda-deep-dive)
* [Official AWS Lambda docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
* [Lambda pricing](https://aws.amazon.com/lambda/pricing/)

# Gotchas

* **Lambda** supports a max storage of 75GB across all functions. Over time this can mount up, so ensure you're cleaning up old, unused versions (e.g. if using `Serverless` framework, using something like the `serverless-prune-plugin`)
* Be aware of **cold start** times - first invocations are slower; subsequent are faster.
* Dashboards & functions are **per-region**
* Always **tag** your AWS resources so you can find/filter/group them
* If something isn't working as you expect, **check the execution permissions**

# Example use cases

* Automating AWS tasks, for example detecting a non-permitted change to a security group and automatically rolling that change back and sending an alert
   * **EC2** change --> **CloudTrail** events --> **CloudWatch** rule --> **Lambda** --> **SNS** and **EC2** revoke
* __Canary__ code deployments, by splitting executions between two function versions on an [alias](#Versioning-and-aliases). Though note that **API Gateway** may be better suited.
*  Automatically deploying a Docker container published to **AWS ECR** in **AWS ECS**
   * **ECR** --> **CloudTrail** events --> **CloudWatch** rule --> **Lambda** --> **ECS**

# Lambda building blocks

* Lambda function - entry point
* [Event source mapping](#invoking) - what triggers it
* Downstream resources - other services the function needs
* [Log streams](#logging-and-monitoring) - within CloudWatch. Different defaults between languages.
* AWS [SAM](./SAM.md) - Serverless Application Model (used to define the serverless architecture)

# Defining a function

* Source code - (deployment package - zip up deployment code along with dependencies, max 50mb each) - there are ways to re-use common code, see [layers](#layers) below.
* Environment variables (note that these can be encryped using KMS)
* **IAM**/execution role - grants function permissions it needs to interact without AWS services
* Tags
* Memory size (CPU proportional to memory)
* Execution timeout
* Network configuration (accessing VPC, n.b. ensure you setup 2 subnets for high availability)
* **Dead letter queue** for failed event payloads (e.g. **SQS** or **SNS**). Note **Lambda** function will need permission to access resources configured.
* [Max concurrent executions](#concurrency) per region
  * Can be set if need to prevent contention with other functions

Note that is a limit on the size of an invocation request (different for sync/async)

# Invoking

Event sources can be AWS services or custom applications.

## Invocation types

* **Async** - good if only need to know if function was triggered and don't need the result immediately. Order of execution not important.
* **Sync** - used when order matters or a return is needed.

AWS services have predetermined invocation types - e.g. **API Gateway** is synchronous.

## Event models

* **Push** - Function invoked when event received, event contains data needed.
* **Pull** - **Lambda** polls another service and triggers event itself after fetching necessary data

## Concurrency

Unit of measurement for **Lambda** functions.

Stream based: (e.g. DynamoDB sharded database) => `Number of shards`

Non-stream based (e.g. S3 bucket `PUT` events) => `Average Execution Time (s) * Number of Events per Second`

If needed, you can **throttle** concurrency - setting `Max concurrent executions` to 0 to disable the function.

Scaling happens automatically, but the maximum concurrent executions is *dependent on region*. Note that if networking (VPC) is enabled in the function definition then **EC2** limitations will apply and you may need to request increases.

# Layers

Layers:
* Can add additional runtime support for programming languages - this support can be packaged into a layer for re-use or sharing with other accounts
* Layers can be used to package dependencies and common code for reuse.
* Are immutable once created (but new versions can be made).

A Lambda function can have up to 5 layers and total size of all used layers must be <250mb. Layers are extracted into `/opt` of the execution environment.

# Failure

* Issues (timeouts, code exeptions, resource constraints) will cause exceptions.
  * Synchronous failures - app invoking function gets `429 Too Many Requests` error.
  * Async failures - tries 2x then sends to [dead letter queue](#defining-a-function) if fails again (if configured)
  * Stream failures - retries until data expires (service-dependent) and will block and not read new records until retry succeeds.

# Logging and Monitoring

* **Lambda** automatically monitors and logs metrics (e.g. like invocation count, invocation duration, errors) in **CloudWatch**
* Additional logs can be included using language's logging/print statements (e.g. `console.log()`) and are then pushed to _Log Groups_ in **CloudWatch**
  * Remember execution role needs `PUT` permission to **CloudWatch** to do this.
* Use **X-Ray** for more in-depth analysis (e.g. covering execution timeline including communication with other services), but this needs:
  * Environment variables to be defined (to identify **X-Ray** trace and some other bits)
  * Include **X-Ray** SDK in your code
  * Use 16Mb/3% of the RAM allocated for your function

# Lambda with CloudWatch

You can setup _Alarms_ in **CloudWatch** to be notified of specific things (e.g. number of errors occurring in time period). Alarm can then publish to **SNS** topic, for example.

You can also have **CloudWatch** trigger a **Lambda** function (or other things) using a _CloudWatch Event_ (AKA _EventBridge_).
* You can configure these in the **Lambda** _designer_ when triggering from **CloudWatch**.
* Or you can configure them in **CloudWatch** directly (in _Events_, configuring a source and then setting your function as the target).
  * The event _source_ can be either an event pattern or on a schedule (fixed period or cron).

# Lambda CLI

* [Lambda CLI reference](https://docs.aws.amazon.com/cli/latest/reference/lambda/index.html)

```
aws lambda help
```

## Function configuration, etc

```
aws lambda create-function help

aws lambda create-function          \
    --function-name "MyFunction"    \
    --runtime "nodejs12"            \
    --role "arn......"              \
    --handler "function.hander"     \
    --code "S3bucket..."
# or use --zip to provide a local zip

aws lambda list-functions

aws lambda get-function --function-name "MyFunction"

aws lambda get-function-configuration --function-name "MyFunction"

# n.b. update-function-code can't be used to update function *configuration*
aws lambda update-function-code ...

# just include the config fields you need to change (don't need to specify existing config)
aws lambda update-function-configuration ...

# n.b. when using the CLI for this, Lambda automatically reserves a buffer of 100 concurrent executions for functions that don't have any reserved concurrent executions, e.g. if account limit is 1000 then you have 900 available to allocate to individual functions.
aws lambda put-function-concurrency ...
```

## Managing event sources

**Push** events (e.g. S3 event triggering function) require a permission to be added to the source-side before creating event source
```
aws lambda create-function ...
aws lambda add-permission --action "lambda:InvokeFunction" ...
aws s3api put-bucket-notification-configuration ... 
```

**Pull** events (i.e. from Kinesis or DynamoDB) require the function's **IAM** role be able to access the resource.
```
aws lambda create-function ...

aws lambda create-event-source-mapping ...

# there are also these:
aws lambda update-event-source-mapping ...
aws lambda list-event-source-mapping ...
```

## Invocation

```
aws lambda invoke help
```

# Running Lambda functions locally (using SAM)

> __"SAM CLI allows faster, iterative development of your Lambda function code"__

See [SAM notes](./SAM.md)

# Versioning and aliases

By default, there's just one version of a function - `$LATEST`, e.g. `MyFunction:$LATEST` (actually, this is an alias - see below)

You can explicitly create a version (readonly) from `$LATEST` using the console or CLI, e.g. `MyFunction:1`

**Each version has a unique ARN**.

Note: It is **best practice** NOT to set event sources on function versions directly and __instead use aliases__... Although you can set these up, __they are not copied__ when new versions are published, so event sources will not carry forward.

An **alias** is a named pointer to a specific version, which you can move. You can even perform **A/B testing** by splitting traffic between two versions!

An alias also gets a unique ARN and ends with something like `MyFunction:PROD`

```
aws lambda publish-version --function-name MyFunction

aws lambda list-versions-by-function --function-name MyFunction

aws lambda create-alias --function-name MyFunction    \
  --description ...                                   \
  --function-version 1                                \
  --name PROD
```

# Lambda with CloudFormation

AWS infrastructure-as-code.

[Lambda resource type reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/AWS_Lambda.html)

**Lambda**-specific **CloudFormation** Resources:
* `AWS::Lambda::EventSourceMapping` - Create/specify **Kinesis**/**DynamoDB** stream to use as source for a function.
* `AWS::Lambda::Alias` - Creates an [alias](#versioning-and-aliases) to use
* `AWS::Lambda::Function` - Create the function
* `AWS::Lambda::Permission` - Grant another service access to invoke a function
* `AWS::Lambda::Version` - Publish a version (`$LATEST` is copied to this version)