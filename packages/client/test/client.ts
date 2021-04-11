import { FeatureFlagger } from "../src";

async function main() {
  try {
    const ff = new FeatureFlagger({
      region: "us-west-2",
    });
    const r = await ff.create({
      namespace: "pepr",
      customerId: 'person.id.something.3',
      featureId: "insurance_price_post_chase",
      options: { prop: "test2" },
      enabled: false,
    });

    const s = await ff.get({
      namespace: "pepr",
      featureId: "insurance_price_post_chase",
    });
    console.log(s);
    // await ff.disable({
    //   namespace: "pepr",
    //   featureId: "insurance_price_post_chase",
    // });
    // console.log("done", r);
  } catch (e) {
    console.error(e);
  }
}

main();
