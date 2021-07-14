// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const paramsStoppedT2 = {
    Filters: [
        {
            
          Name:'instance-type',
            Values:[
                't2.micro'
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

// Call EC2 to retrieve instance description and find all 'stopped' T2.micros
ec2.describeInstances(paramsStoppedT2, function(err, data) {
  if (err) {
    console.error("Error", err.stack);
  } else {

    //data.Reservations.map((reservation) => {
        //reservation.Instances.map((instance) => {
            
            //console.log(instance.State.Name + " instance: " + instance.InstanceId + " is of type " + instance.InstanceType);
            //let instances = instance.InstanceId;
            let instance = data.Reservations[0].Instances[0].InstanceId;
            console.log(instance);

            let paramsStart = {
                InstanceIds: [instance]
              };
              ec2.startInstances(paramsStart, function(err, dataStart) {
                if (err) {
                  console.error("Error", err);
                } else if (dataStart) {
                  console.log("Success", dataStart.StartingInstances);
                }
         
        });

            //console.log(instances);

        }
        
    
    


});


