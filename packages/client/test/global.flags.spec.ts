import "mocha";
import { expect } from "chai";
import { CreateGlobalFeatureFlag, FeatureFlagger, GlobalFeatureFlagKey } from "../src";

const featureFlag = new FeatureFlagger({
  region: "us-west-2",
}).globalFeatureFlag;

describe("a global feature flag", () => {
  it("should create successfully", async () => {
    const params = {
      namespace: "pepr",
      featureId: "feature_1111",
      options: { test: "prop" },
      enabled: true,
    };
    await featureFlag.delete(params);
    const ff = await featureFlag.create(params);
    expect(ff.enabled).to.be.true;
    expect(ff.options).to.deep.equal({ test: "prop" });
    await featureFlag.delete(params);
  });

  it("should replace and an existing feature flag", async () => {
    const params = {
      namespace: "pepr",
      featureId: "feature_1111",
      options: { test: "prop" },
      enabled: true,
    };
    const ff = await featureFlag.replace(params);
    expect(ff.enabled).to.be.true;
    expect(ff.options).to.deep.equal({ test: "prop" });
  });

  it("should delete successfully", async () => {
    const create = async (params: CreateGlobalFeatureFlag) => {
      const ff = await featureFlag.replace(params);
      expect(ff.enabled).to.be.true;
      expect(ff.options).to.deep.equal({ test: "prop" });
      return ff;
    };
    const params = {
      namespace: "pepr",
      featureId: "feature_1112",
      options: { test: "prop" },
      enabled: true,
    };
    await create(params);
    await featureFlag.delete(params);
    const ff = await featureFlag.get(params);
    expect(ff).to.be.undefined;
  });

  describe("in an enabled state", () => {
    const params = {
      namespace: "pepr",
      featureId: "feature_1112",
      options: { test: "prop" },
      enabled: true,
    };

    beforeEach(async () => {
      await featureFlag.replace(params);
    });

    afterEach(async () => {
      await featureFlag.delete(params);
    });

    it("should disable successfully", async () => {
      await featureFlag.disable(params);

      const ff = await featureFlag.get(params);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });

    it("should be enable when retrieved", async () => {
      const ff = await featureFlag.get(params);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });
  });

  describe("in a disabled state", () => {
    const params = {
      namespace: "pepr",
      featureId: "feature_1112",
      options: { test: "prop" },
      enabled: false,
    };

    beforeEach(async () => {
      await featureFlag.replace(params);
    });

    afterEach(async () => {
      await featureFlag.delete(params);
    });

    it("should enable successfully", async () => {
      await featureFlag.enable(params);

      const ff = await featureFlag.get(params);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });

    it("should be disabled when retrieved", async () => {
      const ff = await featureFlag.get(params);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });
  });
});
