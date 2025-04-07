import { LoginRequest, AuthResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

export const handler = async (request: LoginRequest): Promise<AuthResponse> => {
    const userService = new UserService(new DynamoDaoFactory());
    
    const [userDto, authToken] = await userService.login(request.alias, request.password);

    return {
        success: true,
        message: null,
        user: userDto,
        authToken: authToken,
    }
}