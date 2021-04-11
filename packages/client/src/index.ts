import { CustomerFeatureFlagger } from "./customer.flag";
import { GlobalFeatureFlagger } from "./global.flag";

export * from "./customer.flag";
export * from "./global.flag";

export interface FlaggerOpts {
  region: string;
}

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
