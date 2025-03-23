import { GetFollowCountRequest, GetFollowCountResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: GetFollowCountRequest
): Promise<GetFollowCountResponse> => {
  const userService = new UserService();
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
