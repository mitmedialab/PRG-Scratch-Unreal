//sleep timer to let instance spin up
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const AWS = require('aws-sdk');
const route53 = new AWS.Route53();


function encodeIPtoName(ipaddress) {
    let name = '';
    if (ipaddress) {
        name = String(ipaddress);
        name = name.replace(/[.]/g, '-');
        name = `drone-${name}.mitlivinglab.org.`;
    }
    return name;
}

function addDNS(ipaddressToName) {
    return new Promise( (resolve) => {
        // AWS SDK methods don't return promises, but AWS requests have a
        // `promise()` function. See:
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#promise-property
        let name = encodeIPtoName(ipaddressToName); 
        
        let request = route53.changeResourceRecordSets({
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
        });
        let resultP = request.promise();
        resultP.then( (result) => {
            console.log(result);
            resolve();
        });
    });
}


exports.handler = function(event, context, callback)  { 
    
    //console.log("Ok,here we go...");
    //console.log('Can I see this too?');//yes
    
    // Load the AWS SDK for Node.js
    const AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-2'});
    
    // Create EC2 service object
    const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
    //console.log(ec2);//yes, this get filled.
    let response;
    const paramsStoppedG4 = {
        Filters: [
            {
                
                Name:'instance-type',
                Values:[
                    'g4dn.xlarge'
                ],
            },
            {
                Name:'instance-state-name',
                Values:[
                    'stopped'
                ],
            }
        ]
    };
    
    
    ec2.describeInstances(paramsStoppedG4, function(err, data) {
        if (err) {
            console.error("Error", err.stack);
        } else {
            //console.log(data);
            //Grab the first available stopped g4dn.xlarge and spin it up
            let instance = data.Reservations[0].Instances[0].InstanceId;
            //console.log("Your single InstanceId is: " + instance);
            let paramsStart = {
                InstanceIds: [instance]
            };
            ec2.startInstances(paramsStart, function(err, dataStart) {
                if (err) {
                    console.error("Error", err);
                } else if (dataStart) {
                    //console.log("Success", dataStart.StartingInstances);
                    //console.log("An Unreal Engine Pixel Streaming instance is waking up. Please stand by for 30 seconds...");
                    //sleep for 30 seconds to allow instance to pick up an ipaddress and start receiving websocket connections
                    sleep(15000).then(() => {
                        ec2.describeInstances(paramsStart,function(err, dataIPRead){
                            if (err) {
                                console.error("Error", err);
                            } else if (dataIPRead) {
                                let instanceIPAddress = dataIPRead.Reservations[0].Instances[0].PublicIpAddress;
                                
                                console.log("Your instance's Public IP address is: " + instanceIPAddress);

                                console.log("adding DNS name...");
                                addDNS(instanceIPAddress).then( () => {
                                    console.log("DNS name added");
                                    response = {
                                        isBase64Encoded:false,
                                        statusCode:200,
                                        body:JSON.stringify(instanceIPAddress),
                                        headers: {"content-type": "application/json"
                                                 }
                                    };
                                    console.log('response should be: ' + response.body);
                                    callback(null, response);
                                });
                            }
                        });
                    });
                }
            });
        }
    });
};