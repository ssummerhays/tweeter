import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { StatusDao } from "../interfaces/StatusDao";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { StatusDto, Type, UserDto } from "tweeter-shared";
import { PostSegmentDto } from "tweeter-shared/dist/model/dto/PostSegmentDto";

export abstract class DynamoStatusDao implements StatusDao {
  protected client: DynamoDBDocumentClient;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-west-2",
      })
    );
    this.tableName = tableName;
  }

  async createStatus(alias: string, status: StatusDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        alias: alias,
        user: status.user,
        timestamp: status.timestamp,
        post: status.post,
        segments: status.segments,
      },
    };

    try {
      await this.client.send(new PutCommand(params));
    } catch (error) {
      throw new Error("[Server Error] failed to create status");
    }
  }

  async batchCreateAliasesStatus(
    aliases: string[],
    status: StatusDto
  ): Promise<void> {
    const requestItems = aliases.map((alias) => ({
      PutRequest: {
        Item: {
          alias: alias,
          user: status.user,
          timestamp: status.timestamp,
          post: status.post,
          segments: status.segments,
        },
      },
    }));

    const params = {
      RequestItems: {
        [this.tableName]: requestItems,
      },
    };

    try {
      await this.client.send(new BatchWriteCommand(params));
    } catch (error) {
      throw new Error("[Server Error] failed to create statuses");
    }
  }

  async batchCreateStatus(alias: string, statuses: StatusDto[]): Promise<void> {
    const requestItems = statuses.map((status) => ({
      PutRequest: {
        Item: {
          alias: alias,
          user: status.user,
          timestamp: status.timestamp,
          post: status.post,
          segments: status.segments,
        },
      },
    }));

    const params = {
      RequestItems: {
        [this.tableName]: requestItems,
      },
    };

    try {
      await this.client.send(new BatchWriteCommand(params));
    } catch (error) {
      throw new Error("[Server Error] failed to create statuses");
    }
  }

  async batchDeleteStatus(
    deleteItems: {
      alias: string;
      timestamp: number;
    }[]
  ): Promise<void> {
    const requestItems = deleteItems.map((item) => ({
      DeleteRequest: {
        Key: {
          alias: item.alias,
          timestamp: item.timestamp,
        },
      },
    }));

    const params = {
      RequestItems: {
        [this.tableName]: requestItems,
      },
    };

    await this.client.send(new BatchWriteCommand(params));
  }

  async getStatuses(
    alias: string,
    pageSize: number,
    lastTimeStamp: number | undefined
  ): Promise<{
    statuses: StatusDto[];
    hasMore: boolean;
    lastTimestamp: number | undefined;
  }> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "alias = :alias",
      ExpressionAttributeValues: {
        ":alias": { S: alias },
      },
      Limit: pageSize,
      ScanIndexForward: false,
    };

    if (lastTimeStamp) {
      (params.ExpressionAttributeNames = {
        "#timestamp": "timestamp",
      }),
        (params.KeyConditionExpression += " AND #timestamp < :lastTimeStamp");
      params.ExpressionAttributeValues![":lastTimeStamp"] = {
        N: lastTimeStamp.toString(),
      };
    }

    const result = await this.client.send(new QueryCommand(params));

    const statuses: StatusDto[] = (result!.Items || []).map((item) => ({
      post: item.post?.S || "",
      user: item.user.M
        ? {
            alias: item.user.M.alias.S || "",
            firstName: item.user.M.firstName.S || "",
            lastName: item.user.M.lastName.S || "",
            imageUrl: item.user.M.imageUrl.S || "",
          }
        : ({} as UserDto),
      timestamp: Number(item.timestamp?.N) || 0,
      segments: item.segments.L
        ? item.segments.L.map((segment) =>
            segment.M
              ? {
                  text: segment.M.text.S || "",
                  startPostion: Number(segment.M.startPostion?.N) || 0,
                  endPosition: Number(segment.M.endPosition?.N) || 0,
                  type: segment.M.type?.S as Type,
                }
              : ({} as PostSegmentDto)
          )
        : [],
    }));

    return {
      statuses,
      hasMore: result ? result.LastEvaluatedKey !== undefined : false,
      lastTimestamp:
        statuses.length > 0
          ? statuses[statuses.length - 1].timestamp
          : undefined,
    };
  }
}
