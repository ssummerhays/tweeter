import { AuthDao } from "../interfaces/AuthDao";
import { FeedDao } from "../interfaces/FeedDao";
import { FollowDao } from "../interfaces/FollowDao";
import { S3DAO } from "../interfaces/S3Dao";
import { StatusDao } from "../interfaces/StatusDao";
import { StoryDao } from "../interfaces/StoryDao";
import { UserDao } from "../interfaces/UserDao";

export interface AbstractFactory {
    createFollowDao(): FollowDao;
    createStoryStatusDao(): StoryDao;
    createFeedStatusDao(): FeedDao;
    createUserDao(): UserDao;
    createAuthDao(): AuthDao;
    createS3Dao(): S3DAO;
}