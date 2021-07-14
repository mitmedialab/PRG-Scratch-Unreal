    
    //sleep timer to let instance spin up
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
                              
                              //console.log("Your instance's Public IP address is: " + instanceIPAddress);
                                  response = {
                                  isBase64Encoded:false,
                                  statusCode:200,
                                  body:JSON.stringify(instanceIPAddress),
                                  headers: {"content-type": "application/json"
                                  }
                                 };
                              console.log('response should be: ' + response.body);
                              callback(null, response);
                              }
                          });
                      });
                  }
              });
          }
      });
   
     
  };
  