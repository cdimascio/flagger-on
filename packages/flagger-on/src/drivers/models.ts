// import {
//   CreateFlagOptions,
//   Flag,
//   FlagKey,
//   FindFlagsOptions,
//   ReplaceFlagOptions,
//   UpdateFeatureFlagOpts,
// } from "../models";

export interface FlagKey {
  namespace: string;
  id: string;
}

export interface Rollout {
  percentage: number;
}

export interface FlagData {
  [key: string]: any;
}
export interface FlagConfig {
  rollout: Rollout;
  data?: FlagData;
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

export interface FindFlagsOptions {
  namespace: string;
  idPrefix?: string;
  subjectId?: string;
}

export interface FindFlagsForSubjectOptions {
  namespace: string;
  idPrefix?: string;
  subjectId: string;
}

export interface Driver {
  createFlag(opts: CreateFlagOptions): Promise<Flag>;
  replaceFlag(opts: ReplaceFlagOptions): Promise<Flag>;
  getFlag(key: FlagKey): Promise<Flag | undefined>;
  getFlags(q: FindFlagsOptions): Promise<Flag[]>;
  updateFlag(key: UpdateFeatureFlagOpts): Promise<void>;
  deleteFlag(key: FlagKey): Promise<void>;
}
