import { StoryDao } from "../interfaces/StoryDao";
import { DynamoStatusDao } from "./DynamoStatusDao";

export class DynamoStoryDao extends DynamoStatusDao implements StoryDao {
  constructor() {
    super("Story");
  }
}
