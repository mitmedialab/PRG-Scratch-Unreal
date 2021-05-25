'use strict';

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');
const StageLayering = require('../../engine/stage-layering');
//const startSingleG4Instance = require ('../../util/startSingleG4Instance');

const blockIconURI = "https://img.icons8.com/cotton/64/000000/visual-game-boy--v1.png";     // REQUIRED FOR BLOCK TO WORK. Doesnt show up otherwise


/*doStartStuff();
    
async function doStartStuff() {
    try {
        // ------------------ START SINGLE G4 INSTANCE -------------------------------------

        let dataStart = await startSingleG4Instance();
        console.log("Success", dataStart.StartingInstances);
        
        // ------------------ START UP WEBSOCKET CONNECTION --------------------------------
*/
        let ws = new WebSocket("ws://3.14.150.16");  //3.14.150.16 address can be changed depending on websocket and port you connect to

        ws.addEventListener("open", () => {
            console.log("we are connected (as brothers in the Universe!)");
        });

        ws.addEventListener("message", e => {   // if message is sent to us, logs it to console
            console.log(e.data);
            //alert(e.data);
        });
    /*} catch(err) {
        console.error("Error", err);
    }
}  */  


// ------------------- BEGIN CREATING BLOCKS ----------------------------------------
// more info on formatting can be found online
// https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421


class Scratch3SimulatorBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    
    getInfo () {
        return {
            id: 'simulator',
            name: formatMessage({
                id: 'simulator.categoryName',
                default: 'Simulator',
                description: 'Label for the Simulator Blocks'
            }),
            blockIconURI: blockIconURI,
            
            // block definitions begin here
            blocks: [
                {   // this block sends out an alert of whatever string the user types in
                    opcode: 'sendAlert',    // the function, sendAlert(), will execute when this block runs
                    text: formatMessage({
                        id: 'alertblock',
                        default: 'Send out Alert: [TEXT]',
                        description: 'testing block'
                        }),
                    blockType: BlockType.COMMAND,   // specifies that this block is a command block
                                                    // other types exist but we probably dont need them
                                                    // more info can be found online
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,  // specify that the argument for block is a string
                            defaultValue: 'message'
                              }       
                        }
                },
                
                {   // same block as above but with a drop-down menu
                    opcode: 'dropAlert',    
                    text: formatMessage({
                        id: 'menu_thing',
                        default: 'Drop Down Menu! [TEXT]',
                        description: 'testing menu'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "item 1",
                            menu: 'drop_down'
                        }
                    }
                },
                
                {   // block sends out a message to the websocket server
                    opcode: 'SendMsg',
                    text: formatMessage({
                        id: 'websocket msg',
                        default: 'Send message: [TEXT]',
                        description: 'for sending data through webBones'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to set poly vision
                    opcode: 'poly_vision',
                    text: formatMessage({
                        id: 'poly vision',
                        default: 'Select type of Vision: [TEXT]',
                        description: 'for picking binocular or monocular vision'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'scratch: binocular',
                            menu: 'poly_vision_drop'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to set color vision
                    opcode: 'color_vision',
                    text: formatMessage({
                        id: 'color vision',
                        default: 'Enable Color Vision: [TEXT]',
                        description: 'for turning on / off color vision'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "true",
                            menu: 'binary'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to set high acuity
                    opcode: 'high_acuity',
                    text: formatMessage({
                        id: 'high acuity',
                        default: 'Enable High Acuity: [TEXT]',
                        description: 'for turning on / off high acuity'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "true",
                            menu: 'binary'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to set scotopic vision
                    opcode: 'scotopic_vision',
                    text: formatMessage({
                        id: 'scotopic vision',
                        default: 'Enable Scotopic Vision: [TEXT]',
                        description: 'for turning on / off scotopic vision'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "true",
                            menu: 'binary'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to determine predator or prey
                    opcode: 'predator',
                    text: formatMessage({
                        id: 'predator',
                        default: 'Choose Predator or Prey: [TEXT]',
                        description: 'for picking between predator or prey agent class'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "true",
                            menu: 'agent_class'
                        }
                    }
                },
                {   // block sends out a message to the websocket server to determine agent name
                    opcode: 'agent_name',
                    text: formatMessage({
                        id: 'agent name',
                        default: 'Type in name of agent: [TEXT]',
                        description: 'allows creating names for agents'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "default_agent"
                        }
                    }
                },
                {   // DroneName
                    opcode: 'drone_name',
                    text: formatMessage({
                        id: 'drone name',
                        default: 'Type in name of drone: [TEXT]',
                        description: 'allows creating names for drone'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "None"
                        }
                    }
                },
                {   // DroneSpeed
                    opcode: 'drone_speed',
                    text: formatMessage({
                        id: 'drone speed',
                        default: 'Type in max speed of drone: [TEXT]',
                        description: 'allows creating speed for drone'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "0"
                        }
                    }
                },
                {   // DroneName
                    opcode: 'drone_color',
                    text: formatMessage({
                        id: 'drone color',
                        default: 'Select color of drone: [TEXT]',
                        description: 'allows creating color for drone'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "None",
                            menu: "color"
                        }
                    }
                },
                {   // DroneName
                    opcode: 'drone_rgb',
                    text: formatMessage({
                        id: 'drone rgb',
                        default: 'Select RGB color of drone: [TEXT]',
                        description: 'allows creating color for drone'
                        }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "None",
                        }
                    }
                }
            ],

            menus: {    //defining drop-down menus for blocks
                drop_down: {
                    acceptReporters: true,
                    items: [{ text: "testing 1", value: "you picked option 1"}, {text: "testing 2", value: "you picked option 2"}]
                },
                web_drop: {
                    acceptReporters: true,
                    items: [{ text: "do this", value: "ScratchTestIn"}, {text: "do that", value: "scratch: do that"}]
                },
                poly_vision_drop:{
                    acceptReporters: true,
                    items: [{ text: "Monocular", value: "scratch: monocular"}, {text: "Binocular", value: "scratch: binocular"}]
                },
                binary:{
                    acceptReporters:true,
                    items: [{text: 'On', value: "scratch: true"}, {text: "Off", value: "scratch: false"}]
                },
                agent_class:{
                    acceptReporters:true,
                    items: [{text: 'Predator', value: "scratch: agent_class: predator"}, {text: "Prey", value: "scratch: agent_class: prey"}]
                },
                color:{
                    acceptReporters:true,
                    items: [{text: 'Yellow', value: "Yellow"}, {text: "Red", value: "Red"}, {text: "Green", value: "Green"}, {text: "Blue", value: "Blue"}]
                }
            }
        };
    }

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
        msg = '{"scratch": "true", "UserInput": "' + msg + '"}';
        console.log(msg);
        ws.send(msg);
    }

    poly_vision(args){
        const msg = Cast.toString(args.TEXT);
        console.log('sending message: ' + msg);
        ws.send(msg);
    }

    color_vision(args){
        var msg = Cast.toString(args.TEXT);
        msg = "scratch: color_vision: " + msg;
        console.log('sending message: ' + msg);
        ws.send(msg);
    }

    high_acuity(args){
        var msg = Cast.toString(args.TEXT);
        msg = "scratch: high_acuity: " + msg;
        console.log('sending message: ' + msg);
        ws.send(msg);       
    }

    scotopic_vision(args){
        var msg = Cast.toString(args.TEXT);
        msg = "scratch: scotopic_vision: " + msg;
        console.log('sending message: ' + msg);
        ws.send(msg);    
    }

    predator(args){
        const msg = Cast.toString(args.TEXT);
        console.log("sending message: " + msg);
        ws.send(msg);
    }

    agent_name(args){
        const msg = "scratch: agent_name: " + Cast.toString(args.TEXT);
        console.log("sending message: " + msg);
        ws.send(msg);
    }

    drone_name(args){
        var msg = Cast.toString(args.TEXT);
        msg = 'scratch: DroneName-' + msg;  // REV7 AND REV8    
        // msg = '{"scratch": true, "UserInput": "' + msg + '"}';  // UNSURE JSON
        console.log("sending message: " + msg);
        ws.send(msg);
    }

    drone_speed(args){
        var msg = Cast.toString(args.TEXT);
        msg = 'scratch: DroneMaxSpeed-' + msg;
        console.log("sending message: " + msg);
        ws.send(msg);
    }

    drone_color(args){
        var msg = Cast.toString(args.TEXT);
        msg = 'scratch: DroneColor-' + msg;
        console.log("sending message: " + msg);
        ws.send(msg);
    }
    drone_rgb(args){
        var msg = Cast.toString(args.TEXT);
        msg = 'scratch: DroneColorRGB-' + msg;
        console.log("sending message: " + msg);
        ws.send(msg);
    }

}

module.exports = Scratch3SimulatorBlocks;
