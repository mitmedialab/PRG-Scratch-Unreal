This is the cirrus.js and player.htm that allow aws instances to connect to various websocket services. 

player.htm connects to playerServer in cirrus.js when the instance boots up. 

External connections from Scratch or Google Colab Notebook connect to cirrus.js once the instance spins up and returns its public ip address to use for websocket connections.

cirrus.js tracks connected users to the websocket and when a player disconnects for any reason, the instance will self-stop.

aws-sdk and aws-instance-metadata need to be npm installed using the --save switch when cirrus.js and player.htm are copied over the original versions.

The scripts folder holds lots of scripts that make controlling huge numbers of aws ec2 instances much easier. Much of the Lambda function code for waking a stopped instance or the code in cirrus.js to stop and instance are based on these scripts.

Scripts require a key pair in ~/.aws or Windows user's home directory. The keys cannot be stored in a public repo for security purposes. Contact me if you need them.

Lambda functions and cirrus.js do NOT need keys stored locally, as they use IAM Roles for authentication.
