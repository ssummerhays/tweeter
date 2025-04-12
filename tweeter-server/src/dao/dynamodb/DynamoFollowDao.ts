import { FollowDao } from "../interfaces/FollowDao";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export class DynamoFollowDao implements FollowDao {
  private client: DynamoDBDocumentClient;
  private readonly tableName = "Follows";

  constructor() {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-west-2",
      })
    );
  }

  async getFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<[string, string] | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        followerAlias,
        followeeAlias,
      },
    };

    let result;
    try {
      result = await this.client.send(new GetCommand(params));
    } catch (error) {
      throw new Error("[Server Error] failed to get follow");
    }

    if (!result.Item) {
      return null;
    }
    return [result.Item.followerAlias, result.Item.followeeAlias];
  }

  async getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | undefined
  ): Promise<{
    followerAliases: string[];
    hasMore: boolean;
    lastFollowerAlias: string;
  }> {
    const params: any = {
      TableName: this.tableName,
      IndexName: "follow-index",
      KeyConditionExpression: "followeeAlias = :followee",
      ExpressionAttributeValues: {
        ":followee": followeeAlias,
      },
      Limit: pageSize,
    };

    if (lastFollowerAlias) {
      params.ExclusiveStartKey = {
        followeeAlias: followeeAlias,
        followerAlias: lastFollowerAlias,
      };
    }

    const result = await this.client.send(new QueryCommand(params));

    const followerAliases =
      result.Items?.map((item) => item.followerAlias) || [];

    const lastKey = result.LastEvaluatedKey?.followerAlias;
    const hasMore = !!lastKey;

    return { followerAliases, hasMore, lastFollowerAlias: lastKey };
  }

  async getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | undefined
  ): Promise<{
    followeeAliases: string[];
    hasMore: boolean;
    lastFolloweeAlias: string;
  }> {
    let params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "followerAlias = :follower",
      ExpressionAttributeValues: {
        ":follower": followerAlias,
      },
      Limit: pageSize,
    };

    if (lastFolloweeAlias) {
      params.ExclusiveStartKey = {
        followerAlias: followerAlias,
        followeeAlias: lastFolloweeAlias,
      };
    }

    let result = await this.client.send(new QueryCommand(params));

    const followeeAliases =
      result.Items?.map((item) => item.followeeAlias) || [];
    const lastKey = result.LastEvaluatedKey?.followeeAlias;
    const hasMore = !!lastKey;

    return { followeeAliases, hasMore, lastFolloweeAlias: lastKey };
  }

  async createFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    console.log(followerAlias, followeeAlias);
    const params = {
      TableName: this.tableName,
      Item: {
        followerAlias: followerAlias,
        followeeAlias: followeeAlias,
      },
    };

    try {
      await this.client.send(new PutCommand(params));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        followerAlias,
        followeeAlias,
      },
    };

    try {
      await this.client.send(new DeleteCommand(params));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
