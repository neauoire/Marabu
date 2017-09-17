#!/bin/bash
cd ~/Github/HundredRabbits/Marabu/
electron-packager . Marabu --platform=darwin --arch=x64 --out ~/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns
mv -v ~/Desktop/Marabu-darwin-x64/Marabu.app /Applications/
rm -r ~/Desktop/Marabu-darwin-x64/
open -a "Marabu"