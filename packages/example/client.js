const { Flaggeron } = require("flagger-on");

async function main() {
  const f = new Flaggeron({
    dynamodb: {
      apiVersion: "2012-08-10",
      region: "us-west-2",
    },
  });

  const r = await f.isEnabled(
    {
      namespace: "my_project",
      id: "feature_1",
    },
    "customer_id_12345" // must be unique per subject
  );
  console.log(r);
}

main();
