# AWS Serverless Application Model (SAM)

**SAM** = **S**erverless **A**pplication **M**odel. It's an extension of [**CloudFormation**](./CloudFormation.md).

> _The command line tool allows developers to initialize and configure applications, debug locally using IDEs, and deploy to the AWS Cloud._

* Simulates a real-time AWS runtime environment using Docker and AWS CLI.
  * Support live-reloading (no need to redeploy function)
  * Mimics restrictions like timeouts and memory allocation
* [AWS SAM on GitHub](https://github.com/awslabs/serverless-application-model)
* [AWS SAM overview & installation](https://aws.amazon.com/serverless/sam/)
* [AWS SAM Developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
* [AWS SAM Template spec](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification.html)

Note: will **still access actual AWS** for specific things. Credentials for this are:
* First looked for in the environment (`AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID`)
* If not found, then in `~/.aws/credentials`
* If not found, then on your instance profile `curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/<InstanceRole>`

## Setting up a SAM project

```
# setup sample app
sam init

# ... make edits ...

# validate template.yaml file in current directory as compatible with SAM
sam validate

sam package --template-file /path/to/template.yaml --output-template packaged-template.yaml --s3-bucket bucketToUploadTo
# alternatively can use `sam build` to automatically pick up the template.yaml file and output stuff to a `build` folder

sam deploy --template-file packaged-template.yaml --stack-name newCloudFormationStack --capabilities CAPABILITY_IAM
# CAPABILITY_IAM signals CloudFormation to create roles for us
# also: `sam deploy --guided`
```

## Testing locally

```
# start local HTTP server in Docker
# uses local CloudFormation resource descriptions
sam local start-api

# generate an event file for testing
# similar to what you see when creating test event in AWS Console
sam local generate-event s3 > eventFile.json

# invoke function once then terminate
cat eventFile.json | sam local invoke "MyFunction"
sam local invoke "MyFunction" -e eventFile.json
```