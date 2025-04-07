export interface FollowDao {
  createFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  getFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<[string, string] | null>;
  getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | undefined
  ): Promise<{
    followerAliases: string[];
    hasMore: boolean;
    lastFollowerAlias: string;
  }>;
  getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeHandle: string | undefined
  ): Promise<{
    followeeAliases: string[];
    hasMore: boolean;
    lastFolloweeAlias: string;
  }>;
}
