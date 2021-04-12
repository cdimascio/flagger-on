import AWS from "aws-sdk";
import {
  CreateFeatureFlagOpts,
  FeatureFlagCompositeKey,
  FeatureFlag,
  ReplaceFeatureFlagOpts,
  UpdateFeatureFlagOpts,
} from "../models";
import { Driver } from "./models";

export interface DdbFeatureFlagDriverOpts {
  region: string;
}

export type DynamoDbOpts = AWS.DynamoDB.DocumentClient.DocumentClientOptions &
  AWS.DynamoDB.Types.ClientConfiguration;

const TableName = "FeatureFlag";
export class DdbFeatureFlagDriver implements Driver {
  private ddb: AWS.DynamoDB.DocumentClient;
  constructor(opts: DynamoDbOpts) {
    this.ddb = new AWS.DynamoDB.DocumentClient(opts);
  }

  /**
   * Retrieves a feature flag
   * @param key
   * @returns the feature flag or undefined
   */
  async get(key: FeatureFlagCompositeKey): Promise<FeatureFlag | undefined> {
    const { pk, sk } = this.key(key);
    const r = await this.ddb
      .get({
        Key: {
          pk,
          sk,
        },
        TableName,
      })
      .promise();
    const data = <any>r.Item;
    return data
      ? {
          key,
          options: data.options,
          enabled: data.enabled,
        }
      : undefined;
  }

  async delete(key: FeatureFlagCompositeKey): Promise<void> {
    const { pk, sk } = this.key(key);
    await this.ddb
      .delete({
        TableName,
        Key: {
          pk,
          sk,
        },
      })
      .promise();
  }

  async create(
    opts: CreateFeatureFlagOpts | ReplaceFeatureFlagOpts
  ): Promise<FeatureFlag> {
    return await this.createOne(opts, false);
  }

  async replace(
    opts: CreateFeatureFlagOpts | ReplaceFeatureFlagOpts
  ): Promise<FeatureFlag> {
    return await this.createOne(opts, true);
  }

  async update(opts: UpdateFeatureFlagOpts): Promise<void> {
    if (opts.enabled !== undefined && opts.options !== undefined) {
      throw Error(`can only update 'enabled' or 'options', but not both`);
    }
    const { pk, sk } = this.key(opts);

    let UpdateExpression = "";
    const ExpressionAttributeNames: Record<string, string> = {};
    const ExpressionAttributeValues: Record<string, any> = {};

    if (typeof opts.enabled === "boolean") {
      ExpressionAttributeNames["#enabled"] = "enabled";
      ExpressionAttributeValues[":enabled"] = opts.enabled;
      UpdateExpression = "set #enabled = :enabled";
    }

    if (opts.options != undefined) {
      ExpressionAttributeNames["#options"] = "options";
      ExpressionAttributeValues[":options"] = opts.options;
      UpdateExpression += "set #options = :options";
    }

    await this.ddb
      .update({
        Key: {
          pk,
          sk,
        },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ConditionExpression: "attribute_exists(pk)",
        TableName,
      })
      .promise();
  }

  private async createOne(
    opts: CreateFeatureFlagOpts,
    overwrite: boolean
  ): Promise<FeatureFlag> {
    const { pk, sk } = this.key(opts.key);
    const { enabled, options } = opts;
    const ConditionExpression = "attribute_not_exists(pk)";
    await this.ddb
      .put({
        Item: {
          pk,
          sk,
          enabled,
          options,
        },
        ReturnConsumedCapacity: "TOTAL",
        ...(overwrite ? {} : { ConditionExpression }),
        TableName,
      })
      .promise();

    return {
      key: opts.key,
      enabled,
      options,
    };
  }

  private key(key: FeatureFlagCompositeKey): { pk: string; sk: string } {
    const pk = `N|${key.namespace}|FF|${key.id}`;
    const sk = pk;
    return {
      pk,
      sk,
    };
  }
}
