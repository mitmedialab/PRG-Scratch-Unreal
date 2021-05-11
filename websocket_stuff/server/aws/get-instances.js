// Import required AWS SDK clients and commands for Node.js
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

// Set the AWS region
const REGION = "us-east-1"; 
// Create EC2 service object
const ec2client = new EC2Client({ region: REGION });

const run = async () => {
  try {
    const data = await ec2client.send(new DescribeInstancesCommand({}));
    console.log("Success", JSON.stringify(data));
   
  } catch (err) {
    console.log("Error", err);
  }
};
run();
