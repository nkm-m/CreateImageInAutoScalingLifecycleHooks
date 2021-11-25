const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  ec2: "2016-11-15",
  lambda: "2015-03-31",
  autoscaling: "2011-01-01",
};
const EC2API = require("./AWS_API/EC2API");
const ec2 = new EC2API(AWS);
const LambdaAPI = require("./AWS_API/LambdaAPI");
const lambda = new LambdaAPI(AWS);
const AutoScalingAPI = require("./AWS_API/AutoScalingAPI");
const autoscaling = new AutoScalingAPI(AWS);

exports.handler = async (event, context) => {
  console.log(JSON.stringify(event, null, 2));
  const currentAsgName = process.env.ASGNAME;
  const eventAsgName = event.detail.AutoScalingGroupName;
  const instanceId = event.detail.EC2InstanceId;
  if (
    event.detail.LifecycleTransition === "autoscaling:EC2_INSTANCE_LAUNCHING"
  ) {
    //リリースによる新規Auto Scalingグループ起動時に、Lambdaの環境変数を更新
    try {
      const environment = await lambda.updateFunctionConfiguration(
        context.functionName,
        eventAsgName
      );
      console.log(environment);
    } catch (err) {
      console.log(err);
    }
  } else {
    if (currentAsgName === eventAsgName) {
      //予期せぬスケールイン時に障害調査用のAMIを取得
      const imageName = "DisabilityImage";
      try {
        const imageId = await ec2.createImage(instanceId, imageName);
        const snapshotId = await getSnapshotid(imageId);
        if (snapshotId === undefined) {
          console.log("スナップショットIDを取得できませんでした。");
          return;
        }
        await ec2.createTags(imageId, snapshotId, imageName);
      } catch (err) {
        console.log(err);
      }
    } else {
      //リリースによる古いAuto Scalingグループの削除続行
      const result = await autoscaling.completeLifecycleAction(
        eventAsgName,
        event.detail.LifecycleActionToken,
        instanceId,
        event.detail.LifecycleHookName
      );
      console.log(result);
    }
  }
};

//スナップショットのidを取得するメソッド
async function getSnapshotid(imageId) {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const ebs = await ec2.describeImages(imageId);
      if ("SnapshotId" in ebs) {
        return ebs.SnapshotId;
      }
    } catch (err) {
      console.log("getSnapshotidでエラーが発生しました。");
      throw err;
    }
    if (i === 9) {
      console.log("30秒以内にスナップショットのidを取得できませんでした。");
      return undefined;
    }
  }
}
