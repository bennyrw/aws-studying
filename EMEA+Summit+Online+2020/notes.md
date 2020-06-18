# Training & Learning

* aws.amazon.com/training
* aws.amazon.com/training/learning-paths
* aws.amazon.com/blogs
* `Lab` hands-on labs/walkthroughs - aws.amazon.com/getting-started/hands-on


# Security & Compliance

* [Introduction to AWS Security (Slides)](Introduction+to+AWS+Security_Myles+Hosford_Final.pdf)
* [Let's encrypt everything! (Slides)](Let's_encrypt_everything__really_everything_-_Seb_Stormacq.pdf)
* [Security Best Practices: The Well-Architected Framework (Slides)](Security_best_practices_The_Well-Architected_Framework_-_Martin_Beeby.pdf)
* `Course` [AWS Security Training](https://aws.amazon.com/training/path-security/)
* [AWS Security Hub](https://aws.amazon.com/security-hub) - Security alerts and posture
* [AWS Artifact](https://aws.amazon.com/artifact/) - Access to AWS compliance reports (ISO 9001, SOC-2, etc)
* [AWS Compliance Center](https://atlas.aws/) - Research regulatory compliance for different countries around usage of Cloud resources
* [Amazon GuardDuty](https://console.aws.amazon.com/guardduty) - ML-driven threat detection
* `Lab` github.com/YecineA/elb-authentication-cognito (ELB + Cognito)
* [AWS KMS](https://aws.amazon.com/kms/)
* [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
* `Whitepaper` https://d0.awsstatic.com/whitepapers/Security/AWS_Security_Best_Practices.pdf


# Software Process

* [Amazon CodeGuru](https://aws.amazon.com/codeguru/) - Augments human code review, searches for AWS best practices, concurrency issues, resource leaks, profiling. (Java only, but one to keep an eye on)
* **VS Code** plugins or things to include in **build pipeline**
  * https://github.com/stelligent/cfn_nag - Linter for CloudFormation templates
  * https://github.com/aws-cloudformation/cfn-python-lint - Linter for CloudFormation templates
  * https://github.com/aws-quickstart/taskcat - Tests CloudFormation templates by actually deploying them to different regions with sample parameters. More of an active check than the above linters.


# Infrastructure-as-code

* [Deep dive into Infrastructure-as-code on AWS (Slides)](Deep_dive_Infrastructure_as_code_on_AWS_-_Darko_Meszaros.pdf)
* Best practice to **modularise CloudFormation templates**


# Architecture

* aws.amazon.com/builders-library
* aws.amazon.com/this-is-my-architecture
* aws.amazon.com/solutions
* Well-Architected Tool and advice
  * aws.amazon.com/architecture/well-architected/
  * `Course` [AWS Well-Architected Training](https://www.aws.training/Details/Curriculum?id=12049)
  * aws.amazon.com/blogs/apn/the-5-pillars-of-the-aws-well-architected-framework/
  * d1.awsstatic.com/whitepapers/architecture/AWS_Well-Architected_Framework.pdf
* Serverless
  * `Course` [Architecting Serverless Solutions](https://www.aws.training/Details/eLearning?id=42594)
  * `Video` [AWS re:Invent 2017 - Serverless patterns and best practices](https://www.youtube.com/watch?v=Xi_WrinvTnM)
  * `Whitepaper` https://d1.awsstatic.com/whitepapers/serverless-architectures-with-aws-lambda.pdf
* API design
  * `Course` [API Gateway for Serverless apps](https://www.aws.training/Details/eLearning?id=27199)


# Coding

* [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) - Use familiar languages to model infrastructure as code (which then uses CloudFormation behind the scenes)
  * Can use [Jest to test](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) what a stack looks like etc (e.g. against snapshots but also assertion `expect(stack).toHaveResource('AWS::SWS::Queue', {...})`)
  * `Lab` https://docs.aws.amazon.com/cdk/latest/guide/examples.html
* AWS **Amplify**
  * `Lab` https://docs.amplify.aws/start/q/integration/react
  * `Lab` github.com/phonghuule/voterocket-lab (Amplify)
* Other
  * `Lab` github.com/justasitsounds/lambda-edge-lab (A/B testing on Lambda with CloudFront)
  * `Lab` github.com/JerryChenZeyun/aws-health-api-organization-view (AWS Health API and QuickSight)


# Storage and databases

* aws.amazon.com/products/databases - Comparison of different database types
* `Infographic` [Right database for the right job](https://d1.awsstatic.com/webteam/category-pages/Databases/AWS-Database-Products-Infographic.pdf)
* `Course` [AWS Storage learning path](https://aws.amazon.com/training/path-storage/)
* `Course` [RDS Primer](https://www.aws.training/Details/eLearning?id=36999)
* `Course` [DynamoDB for Serverless Architectures](https://www.aws.training/Details/eLearning?id=27196)


# Big data, data analysis, data lakes, etc

* [Raw data to business insights to build a modern data lake (Slides)](Raw_data_to_business_insights_What_you_need_to_build_a_modern_data_lake_-_Javier_Ramirez.pdf)
* [Best practices for implementing a data lake in S3 (Slides)](Best_practices_for_implementing_a_data_lake_in_Amazon_S3_-_Kumar_Nachiketa.pdf)
* [Modernising your data warehouse (Slides)](Modernize_your_data_warehouse_-_Aneesh_Chandra.pdf)
* [Streaming and real-time analytics (Slides)](Streaming_and_real-time_analytics_-_Donnie_Prakoso.pdf)
* `Course` [Data Analysis Fundamentals](https://www.aws.training/Details/eLearning?id=35364)
* aws.amazon.com/snowball/ - AWS computing and storage capabilities to edge environments. Seems possible to rent very powerful devices for short term data processing/analysis jobs offline and then upload to S3 etc.


# ML

* [How to build smart apps without a ML background (Slides)](How_to_build_smart_applications_without_a_machine_learning_background_-_Alex_Casalboni.pdf)