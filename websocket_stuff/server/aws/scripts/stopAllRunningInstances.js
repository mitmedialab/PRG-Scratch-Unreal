// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const params = {
    Filters: [
        {
            Name:'instance-state-name',
            Values:[
                'running'
                ]
        }
    ]
};

// Call EC2 to retrieve instance description
ec2.describeInstances(params, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {
    //console.log("Success", JSON.stringify(data));
    //Lots of info
    data.Reservations.map((reservation) => {
        reservation.Instances.map((instance) => {
            //console.log(instance.PublicIpAddress);
            console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType + " with ip address: " + instance.PublicIpAddress);
            let instances = instance.InstanceId;
            
            let paramsStop = {
                InstanceIds: [instances]
              };
              ec2.stopInstances(paramsStop, function(err, dataStop) {
                if (err) {
                  console.error("Error", err);
                } else if (dataStop) {
                  console.log("Success", dataStop.StoppingInstances);
                }
         
        });

            //console.log(instances);

        })
        
    })
    
}

});


