import { DescribeReplaceRootVolumeTasksCommandInput, DescribeReplaceRootVolumeTasksCommandOutput } from "../commands/DescribeReplaceRootVolumeTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeReplaceRootVolumeTasks(config: EC2PaginationConfiguration, input: DescribeReplaceRootVolumeTasksCommandInput, ...additionalArguments: any): Paginator<DescribeReplaceRootVolumeTasksCommandOutput>;
