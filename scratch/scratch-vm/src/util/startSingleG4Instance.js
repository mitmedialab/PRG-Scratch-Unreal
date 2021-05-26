'use strict';

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

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

// Call EC2 to retrieve instance description and find all 'stopped' g4dn.xlarges
async function startSingleG4Instance() {
    return new Promise( (resolve, reject) => {
        ec2.describeInstances(paramsStoppedG4, function(err, data) {
            if (err) {
                reject(err);
            } else {
                //Grab the first available stopped g4dn.xlarge and spin it up
                let instance = data.Reservations[0].Instances[0].InstanceId;
                console.log("Your single InstanceId is: " + instance);

                let paramsStart = {
                    InstanceIds: [instance]
                };

                ec2.startInstances(paramsStart, function(err, dataStart) {
                    if (err) {
                        reject(err);
                    } else if (dataStart) {
                        resolve(dataStart);
                    }
                });
            }
        });
    });
}


async function main() {
    try {
        let dataStart = await startSingleG4Instance();//await 
        console.log("Success", dataStart.StartingInstances);
    } catch(err) {
        console.error("Error", err);
    }
}
        

// run things if we were called directly on the command line
if (require.main === module) {
    main();
}
    

module.exports.startSingleG4Instance = startSingleG4Instance;

