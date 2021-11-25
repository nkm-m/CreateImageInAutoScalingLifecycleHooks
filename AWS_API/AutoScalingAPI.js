module.exports = class AutoScalingAPI {
  constructor(AWS) {
    this.autoscaling = new AWS.AutoScaling();
  }

  //Auto Scalingグループのライフサイクルアクションを完了させるメソッド
  async completeLifecycleAction(
    AutoScalingGroupName,
    LifecycleActionToken,
    InstanceId,
    LifecycleHookName
  ) {
    const params = {
      AutoScalingGroupName,
      LifecycleActionResult: 'CONTINUE',
      LifecycleActionToken,
      InstanceId,
      LifecycleHookName,
    };
    try {
      const result = await this.autoscaling
        .completeLifecycleAction(params)
        .promise();
      return result;
    } catch (err) {
      console.log('completeLifecycleActionでエラーが発生しました。');
      throw err;
    }
  }
};
