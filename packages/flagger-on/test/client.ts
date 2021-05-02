import { FeatureFlagger } from "../src";

async function main() {
  try {
    const ff = new FeatureFlagger({
      region: "us-west-2",
    });
    const r = await ff.customerFeatureFlag.replace({
      namespace: "my_namespace",
      customerId: "person.id.something.3",
      featureId: "insurance_price_post_chase",
      options: { prop: "test1" },
      enabled: true,
    });

    const s = await ff.globalFeatureFlag.get({
      namespace: "my_namespace",
      featureId: "insurance_price_post_chase",
    });
    console.log(s);
    // await ff.disable({
    //   namespace: "my_namespace",
    //   featureId: "insurance_price_post_chase",
    // });
    // console.log("done", r);
  } catch (e) {
    console.error(e);
  }
}

main();
