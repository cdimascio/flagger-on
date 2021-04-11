import {
  CreateFeatureFlagOpts,
  FeatureFlag,
  FeatureFlagger,
  FeatureFlagKey,
  FeatureFlagOpts,
} from "./internal/feature.flag";

export type GlobalFeatureFlag = Omit<FeatureFlag, "customerId">;
export interface GlobalFeatureFlagOpts extends FeatureFlagOpts {}
export type GlobalFeatureFlagKey = Omit<FeatureFlagKey, "customerId">;
export type CreateGlobalFeatureFlag = Omit<
  CreateFeatureFlagOpts,
  "customerId" | "overwrite"
>;
export type ReplaceGlobalFeatureFlag = CreateGlobalFeatureFlag;

export class GlobalFeatureFlagger {
  private fsvc: FeatureFlagger;
  constructor(opts: GlobalFeatureFlagOpts) {
    this.fsvc = new FeatureFlagger(opts);
  }

  async create(opts: CreateGlobalFeatureFlag): Promise<GlobalFeatureFlag> {
    const { namespace, featureId, enabled, options } = opts;
    return await this.fsvc.createOne({
      namespace,
      featureId,
      enabled,
      options,
      overwrite: false,
    });
  }

  async replace(opts: ReplaceGlobalFeatureFlag): Promise<GlobalFeatureFlag> {
    const { namespace, featureId, enabled, options } = opts;
    return await this.fsvc.createOne({
      namespace,
      featureId,
      enabled,
      options,
      overwrite: true,
    });
  }

  async get(key: GlobalFeatureFlagKey): Promise<GlobalFeatureFlag | undefined> {
    const { namespace, featureId } = key;
    return await this.fsvc.get({
      namespace,
      featureId,
    });
  }

  async delete(key: GlobalFeatureFlagKey): Promise<void> {
    const { namespace, featureId } = key;
    return await this.fsvc.delete({
      namespace,
      featureId,
    });
  }

  async isEnabled(key: GlobalFeatureFlagKey): Promise<boolean> {
    const ff = await this.get(key);
    return ff?.enabled ?? false;
  }

  async enable(key: GlobalFeatureFlagKey): Promise<void> {
    const { namespace, featureId } = key;
    return this.fsvc.update({
      namespace,
      featureId,
      enabled: true,
    });
  }

  async disable(key: GlobalFeatureFlagKey): Promise<void> {
    const { namespace, featureId } = key;
    return this.fsvc.update({
      namespace,
      featureId,
      enabled: false,
    });
  }
}
