import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoFollowDao } from "../../dao/dynamodb/DynamoFollowDao";

const sqsClient = new SQSClient({ region: "us-west-2" });

const followDao = new DynamoFollowDao();

export const handler = async (event: any) => {
  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];
    const body = record.body;

    const { status } = JSON.parse(body);

    let hasMore = true;
    let lastItem = undefined;
    while (hasMore) {
      const startTimeMillis = new Date().getTime();
      const followerPage = await followDao.getPageOfFollowers(
        status.user.alias,
        100,
        lastItem
      );

      hasMore = followerPage.hasMore;
      lastItem = followerPage.lastFollowerAlias;

      const followerAliases = followerPage.followerAliases;
      console.log(followerAliases);

      const messageBody = JSON.stringify({
        status: status,
        followerAliases: followerAliases,
      });

      const sqsCommand = new SendMessageCommand({
        QueueUrl:
          "https://sqs.us-west-2.amazonaws.com/034362054802/UpdateFeedQueue",
        MessageBody: messageBody,
      });

      await sqsClient.send(sqsCommand);

      const elapsedTime = new Date().getTime() - startTimeMillis;
      if (elapsedTime < 1000) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, 1000 - elapsedTime)
        );
      }
    }
  }
};
