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
  dynamodb?: DynamoDbOpts;
}

export interface OptionsWithNamespace extends Options {
  namespace: string;
}

export interface CreateFlagOptions {
  featureId: string;
  enabled: boolean;
  config: FlagConfig;
}

export type ReplaceFlagOptions = CreateFlagOptions;
