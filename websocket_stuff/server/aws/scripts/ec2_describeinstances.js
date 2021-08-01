// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const paramsRunning = {
    Filters: [
        {
            Name:'instance-state-name',
            Values:[
                'running'
                ]
        }
    ]
};

// Call EC2 to retrieve policy for selected bucket
ec2.describeInstances(paramsRunning, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {
    //console.log("Success", JSON.stringify(data));
    //JUST THE IP ADDRESSES
    data.Reservations.map((reservation) => {
        reservation.Instances.map((instance) => {
            //console.log(instance.PublicIpAddress);
            console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType + " with ip address: " + instance.PublicIpAddress);
            //console.log("........................\n");
        })
    })
}
  
});

const paramsStopped = {
    Filters: [
        {
            Name:'instance-state-name',
            Values:[
                'stopped'
                ]
        }
    ]
};

ec2.describeInstances(paramsStopped, function(err, data) {
    if (err) {
      console.error("Error", err.stack);
    } else {
      //console.log("Success", JSON.stringify(data));
      //JUST THE IP ADDRESSES
      data.Reservations.map((reservation) => {
          reservation.Instances.map((instance) => {
              //console.log(instance.PublicIpAddress);
              console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType);
          })
      })
  }
    
  });
