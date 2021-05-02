import { DynamoDbOpts } from "./drivers/ddb";
import { FlagConfig } from "./drivers/models";

export { FlagConfig } from "./drivers/models";

export interface Flag {
  featureId: string;
  enabled: boolean;
  config: FlagConfig;
}
export interface NamespacedFlag extends Flag {
  namespace: string;
}
export interface Options {
  namespace: string;
  dynamodb?: DynamoDbOpts;
}

export interface CreateFlagOptions {
  featureId: string;
  enabled: boolean;
  config: FlagConfig;
}

export type ReplaceFlagOptions = CreateFlagOptions;
