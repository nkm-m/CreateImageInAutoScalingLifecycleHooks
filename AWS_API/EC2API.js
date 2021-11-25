module.exports = class EC2API {
  constructor(AWS) {
    this.ec2 = new AWS.EC2();
  }

  //AMIを作成するメソッド
  async createImage(InstanceId, Name) {
    const params = {
      InstanceId /* required */,
      Name /* required */,
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/sda1',
          Ebs: {
            DeleteOnTermination: true,
            Encrypted: false,
            //Iops: 'NUMBER_VALUE',
            //KmsKeyId: 'STRING_VALUE',
            //SnapshotId: 'STRING_VALUE',
            //Throughput: 'NUMBER_VALUE',
            VolumeSize: 30,
            VolumeType: 'gp2',
          },
          //NoDevice: 'STRING_VALUE',
          //VirtualName: 'STRING_VALUE'
        },
        /* more items */
      ],
      Description: Name,
      DryRun: false,
      NoReboot: true,
    };

    try {
      const result = await this.ec2.createImage(params).promise();
      return result.ImageId;
    } catch (err) {
      console.log('createImageでエラーが発生しました。');
      throw err;
    }
  }

  //AMIのスナップショットidを取得するメソッド
  async describeImages(imageId) {
    const params = {
      ImageIds: [imageId],
    };

    try {
      const result = await this.ec2.describeImages(params).promise();
      return result.Images[0].BlockDeviceMappings[0].Ebs;
    } catch (err) {
      console.log('describeImagesでエラーが発生しました。');
    }
  }

  //AMIとスナップショットにタグ(名前)を付けるメソッド
  async createTags(imageId, snapshotId, Value) {
    const params = {
      Resources: [imageId, snapshotId],
      Tags: [
        {
          Key: 'Name',
          Value,
        },
        {
          Key: 'Name',
          Value,
        },
      ],
    };

    try {
      await this.ec2.createTags(params).promise();
    } catch (err) {
      console.log('createTagsでエラーが発生しました。');
      throw err;
    }
  }
};
