import { Flaggeron } from "./feature.flag";
import {
  CreateFlagOptions,
  Flag,
  NamespacedFlag,
  OptionsWithNamespace,
  ReplaceFlagOptions,
} from "./models";

export class FlaggeronWithNamespace {
  private namespace: string;
  private delegate: Flaggeron;
  constructor(opts: OptionsWithNamespace) {
    this.namespace = opts.namespace;
    this.delegate = new Flaggeron(opts);
  }

  async createFlag(opts: CreateFlagOptions): Promise<NamespacedFlag> {
    return await this.delegate.createFlag(this.namespace, {
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    });
  }

  async replaceFlag(opts: ReplaceFlagOptions): Promise<NamespacedFlag> {
    return await this.delegate.replaceFlag(this.namespace, {
      featureId: opts.featureId,
      config: opts.config,
      enabled: opts.enabled,
    });
  }

  async getFlag(
    featureId: string,
    subjectId?: string
  ): Promise<Flag | undefined> {
    return this.delegate.getFlag(this.namespace, featureId, subjectId);
  }

  async getFlags(featureIdPrefix?: string): Promise<Flag[]> {
    return this.delegate.getFlags(this.namespace, featureIdPrefix);
  }

  async getFlagsForSubject(
    subjectId: string,
    featureIdPrefix?: string
  ): Promise<Flag[]> {
    return this.delegate.getFlagsForSubject(
      this.namespace,
      subjectId,
      featureIdPrefix
    );
  }

  async deleteFlag(id: string): Promise<void> {
    return this.delegate.deleteFlag(this.namespace, id);
  }

  async enableFlag(id: string): Promise<void> {
    return await this.delegate.enableFlag(this.namespace, id);
  }

  async disableFlag(id: string): Promise<void> {
    return await this.delegate.disableFlag(this.namespace, id);
  }
}
