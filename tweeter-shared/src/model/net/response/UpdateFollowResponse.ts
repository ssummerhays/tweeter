import { TweeterResponse } from "./TweeterResponse";

export interface UpdateFollowResponse extends TweeterResponse {
    readonly followerCount: number;
    readonly followeeCount: number;
}