import { AuthResponse, RegisterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: RegisterRequest
): Promise<AuthResponse> => {
  const userService = new UserService();
  const userImageBytes = Buffer.from(request.userImageBytesString, "base64");
  const [user, authToken] = await userService.register(
    request.firstName,
    request.lastName,
    request.alias,
    request.password,
    userImageBytes,
    request.imageFileExtension
  );

  return {
    success: true,
    message: null,
    user: user,
    authToken: authToken,
  };
};
