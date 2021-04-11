import { GlobalFeatureFlagger } from "./global.flag";
import {
  CreateFeatureFlagOpts,
  FeatureFlag,
  FeatureFlagger,
  FeatureFlagKey,
  FeatureFlagOpts,
} from "./internal/feature.flag";

export interface CustomerFeatureFlagOpts extends FeatureFlagOpts {
  globalFlagger: GlobalFeatureFlagger;
}
export type CustomerFeatureFlag = Required<FeatureFlag>;
export type CustomerFeatureFlagKey = Required<FeatureFlagKey>;
export type CreateCustomerFeatureFlag = Omit<
  Required<CreateFeatureFlagOpts>,
  "overwrite"
>;
export type ReplaceCustomerFeatureFlag = CreateCustomerFeatureFlag;

export class CustomerFeatureFlagger {
  private fsvc: FeatureFlagger;
  private gfsvc: GlobalFeatureFlagger;
  constructor(opts: CustomerFeatureFlagOpts) {
    this.fsvc = new FeatureFlagger(opts);
    this.gfsvc = opts.globalFlagger;
  }

  async create(opts: CreateCustomerFeatureFlag): Promise<CustomerFeatureFlag> {
    const { customerId: _, ...globalOpts } = opts;

    const [globalFlag, customerFlag] = await Promise.all([
      this.gfsvc.create(globalOpts).catch((e) => {
        console.error("=----", e);
      }),
      this.fsvc.createOne({ ...opts, overwrite: false }),
    ]);
    return <Required<FeatureFlag>>customerFlag;
  }

  async replace(
    opts: ReplaceCustomerFeatureFlag
  ): Promise<CustomerFeatureFlag> {
    const ff = <Required<FeatureFlag>>await this.fsvc.createOne({
      ...opts,
      overwrite: true,
    });
    return ff;
  }

  async get(key: CustomerFeatureFlagKey): Promise<CustomerFeatureFlag> {
    const ff = await this.fsvc.get(key);
    return <Required<FeatureFlag>>ff;
  }

  async delete(key: CustomerFeatureFlagKey): Promise<void> {
    return this.fsvc.delete(key);
  }

  async isEnabled(key: CustomerFeatureFlagKey, checkGlobalFlag = true) {
    if (checkGlobalFlag) {
      const [globallyEnabled, customerFlag] = await Promise.all([
        this.gfsvc.isEnabled(key),
        this.get(key),
      ]);
      return (globallyEnabled && customerFlag.enabled) ?? false;
    }
    const customerFlag = await this.get(key);
    return customerFlag.enabled ?? false;
  }

  async enable(key: CustomerFeatureFlagKey): Promise<void> {
    const { namespace, featureId, customerId } = key;
    return this.fsvc.update({
      namespace,
      featureId,
      customerId,
      enabled: true,
    });
  }

  async disable(key: CustomerFeatureFlagKey): Promise<void> {
    const { namespace, featureId, customerId } = key;
    return this.fsvc.update({
      namespace,
      featureId,
      customerId,
      enabled: false,
    });
  }
}
