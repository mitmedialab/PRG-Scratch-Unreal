// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set proper region here
AWS.config.update({region: 'us-east-2'});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

// This is our saved Unreal Launch Template
const instanceParams = {
   
   LaunchTemplate: {
    LaunchTemplateId: 'lt-06e93387e7f17084e',// CHANGE ME EVERY TIME YOU HAVE A NEW LAUNCH TEMPLATE
    Version: '1'},
   MinCount: 3, //This should likely be an argument from the command 
   MaxCount: 3// Not sure what happens if these aren't the same. Put the number of instances you want to create here. 
};

// Create a promise on an EC2 service object
var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();

// Handle promise's fulfilled/rejected states
instancePromise.then(
  function(data) {
    console.log(data);
    var instanceId = data.Instances[0].InstanceId;
    console.log("Created instance", instanceId);
    // Add tags to the instance
    tagParams = {Resources: [instanceId], Tags: [
       {
          Key: 'Name',
          Value: 'scratch-XR-Candidate-02'//Update this to something meaningful or useful everytime you create a new Launch Template.
       }
    ]};
    // Create a promise on an EC2 service object
    var tagPromise = new AWS.EC2({apiVersion: '2016-11-15'}).createTags(tagParams).promise();
    // Handle promise's fulfilled/rejected states
    tagPromise.then(
      function(data) {
        console.log("Instance tagged");
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
