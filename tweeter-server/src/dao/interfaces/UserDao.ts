import { UserDto } from "tweeter-shared";

export interface UserDao {
  createUser(user: UserDto, hashedPassword: string): Promise<void>;
  getUserByAlias(
    alias: string
  ): Promise<[UserDto, string, number, number] | null>;
  updateFollowCounts(
    alias: string,
    followerCountChange: number,
    followeeCountChange: number
  ): Promise<void>;
}
