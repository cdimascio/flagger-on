import AWS from "aws-sdk";
import {
  CreateFlagOptions,
  FlagKey,
  Flag,
  ReplaceFlagOptions,
  UpdateFeatureFlagOpts,
  FindFlagsOptions,
} from "./models";
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
  async getFlag(key: FlagKey): Promise<Flag | undefined> {
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
          config: data.config,
          enabled: data.enabled,
        }
      : undefined;
  }

  async getFlags(opts: FindFlagsOptions): Promise<Flag[]> {
    const pk = `N|${opts.namespace}`;

    const sk = `${pk}|FF|${opts.idPrefix ?? ""}`;
    const r = await this.ddb
      .query({
        KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
        ExpressionAttributeNames: {
          "#pk": "pk",
          "#sk": "sk",
        },
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
        },
        TableName,
      })
      .promise();
    const data = <unknown[]>r.Items;
    return data.map((d: any) => ({
      key: {
        namespace: opts.namespace,
        id: d.sk.split("|FF|")[1],
      },
      enabled: d.enabled,
      config: d.config,
    }));
  }

  async deleteFlag(key: FlagKey): Promise<void> {
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
    return;
  }

  async createFlag(opts: CreateFlagOptions | ReplaceFlagOptions): Promise<Flag> {
    return await this.createOne(opts, false);
  }

  async replaceFlag(opts: CreateFlagOptions | ReplaceFlagOptions): Promise<Flag> {
    return await this.createOne(opts, true);
  }

  async updateFlag(opts: UpdateFeatureFlagOpts): Promise<void> {
    if (opts.enabled !== undefined && opts.config !== undefined) {
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

    if (opts.config != undefined) {
      ExpressionAttributeNames["#config"] = "config";
      ExpressionAttributeValues[":config"] = opts.config;
      UpdateExpression += "set #config = :config";
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
    opts: CreateFlagOptions,
    overwrite: boolean
  ): Promise<Flag> {
    const { pk, sk } = this.key(opts.key);
    const { enabled, config } = opts;
    const ConditionExpression = "attribute_not_exists(pk)";
    await this.ddb
      .put({
        Item: {
          pk,
          sk,
          enabled,
          config,
        },
        ReturnConsumedCapacity: "TOTAL",
        ...(overwrite ? {} : { ConditionExpression }),
        TableName,
      })
      .promise();

    return {
      key: opts.key,
      enabled,
      config,
    };
  }

  private key(key: FlagKey): { pk: string; sk: string } {
    const pk = `N|${key.namespace}`;
    const sk = `${pk}|FF|${key.id}`;
    return {
      pk,
      sk,
    };
  }
}
