# flagger-on

Enable / disable feature flags globally and / or rollout to a percentage of customers.

## Install

```
npm install flagger-on
```

## Prerequisites

Requires DynamoDB (additional DBs coming...)

(see DynamoDB section for setup)

## Usage

```javascript
const f = new Flaggeron({
  dynamodb: {
    apiVersion: "2012-08-10",
    region: "us-west-2",
  },
});
```

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

`config.rollout.percentage` applies only to per subject rolouts e.g. customer

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

Setup via CDK

```
const table = new dynamodb.Table(this, "Table", {
    partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
    sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
    tableName: "FeatureFlag",
});
```

## License

MIT
