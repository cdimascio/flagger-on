// import { expect } from "chai";
// import "mocha";
// import {
//   CreateCustomerFeatureFlag,
//   CustomerFeatureFlag,
//   CustomerFeatureFlagKey,
//   FeatureFlagger,
// } from "../src";

// const cleanup = async (params: CustomerFeatureFlagKey) => {
//   await Promise.all([
//     customerFeatureFlag.delete(params),
//     globalFeatureFlag.delete(params),
//   ]);
// };

// const { customerFeatureFlag, globalFeatureFlag } = new FeatureFlagger({
//   region: "us-west-2",
// });

// describe("a customer feature flag", () => {
//   const params: CreateCustomerFeatureFlag = {
//     namespace: "pepr",
//     featureId: "feature_2222",
//     customerId: "customer_aaaa",
//     options: { test: "prop" },
//     enabled: true,
//   };

//   let f: CustomerFeatureFlag;
//   beforeEach(async () => {
//     await cleanup(params);
//     f = await customerFeatureFlag.create(params);
//   });

//   afterEach(async () => await cleanup(params));

//   it("should create successfully", async () => {
//     expect(f.enabled).to.be.true;
//     expect(f.options).to.deep.equal({ test: "prop" });
//   });

//   it("should also create a global feature flag", async () => {
//     const customerFlag = await customerFeatureFlag.get(params);
//     const globalFlag = await globalFeatureFlag.get(params);
//     expect(customerFlag?.enabled).to.be.true;
//     expect(globalFlag?.enabled).to.be.true;
//     expect(customerFlag?.options).to.deep.equal(globalFlag?.options);
//     expect(customerFlag?.enabled).to.deep.equal(globalFlag?.enabled);
//   });

//   it("should replace and an existing feature flag", async () => {
//     const ff = await customerFeatureFlag.replace(params);
//     expect(ff.enabled).to.be.true;
//     expect(ff.options).to.deep.equal({ test: "prop" });

//     const newParams = { ...params, options: {}, enabled: false };
//     const replaced = await customerFeatureFlag.replace(newParams);
//     expect(replaced.enabled).to.be.false;
//     expect(replaced.options).to.deep.equal({});
//     await customerFeatureFlag.delete(newParams);
//   });

//   it("should delete successfully", async () => {
//     const params = {
//       namespace: "pepr",
//       featureId: "feature_delete_successfully",
//       customerId: "customer_delete_successfully",
//       options: { test: "prop" },
//       enabled: true,
//     };

//     // make sure the feature flag doesn't exist at test start
//     await customerFeatureFlag.delete(params);
//     await globalFeatureFlag.delete(params);

//     // create a customer ff and verify that both the global and customer ff are created
//     await customerFeatureFlag.create(params);
//     const created = await customerFeatureFlag.get(params);
//     expect(created?.enabled).to.be.true;
//     expect(created?.options).to.deep.equal({ test: "prop" });
//     const global = await globalFeatureFlag.get(params);
//     expect(global?.enabled).to.be.true;
//     expect(global?.options).to.deep.equal({ test: "prop" });

//     // delete the customer ff
//     await customerFeatureFlag.delete(params);
//     const created2 = await customerFeatureFlag.get(params);
//     expect(created2).to.be.undefined;

//     // check that the global ff created with the customer ff still exists
//     const global2 = await globalFeatureFlag.get(params);
//     expect(global2?.enabled).to.be.true;
//     expect(global2?.options).to.deep.equal({ test: "prop" });
//   }).timeout(5000);

//   describe("in an enabled state", () => {
//     const params = {
//       namespace: "pepr",
//       featureId: "feature_enabled_tests",
//       customerId: "customer_enabled_tests",
//       options: { test: "prop" },
//       enabled: true,
//     };

//     beforeEach(async () => {
//       await customerFeatureFlag.replace(params);
//     });

//     afterEach(async () => {
//       await customerFeatureFlag.delete(params);
//     });

//     it("should disable successfully", async () => {
//       await customerFeatureFlag.disable(params);

//       const ff = await customerFeatureFlag.get(params);
//       expect(ff?.enabled).to.not.be.undefined;
//       expect(ff?.enabled).to.be.false;
//     });

//     it("should be enable when retrieved", async () => {
//       const ff = await customerFeatureFlag.get(params);
//       expect(ff?.enabled).to.not.be.undefined;
//       expect(ff?.enabled).to.be.true;
//     });
//   });

//   describe("in a disabled state", () => {
//     const params = {
//       namespace: "pepr",
//       featureId: "feature_disnabled_tests",
//       customerId: "customer_disabled_tests",
//       options: { test: "prop" },
//       enabled: false,
//     };

//     beforeEach(async () => {
//       await customerFeatureFlag.replace(params);
//     });

//     afterEach(async () => {
//       await customerFeatureFlag.delete(params);
//     });

//     it("should enable successfully", async () => {
//       await customerFeatureFlag.enable(params);

//       const ff = await customerFeatureFlag.get(params);
//       expect(ff?.enabled).to.not.be.undefined;
//       expect(ff?.enabled).to.be.true;
//     });

//     it("should be disabled when retrieved", async () => {
//       const ff = await customerFeatureFlag.get(params);
//       expect(ff?.enabled).to.not.be.undefined;
//       expect(ff?.enabled).to.be.false;
//     });
//   });
// });
