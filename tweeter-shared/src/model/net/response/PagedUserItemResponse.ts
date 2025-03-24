import { UserDto } from "../../dto/UserDto";
import { PagedItemResponse } from "./PagedItemResponse";
import { TweeterResponse } from "./TweeterResponse";

export interface PagedUserItemResponse extends PagedItemResponse<UserDto> {}
