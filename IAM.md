# Best practices

* **Protect root account** - MFA, no access keys, lock access away, never use for day-to-day access. Use named admins instead (these can be revoked/disabled)
* Apply principle of **least privilege**
* **Use groups** to set permissions based on role, then assign users to groups.
* Inspect access using the [Access Advisor](#access-advisor).

# General

IAM has global scope, i.e. is across all regions.

Can customise the IAM user sign-in link using the console.

# Users

Implicit deny, need policies attached to explicitly allow permissions

## Root user

Some tasks still need root user - e.g. closing an account, payments/billing, transferring stuff to other accounts (e.g. S3 domain), requesting removal of some throttles (e.g. port 25 email), create CloudFront key pairs

**Never use the root user for day to day usage**

# Roles

A role is an entity that can be granted permission to interact with AWS resources.

A role has two components:
* **Trust policy** - Defines who can assume the role
* **Permissions policy** - Access rights granted when the role is _assumed_ by another entity (e.g. AWS resource, a user outside our account, federated access, SAML, etc).

For example, a [Lambda](./Lambda.md) functions needs to access an [S3](./S3.md) bucket. The function assumes a role with appropriate S3 access and can then access the data it needs.

Roles have no long-term access credentials. Instead, when assuming a role temporary credentials managed by **AWS STS** are used (valid for minutes to hours). Credentials can be renewed early and will be granted so long as the requesting identity has permissions to assume the role.

> STS - Secure Token Service
>
> https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html
>
> Allows temporary time-limited access without need to store users' credentials.
> Temporary credentials have global scope, just like IAM.

**Note:** AWS services can only have one role attached at a time.

Never pass/store credentials to an EC2 instance, always use roles instead to protect those credentials. (i.e. don't use `aws configure` etc on the instance and instead assign a suitable role to that instance instead, which the `aws` CLI tools can then use)

## Revoke session

You can't expire STS temporary credentials, they're valid until the expiry.

However... you can use the console/CLI to revoke existing sessions. This actually amends the **permissions policy** for the role to include a `deny` rule for any tokens issued before the revocation time.

# Access Advisor

Can look at usage from IAM user, group or role and see when AWS services were last accessed. Can help to identify inappropriate access (where it occurred, not what is possible).

Can help to remove roles that aren't used.

# Policies

Note that **an explit deny overrides an explicit allow**