import { CustomerFeatureFlagger } from "./customer.flag";
import { GlobalFeatureFlagger } from "./global.flag";

export * from "./customer.flag";
export * from "./global.flag";

export interface FlaggerOpts {
  region: string;
}

// CRC32(user.id) < (2**32 - 1) / 100.0 * percentage
export class FeatureFlagger {
  public globalFeatureFlag: GlobalFeatureFlagger;
  public customerFeatureFlag: CustomerFeatureFlagger;
  constructor(opts: FlaggerOpts) {
    this.globalFeatureFlag = new GlobalFeatureFlagger(opts);
    this.customerFeatureFlag = new CustomerFeatureFlagger({
      ...opts,
      globalFlagger: this.globalFeatureFlag,
    });
  }
}
