import { ConcreteS3Dao } from "../ConcreteS3Dao";
import { DynamoAuthDao } from "../dynamodb/DynamoAuthDao";
import { DynamoFeedDao } from "../dynamodb/DynamoFeedDao";
import { DynamoFollowDao } from "../dynamodb/DynamoFollowDao";
import { DynamoStoryDao } from "../dynamodb/DynamoStoryDao";
import { DynamoUserDao } from "../dynamodb/DynamoUserDao";
import { AuthDao } from "../interfaces/AuthDao";
import { FeedDao } from "../interfaces/FeedDao";
import { FollowDao } from "../interfaces/FollowDao";
import { S3DAO } from "../interfaces/S3Dao";
import { StoryDao } from "../interfaces/StoryDao";
import { UserDao } from "../interfaces/UserDao";
import { AbstractFactory } from "./AbstractFactory";

export class DynamoDaoFactory implements AbstractFactory {
  createFollowDao(): FollowDao {
    return new DynamoFollowDao();
  }

  createStoryStatusDao(): StoryDao {
    return new DynamoStoryDao();
  }

  createFeedStatusDao(): FeedDao {
    return new DynamoFeedDao();
  }

  createUserDao(): UserDao {
    return new DynamoUserDao();
  }

  createAuthDao(): AuthDao {
    return new DynamoAuthDao();
  }

  createS3Dao(): S3DAO {
    return new ConcreteS3Dao();
  }
}
