# VPC - Virtual Private Cloud

Define your own Cloud - control of IPs, subnets, internal & external connectivity.

* [AWS re:Invent 2018 VPC Fundamentals and Connectivity Options](https://www.youtube.com/watch?v=jZAvKgqlrjY)

3 zones from perspective of an AWS architecture:
* AWS - services within VPCs
* AWS Public Zones - services accessible inside AWS and from the public internet, e.g. S3, DynamoDB
* Public internet

# Definition

1/ **Choose IP address range**
* RFC1918 range (non-internet-routable, e.g. `10.x.x.x` or `172.x.x.x`) and use `/16`
* Pick non-overlapping ranges
* Can have dual IPv4 and IPv6 if needed

2/ **Create [subnets](#subnets) in Availability Zones**
* VPC is across a **region** and within regions there are independent **availability zones** with independent UPS, connections, etc

3/ **Create a route to the internet**
* **Route table** defines rules for which packets go where
* Your VPC has a __default route table__ but you can override that on subnet-by-subnet basis.
* To send traffic to the internet, send anything not matching subnet IPs to the internet gateway

4/ **Authorise in/out traffic (firewall rules)**
* Define **security groups** for resources with a common purpose
* Define ingress (in) and egress (out) rules
* Follow __principal of least privilege__

# VPC

* The VPC gets overall CIDR range, which are then shared out between subnets and resources.
* Ensure you use different ranges for each VPC and not overlapping with on-prem network.
* Unless you configure otherwise, VPCs in different regions can't communicate.
* VPCs occupy all AZs in the region you create them in.
* There is a default VPC that some services depend upon (e.g. ELB).

> [**AWS Resource Access Manager (RAM)**](https://docs.aws.amazon.com/ram/index.html) allows you to share VPC resources between accounts.

# Subnets

* Subnets can only be associated with a single VPC and a single AZ.
* Subnets take part of the VPC's CIDR range.
* Some IPs are reserved in each subnet, .0, .1, 2, .3, .255
* Subnets are private by default.
* Subnets can be made public by:
  * Creating an Internet Gateway
  * Creating a default route pointing to the IGW (make custom route table; add public route `0.0.0.0/0` to IGW, i.e. anything not destined within VPC goes to IGW)
  * Associate custom route table with subnets to make public)
  * May want to amend each public subnet's IP addressing rules to auto-allocate public IPs.
* Any services within the VPC use the `network + 2` IP address, e.g. `10.0.0.2`.

# Routing

* Every VPC has a VPC router
* Per-VPC logical device
* Occupies `network + 1` IP address, e.g. `10.0.0.1`
* Configured via **route tables**, which define where IP traffic is sent.
* Each VPC has a _main route table_, which is associated with all subnets that don't have a custom route. (Only one route table associated with a subnet)
* Each route table starts with a single fixed entry for a local IP range.
* More specific routes take priority (e.g. /32 is higher priority than /16 etc)

# Network Access Control Lists (NACLs)

* Network-level logical entity. Can only define rules in terms of IP ranges.
* **Stateless** security filtering.
* Applies only when crossing a subnet boundary, e.g. between two subnets the outgoing rules from one subnet and the incoming rules from the other subnet will be applied. NACLs are never applied within a subnet, e.g. between EC2 instances.
* Each VPC has a default NACL, associated with any subnets that don't have specific NACLs assigned
* Subnets can only have one NACL - either the VPC's default or a custom one.
* By default, NACLs allow all traffic!
* **Important:** May need to add ephemeral ports (1024-65535) explicitly to outgoing rules to allow response traffic to leave the network.
* Rules processed in order of _rule #_. Once a rule matches, it applies the allow/deny and stops processing.

# Security Groups

* **Stateful** filtering attached to AWS network interfaces on resources.
  * If traffic is allowed in, the corresponding return traffic is automatically allowed (this can't be changed). And vice versa. This means you don't need to add ephemeral ports like for NACLs.
* Multiple SGs can be associated with a NIC and a single SG can be associated with many NICs.
* There is no order - all rules are evaluated together. There is a default implicit deny for any non-matched rules, but this means you can't explicitly deny traffic. (You need to use NACLs for that)
* Can reference other logical resources, e.g. other SGs, EC2 instances, even itself.

# Internet Gateways and NAT Gateways

* IGW is a type of NGW. Resources don't have public IPs themselves, the IGW translates private IPs for public IPs when traffic goes out (and the reverse when it comes back).
* NGWs allows private resources to access the public internet or AWS public zone in a limited way. No traffic in, except return traffic.
  * Only for IPv4! IPv6 addresses are public routable by default. Instead, you can use an _egress only internet gateway_.
* NGWs require **elastic IP addresses**.
* NGWs are HA within a AZ, but not between AZs (if an AZ goes down, the NGW does too). Solution is to put a NGW in every AZ if outgoing internet traffic is a primary concern.

# Connectivity Patterns

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

Create a **flow log** for a VPC, which logs access (along with allow/block, port, source IP, etc) into [CloudWatch](CloudWatch.md) logs or int [S3](S3.md).

It only records meta data, like `haproxy`, not details of packets. Also, it isn't realtime.

Monitoring point determines what is logged:
* VPC level (to/from/inside)
* Subnet level (to/from/inside)
* Interfect level (to/from)


# Security

* Isolate workloads into separate VPCs (based on app, dept, test, dev, etc)
* Layer network security with public + private subnets
* Collect VPC **flow logs** (like haproxy logs showing access)
* Use NACLs as first level of blocking, preventing unwanted traffic entering the subnet to begin with
* With security groups, group resources with similar functions

Also depends upon connection type:
* **Internet only** - use SSL/TLS, setup own VPN solution (e.g. on EC2 instance).
* **IPSec tunnel over public internet** - Deploy VPN using standard AWS VPN components (e.g. VPN Gateway, Customer Gateway, VPN Connection).
* **AWS DirectConnect** - (Dedicated links to peer to AWS) - Private peered connection may be sufficient.
* **Hybrid** - Mix of the above.