import { crc32 } from "crc";
import { DdbFeatureFlagDriver } from "./drivers/ddb";
import { Driver } from "./drivers/models";
import {
  Flag,
  FlagConfig,
  CreateFlagOptions,
  NamespacedFlag,
  Options,
  ReplaceFlagOptions,
} from "./models";

const isEnabled = (config: FlagConfig, subjectId: string) => {
  const percentage = config.rollout?.percentage ?? 100;
  return crc32(subjectId) < ((2 ** 32 - 1) / 100.0) * percentage;
};
export class Flaggeron {
  private namespace: string;
  private driver: Driver;
  constructor(opts: Options) {
    this.namespace = opts.namespace;
    this.driver = new DdbFeatureFlagDriver(opts.dynamodb ?? {});
  }

  async createFlag(opts: CreateFlagOptions): Promise<NamespacedFlag> {
    // validate config.rollout.percentage is between 0 and 100;
    await this.driver.createFlag({
      key: {
        namespace: this.namespace,
        id: opts.featureId,
      },
      config: opts.config,
      enabled: opts.enabled,
    });
    return {
      namespace: this.namespace,
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    };
  }

  async replaceFlag(opts: ReplaceFlagOptions): Promise<NamespacedFlag> {
    // validate config.rollout.percentage is between 0 and 100
    await this.driver.replaceFlag({
      key: {
        namespace: this.namespace,
        id: opts.featureId,
      },
      config: opts.config,
      enabled: opts.enabled,
    });
    return {
      namespace: this.namespace,
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    };
  }

  // async isEnabled(key: FlagKey, sujbect?: string): Promise<boolean> {
  //   const subjectKey = `${key.namespace}-${key.id}-${sujbect}`;
  //   const ff = await this.get(key);

  //   if (!ff || !ff.enabled) return false;

  //   const percentage = ff.config.rollout.percentage ?? 100;
  //   return crc32(subjectKey) < ((2 ** 32 - 1) / 100.0) * percentage;
  // }

  async getFlag(
    featureId: string,
    subjectId?: string
  ): Promise<Flag | undefined> {
    const key = { namespace: this.namespace, id: featureId };
    const flag = await this.driver.getFlag(key);
    if (!flag) return;

    const config = flag?.config ?? {};
    if (!config.rollout || !config.rollout.percentage == undefined) {
      config.rollout = {
        percentage: 100,
      };
    }
    const enabled =
      flag.enabled && subjectId ? isEnabled(config, subjectId) : flag.enabled;
    return {
      featureId,
      enabled,
      config,
    };
  }
  async getFlags(featureIdPrefix?: string): Promise<Flag[]> {
    return this.findFlags({ idPrefix: featureIdPrefix });
  }

  async getFlagsForSubject(
    subjectId: string,
    featureIdPrefix?: string
  ): Promise<Flag[]> {
    return this.findFlags({ idPrefix: featureIdPrefix, subjectId });
  }

  async deleteFlag(id: string): Promise<void> {
    return await this.driver.deleteFlag({
      namespace: this.namespace,
      id,
    });
  }

  async enableFlag(id: string): Promise<void> {
    return await this.driver.updateFlag({
      namespace: this.namespace,
      id,
      enabled: true,
    });
  }

  async disableFlag(id: string): Promise<void> {
    return await this.driver.updateFlag({
      namespace: this.namespace,
      id,
      enabled: false,
    });
  }

  private async findFlags({
    subjectId,
    idPrefix,
  }: {
    subjectId?: string;
    idPrefix?: string;
  }): Promise<Flag[]> {
    const tflags = await this.driver.getFlags({
      namespace: this.namespace,
      idPrefix,
      subjectId,
    });

    const flags: Flag[] = [];
    for (const tflag of tflags) {
      const config = tflag?.config ?? {};
      if (!config.rollout || !config.rollout.percentage == undefined) {
        config.rollout = {
          percentage: 100,
        };
      }
      const enabled =
        tflag.enabled && subjectId
          ? isEnabled(config, subjectId)
          : tflag.enabled;

      flags.push({
        featureId: tflag.key.id,
        enabled,
        config: tflag.config,
      });
    }
    return flags;
  }
}
