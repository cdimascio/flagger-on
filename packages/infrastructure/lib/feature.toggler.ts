import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class FeatureTogglerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      tableName: "FeatureFlag",
    });

    table
      .autoScaleReadCapacity({
        minCapacity: 1,
        maxCapacity: 50,
      })
      .scaleOnUtilization({
        targetUtilizationPercent: 70,
      });

    table
      .autoScaleWriteCapacity({
        minCapacity: 1,
        maxCapacity: 50,
      })
      .scaleOnUtilization({
        targetUtilizationPercent: 70,
      });
  }
}
