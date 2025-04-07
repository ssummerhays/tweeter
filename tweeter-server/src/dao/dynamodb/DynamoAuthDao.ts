import { AuthTokenDto } from "tweeter-shared";
import { AuthDao } from "../interfaces/AuthDao";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoAuthDao implements AuthDao {
  private client: DynamoDBDocumentClient;
  private readonly tableName = "Auth";

  constructor() {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-west-2",
      })
    );
  }
  async addToken(alias: string, authToken: AuthTokenDto): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: { alias, token: authToken.token, timestamp: authToken.timestamp },
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw new Error("[Server Error] failed to add token");
    }
  }

  async deleteToken(token: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { token },
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw new Error("[Server Error] failed to delete token");
    }
  }

  async getAliasByAuth(token: string): Promise<string> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { token },
    });

    let response = await this.client.send(command);

    if (!response.Item) {
      throw new Error("[Bad Request] Invalid or expired token");
    }

    return response.Item.alias;
  }

  async getTimestampByAuth(token: string): Promise<number> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { token },
    });

    let response = await this.client.send(command);

    if (!response.Item) {
      throw new Error("[Bad Request] Invalid or expired token");
    }

    return response.Item.timestamp;
  }
}
