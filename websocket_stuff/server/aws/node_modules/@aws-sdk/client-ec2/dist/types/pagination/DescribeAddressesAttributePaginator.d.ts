import { DescribeAddressesAttributeCommandInput, DescribeAddressesAttributeCommandOutput } from "../commands/DescribeAddressesAttributeCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateDescribeAddressesAttribute(config: EC2PaginationConfiguration, input: DescribeAddressesAttributeCommandInput, ...additionalArguments: any): Paginator<DescribeAddressesAttributeCommandOutput>;
