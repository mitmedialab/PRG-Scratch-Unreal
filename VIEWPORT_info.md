# Potential Methods for Implementing Viewport

## Method 1
Javascript has a built in function called **window.open()**
[learn more](https://www.w3schools.com/jsref/met_win_open.asp)


This method seemed promising because you can scale the window to any size you want and you can place it anywhere on the screen. However, it works in the same way as if you had a second smaller window open on top of your main browser window. This means that if you click anywhere outside of the new winow, then it will get hidden behind your main browser window. This is unideal because we want the users to be able to interact with scratch in their main browser window and not have the smaller viewport window hide everytime they click elsewhere. *There may be a fix for this by using the 'focus' parameter, but I was not able to get it to work.*


It is also unfortunately a bit outdated and some browsers are removing compatibility for this method as it can easily be abused to create pop up ads in malicious sites.


You can mess around with this method [here](https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_win_open) so that you understand how it works. 


## Method 2
This second method uses a library for JavaScript called Jquery. It seems to be fairly common and well known, I was just running into the issue of importing it into our scratch project. It seems that JavaScript does not have an import() method built in so there has to be another way of importing Jquery into our project. A bit of time on google is most likely all it takes to get over this uncertainty. One method that works 100% for importing Jquery is to simply just copy the code from the Jquery file into our `index.js` file for our scratch blocks. However, that would make the file pretty long and harder to read.

After Jquery has been imported correctly, we need to add an additional extension so that we can open up our viewport.
I found this [extension](http://swip.codylindley.com/DOMWindowDemo.html#inlineContentExample7) that seems like it could be pretty useful. Refer to examples 5 and 6.

This extension seems like it could be useful for creating windows that stay regardless of where you click. My only concern is that they may rely on JavaScript running inside of an HTML file. For our scratch blocks, I wasn not able to find an HTML file that we could modify so I am unsure if this could still work if we were to add this code to our `index.js` file.

## Method 3
It is possible that there are other extensions out there that can provide the functionality we seek, however, when looking for methods of implementing our Viewport I tried to stay as close as possible to vanilla JavaScript in order to not mess with the scratch-vm code too much. However, our project may require that we use extensions.

Here is some more [information](https://stackoverflow.com/questions/13965584/how-to-make-child-window-stay-on-top) I found 