import AWS from "aws-sdk";

export interface FeatureFlagOpts {
  region: string;
}

export interface Options {
  [key: string]: any;
}

export interface FeatureFlag {
  namespace: string;
  featureId: string;
  customerId?: string;
  enabled: boolean;
  options: Options;
}

export interface FeatureFlagKey {
  namespace: string;
  featureId: string;
  customerId?: string;
}

export interface CreateFeatureFlagOpts extends FeatureFlagKey {
  enabled: boolean;
  options?: Options;
  overwrite: boolean;
}

export interface FeatureFlagOptionsOpts extends FeatureFlagKey {
  options?: Options;
}

interface UpdateFeatureFlagOpts extends FeatureFlagKey {
  options?: Options;
  enabled?: boolean;
}

const TableName = "FeatureFlag";
export class FeatureFlagger {
  private ddb: AWS.DynamoDB.DocumentClient;
  constructor({ region }: FeatureFlagOpts) {
    this.ddb = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region,
    });
  }

  // /**
  //  * Creates a new feature flag
  //  * If creating a customer ff, the base ff is also be created if it does not already exists
  //  * @param opts
  //  * @returns the feature flag
  //  */
  // async create(opts: CreateFeatureFlagOpts): Promise<FeatureFlag> {
  //   if (!opts.customerId) {
  //     return this.createOne(opts);
  //   }
  //   const ffOpts = { ...opts };
  //   delete ffOpts.customerId;
  //   const ps = await Promise.all([
  //     this.createOne(opts),
  //     this.createOne(ffOpts).catch((e) => {
  //       console.error(e);
  //     }),
  //   ]);
  //   const [cff, _] = await Promise.all(ps);
  //   return cff;
  // }

  // /**
  //  * Creates or replaces an existing feature flag
  //  * @param opts
  //  * @returns the feature flag
  //  */
  // async replace(opts: CreateFeatureFlagOpts): Promise<FeatureFlag> {
  //   return await this.createOne(opts, true);
  // }

  /**
   * Retrieves a feature flag
   * @param key
   * @returns the feature flag or undefined
   */
  async get(key: FeatureFlagKey): Promise<FeatureFlag | undefined> {
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
          ...key,
          options: data.options,
          enabled: data.enabled,
        }
      : undefined;
  }

  // /**
  //  * Sets options on an existing FeatureFlag
  //  * @param opts
  //  * @returns
  //  */
  // async options(opts: FeatureFlagOptionsOpts): Promise<void> {
  //   return await this.update(opts);
  // }

  // /**
  //  * Retrieves whether a feature flag is active
  //  * If customer is provide, both the global and customer flag are considered. IF either
  //  * is disabled,, enabled is false
  //  * @param key
  //  */
  // async enabled(key: FeatureFlagKey): Promise<boolean> {
  //   if (!key.customerId) {
  //     const ff = await this.get(key);
  //     return ff?.enabled ?? false;
  //   }
  //   const globalKey = { ...key };
  //   delete globalKey.customerId;
  //   const [gff, ff] = await Promise.all([this.get(globalKey), this.get(key)]);
  //   return (gff?.enabled && ff?.enabled) ?? false;
  // }

  // /**
  //  * Enables an existing feature flag
  //  * @param key
  //  */
  // async enable(key: FeatureFlagKey): Promise<void> {
  //   await this.update({ ...key, enabled: true, options: undefined });
  // }

  // /**
  //  * Disables an existing feature flag
  //  * @param key
  //  */
  // async disable(key: FeatureFlagKey): Promise<void> {
  //   await this.update({ ...key, enabled: false, options: undefined });
  // }

  async delete(key: FeatureFlagKey): Promise<void> {
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

  async createOne(opts: CreateFeatureFlagOpts): Promise<FeatureFlag> {
    const { namespace, customerId, featureId, enabled, options = {} } = opts;
    const { pk, sk } = this.key({ namespace, featureId, customerId });
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
        ...(opts.overwrite ? {} : { ConditionExpression }),
        TableName,
      })
      .promise();

    return {
      namespace,
      featureId,
      customerId,
      enabled,
      options,
    };
  }

  async update({
    namespace,
    customerId,
    featureId,
    enabled,
    options,
  }: UpdateFeatureFlagOpts): Promise<void> {
    if (enabled !== undefined && options !== undefined) {
      throw Error(`can only update 'enabled' or 'options', but not both`);
    }
    const pk = customerId
      ? `${namespace}|C|${customerId}`
      : `${namespace}|FF|${featureId}`;
    const sk = customerId ? `FF|${featureId}` : pk;

    let UpdateExpression = "";
    const ExpressionAttributeNames: Record<string, string> = {};
    const ExpressionAttributeValues: Record<string, any> = {};

    if (typeof enabled === "boolean") {
      ExpressionAttributeNames["#enabled"] = "enabled";
      ExpressionAttributeValues[":enabled"] = enabled;
      UpdateExpression = "set #enabled = :enabled";
    }

    if (options !== undefined) {
      ExpressionAttributeNames["#options"] = "options";
      ExpressionAttributeValues[":options"] = options;
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

  private key(key: FeatureFlagKey): { pk: string; sk: string } {
    const pk = key.customerId
      ? `${key.namespace}|C|${key.customerId}`
      : `${key.namespace}|FF|${key.featureId}`;
    const sk = key.customerId ? `FF|${key.featureId}` : pk;
    return {
      pk,
      sk,
    };
  }
}
