module.exports = class LambdaAPI {
  constructor(AWS) {
    this.lambda = new AWS.Lambda();
  }

  //Lambdaの環境変数を更新するメソッド
  async updateFunctionConfiguration(FunctionName, newAsgName) {
    const params = {
      FunctionName,
      Environment: {
        Variables: {
          ASGNAME: newAsgName,
          /* '<EnvironmentVariableName>': ... */
        },
      },
    };
    try {
      const result = await this.lambda
        .updateFunctionConfiguration(params)
        .promise();
      return result.Environment;
    } catch (err) {
      console.log("updateFunctionConfigurationでエラーが発生しました。");
      throw err;
    }
  }
};
