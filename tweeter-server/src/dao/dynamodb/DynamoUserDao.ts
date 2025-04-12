import { UserDto } from "tweeter-shared";
import { UserDao } from "../interfaces/UserDao";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoUserDao implements UserDao {
  private client: DynamoDBDocumentClient;
  private readonly tableName = "User";

  constructor() {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-west-2",
      })
    );
  }

  async createUser(user: UserDto, hashedPassword: string): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        alias: user.alias,
        user,
        hashedPassword,
        follower_count: 0,
        followee_count: 0,
      },
    });
    try {
      await this.client.send(command);
    } catch (error) {
      throw new Error("[Server Error] failed to create user");
    }
  }

  async getUserByAlias(
    alias: string
  ): Promise<[UserDto, string, number, number] | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { alias },
    });

    const result = await this.client.send(command);

    if (!result.Item) {
      return null;
    }
    return [
      result.Item.user as UserDto,
      result.Item.hashedPassword,
      result.Item.follower_count,
      result.Item.followee_count,
    ];
  }

  async updateFollowCounts(
    alias: string,
    followerCountChange: number,
    followeeCountChange: number
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { alias },
      UpdateExpression:
        "SET follower_count = follower_count + :r, followee_count = followee_count + :e",
      ExpressionAttributeValues: {
        ":r": followerCountChange,
        ":e": followeeCountChange,
      },
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw new Error("[Server Error] failed to update follow counts");
    }
  }
}
