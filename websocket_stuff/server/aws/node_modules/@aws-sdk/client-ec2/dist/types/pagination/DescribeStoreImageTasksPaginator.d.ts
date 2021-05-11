import { DescribeStoreImageTasksCommandInput, DescribeStoreImageTasksCommandOutput } from "../commands/DescribeStoreImageTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeStoreImageTasks(config: EC2PaginationConfiguration, input: DescribeStoreImageTasksCommandInput, ...additionalArguments: any): Paginator<DescribeStoreImageTasksCommandOutput>;
