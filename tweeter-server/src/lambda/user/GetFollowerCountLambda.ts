import { TokenUserRequest, GetFollowCountResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

export const handler = async (
  request: TokenUserRequest
): Promise<GetFollowCountResponse> => {
  const userService = new UserService(new DynamoDaoFactory());
  
  const followerCount = await userService.getFollowerCount(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    count: followerCount,
  };
};
