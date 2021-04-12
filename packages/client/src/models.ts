import { DynamoDbOpts } from "./drivers/ddb";

export interface FeatureFlagOpts {
  dynamodb?: DynamoDbOpts;
}

export interface FeatureFlagCompositeKey {
  namespace: string;
  id: string;
}

export interface FeatureFlagRollout {
  percentage: number;
}

export interface FeatureFlagOptions {
  rollout: FeatureFlagRollout;
  [key: string]: any;
}

export interface FeatureFlag {
  key: FeatureFlagCompositeKey;
  enabled: boolean;
  options: FeatureFlagOptions;
}

export type CreateFeatureFlagOpts = FeatureFlag;
export type ReplaceFeatureFlagOpts = FeatureFlag;
export interface UpdateFeatureFlagOpts extends FeatureFlagCompositeKey {
  enabled?: boolean;
  options?: FeatureFlagOptions;
}

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
