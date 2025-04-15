import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: "us-west-2" });

export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusService = new StatusService(new DynamoDaoFactory());

  await statusService.postStatus(request.token, request.newStatus);

  const messageBody = JSON.stringify({
    status: request.newStatus,
  });

  const sqsCommand = new SendMessageCommand({
    QueueUrl:
      "https://sqs.us-west-2.amazonaws.com/034362054802/PostStatusQueue",
    MessageBody: messageBody,
  });

  try {
    await sqsClient.send(sqsCommand);
  } catch (error) {
    throw new Error("[Server Error] unable to send SQS message");
  }

  return {
    success: true,
    message: null,
  };
};
