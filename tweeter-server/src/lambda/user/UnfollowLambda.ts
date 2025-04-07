import { TokenUserRequest, UpdateFollowResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

export const handler = async (
  request: TokenUserRequest
): Promise<UpdateFollowResponse> => {
  const userService = new UserService(new DynamoDaoFactory());
  
  const [followerCount, followeeCount] = await userService.unfollow(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    followerCount: followerCount,
    followeeCount: followeeCount,
  };
};
