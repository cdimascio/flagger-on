import { crc32 } from "crc";
import { DdbFeatureFlagDriver } from "./drivers/ddb";
import { Driver } from "./drivers/models";
import {
  CreateFeatureFlagOpts,
  FeatureFlag,
  FeatureFlagCompositeKey,
  FeatureFlagOptions,
  FeatureFlagOpts,
  ReplaceFeatureFlagOpts,
} from "./models";

export class FeatureFlagger {
  private driver: Driver;
  constructor(opts: FeatureFlagOpts) {
    this.driver = new DdbFeatureFlagDriver(opts.dynamodb ?? {});
  }

  async create(opts: CreateFeatureFlagOpts): Promise<FeatureFlag> {
    // validate options.rollout.percentage is between 0 and 100
    await this.driver.create(opts);
    return opts;
  }

  async replace(opts: ReplaceFeatureFlagOpts): Promise<FeatureFlag> {
    // validate options.rollout.percentage is between 0 and 100
    await this.driver.replace(opts);
    return opts;
  }

  async isEnabled(
    key: FeatureFlagCompositeKey,
    sujbect?: string
  ): Promise<boolean> {
    const subjectKey = `${key.namespace}-${key.id}-${sujbect}`;
    const ff = await this.get(key);

    if (!ff || !ff.enabled) return false;

    const percentage = ff.options.rollout.percentage ?? 100;
    return crc32(subjectKey) < ((2 ** 32 - 1) / 100.0) * percentage;
  }

  async get(key: FeatureFlagCompositeKey): Promise<FeatureFlag | undefined> {
    const ff = await this.driver.get(key);
    if (!ff) return;

    const options = ff?.options ?? {};
    if (!options.rollout || !options.rollout.percentage == undefined) {
      options.rollout = {
        percentage: 100,
      };
    }
    return {
      key,
      enabled: ff?.enabled ?? false,
      options: <FeatureFlagOptions>options,
    };
  }

  async delete(key: FeatureFlagCompositeKey): Promise<void> {
    return await this.driver.delete(key);
  }

  async enable(key: FeatureFlagCompositeKey): Promise<void> {
    return await this.driver.update({ ...key, enabled: true });
  }

  async disable(key: FeatureFlagCompositeKey): Promise<void> {
    return await this.driver.update({ ...key, enabled: false });
  }
}
