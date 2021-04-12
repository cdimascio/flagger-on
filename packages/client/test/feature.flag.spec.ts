import "mocha";
import { expect } from "chai";
import { CreateFlagOptions, Flag, FeatureFlag } from "../src";

const featureFlag = new FeatureFlag({
  dynamodb: {
    apiVersion: "2012-08-10",
    region: "us-west-2",
  },
});

describe("a feature flag", () => {
  it("should create successfully", async () => {
    const params = {
      key: {
        namespace: "pepr_test",
        id: "feature_1111",
      },
      config: {
        rollout: {
          percentage: 100,
        },
      },
      enabled: true,
    };
    await featureFlag.delete(params.key);
    const ff = await featureFlag.create(params);
    expect(ff.enabled).to.be.true;
    expect(ff.config).to.deep.equal(params.config);
    await featureFlag.delete(params.key);
  });

  it("should replace and an existing feature flag", async () => {
    const params = {
      key: {
        namespace: "pepr_test",
        id: "feature_1111",
      },
      config: { test: "prop", rollout: { percentage: 100 } },
      enabled: true,
    };
    const ff = await featureFlag.replace(params);
    expect(ff.enabled).to.be.true;
    expect(ff.config).to.deep.equal(params.config);
  });

  it("should delete successfully", async () => {
    const create = async (params: CreateFlagOptions) => {
      const ff = await featureFlag.replace(params);
      expect(ff.enabled).to.be.true;
      expect(ff.config).to.deep.equal(params.config);
      return ff;
    };
    const params = {
      key: {
        namespace: "pepr_test",
        id: "feature_1112",
      },
      config: { test: "prop", rollout: { percentage: 100 } },
      enabled: true,
    };
    await create(params);
    await featureFlag.delete(params.key);
    const ff = await featureFlag.get(params.key);
    expect(ff).to.be.undefined;
  }).timeout(5000);

  describe("in an enabled state", () => {
    const params = {
      key: {
        namespace: "pepr_test",
        id: "feature_1112",
      },
      config: {
        test: "prop",
        rollout: {
          percentage: 100,
        },
      },
      enabled: true,
    };

    beforeEach(async () => {
      await featureFlag.replace(params);
    });

    afterEach(async () => {
      await featureFlag.delete(params.key);
    });

    it("should disable successfully", async () => {
      await featureFlag.disable(params.key);

      const ff = await featureFlag.get(params.key);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });

    it("should be enabled when retrieved", async () => {
      const ff = await featureFlag.get(params.key);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });

    describe("with a unique subject", () => {
      const params = {
        key: {
          namespace: "pepr_test",
          id: "feature_subject_111",
        },
        config: {
          rollout: {
            percentage: 100,
          },
        },
        enabled: true,
      };

      afterEach(async () => {
        await featureFlag.delete(params.key);
      });

      it("should return disabled when a feature flag is enabled at 0 percent rollout", async () => {
        params.config.rollout.percentage = 0;
        await featureFlag.replace(params);

        const a = await featureFlag.isEnabled(params.key, "customer_test_aaa");
        expect(a).to.be.false;
      });

      it("should return enabled when a feature flag is enabled at 100 percent rollout", async () => {
        params.config.rollout.percentage = 100;
        await featureFlag.replace(params);

        const a = await featureFlag.isEnabled(params.key, "customer_test_aaa");
        expect(a).to.be.true;
      });
    });
  });

  describe("in an disabled state", () => {
    const params = {
      key: {
        namespace: "pepr_test",
        id: "feature_1112",
      },
      config: {
        test: "prop",
        rollout: {
          percentage: 100,
        },
      },
      enabled: false,
    };

    beforeEach(async () => {
      await featureFlag.replace(params);
    });

    afterEach(async () => {
      await featureFlag.delete(params.key);
    });

    it("should enable successfully", async () => {
      await featureFlag.enable(params.key);

      const ff = await featureFlag.get(params.key);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });

    it("should be disabled when retrieved", async () => {
      const ff = await featureFlag.get(params.key);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });

    describe("with a unique subject", () => {
      const params = {
        key: {
          namespace: "pepr_test",
          id: "feature_subject_111",
        },
        config: {
          rollout: {
            percentage: 100,
          },
        },
        enabled: false,
      };

      afterEach(async () => {
        await featureFlag.delete(params.key);
      });

      it("should return disabled when a feature flag is disabled at 100 percent rollout", async () => {
        params.config.rollout.percentage = 100;
        await featureFlag.replace(params);

        const a = await featureFlag.isEnabled(params.key, "customer_test_aaa");
        expect(a).to.be.false;
      });

      it("should return disabled when a feature flag is enabled at 50 percent rollout", async () => {
        params.config.rollout.percentage = 50;
        await featureFlag.replace(params);

        const a = await featureFlag.isEnabled(params.key, "customer_test_aaa");
        expect(a).to.be.false;
      });
    });
  });
});
