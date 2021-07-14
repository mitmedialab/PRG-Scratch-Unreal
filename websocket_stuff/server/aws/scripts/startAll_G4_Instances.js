// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const paramsStoppedG4 = {
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
                'g4dn.xlarge'
                ]
        	},
	{
            Name:'tag:Name',
            Values:[
                'scratch-XR-Test'
                ]
              }

    ]
};

// Call EC2 to retrieve instance description
ec2.describeInstances(paramsStoppedG4, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {

    data.Reservations.map((reservation) => {
        reservation.Instances.map((instance) => {
            
            console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType);
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


