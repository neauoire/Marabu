1) Get NPM
Follow these instructions to get npm to run on your machine
https://docs.npmjs.com/getting-started/installing-node
 Those instructions will walk you through downloading node.
Then, you need to install it on your machine.  (e.g. doubleclick on node-*.pkg)

2) Build it
You need to compile it. To do that, you  change into the project directory using Terminal.
At the MacOSX command prompt, first type 'cd' then a space
Then, drag the project folder from Finder to the space after cd.
The command line will automatically type in the project directory.
So it will read something like this:
cd /Users/username/Downloads/Marabu-master

Now, you type the following to get the packages that the project needs to run:
npm install

After npm has found all the dependent libraries, (which might take some time, you'll see
a progress bar on the bottom) , you then type:

npm start 

A new window will pop up and then you should be able to use it.
