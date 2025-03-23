import { UserDto } from "../../dto/UserDto";

export interface GetFollowCountRequest {
    token: string;
    user: UserDto;
}