Infrastructure as code.

* [**Template**](#Templates) - declare resources. Semantically like a class in OO programming. Stored locally or in S3.
* [**Stack**](#Stacks) - instantiation of a Template, like an object instance in OO programming

> Stacks exist within a single region. For cross-region (or even cross-account) stacks, use [AWS CF StackSets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html)


# Best practices

* **Avoid drift** - Any resources managed in CF should only be modified in CF and not directly. Doing so is called [__drift__](#drift) (but in some very special cases it is necessary).
* **Assign least privilege access** - Assign appropriate [IAM](./IAM.md) role(s) to CF
  * The role needs to have CF permissions as well as permissions on the resources/services being managed.
  * Use **IAM service roles** to limit permissions and **never blindly use a root/admin account**
  * e.g. only allow certain people to create/update/delete production stack
* Don't embed credentials/sensitive info in templates - use secure variables in [Systems Manager](./SystemsManager.md) or [Secrets Manager](./SecretsManager.md)
* **Validate parameters** (`AllowedPattern`, `MinLength`, list items, etc) to prevent GIGO and mask (`NoEcho`) passwords etc
* **Organise stacks** - grouping by lifecycle/ownership
* **Reuse template** - Use [nested stacks](#nested-stacks) and replicate prod/test/dev infrastructure using parameters, mappings and conditions
* When creating/updating a stack, don't necessarily go straight to use existing templates. A good learning approach is to plan out the top-level resources you need then think about what configured properties/resources each of those need (which you can determine from the console/CLI properties and the CF documentation for those services)
* **Use Guardrails** - Stack policies, drift detection, etc
* **Use Change Sets** when updating stacks


# Resource types

> [AWS CF Resource and Property Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)

Note CF doesn't support all AWS resources out-of-the-box - but you can add/find support using **custom resources**.


# Templates

## Template sections

> [Template anatomy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html)

* **Format Version**
* **Description**
* **Metadata** - Set arbitrary metadata but also some data used by other CF features (e.g. `cfn-init` script uses `AWS::CloudFormation::Init` metadata values)
* **Parameters** - Variables for use in the stack, helps with re-use.
* **Mappings** - Define arbitrary maps for use in the template, e.g. region to AMI
* **Conditions** - Define conditions for use in the template. One use case is to allow creation of different spec/layout in dev vs test vs prod. Typically would use a parameter, define a condition and then use it in `Condition` field for each resource.
* **Transform** - [Macros](#Macros/Transforms) used to mutate the whole or a subpart of the CF template.
* **Resources** - The actual resouces to create.
* **Outputs** - Tvailable to use after stack created. Can be used for cross-stack references. e.g. website URL.

## Pseudo parameters (global vars)

> [Psuedo parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html)

## Systems Manager parameters and references

[Systems Manager](./SystemsManager.md) has a __Parameter Store__, where you can define variables that can be used as parameters in CF templates. e.g. use one of the following in place of a value:
```
AWS:SSM:Parameter:Name
AWS:SSM:Parameter:Value<String>
AWS:SSM:Parameter:Value<List<String>>
AWS:SSM:Parameter:Value<Any AWS type>
```

You can also directly reference Systems Manager variables in place of other values in a CF template.
CF retrieves the referenced value when required, e.g. during creation.

> https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html

## Intrinsic and conditional functions

> [Intrinsic functions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html)

> [Conditional functions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html)

* Can only be used in some parts of a template.
* `Fn::Ref` etc can be used in YAML and JSON. YAML has shortform `!Ref` etc
* But remember `!If` doesn't mean __not if__, __not__ has its own conditional function `!Not`

Can nest functions, e.g.
* Generate an ARN:
```
!Join
  - ''
  - - 'arn:'
    - !Ref AWS::Partition
    - ':s3:::elasticbeanstalk-*-'
    - !Ref 'AWS::AccountId'
```
* Split a string and pick a value:
```
!Select [2, !Split [",", !ImportValue AccountSubnetIDs]]
```
(In this example, could alternatively use `!Sub` to do string interpolation)

## Macros/Transforms

Modify the CF template (e.g. search & replace), either as a whole (if `Transform` is defined at top-level) or sub-part (if `Fn::Transform` is defined for a specific part of the template).

> https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-macros.html

Executed in the order defined.

Two AWS-provided macros:
* `AWS::Include` - include a snippet from [S3](./S3.md) in the template
* `AWS::Serverless` - define a Lambda functions using [SAM](./SAM.md) syntax. The macro converts the SAM format into CF format.

Under the hood macros all use [Lambda](./Lambda.md).

## Nested stacks

> [Working with nested stacks](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-nested-stacks.html)

It's a best practice to reuse template content by defining reusable modules/components in separate stack templates. These can then be included (__nested__) in other templates by defining `AWS::CloudFormation::Stack` resources.

Note that you shouldn't update a nested stack directly, always update the highest-applicable parent (or the root stack if applicable).

## Wait conditions

Pause stack creation until a condition is met. Set up using __additional resources__ in the CF template:
* `AWS::CloudFormation::WaitConditionHandle` - this sets up a pre-signed URL that receives JSON to allow signalling of success/failure
* `AWS::CloudFormation::WaitCondition` - this defines what handle to use, what is being waited on (`DependsOn`), the timeout and, optionally, the count.

## Create/update policies

* Create policies - Very similar to [wait conditions](#wait-conditions) in that these pause creation of a resource but these are defined as properties on a resource, whereas wait conditions are explicit resources.
* Update policies - Structured way of updating __Auto scaling groups__ allowing rolling updates.

## Bootstrapping EC2 instances

* Use [helper scripts](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-helper-scripts-reference.html), `cfn-init`, `cfn-signal`, `cfn-get-metadata`, `cfn-hup`


# Stacks

> [Working with Stacks](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html)

Stack creation/deletion is an all-or-nothing operation.
i.e. if deletion fails, stack goes to `failed` status and may still have resources hanging around and costing money.

Setting up a stack is all-or-nothing - if an error occurs, CF rolls back.
You can also setup **rollback alarms** to monitor the creation of the stack and roll it back if specific [CloudWatch](../CloudWatch.md) alarms are triggered.

## Protecting from accidental deletion/update

> The items below, along with drift detection, are also known as __Guardrails__

* Termination protection
  * Configure when creating the stack (default = disabled)
  * Manage who can remove termination protection with IAM policies
  * For nested stacks, cascades from parent to child.
  * Remember you're only protecting the stack in CF - you need to ensure resources can't be deleted directly (e.g. in EC2)
* [Stack policies](#create/update-policies)
  * Configure when creating the stack (default = none). Syntax like IAM definitions 
  * Fine-grained control over update/delete protection per resource.
* Resource policies
  * Configure in the CF template, e.g. `DeletionPolicy: Retain`
  * Fine-grained control over what happens when each resource is deleted.
  * Can configure it to delete it, retain it, or snapshot it.
* IAM policies
  * Define user/group roles that have appropriate permissions on CF, even specific stacks.

## Monitoring stacks

[AWS Config](../Config.md) can be used for this.

## Making updates

You don't need to delete and recreate a stack. Instead, submit new parameters or an updated template to generate a **change set** that allows you to update only the changed resources.

> You can also do a __direct update__ where you don't preview the changes, but obviously don't do that for prod!

Different update behaviour depending upon the resource:
* Update with no interruption (retain ID)
* Update with some interruption (retain ID)
* Replacement (new ID)

## Drift

_Drift_ occurs when the stack diverges from its template via manual editing.

Detect drift in the [CLI](#CLI) or [AWS Config](./Config.md) (the `cloudformation-stack-drift-detection-check` rule).

Remediate drift manually by reviewing the generated drift reports.


# Stack sets

Manage stacks across multiple regions and accounts, kicking things off in a single operation initiated by an admin. Useful for HA/DR.

> https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html

* Admin account - Account where the stack set is created from a CF template
* Target accounts - Accounts into which stack instances are created (must have an [IAM](./IAM.md) trust relationship)

Stack sets can be updated by changing template parameters (if there are any) or using a new template. You can also use __override parameters__ to use different parameter values in different accounts/regions.

After a stack set has been created in specific accounts and regions, you can add more stacks (either by deploying into more accounts and/or regions).

To __delete__ a stack set, you have to delete stack instances first - there is an option for this in the console under the **Actions** dropdown.

## Best practices for stack sets

* Be sure global resources don't have naming conflicts (e.g. S3 buckets)
* Test on a small number of accounts/regions before applying everywhere (easy to add more accounts/regions later)
* Consider multiple stack sets to keep things organised and have granular control
* Updates to large stack sets can take time, which may block other operations on the stack resources.


# CLI

> [CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/index.html#available-commands)

```
aws cloudformation help

aws cloudformation list-stacks

aws cloudformation describe-stacks

aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE

aws cloudformation create-stack --stack-name MyStack --template-body file://path/to/template.yaml --parameters ParameterKey=key1,ParameterValue=value1,ParameterKey=key2,ParameterValue=value2

aws cloudformation detect-stack-drift                       # kick it off async
aws cloudformation describe-stack-drift-detection-status    # check status
aws cloudformation describe-stack-resource-drifts           # view result
```


# CloudFormer

__Beta__ tool that can create a CF template based on your existing resources in your AWS account. Intended as a quickstart to begin using CF. Spins up a new EC2 instance that then provides a wizard to guide you through.


# Troubleshooting

> [User Guide - Troubleshooting](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html)