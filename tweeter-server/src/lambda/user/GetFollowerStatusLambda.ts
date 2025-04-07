import { FollowerStatusRequest, FollowerStatusResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

export const handler = async (
  request: FollowerStatusRequest
): Promise<FollowerStatusResponse> => {
  const userService = new UserService(new DynamoDaoFactory());
  
  const isFollower = await userService.getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser
  );
  return {
    success: true,
    message: null,
    isFollower: isFollower,
  };
};
