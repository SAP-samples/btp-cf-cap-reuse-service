# Business/Reuse Service Basics

As the topic of Business/Reuse Services is relatively unknown within the SAP Community so far, the following section provides a short introduction to this topic. 

Defining what constitutes an application versus a service is important. A (business) service offers well-defined, reusable business functionality that can be programmatically accessed via an API. On the other hand, an application is typically accessed by business users through a UI. 

However, there are certain edge cases where a service also provides a UI, such as in the case of dashboards or service configuration UIs, and applications may also provide APIs for extensibility or configuration.

One excellent example of a (business) service providing a UI is the **SAP Document Management Service**. This **service** is designed to provide various business **applications** with the ability to upload and manage documents as part of their application implementation. To simplify the integration with **applications**, the SAP Document Management Service provides a so-called "Reuse UI" as part of its service offering that can be reused in a generic manner by any embedding application.

An application may combine multiple services by binding to instances of those services, and multitenant enabled applications are subscribed by tenants. To facilitate the discovery of services, they should be listed in the SAP BTP marketplace, which requires services to implement a service broker. Services can be instantiated and used by multiple consumers with their own instances.

In summary, the purpose of a business application is to offer a certain (usually business centric) solution to end-users, which is usually provided as a web application. A business service in contrast provides a certain feature, that is supposed to be re-used by multiple business applications, and usually consumed via an API.

This tutorial is primarily focusing on providing guidance for the deployment and integration of business **services** into business **applications** - either Standalone or Software-as-a-Service Applications. 

**Limitations**

Reuse/Business Services come with certain limitations: 

- No dependencies available in the consuming Subaccounts
  - You cannot use the Destination Service, Connectivity Service or Cloud Connector
- Role collections not automatically created in the consuming Subaccount
- Usability across Global Accounts but only within the same SAP BTP Region
- The Business/Reuse Service Broker must handle the whole provisioning and deprovisioning logic
  - setting up required persistency (files, schemas, and/or database containers)
  - tracking which services are allocated to which tenant
  - tearing tenants down or archiving them
- SSO Dashboard feature available still authorization check limited
- Service Broker needs to be registered to every Subaccount

https://blogs.sap.com/2022/03/11/consumability-across-global-btp-accounts-via-custom-service-brokers/



# Deployment Instructions - Standalone Application

Using a Business Service in a Single Tenant/Standalone Business Application scenario is fairly simple. In this case, the Application Router of your embedding Business Application needs to bind to a Service Instance of the Business Service in the same Subaccount. 

Once a binding between the Application Router and the Business Service is given, the Reuse UI as well as the Reuse Business Service API can be consumed either using a **UserTokenExchange** or **Client Credentials** flow depending on your requirements. Both authentication flows will be handled automatically by the Application Router without further ado. 

[<img src="./images/ArchSingleTenant.png?raw=true" width="700" />](./images/ArchSingleTenant.png)


## 1. Setup the Reuse/Business Service

1.1. Initialize the Reuse/Business Service Broker to provide unique IDs by running the respective npm script.

```sh
git clone https://github.com/SAP-samples/btp-cf-cap-reuse-service
cd single-tenant/reuse-service/broker
npm install --include=dev
npm run init
```

1.2. Save the displayed **Plaintext password** and the **Hashed credentials**. 

[<img src="./images/InitBroker.png?raw=true" width="600" />](./images/InitBroker.png)

1.3. Switch to the **mta.yaml** file in the **single-tenant/reuse-service** directory and paste the **Hashed credentials** value to the sbf module details. 

> **Important** - Do not commit this details to Git!

```yaml
# --------------------- BROKER MODULE ------------------------
  - name: demo-broker-sbf
  # ------------------------------------------------------------
    type: nodejs
    path: broker
    build-parameters:
      builder: npm-ci
      ignore: ['node_modules/', 'default-*.json', 'manifest*.yml']
    parameters:
      memory: 128M
      disk: 512MB
    properties:
      SBF_BROKER_CREDENTIALS_HASH: >
        {
           "broker-user": "<Hashed credentials>"
        }
```

1.4. Switch back to the **single-tenant/reuse-service** directory.

```sh
cd ../
```

1.5. Continue building the reuse-service multi target application by running the below command. 

```sh
mbt build
```

1.6. Deploy the application to your dedicated Cloud Foundry Space.

```sh
cf login -a api.cf.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com
cf deploy mta_archives/com.sap.demo.reuse_0.0.1.mtar 
```


## 2. Create a Service Manager Instance

2.1. Create a Service Manager instance in your Subaccount using the **subaccount-admin** Plan and choosing the Runtime Environment **Other**. 

[<img src="./images/ServiceManager.png?raw=true" width="500" />](./images/ServiceManager.png)

2.2. Create a new **Service Binding** with the name of your choice.

[<img src="./images/ServiceManagerCredentials.png?raw=true" width="600" />](./images/ServiceManagerCredentials.png)


## 3. Register Service Broker

> **Hint** - If you haven't installed the Service Manager Command-Line Tool, you can find the instructions [here](https://help.sap.com/docs/service-manager/sap-service-manager/installing-service-manager-control-smctl-command-line-tool?locale=en-US). 

Use the binding credentials to register a new service broker in your Subaccount leveraging the Service Manager Command-Line Tool.

```sh
smctl login -a <sm_url> --auth-flow client-credentials --param subdomain=<Subaccount Subdomain> --client-id='<clientid>' --client-secret='<clientsecret>' 
```

**Sample**

[<img src="./images/SmctlLogin.png?raw=true" width="1200" />](./images/SmctlLogin.png)

> **Important** - The scale-out regions like **eu10-004** or **us10-002** require the Service Manager base region endpoints (like https://service-manager.cfapps.eu10.hana.ondemand.com).

```sh
smctl register-broker demo-broker "https://<Broker Host>.cfapps.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com" -b broker-user:<Broker Plaintext Password>
```

**Sample**

[<img src="./images/ServiceBrokerUrl.png?raw=true" width="600" />](./images/ServiceBrokerUrl.png)

**Sample**

[<img src="./images/SmctlRegisterBroker.png?raw=true" width="1100" />](./images/SmctlRegisterBroker.png)



## 4. Setup the Sample application

4.1. Switch to the **single-tenant/sample-app** directory.

```sh
cd single-tenant/sample-app
```

4.2. Build the Sample application.

```sh
mbt build
```

4.3. Deploy the Sample application.

```sh
cf login -a api.cf.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com
cf deploy mta_archives/com.sap.demo_0.0.1.mtar
```

4.4. Assign the **Admin** roles of the **Sample application** and the **Reuse Service** to your user. 

[<img src="./images/RoleAssignment.png?raw=true" width="600" />](./images/RoleAssignment.png)

4.5. Start the Sample application using the Application Router Route. 


## 5. Test the Reuse Service Integration

5.1. Click on the **Reuse Sample** tile. 

[<img src="./images/TestReuse.png?raw=true" width="600" />](./images/TestReuse.png)

5.2. The Reuse UI will show up and load the user details using the Reuse Service. 

[<img src="./images/ReuseUiDetails.png?raw=true" width="600" />](./images/ReuseUiDetails.png)



# Deployment Instructions - Multi Tenant

Using a Business Service in a multitenant scenario is a bit more complicated. Based on your requirements, this scenario can be set up in multiple facets. 

**Technical Access**

[<img src="./images/ArchMultiTenant.png?raw=true" width="700" />](./images/ArchMultiTenant.png)

In case of technical Business Service Access, the Application Router of your embedding SaaS application needs to bind to a Service Instance of the Business Service in the same subaccount which hosts the SaaS application. Once a binding between the SaaS Application Router and the Business Service is established, the Reuse UI as well as the Reuse Business Service can be consumed by your SaaS Subscribers using the **Client Credentials** flow. This flow will be handled automatically by the Application Router without further ado. 

> **Important** - This approach based on a Client Credentials flow, does not allow you to assign roles defined for your Business Service to any user of your SaaS Subscriber. So in the respective Business Service implementation, you will not be able to do any permission checks. Only use it for scenarios, in which all SaaS application users are supposed to use the Business Service. 


**Principal Propagation**

[<img src="./images/ArchMultiTenantUser.png?raw=true" width="700" />](./images/ArchMultiTenantUser.png)

In case you need to identify the accessing user and more specifically you have to check which roles that SaaS subscriber user is assigned in context of your Business Service, you need to use the **UserTokenExchange** flow. 

To achieve this in a multitenant SaaS scenario, you need to make use of Destinations in the Subscriber Subaccounts. Each SaaS Subscriber needs to register and create a Service Instance of the Business Service in the respective Subscriber Subaccount and add the Service Binding Credentials of this Service Instance to a dedicated Subaccount Destination of type **OAuth2UserTokenExchange**.

> **Hint** - Creating a Business Service Instance in the Subscriber Subaccount will also add the roles of that Business Service to the respective Subscriber Subaccount!

Registering the Service Broker and creating a Business Service Instance in the Subscriber Subaccount allows exchanging the SaaS application token to a token issued using the Client Credentials of the Business Service Instance. The exchanged token will contain the Subscriber-specific role assignments of the Business Service and will be accepted by the Business Service backend implementation.

For authenticating to the Business Service, the SaaS solution will fetch the Client Credential details from the Subscriber Subaccount Destination (**preferLocal : true**), instead of using the Business Service Binding in the Provider Subaccount. 

```json
{
    "source": "^/comsapdemoreuseservice/api(.*)$",
    "target": "$1",
    "preferLocal": true,
    "authenticationType": "xsuaa",
    "destination": "dev-demo-saas-reuse-service"
}
```

> **Important** - For consuming the Reuse UI, the binding between the SaaS Application Router and a Business Service Instance in the Provider Subaccount is still essential! Only the Business Service API Calls are making use of the Subscriber-specific destination details allowing the **UserTokenExchange** flow. 


## 1. Setup the Reuse/Business Service

1.1. Initialize the Reuse/Business Service Broker to provide unique IDs by running the respective npm script.

```sh
git clone https://github.com/SAP-samples/btp-cf-cap-reuse-service
cd multi-tenant/reuse-service/broker
npm install --include=dev
npm run init
```

1.2. Save the displayed **Plaintext password** and the **Hashed credentials**. 

[<img src="./images/InitBroker.png?raw=true" width="600" />](./images/InitBroker.png)

1.3. Switch to the **mta.yaml** file in the **reuse-service** directory and paste the **Hashed credentials** value to the sbf module details. 

> **Important** - Do not commit this details to Git!

```yaml
# --------------------- BROKER MODULE ------------------------
  - name: demo-broker-sbf
  # ------------------------------------------------------------
    type: nodejs
    path: broker
    build-parameters:
      builder: npm-ci
      ignore: ['node_modules/', 'default-*.json', 'manifest*.yml']
    parameters:
      memory: 128M
      disk: 512MB
    properties:
      SBF_BROKER_CREDENTIALS_HASH: >
        {
           "broker-user": "<Hashed credentials>"
        }
```

1.4. Switch back to the **reuse-service** directory.

```sh
cd ../
```

1.5. Continue building the reuse-service multi target application by running the below command. 

```sh
mbt build
```

1.6. Deploy the application to your dedicated Cloud Foundry Space.

> **Hint** - While you can consume Reuse/Business Services across different Global Accounts, you cannot consume them from different regions! 

```sh
cf login -a api.cf.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com
cf deploy mta_archives/com.sap.demo.reuse_0.0.1.mtar 
```


### 2. Create a Service Manager Instance

2.1 Create a Service Manager instance in your **Provider** Subaccount using the **subaccount-admin** Plan and choosing the Runtime Environment **Other**. 

[<img src="./images/ServiceManager.png?raw=true" width="500" />](./images/ServiceManager.png)

2.2. Create a new **Service Binding** with the name of your choice.

[<img src="./images/ServiceManagerCredentials.png?raw=true" width="600" />](./images/ServiceManagerCredentials.png)


### 3. Register Service Broker

> **Hint** - If you haven't installed the Service Manager Command-Line Tool, you can find the instructions [here](https://help.sap.com/docs/service-manager/sap-service-manager/installing-service-manager-control-smctl-command-line-tool?locale=en-US). 

Use the binding credentials to register a new service broker in your **Provider Subaccount** leveraging the Service Manager Command-Line Tool.

```sh
smctl login -a <sm_url> --auth-flow client-credentials --param subdomain=<Subaccount Subdomain> --client-id='<clientid>' --client-secret='<clientsecret>' 
```

**Sample**

[<img src="./images/SmctlLogin.png?raw=true" width="1200" />](./images/SmctlLogin.png)

> **Important** - The scale-out regions like **eu10-004** or **us10-002** require the Service Manager base region endpoints (like https://service-manager.cfapps.eu10.hana.ondemand.com).

```sh
smctl register-broker demo-broker "https://<Broker Host>.cfapps.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com" -b broker-user:<Broker Plaintext Password>
```

**Sample**

[<img src="./images/ServiceBrokerUrl.png?raw=true" width="600" />](./images/ServiceBrokerUrl.png)

**Sample**

[<img src="./images/SmctlRegisterBroker.png?raw=true" width="1100" />](./images/SmctlRegisterBroker.png)


### 4. Consuming the Business Service

**Important** - This chapter is only required, in case you require a UserTokenExchange flow, meaning you need to identify the calling SaaS Subscriber tenant and respective role assignments in your Business Services implementation. If a technical access is sufficient for your scenario, you can skip the following steps!

> **Important** - We cannot guarantee the continued availability of this workaround in the future. Please use it on your own risk!

First of all, please register the Business Service Broker also within the **Subscriber Subaccount** as you've just done in the Provider Subaccount. 

Therefore, you need to create another Service Manager Instance in the Subscriber Subaccount. Login to the Subscriber Subaccount using the Service Manager Command-Line tool and the Service Key Client Credentials of the new Service Manager Instance.

Once you registered the Business Service Broker also in the Subscriber Subaccount, please create a new Service Instance of the Business Service Broker. Additionally, please create a new Service Binding for that Business Service instance. 

[<img src="./images/ServiceKeyDest.png?raw=true" width="600" />](./images/ServiceKeyDest.png)

Next, please create a new Destination on Subaccount level within the Subscriber Subaccount, leveraging those Client Credentials and the additional settings below (like Authentication **OAuth2UserTokenExchange**).

**Destination** 

```html
Type=HTTP
clientId=sb-bd47dbc4-7881ccca3d53!b204893|demo-broker-demo-a1b2c3d4-dev!b204893
clientSecret=a5b7dn7AmqstIsicHnoyf-ZFnCVjw=
Authentication=OAuth2UserTokenExchange
Name=dev-demo-saas-reuse-service
tokenServiceURL=https://demo-a1b2c3d4.authentication.eu10.hana.ondemand.com/oauth/token
ProxyType=Internet
URL=https://demo-a1b2c3d4-dev-demo-broker-srv.cfapps.eu10-004.hana.ondemand.com
tokenServiceURLType=Dedicated
```

Last but not least, please adapt the routing configuration (**xs-app.json**) of your SaaS Application Router. Add a route, that will redirect all Business Service API requests to the Destination available in your Subscriber Subaccounts. Using the **preferLocal** setting, you can ensure that the SaaS application will use the Subscriber Subaccount destination. 

```json
{
    "source": "^/comsapdemoreuseservice/api(.*)$",
    "target": "$1",
    "preferLocal": true,
    "authenticationType": "xsuaa",
    "destination": "dev-demo-saas-reuse-service"
}
```

That's it. Using this setup, the Reuse UI will be consumed via the Service Binding in the Provider Subaccount, whereas API Calls to the Business Service will leverage the Subscriber-specific Destination settings in the Subscriber Subaccounts. This allows you to use the UserTokenExchange flow in a SaaS context, without returning the Business Service as a dependency in your SaaS dependency callback!


## Deploy the SaaS application

Switch to the **multi-tenant/saas-app** directory.

```sh
cd multi-tenant/saas-app
```

Build the SaaS application.

```sh
mbt build
```

Deploy the SaaS application.

```sh
cf login -a api.cf.<SAP BTP Region like us20 or eu10-004>.hana.ondemand.com
cf deploy mta_archives/com.sap.demo.saas_0.0.1.mtar
```

Create a **Subscription** in the same account in which you deployed the SaaS application.

[<img src="./images/SaasSubscribe.png?raw=true" width="500" />](./images/SaasSubscribe.png)


Create a new **Route** for the subscription.

> **Hint** - This process can also be automated as part of the onboarding process. 

Copy the Subscription URL from the **Instances & Subscriptions** screen.

[<img src="./images/RouteCopyUrl.png?raw=true" width="400" />](./images/RouteCopyUrl.png)

Switch to your Cloud Foundry Space and open the **Routes** sub-menu. Click on **New Route**. Select the **cfapps** default domain. Paste the Subscription URL to the **Host Name** field. 

> **Important** - Remove the leading **https://** and the default domain starting from **.cfapps...** (including the dot). <br>
> https://<span>demo-a1b2c3d4-demo-saas-dev.cfapps.eu10-004.hana.ondemand.com/</span> **=> demo-a1b2c3d4-demo-saas-dev**

[<img src="./images/RouteCreate.png?raw=true" width="600" />](./images/RouteCreate.png)

After creating the route, please map it to the **Application Router** application instance named **demo-saas-\<Space Name\>**

[<img src="./images/RouteMap.png?raw=true" width="600" />](./images/RouteMap.png)


## Test the Reuse Service Integration

Assign the **Admin** roles of the **SaaS application** and the **Reuse Service** to your user. 

> **Important** - If you are using a technical integration and did not create a Business Service Instance in the Subscriber Subaccount, only assign the SaaS roles. 

> **Hint** - In the Subscriber Subaccounts, you might need to create a new **Role Collection** based on the **Business Service** role templates. 

[<img src="./images/RoleAssignment.png?raw=true" width="600" />](./images/RoleAssignment.png)

Start the SaaS application from the **Instances & Subscriptions** screen. 

[<img src="./images/StartApplication.png?raw=true" width="600" />](./images/StartApplication.png)

Click on the **Reuse Sample** tile. 

[<img src="./images/TestReuse.png?raw=true" width="600" />](./images/TestReuse.png)

The Reuse UI will show up and load the user details using the Reuse Service.

[<img src="./images/ReuseUiDetails.png?raw=true" width="600" />](./images/ReuseUiDetails.png)

## Known Issues
 No known issues so far.

## How to obtain support
[Create an issue](https://github.com/SAP-samples/btp-cf-cap-reuse-service/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
