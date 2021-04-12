import {
  CreateFlagOptions,
  Flag,
  FlagKey,
  ReplaceFlagOptions,
  UpdateFeatureFlagOpts,
} from "../models";

export interface Driver {
  create(opts: CreateFlagOptions): Promise<Flag>;
  replace(opts: ReplaceFlagOptions): Promise<Flag>;
  get(key: FlagKey): Promise<Flag | undefined>;
  update(key: UpdateFeatureFlagOpts): Promise<void>;
  delete(key: FlagKey): Promise<void>;
}
