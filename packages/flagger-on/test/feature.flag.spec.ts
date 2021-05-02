import "mocha";
import { expect } from "chai";
import {
  CreateFlagOptions,
  Flag,
  FlaggeronWithNamespace as Flaggeron,
} from "../src";

const flaggeron = new Flaggeron({
  namespace: "my_namspace_test",
  dynamodb: {
    apiVersion: "2012-08-10",
    region: "us-west-2",
  },
});

describe("a feature flag", () => {
  const toRemove: Flag[] = [];
  const replaceFlag = async (params: CreateFlagOptions) => {
    const flag = await flaggeron.replaceFlag(params);
    toRemove.push(flag);
    return flag;
  };
  afterEach(async () => {
    const ps = toRemove.map((r) => flaggeron.deleteFlag(r.featureId));
    return await Promise.all(ps);
  });
  it("should create successfully", async () => {
    const params = {
      featureId: "feature_1111",
      config: {
        rollout: {
          percentage: 100,
        },
      },
      enabled: true,
    };
    const ff = await replaceFlag(params);
    expect(ff.enabled).to.be.true;
    expect(ff.config).to.deep.equal(params.config);
    await flaggeron.deleteFlag(params.featureId);
  });

  it("should replace and an existing feature flag", async () => {
    const params = {
      featureId: "feature_1111",
      config: { data: { test: "prop" }, rollout: { percentage: 100 } },
      enabled: true,
    };
    const ff = await replaceFlag(params);
    expect(ff.enabled).to.be.true;
    expect(ff.config).to.deep.equal(params.config);
  });

  it("should delete successfully", async () => {
    const params = {
      featureId: "feature_1112",
      config: { test: "prop", rollout: { percentage: 100 } },
      enabled: true,
    };
    await replaceFlag(params);
    await flaggeron.deleteFlag(params.featureId);
    const ff = await flaggeron.getFlag(params.featureId);
    expect(ff).to.be.undefined;
  }).timeout(5000);

  describe("in an enabled state", () => {
    const params = {
      featureId: "feature_1112",
      config: {
        test: "prop",
        rollout: {
          percentage: 100,
        },
      },
      enabled: true,
    };

    beforeEach(async () => await flaggeron.replaceFlag(params));

    afterEach(async () => await flaggeron.deleteFlag(params.featureId));

    it("should disable successfully", async () => {
      await flaggeron.disableFlag(params.featureId);

      const ff = await flaggeron.getFlag(params.featureId);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });

    it("should be enabled when retrieved", async () => {
      const ff = await flaggeron.getFlag(params.featureId);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });

    describe("with a unique subject", () => {
      const params = {
        featureId: "feature_subject_111",
        config: {
          rollout: {
            percentage: 100,
          },
        },
        enabled: true,
      };

      afterEach(async () => flaggeron.deleteFlag(params.featureId));

      it("should return disabled when a feature flag is enabled at 0 percent rollout", async () => {
        params.config.rollout.percentage = 0;
        await flaggeron.replaceFlag(params);

        const a = await flaggeron.getFlagsForSubject(
          "customer_test_aaa",
          params.featureId
        );
        expect(a[0].enabled).to.be.false;
      });

      it("should return enabled when a feature flag is enabled at 100 percent rollout", async () => {
        params.config.rollout.percentage = 100;
        await flaggeron.replaceFlag(params);

        const a = await flaggeron.getFlagsForSubject(
          "customer_test_aaa",
          params.featureId
        );
        expect(a[0].enabled).to.be.true;
      });
    });
  });

  describe("in an disabled state", () => {
    const params = {
      featureId: "feature_1112",
      config: {
        test: "prop",
        rollout: {
          percentage: 100,
        },
      },
      enabled: false,
    };

    beforeEach(async () => {
      await flaggeron.replaceFlag(params);
    });

    afterEach(async () => {
      await flaggeron.deleteFlag(params.featureId);
    });

    it("should enable successfully", async () => {
      await flaggeron.enableFlag(params.featureId);

      const ff = await flaggeron.getFlag(params.featureId);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.true;
    });

    it("should be disabled when retrieved", async () => {
      const ff = await flaggeron.getFlag(params.featureId);
      expect(ff?.enabled).to.not.be.undefined;
      expect(ff?.enabled).to.be.false;
    });

    describe("with a unique subject", () => {
      const params = {
        featureId: "feature_subject_111",
        config: {
          rollout: {
            percentage: 100,
          },
        },
        enabled: false,
      };

      afterEach(async () => {
        await flaggeron.deleteFlag(params.featureId);
      });

      // it("should return disabled when a feature flag is disabled at 100 percent rollout", async () => {
      //   params.config.rollout.percentage = 100;
      //   await flaggeron.replaceFlag(params);

      //   const a = await flaggeron.isEnabled(params.key, "customer_test_aaa");
      //   expect(a).to.be.false;
      // });

      // it("should return disabled when a feature flag is enabled at 50 percent rollout", async () => {
      //   params.config.rollout.percentage = 50;
      //   await flaggeron.replaceFlag(params);

      //   const a = await flaggeron.isEnabled(params.key, "customer_test_aaa");
      //   expect(a).to.be.false;
      // });
    });
  });
});

describe("with many feature flags", () => {
  let allFlags: Flag[] = [];
  beforeEach(async () => {
    const generateParams = (
      featureId: string,
      enabled: boolean,
      percentage: number
    ) => ({
      featureId,
      config: {
        rollout: {
          percentage,
        },
        data: {
          test: "prop",
        },
      },
      enabled,
    });
    const flags = await Promise.all(
      [1, 2, 3, 4].map((i) =>
        flaggeron.replaceFlag(generateParams(`feature_${i}`, true, 50))
      )
    );
    allFlags = flags;
    return flags;
  });

  afterEach(async () => {
    const s = allFlags.map((f) => flaggeron.deleteFlag(f.featureId));
    await Promise.all(s);
  });

  it("should return all flags for namespace", async () => {
    const flags = await flaggeron.getFlags();
    expect(flags).to.have.lengthOf(allFlags.length);
    flags.forEach((flag) => {
      expect(flag.enabled).to.eq(true);
    });
  });

  it("should return all flags for namespace and customer (disabled)", async () => {
    const flags = await flaggeron.getFlagsForSubject("aaa");
    expect(flags).to.have.lengthOf(allFlags.length);
    flags.forEach((flag) => {
      expect(flag.enabled).to.eq(false);
    });
  });

  it("should return all flags for namespace and customer (enabled)", async () => {
    const flags = await flaggeron.getFlagsForSubject("aaaaazzzzzzz");
    expect(flags).to.have.lengthOf(allFlags.length);
    flags.forEach((flag) => {
      expect(flag.enabled).to.eq(true);
    });
  });
});
