import { AuthTokenDto } from "tweeter-shared";

export interface AuthDao {
  addToken(alias: string, authToken: AuthTokenDto): Promise<void>;
  deleteToken(token: string): Promise<void>;
  getAliasByAuth(token: string): Promise<string>;
  getTimestampByAuth(token: string): Promise<number>;
}
