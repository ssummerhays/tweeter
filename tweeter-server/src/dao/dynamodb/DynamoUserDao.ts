import { UserDto } from "tweeter-shared";
import { UserDao } from "../interfaces/UserDao";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
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
      Item: { alias: user.alias, user, hashedPassword },
    });
    try {
      await this.client.send(command);
    } catch (error) {
      throw new Error("[Server Error] failed to create user");
    }
  }

  async getUserByAlias(alias: string): Promise<[UserDto, string] | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { alias },
    });

    const result = await this.client.send(command);

    if (!result.Item) {
      return null;
    }
    return [result.Item.user as UserDto, result.Item.hashedPassword];
  }
}
