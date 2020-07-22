# General

* Understand the shared responsibility model - AWS are responsible for _security **of** the Cloud_, users are responsible for _security **in** the Cloud_.

# Permissions, etc

* Rule of least privilege.
* [IAM best practices](../IAM.md)

# Network security

* Keep traffic between services private using [VPCs](../VPC.md) - don't route over the public internet unless necessary
* Secure data in transit using certificates, e.g. **AWS Certificate Manager**.

# Compliance

* Use regions and AZs to manage compliance with regulations
* Use [AWS Config](../Config.md) to check compliance with rules, regulations and standards

# Data security

* Understand what happens when reading, writing and deleting data
  * **Delete** - does not decom the hardware. In AWS, blocks are marked at unallocated and then spread around for re-use.
  * **Write** - overwrites whatever is there and then writes your data.
  * **Reading** - if previous data exists then it's returned else returns 0/null.
* When a storage device reaches end of life, AWS follows industry standards (e.g. NIST guidelines) for rewriting/destroying drives.

# Security testing and checking

* Use a third-party service with little prior knowledge of infrastructure for penetration testing. Note that AWS must be notified - there's a specific form.
* Considering using [Guard Duty](./GuardDuty.md) for threat detection.
* Use the **AWS Trusted Advisor** tool to automatically check things like IAM, security groups, public access to EBS/RDS snapshots, etc.
* For [EC2](../EC2.md) instances, consider using __AWS Inspector__.
* **AWS Web Application Firewall (WAF)** allows rules and conditions to be configured for **CloudFront** and **ELB**. Can detect things like XSS, SQL injections and can block IPs.
* **AWS Shield** provides DDOS protection and **AWS Sheild Advanced** provides more protection, dedicated support and cost protection from usage spikes.

# Organisational processes

* Monitor procedures
* Measure effectiveness, SLAs, etc. Review regularly.
* Risk assessments at regular invervals.
* Internal audits.