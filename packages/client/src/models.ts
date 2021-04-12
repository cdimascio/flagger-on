import { DynamoDbOpts } from "./drivers/ddb";

export interface Options {
  dynamodb?: DynamoDbOpts;
}

export interface FlagKey {
  namespace: string;
  id: string;
}

export interface Rollout {
  percentage: number;
}

export interface FlagConfig {
  rollout: Rollout;
  [key: string]: any;
}

export interface Flag {
  key: FlagKey;
  enabled: boolean;
  config: FlagConfig;
}

export type CreateFlagOptions = Flag;
export type ReplaceFlagOptions = Flag;
export interface UpdateFeatureFlagOpts extends FlagKey {
  enabled?: boolean;
  config?: FlagConfig;
}
