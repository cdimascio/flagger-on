#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { FeatureTogglerStack } from "../lib/feature.toggler";

const {
  CDK_DEPLOY_ACCOUNT,
  CDK_DEFAULT_ACCOUNT,
  CDK_DEPLOY_REGION,
  CDK_DEFAULT_REGION,
} = process.env;
const account = CDK_DEPLOY_ACCOUNT ?? CDK_DEFAULT_ACCOUNT;
const region = CDK_DEPLOY_REGION ?? CDK_DEFAULT_REGION;
if (!account) {
  throw Error("one of CDK_DEFAULT_ACCOUNT or CDK_DEPLOY_ACCOUNT required.");
}

console.log({ account, region }, process.env.CDK_DEPLOY_REGION);
const app = new cdk.App();
new FeatureTogglerStack(app, "FeatureTogglerStack", {
  env: {
    account,
    region,
  },
});
