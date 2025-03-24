import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface TokenUserRequest extends TweeterRequest {
    token: string;
    user: UserDto;
}