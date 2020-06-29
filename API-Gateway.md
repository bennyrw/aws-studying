# Concepts

`Deployment` - Snapshot of API's resources and deployments. Callable when associated with a stage.

`Stage` - Reference to a lifecycle status (e.g. dev, prod, beta). Each stage provides a unique URL suffix. Resource URLs are like `...amazonaws.com/stage/resource` where `stage` might be `dev` or `prod` etc


# Features

Supports:
* Rate-limiting
* API keys
* Public access
* [IAM](../IAM.md)