import { StatusDto } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoDaoFactory } from "../../dao/factories/DynamoDaoFactory";

const statusService = new StatusService(new DynamoDaoFactory());

export const handler = async (event: any) => {
  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];
    const body = JSON.parse(record.body);
    const { status, followerAliases } = body;

    for (let i = 0; i < followerAliases.length; i += 25) {
      const batch = followerAliases.slice(i, i + 25);
      await tryUpdateFeedsWithRetry(status, batch);
      console.log("Successful update");
    }
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function tryUpdateFeedsWithRetry(
  status: StatusDto,
  batch: string[],
  maxRetries = 5
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await statusService.updateFeeds(status, batch);
      return;
    } catch (err: any) {
      if (err.name === "ProvisionedThroughputExceededException") {
        const backoff = Math.pow(2, attempt) * 100 + Math.random() * 100;
        console.log(
          `Throttled. Retry #${attempt + 1} in ${backoff.toFixed(0)}ms`
        );
        await delay(backoff);
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries reached for updateFeeds");
}
