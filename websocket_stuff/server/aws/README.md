How to install and scale AWS instances of Unreal with Pixel Streaming and Deploy as HTTPS: on Port 443.

Step 1: Whenever you have a new build of the Unreal executable:

    1. BEFORE you zip it up for deployment, replace cirrus.js, config.json, and player.htm in "C:\PixelStreamer\WindowsNoEditor\Engine\Source\Programs\PixelStreaming\WebServers\SignallingWebServer" with the custom versions from the "PRG-Scratch-Unreal/websocket_stuff/server/aws" directory.
    2. The automation scripts require the "aws-sdk" and "aws-instance-metadata" node.js modules to be installed. 
    3. From the directory in which cirrus.js resides, run "npm install --save aws-sdk"
    4. From the directory in which cirrus.js resides, run "npm install --save aws-instance-metadata"
    5. Copy the "C:\PixelStreamer\WindowsNoEditor\Engine\Source\Programs\PixelStreaming\WebServers\SignallingWebServer\certificates" folder to the directory in which cirrus.js resides. These certificates are from "Let's Encrypt" and are only good for 90 days. They MUST live on the machine in the "certificates" directory to enable this entire system to work over https: on port 443. (Jon/Parker should work on a way to have the instance request an updated certificate as it spins up so it's fresh and valid every time an instance spins up otherwise you'll need to install new certificates at the end of the 90 days and save off that instance as a NEW custom Amazon Machine Image (AMI) and create a new "Launch Template" from using that AMI. This will be a big pain in the butt.)
    6. You are now ready to follow the instuctions here:
        
        https://github.com/aws-samples/deploying-unreal-engine-pixel-streaming-server-on-ec2

        The Could Formation template and bootstrap script mentioned in these instructions are also in the repo under 'cloud_formation_tools'

    7. Once you have followed these directions, you should RDP into the running instance and make sure it has and does everything you need or want it to do. If there are any additional applications or services, or you didn't install the aws-sdk and metadata modules prior to zipping, you can do it here.
    8. If all is to your liking, save this instance as a custom AMI (Amazon Machine Image). A snapshot will be taken of the disk and stored for use the next time this AMI is chose. 
    9. Create a "Launch Template" the uses THIS AMI. A Launch Template will included security groups and IAM Roles.
    10. Use the security group that was created by the Cloud Formation Template in the original deployment of the first instance. It will usually have the name "DCV Security Group" or something. You can give it a meaningful name during the Cloud Formation step 
    11. YOU MUST ATTACH IAM Role "scratch-XR-Test-RootInstanceProfile-BUB77B4N63XQ" for the instance to be able to execute EC2 commands and make DNS entries in the Route 53 Hosted Zone of mitlivinglabs.org (which each instance becomes a member of via the Lambda function, thus allowing us to use a wildcard certificate from Let's Encrypt, which in turn allow us to use HTTP: and embed in secure pages like a Colab Notebook.)
    12. I highly suggest using a naming convention that keeps a VERSION NUMBER the same through each of these steps. So the AMI should have the same name and version number as the Launch Template etc. Make liberal use of the Tags, and use the "Name" tag to also show the version number. You can also do all sorts of clever things via the command line or Lambda function by searching for all machines with a certain "Name" tag, doing something to them, then changingn the tag, etc. 
    13. Once you have a Launch Template, create a few instance manually from the AWS console and test each one to make sure it's up and running and doing everything you need it to.
    14. Note the ARN (Amazon Resource Number) of the Launch Template and copy it into the 'createUnrealInstance.js' script at the indicated location.
    15. Use the 'createUnrealInstance.js' script to create as many instances as you need right now. They will be born in the "Running" state. Once they are all up and running, use the 'stopAllRunningUnrealInstances.js' to put them into the "Stopped" state, which means they are ready to be woken by the Lambda function and used by a user. 
    16. NOTE: The 'stopAllRunningUnrealInstances.js' script looks for all currently "running + g4dn.xlarge + NAME TAG" instances. So you can change the Name tag and grab only certain machines but not others. Again, make liberal use of tags. They are powerful and fun.

    At this point, everything is automatic and an instance should spin up, get entered into the DNS table, and the Unreal content should pop up streaming in the Notebook and you should be able to issue commands in the cells below it. Keyboard and Mouse commands work as epxpected in the interface. You may need to click in the embed window to make it active if you've clicked away for something else.


The order of operations is such:

When the simulation Scratch blocks OR the first cell of the colab notebook is run, a fetch command is called on an Amazon API Gateway. This Gateway is the trigger for the Lambda function that then finds all "Stopped" g4dn instances (you can add a tag if you'd like). It will grab the first instance in the list and spin it up into the "Running" state. The Lambda function will wait for 15 seconds to allow the instance to be assigned its public ip address, after which it will return the ip address as the body of a json response to scratch or the clab notebook who will then use that ip address to establish the websocket connections they need with the recently woken instance. The public ip address is also reformatted by the Lambda function as an "A" record and entered in the proper routing table. Scrath or the Colab notebook will also reformat the ip address it received into the fully qualified domain name and display it in the embed (this is not working in Scratch yet. Not sure if Scratch can do embeds?)

player.htm connects to playerServer in cirrus.js when the instance boots up. 

External connections from Scratch or Google Colab Notebook connect to cirrus.js once the instance spins up and returns its public ip address to use for websocket connections. The public ip address is then also used to create a DNS "A" record in the DNS table of the mitlivinglabs.org Hosted Zone. Eventually, you should register a domain for this project, get wildcard certificates, and update the Lambda function to point to it instead. We're sqautting on mitlivinglabs.org because we have access to it and control it.

cirrus.js tracks connected users to the websocket and when a player disconnects for any reason, the instance will self-stop. Note at this point the "A" record in the DNS table will NOT be deleted. This functionality can be added to the "onPlayerDisconnect" function in cirrus.js just BEFORE the function that instructs the instance to put itself into a 'Stopped' state. Until this functionality is written in, you can occasionally manually prune the DNS table. All DNS entries beginning with "drone-" an then the ipaddress seperated by dashes are the "A" records that can be deleted. But also, since we're using the "Upsert" command when we make the entry, if an "A" record already exists for an ip address, it'll just be updated, and you don't have to worry about manually pruning that often. You can change the name the A records get by changing the code in the Lambda function, if you want them to be named differently.


[Scripts]
The scripts folder holds lots of aws-sdk command line node.js scripts that make controlling huge numbers of aws ec2 instances much easier. Much of the Lambda function code for waking a stopped instance or the code in cirrus.js to stop and instance are based on these scripts.

Scripts run from your command line in a terminal require a key pair in ~/.aws or Windows user's home directory. The keys cannot be stored in a public repo for security purposes. Contact me if you need them or download the "XR" Key Pair from the PRGDEV Amazon Web Console.

Lambda functions and cirrus.js do NOT need keys stored locally, as they use IAM Roles for authentication.

TODO: 

1. Make an aws-sdk node.js script that occasianly prunes any dead "drone-*" A records in the DNS table.
2. Add function to onPlayerDisconnect in cirrus.js that deletes the DNS entry for the instance before it is put into a 'Stopped' state.
3. Alter the Cloud Formation Template to use the "CloudXR" version of the g4dn.xlarge with the latest Windows Server install.

