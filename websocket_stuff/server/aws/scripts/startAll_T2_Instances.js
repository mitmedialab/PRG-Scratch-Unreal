// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const paramsStoppedT2 = {
    Filters: [
        {
            Name:'instance-state-name',
            Values:[
                'stopped'
                ],
        
              },
        {
            Name:'instance-type',
            Values:[
                't2.micro'
                ]
        }
    ]
};

// Call EC2 to retrieve instance description
ec2.describeInstances(paramsStoppedT2, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {

    data.Reservations.map((reservation) => {
        reservation.Instances.map((instance) => {
            
            console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType + " with ip address: " + instance.PublicIpAddress);
            let instances = instance.InstanceId;
            
            let paramsStart = {
                InstanceIds: [instances]
              };
              ec2.startInstances(paramsStart, function(err, dataStart) {
                if (err) {
                  console.error("Error", err);
                } else if (dataStart) {
                  console.log("Success", dataStart.StartingInstances);
                }
         
        });

            //console.log(instances);

        })
        
    })
    
}

});


