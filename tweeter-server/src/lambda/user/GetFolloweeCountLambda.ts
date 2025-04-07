import { TokenUserRequest, GetFollowCountResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

export const handler = async (
  request: TokenUserRequest
): Promise<GetFollowCountResponse> => {
  const userService = new UserService(new DynamoDaoFactory());
  
  const followeeCount = await userService.getFolloweeCount(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    count: followeeCount,
  };
};
