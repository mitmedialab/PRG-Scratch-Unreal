// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
ec2.describeInstances(paramsStoppedG4, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {

            //Grab the first available stopped g4dn.xlarge and spin it up
            let instance = data.Reservations[0].Instances[0].InstanceId;
            //sleep(2000).then(() => { console.log("Waiting for 3 seconds"); });
            console.log("Your single InstanceId is: " + instance);
            
            let paramsStart = {
                InstanceIds: [instance]
              };
              ec2.startInstances(paramsStart, function(err, dataStart) {
                if (err) {
                  console.error("Error", err);
                } else if (dataStart) {
                    console.log("Success", dataStart.StartingInstances);
                    sleep(5000).then(() => {
                    ec2.describeInstances(paramsStart,function(err, dataIPRead){
                        if (err) {
                          console.error("Error", err);
                        } else if (dataIPRead) {
                            let instanceIPAddress = dataIPRead.Reservations[0].Instances[0].PublicIpAddress;
                            console.log("Your single InstanceId is still: " + instance);
                            console.log("Your instance's Public IP adress is: " + instanceIPAddress);
                        }
                        });
                    });
                    }
                
         
              });

            }
        
    });


