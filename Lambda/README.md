# Overview

* Function-as-a-Service, event-sourced/event-driven architecture
* Not suitable for every project. Good for: start-ups where don't want to spend time on Ops; light use sites where costs may be lower (it's pay-per-use). But not so good if you want to control resource usages or if you've got a large/slow site where costs can spiral.

# Useful links

* LinuxAcademy's 'Lambda Deep Dive' course resources
  * [LucidChart course notes](https://app.lucidchart.com/documents/view/4ec7e6c2-e99c-44f2-aad6-7fb7fbceb988/fB.lPxz788ce)
  * [Lab resources, including sample functions and events](https://github.com/bennyrw/content-lambda-deep-dive)
* [Official AWS Lambda docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
* [Lambda pricing](https://aws.amazon.com/lambda/pricing/)

# Gotchas

* Be aware of **cold start** times - first invocations are slower; subsequent are faster.
* Dashboards & functions are **per-region**
* Always **tag** your AWS resources so you can find/filter/group them
* If something isn't working as you expect, **check the execution permissions**

# Lambda building blocks

* Lambda function - entry point
* [Event source mapping](#invoking) - what triggers it
* Downstream resources - other services the function needs
* [Log streams](#logging-&amp;-monitoring) - within CloudWatch. Different defaults between languages.
* AWS **SAM** - Serverless Application Model (used to define the serverless architecture)

# Defining a function

* Source code - (deployment package - zip up deployment code along with dependencies, max 50mb each)
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

# Failure

* Issues (timeouts, code exeptions, resource constraints) will cause exceptions.
  * Synchronous failures - app invoking function gets `429 Too Many Requests` error.
  * Async failures - tries 2x then sends to [dead letter queue](#defining-a-function) if fails again (if configured)
  * Stream failures - retries until data expires (service-dependent) and will block and not read new records until retry succeeds.

# Logging & Monitoring

* **Lambda** automatically monitors and logs metrics (e.g. like invocation count, invocation duration, errors) in **CloudWatch**
* Additional logs can be included using language's logging/print statements (e.g. `console.log()`) and are then pushed to _Log Groups_ in **CloudWatch**
  * Remember execution role needs `PUT` permission to **CloudWatch** to do this.
* Use **X-Ray** for more in-depth analysis (e.g. covering execution timeline including communication with other services), but this needs:
  * Environment variables to be defined (to identify **X-Ray** trace and some other bits)
  * Include **X-Ray** SDK in your code
  * Use 16Mb/3% of the RAM allocated for your function

# CloudWatch & Lambda

You can setup _Alarms_ in **CloudWatch** to be notified of specific things (e.g. number of errors occurring in time period). Alarm can then publish to **SNS** topic, for example.

You can also have **CloudWatch** trigger a **Lambda** function (or other things) using a _CloudWatch Event_ (AKA _EventBridge_).
* You can configure these in the **Lambda** _designer_ when triggering from **CloudWatch**.
* Or you can configure them in **CloudWatch** directly (in _Events_, configuring a source and then setting your function as the target).
  * The event _source_ can be either an event pattern or on a schedule (fixed period or cron).

# CLI & Lambda

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

> _"SAM CLI allows faster, iterative development of your Lambda function code"_

See [SAM notes](../SAM/README.md)