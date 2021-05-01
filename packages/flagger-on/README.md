# 🦩 flagger-on

Enable / disable feature flags globally and / or rollout to a percentage of customers.

<p align="center">
<img src="https://github.com/cdimascio/flagger-on/blob/main/assets/flagger-on-pastel-logo.png?raw=true" width="600">
</p>


## Install

```
npm install flagger-on
```

## Prerequisites

Requires DynamoDB (additional DB support coming...)

## Usage

```javascript
const f = new Flaggeron({
  dynamodb: {
    apiVersion: "2012-08-10",
    region: "<your-region>",
  },
});
```

or with DAX

```javascript
const f = new Flaggeron({
  dynamodb: {
    apiVersion: "2012-08-10",
    service = new AmazonDaxClient({
        endpoint: dax.endpoint,
        region: '<your-region>',
      });
  },
});
```

## Setup DynamoDB

```shell
aws dynamodb create-table --table-name FeatureFlag \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
  --billing-mod PAY_PER_REQUEST
```

See [DynamoDB Setup](README.md#DynamoDB-setup) for additional setup options .

## API

## isEnabled(key, subject?)

Checks whether a feature flag is globally _**active**_ and/or active for a given _**subject identifier**_ e.g. customer id.

Enabled globally

```javascript
f.isEnabled({
  namespace: "my_project",
  id: "feature_1",
});
```

Enabled for a subject identifier e.g. customer id

```javascript
f.isEnabled(
  {
    namespace: "my_project",
    id: "feature_1",
  },
  "customer_id_12345" // must be unique per subject
);
```

## enable

Enables a feature flag

```javascript
f.enable({
  namespace: "my_project",
  id: "feature_1",
});
```

## disable

Disables a feature flag

```javascript
f.disable({
  namespace: "my_project",
  id: "feature_1",
});
```

### create

Creates a feature flag

`config.rollout.percentage` applies only to per subject rolouts e.g. customer (see isEnabled)

```javascript
f.create({
  key: {
    namespace: "my_project",
    id: "feature_1",
  },
  config: {
    rollout: {
      percentage: 100,
    },
  },
  enabled: true,
});
```

### replace

Reaplce a feature flag

`config.rollout.percentage` applies only to per subject rolouts e.g. customer

```javascript
f.replace({
  key: {
    namespace: "my_project",
    id: "feature_1",
  },
  config: {
    rollout: {
      percentage: 100,
    },
  },
  enabled: true,
});
```

## delete

Deletes a feature flag

```javascript
f.delete({
  namespace: "my_project",
  id: "feature_1",
});
```

## DynamoDB setup

Create a DynamoDB Table with name `FeatureFlag`, partition key `pk`, and sort key `sk`

Setup via CLI

_NOTE: consider provisioned capacity, rather than `PAY_PER_REQUEST` to keep costs low_

```shell
aws dynamodb create-table --table-name FeatureFlag \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
  --billing-mod PAY_PER_REQUEST
```

Setup via CDK

```javacsript
const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      tableName: 'FeatureFlag',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});
```

## Dax Setup

Setup via CDK

```javascript
 const daxSecurityGroup = new ec2.SecurityGroup(this, 'DaxSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      securityGroupName: 'dax-security-group',
    });

    daxSecurityGroup.connections.allowFromAnyIpv4(
      new ec2.Port({
        protocol: ec2.Protocol.TCP,
        fromPort: 8111,
        toPort: 8111,
        stringRepresentation: 'DaxPort',
      })
    );

    const subnetGroup = new dax.CfnSubnetGroup(this, 'DaxSubnetGroup', {
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
      subnetGroupName: 'my-dax-subnet-group',
    });

    const daxRole = new iam.Role(this, 'DaxRole', {
      assumedBy: new iam.ServicePrincipal('dax.amazonaws.com'),
    });
    daxRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:DescribeTable',
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:ConditionCheckItem',
        ],
        resources: [this.table.tableArn],
      })
    );

    new dax.CfnCluster(this, 'DaxCluster', {
      iamRoleArn: daxRole.roleArn,
      clusterName: 'my-dax-cluster',
      availabilityZones: props.vpc.availabilityZones,
      nodeType: 'dax.t3.small',
      replicationFactor: props.vpc.availabilityZones.length,
      securityGroupIds: [daxSecurityGroup.securityGroupId],
      subnetGroupName: subnetGroup.subnetGroupName,
      sseSpecification: {
        sseEnabled: true,
      },
    });
```

## License

MIT
