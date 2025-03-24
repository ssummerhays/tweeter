import { UserDto } from "../../dto/UserDto";

export interface TokenUserRequest {
    token: string;
    user: UserDto;
}