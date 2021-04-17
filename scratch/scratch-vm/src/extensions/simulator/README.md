# Simulator Blocks Extension

This is the main code for the Simulator blocks. Lets look at it, piece by piece. If you haven't already read [this article](https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421), you should. It goes over the format of the code and reasons as to why I did some things a certain way. [This other article](https://github.com/LLK/scratch-vm/blob/develop/docs/extensions.md) presents some of the same information and it is strongly suggested that you read it as well.

## Icon 
Line 12 adds the icon that appears next to each block from this extension. It is crucial that an icon is specified. Otherwise the code will not render properly

```
const blockIconURI = "https://img.icons8.com/cotton/64/000000/visual-game-boy--v1.png";     // REQUIRED FOR BLOCK TO WORK. Doesnt show up otherwise
```

## WebSocket Connection
These lines create a WebSocket connection to the Unreal Engine's `playerServer`. 

```
var ws = new WebSocket("ws://3.16.89.150");  // address can be changed depending on websocket and port you connect to

ws.addEventListener("open", () => {
    console.log("we are connected");
});

ws.addEventListener("message", e => {   // if message is sent to us, logs it to console
    console.log(e.data);
    //alert(e.data);
});
```

## Defining blocks

Starting from line 30, we begin preparing the code for our blocks. The format is the same as what is specified in the articles mentioned above.
At line 53, the blocks finally begin to be defined. Here is an example block:

```
// this block sends out an alert of whatever string the user types in
                {
                    opcode: 'sendAlert',    // the function, sendAlert(), will execute when this block runs
                    text: formatMessage({
                        id: 'alertblock',
                        default: 'Send out Alert: [BOOL]',
                        description: 'testing block'
                        }),
                    blockType: BlockType.COMMAND,   // specifies that this block is a command block
                                                    // other types exist but we probably dont need them
                                                    // more info can be found online
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,  // specify that the argument for block is a string
                            defaultValue: "item1"
                              }       
                        }
                },
```

### Creating and using drop-down menus

Some blocks are better with drop down menus instead of typed-in string inputs. In order to use a menu, we have to modify the `arguments` section of our block code.

```
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "item 1",
                            menu: 'menu1'   // ADD THIS LINE IN ORDER TO USE MENU
                        }
                    }
```
This is saying that we will be using the menu, `menu1`, for this block. All menus are drop down menus. To create menus, we implement the following code after the blocks section. More info for placement of the code can be found in the actual code for this extension:

```
//defining drop-down menus for blocks
menus: {
                menu1: {
                    acceptReporters: true,
                    items: [{ text: "testing 1", value: "you picked option 1"}, {text: "testing 2", value: "you picked option 2"}]
                }
        }
```

### opcode

These are the functions that are ran by blocks. Each block has to have its own function, even if two different blocks do the same thing.

These are definied after the `getInfo()` function that takes up most of the extension code.

```
// these are the functions that each block executes
    
    sendAlert(args) {
        const msg = Cast.toString(args.TEXT);
        alert(msg);
    }
    
    dropAlert(args){
        const msg = Cast.toString(args.TEXT);
        alert(msg);
    }
    
    
    SendMsg(args) {
        var msg = Cast.toString(args.TEXT);
        console.log('sending message: ' + msg);
        ws.send(msg);
    }

    poly_vision(args){
        const msg = Cast.toString(args.TEXT);
        console.log('sending message: ' + msg);
        ws.send(msg);
    }
    
...    
```

## Differences between JSON and non-JSON blocks
The JSON blocks structure their messages in different ways from the non-JSON blocks.

### Non-JSON
This is an example of a non-JSON block's opcode:

```
    drone_name(args){
        var msg = Cast.toString(args.TEXT);
        msg = 'scratch: DroneName-' + msg;  // for REV7, REV8, and REV10    
        console.log("sending message: " + msg);
        ws.send(msg);
    }
```
Here, the message that is sent over the WebSocket is "scratch: DroneName-input" where input is whatever the user typed into the block. The `playerServer` will splice the message and look for "scratch". If it finds "scratch" in the message, then it will run the code that has been set up for receiving Scratch messages. If it does not find "scratch" in the message, then it will not perform any further action regarding scratch commands. This system is set up so that the server can differentiate between scratch messages and other info that is coming in.

### Using JSON

This is an example of a JSON Block's opcode:
```
    drone_name(args){
        var msg = Cast.toString(args.TEXT);

        let out = {
            scratch: true,
            Name: msg         
                  };

        console.log("sending message: " + JSON.stringify(out));
        ws.send(JSON.stringify(out));
    }
```

Here, the user input is placed into a JSON object and then turned into a string, via `JSON.stringify()`. We have to turn the JSON object into a string in order to be able to send it across the WebSocket. `playerServer` will then run `JSON.parse()` in order to turn the string back into a JSON object. Then, it checks to see if `scratch == true` inside the JSON object. If so, then it will run the code that has been set up for receiving Scratch messages
