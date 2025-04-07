import { StatusDto } from "tweeter-shared";

export interface StatusDao {
  createStatus(alias: string, status: StatusDto): Promise<void>;
  batchCreateStatus(alias: string, statuses: StatusDto[]): Promise<void>;
  batchDeleteStatus(
    delteItems: {
      alias: string;
      timestamp: number;
    }[]
  ): Promise<void>;
  getStatuses(
    alias: string,
    pageSize: number,
    lastTimeStamp: number | undefined
  ): Promise<{
    statuses: StatusDto[];
    hasMore: boolean;
    lastTimestamp: number | undefined;
  }>;
}
