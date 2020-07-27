# Cognito - User management, sign-up and log-on

* [Cognito resources](https://aws.amazon.com/cognito/dev-resources/)
* [OAuth 2.0 grant flow](assets/cognito_oauth_grant_flow.png)

Two main components:
* **User pools** - user directory providing sign-up and sign-in for your app users
* **Identity pools** - provide AWS credentials to grant your users access to other AWS services.

# Rough steps for incorporating a Cognito-hosted login & sign-up page in your app

1. Create user pool (user directory)
1. Configure the pool and create 'App client' (Cognito-hosted login page). **Note:** disable `Generate client secret` as this is not supported by Cognito JS SDK currently.
1. Create a certificate in AWS **CM** (go through validation, e.g. add required `CNAME` to DNS). **Note:** There is a quirk in **Cognito** where you also need an `A` record (setup in **Route 53**) to your root domain.
1. Back in the user pool 'App integration' settings, set the domain name (your own domain) - e.g. use `auth.mydomain.com` and choose the certificate create in preceding step.
1. As popup message says, add `A` record with alias to **Cognito**'s Cloudfront target.
1. Back in the user pool and in 'App client settings', enable the 'Cognito user pool' and specify successful sign-in and sign out URLs and __OAuth__ settings (e.g. Authorization code grant - token based).