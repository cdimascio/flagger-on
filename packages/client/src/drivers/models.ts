import {
  CreateFeatureFlagOpts,
  FeatureFlag,
  FeatureFlagCompositeKey,
  ReplaceFeatureFlagOpts,
  UpdateFeatureFlagOpts,
} from "../models";

export interface Driver {
  create(opts: CreateFeatureFlagOpts): Promise<FeatureFlag>;
  replace(opts: ReplaceFeatureFlagOpts): Promise<FeatureFlag>;
  get(key: FeatureFlagCompositeKey): Promise<FeatureFlag | undefined>;
  update(key: UpdateFeatureFlagOpts): Promise<void>;
  delete(key: FeatureFlagCompositeKey): Promise<void>;
}
