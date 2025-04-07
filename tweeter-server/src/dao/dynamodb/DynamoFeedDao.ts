import { DynamoStatusDao } from "./DynamoStatusDao";
import { FeedDao } from "../interfaces/FeedDao";

export class DynamoFeedDao extends DynamoStatusDao implements FeedDao {
  constructor() {
    super("Feed");
  }
}
