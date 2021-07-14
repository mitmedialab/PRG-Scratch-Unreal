import { __assign, __extends } from "tslib";
import { ClientDefaultValues as __ClientDefaultValues } from "./runtimeConfig";
import { resolveEndpointsConfig, resolveRegionConfig, } from "@aws-sdk/config-resolver";
import { getContentLengthPlugin } from "@aws-sdk/middleware-content-length";
import { getHostHeaderPlugin, resolveHostHeaderConfig, } from "@aws-sdk/middleware-host-header";
import { getLoggerPlugin } from "@aws-sdk/middleware-logger";
import { getRetryPlugin, resolveRetryConfig } from "@aws-sdk/middleware-retry";
import { getAwsAuthPlugin, resolveAwsAuthConfig, } from "@aws-sdk/middleware-signing";
import { getUserAgentPlugin, resolveUserAgentConfig, } from "@aws-sdk/middleware-user-agent";
import { Client as __Client, } from "@aws-sdk/smithy-client";
/**
 * <fullname>Amazon Elastic Compute Cloud</fullname>
 *          <p>Amazon Elastic Compute Cloud (Amazon EC2) provides secure and resizable computing capacity in the AWS Cloud.
 *           Using Amazon EC2 eliminates the need to invest in hardware up front, so you can develop and deploy applications
 *           faster. Amazon Virtual Private Cloud (Amazon VPC) enables you to provision a logically isolated section of the
 *           AWS Cloud where you can launch AWS resources in a virtual network that you've defined. Amazon Elastic Block Store
 *           (Amazon EBS) provides block level storage volumes for use with EC2 instances. EBS volumes are highly available
 *           and reliable storage volumes that can be attached to any running instance and used like a hard drive.</p>
 *          <p>To learn more, see the following resources:</p>
 *          <ul>
 *             <li>
 *                <p>Amazon EC2: <a href="http://aws.amazon.com/ec2">AmazonEC2 product page</a>, <a href="http://aws.amazon.com/documentation/ec2">Amazon EC2 documentation</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>Amazon EBS: <a href="http://aws.amazon.com/ebs">Amazon EBS product page</a>, <a href="http://aws.amazon.com/documentation/ebs">Amazon EBS documentation</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>Amazon VPC: <a href="http://aws.amazon.com/vpc">Amazon VPC product page</a>, <a href="http://aws.amazon.com/documentation/vpc">Amazon VPC documentation</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>AWS VPN: <a href="http://aws.amazon.com/vpn">AWS VPN product page</a>, <a href="http://aws.amazon.com/documentation/vpn">AWS VPN documentation</a>
 *                </p>
 *             </li>
 *          </ul>
 */
var EC2Client = /** @class */ (function (_super) {
    __extends(EC2Client, _super);
    function EC2Client(configuration) {
        var _this = this;
        var _config_0 = __assign(__assign({}, __ClientDefaultValues), configuration);
        var _config_1 = resolveRegionConfig(_config_0);
        var _config_2 = resolveEndpointsConfig(_config_1);
        var _config_3 = resolveRetryConfig(_config_2);
        var _config_4 = resolveHostHeaderConfig(_config_3);
        var _config_5 = resolveAwsAuthConfig(_config_4);
        var _config_6 = resolveUserAgentConfig(_config_5);
        _this = _super.call(this, _config_6) || this;
        _this.config = _config_6;
        _this.middlewareStack.use(getRetryPlugin(_this.config));
        _this.middlewareStack.use(getContentLengthPlugin(_this.config));
        _this.middlewareStack.use(getHostHeaderPlugin(_this.config));
        _this.middlewareStack.use(getLoggerPlugin(_this.config));
        _this.middlewareStack.use(getAwsAuthPlugin(_this.config));
        _this.middlewareStack.use(getUserAgentPlugin(_this.config));
        return _this;
    }
    /**
     * Destroy underlying resources, like sockets. It's usually not necessary to do this.
     * However in Node.js, it's best to explicitly shut down the client's agent when it is no longer needed.
     * Otherwise, sockets might stay open for quite a long time before the server terminates them.
     */
    EC2Client.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return EC2Client;
}(__Client));
export { EC2Client };
//# sourceMappingURL=EC2Client.js.map