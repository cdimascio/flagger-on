import { crc32 } from "crc";
import { DdbFeatureFlagDriver } from "./drivers/ddb";
import { Driver } from "./drivers/models";
import {
  CreateFlagOptions,
  Flag,
  FlagKey,
  FlagConfig,
  Options,
  ReplaceFlagOptions,
} from "./models";

export class Flaggeron {
  private driver: Driver;
  constructor(opts: Options) {
    this.driver = new DdbFeatureFlagDriver(opts.dynamodb ?? {});
  }

  async create(opts: CreateFlagOptions): Promise<Flag> {
    // validate config.rollout.percentage is between 0 and 100
    await this.driver.create(opts);
    return opts;
  }

  async replace(opts: ReplaceFlagOptions): Promise<Flag> {
    // validate config.rollout.percentage is between 0 and 100
    await this.driver.replace(opts);
    return opts;
  }

  async isEnabled(key: FlagKey, sujbect?: string): Promise<boolean> {
    const subjectKey = `${key.namespace}-${key.id}-${sujbect}`;
    const ff = await this.get(key);

    if (!ff || !ff.enabled) return false;

    const percentage = ff.config.rollout.percentage ?? 100;
    return crc32(subjectKey) < ((2 ** 32 - 1) / 100.0) * percentage;
  }

  async get(key: FlagKey): Promise<Flag | undefined> {
    const ff = await this.driver.get(key);
    if (!ff) return;

    const config = ff?.config ?? {};
    if (!config.rollout || !config.rollout.percentage == undefined) {
      config.rollout = {
        percentage: 100,
      };
    }
    return {
      key,
      enabled: ff?.enabled ?? false,
      config: <FlagConfig>config,
    };
  }

  async delete(key: FlagKey): Promise<void> {
    return await this.driver.delete(key);
  }

  async enable(key: FlagKey): Promise<void> {
    return await this.driver.update({ ...key, enabled: true });
  }

  async disable(key: FlagKey): Promise<void> {
    return await this.driver.update({ ...key, enabled: false });
  }
}
