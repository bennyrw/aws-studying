# VPC - Virtual Private Cloud

Define your own Cloud - control of IPs, subnets, internal & external connectivity.

* [AWS re:Invent 2018 VPC Fundamentals and Connectivity Options](https://www.youtube.com/watch?v=jZAvKgqlrjY)

# Definition

1/ **Choose IP address range**
* RFC1918 range (non-internet-routable, e.g. `10.x.x.x` or `172.x.x.x`) and use `/16`
* Pick non-overlapping ranges
* Can have dual IPv4 and IPv6 if needed

2/ **Create subnets in Availability Zones**
* VPC is across a **region** and within regions there are independent **availability zones** with independent UPS, connections, etc

3/ **Create a route to the internet**
* **Route table** defines rules for which packets go where
* Your VPC has a __default route table__ but you can override that on subnet-by-subnet basis.
* To send traffic to the internet, send anything not matching subnet IPs to the internet gateway

4/ **Authorise in/out traffic (firewall rules)**
* Define **security groups** for resources with a common purpose
* Define ingress (in) and egress (out) rules
* Follow __principal of least privilege__

# Connectivity patterns

* Load balancer servers that are internet routable but keeping app & db servers on a private subnet to prevent them being accessed/communicating out.
  * But if those servers need to access the internet (e.g. updates) can use a **NAT Gateway** to avoid having to open everything up.
* In each availability zone used by your app, create public and private subnets in each availability zone.
* **VPC peering** - cross-VPC connectivity, e.g. sharing server.
  * Can be in different accounts, different regions. But CIDR ranges must not overlap.
  * Handshake to  setup - peering request, agree request, both sides setup route to peering connection.
* Connecting to on-premise networks
  * e.g. hybrid model, some apps on-prem and some in Cloud
  * **AWS VPN** - Set up your own networking device to be __customer gateway__. In your VPC you have a __virtual private gateway__. This establishes a VPN connection of two IPSec tunnels over internet. Good idea to setup to terminate in 2 availability zones for redundancy. Then setup routes.
  * **AWS Direct Connect** - put your own hardware in location which is shared with AWS. Can then create __private virtual interface__ (access VPC resources) or __public virtual interface__ (public connectivity to AWS services without going over public internet).
* Can also avoid your VPC having to use public internet for AWS services by using:
  * **Gateway VPC endpoints** (for S3 and DynamoDB) - route to them using route table. Traffic looking like going to S3, goes to this endpoint. No app changes needed. Can additionally use IAM policy (a) at VPC endpoint to restrict what the VPC can do and (b) on S3 bucket to only allow access from VPC.
  * **Interface VPC endpoint** (using [AWS **PrivateLink**](https://aws.amazon.com/privatelink/)) - creates private IPs in availability zones and these route through to AWS APIs (e.g. EC2). Isn't a gateway, so doesn't use a route table. Uses DNS - when resolve the DNS inside the VPC subnet it resolves appropriately.

# Diagnosing issues

Create a **flow log** for a VPC, which logs access (along with allow/block, port, source IP, etc) into [CloudWatch](./CloudWatch.md) logs.