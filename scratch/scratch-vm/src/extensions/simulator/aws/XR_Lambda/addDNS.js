const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2'
});

const route53 = new AWS.Route53();

testip = '3.135.237.121';
addDNS(testip);//.catch(err => console.log(err));

function encodeIPtoName(ipaddress) {
    let name = '';
    if (ipaddress) {
        name = String(ipaddress);
        name = name.replace(/[.]/g, '-');
        name = `drone-${name}.mitlivinglab.org.`;
    }
    return name;
}

async function addDNS(ipaddressToName) {
  // AWS SDK methods don't return promises, but AWS requests have a
  // `promise()` function. See:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#promise-property
let name = encodeIPtoName(ipaddressToName); 

const res = await route53.changeResourceRecordSets({
    HostedZoneId: '/hostedzone/Z19FUTJWRLDEB0',
    ChangeBatch: {
      Changes: [{ 
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: name,
          Type: 'A',
          TTL: 60 * 5, // 5 minutes
          ResourceRecords: [{ Value: ipaddressToName }]
        }
      }]
    }
  }).promise();
  console.log(res);
}