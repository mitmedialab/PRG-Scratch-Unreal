# Scratch Block Extensions

## Intro 
Scratch extensions are how we managed to get our custom blocks to appear in Scratch.
[This is the article](https://medium.com/@hiroyuki.osaki/how-to-develop-your-own-block-for-scratch-3-0-1b5892026421) that I followed in order to create my own blocks. Follow the second method.

## Small but important detail
> It is important to note that you *need* icons. If you dont add an image then the blocks will not manifest themselves properly. If you look at index.js for the simulator extension, line 12 explains this.

```
const blockIconURI = "https://img.icons8.com/cotton/64/000000/visual-game-boy--v1.png";     // REQUIRED FOR BLOCK TO WORK. Doesnt show up otherwise
```
## Location of code
The **main code** for the simulator blocks is found in "scratch/scratch-vm/src/extensions/simulator/index.js"

> **Further documentation that goes in-depth for the blocks can be found in the folder mentioned above ^^^**

There are two other files that you have to update. The article will walk you through this:
1. scratch/scratch-vm/src/extension-support/extension-manager.js
2. scratch/scratch-gui/src/lib/libraries/extensions/index.jsx

## Useful Resources
[Here is another article](https://medium.com/@hiroyuki.osaki/scratch-3-block-types-you-can-develop-and-samples-191b0d769b91) that goes more into depth on the specifications for blocks and the different types that you can make. [This link](https://github.com/LLK/scratch-vm/blob/develop/docs/extensions.md) has some great information on block creation as well as an **excellent example** of a working extension that utilizes multiple different inputs (not just singular-input blocks) for you to understand how to customize your blocks a little more.

### Setting up the boilerplate to work with your changes
After you have implemented your changes to the Scratch extension, you have to run some commands for the changes to take effect.

1. cd into ``scratch-vm`` and run ``npm link``. 
2. Then cd into ``scratch-gui`` and run ``npm link scratch-vm``. The two folders should now be linked. 
3. You can then run ``npm start`` inside of scratch-gui and it should compile your changes as well as start up the localhost server. 

[This link](https://github.com/LLK/scratch-gui/wiki/Getting-Started) somewhat goes over the process.
