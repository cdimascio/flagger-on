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
  private driver: Driver;
  constructor(opts: Options) {
    this.driver = new DdbFeatureFlagDriver(opts.dynamodb ?? {});
  }

  async createFlag(
    namespace: string,
    opts: CreateFlagOptions
  ): Promise<NamespacedFlag> {
    // validate config.rollout.percentage is between 0 and 100;
    await this.driver.createFlag({
      key: {
        namespace,
        id: opts.featureId,
      },
      config: opts.config,
      enabled: opts.enabled,
    });
    return {
      namespace,
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    };
  }

  async replaceFlag(
    namespace: string,
    opts: ReplaceFlagOptions
  ): Promise<NamespacedFlag> {
    // validate config.rollout.percentage is between 0 and 100
    await this.driver.replaceFlag({
      key: {
        namespace,
        id: opts.featureId,
      },
      config: opts.config,
      enabled: opts.enabled,
    });
    return {
      namespace,
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    };
  }

  async getFlag(
    namespace: string,
    featureId: string,
    subjectId?: string
  ): Promise<Flag | undefined> {
    const key = { namespace, id: featureId };
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
  async getFlags(namespace: string, featureIdPrefix?: string): Promise<Flag[]> {
    return this.findFlags({ namespace, idPrefix: featureIdPrefix });
  }

  async getFlagsForSubject(
    namespace: string,
    subjectId: string,
    featureIdPrefix?: string
  ): Promise<Flag[]> {
    return this.findFlags({ namespace, idPrefix: featureIdPrefix, subjectId });
  }

  async deleteFlag(namespace: string, id: string): Promise<void> {
    return await this.driver.deleteFlag({
      namespace,
      id,
    });
  }

  async enableFlag(namespace: string, id: string): Promise<void> {
    return await this.driver.updateFlag({
      namespace,
      id,
      enabled: true,
    });
  }

  async disableFlag(namespace: string, id: string): Promise<void> {
    return await this.driver.updateFlag({
      namespace,
      id,
      enabled: false,
    });
  }

  private async findFlags({
    namespace,
    subjectId,
    idPrefix,
  }: {
    namespace: string;
    subjectId?: string;
    idPrefix?: string;
  }): Promise<Flag[]> {
    const tflags = await this.driver.getFlags({
      namespace,
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
