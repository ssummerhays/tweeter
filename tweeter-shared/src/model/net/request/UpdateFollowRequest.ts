import { UserDto } from "../../dto/UserDto";

export interface UpdateFollowRequest {
    token: string;
    user: UserDto;
}