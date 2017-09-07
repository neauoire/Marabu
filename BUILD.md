## Build

Don't forget to ```npm cache clean```!

### Build Linux64 / Darwin64 / Windows64(Offsite)

```
cd /xxiivv/Nataniev/public/public.projects/sources/Marabu/

git pull

rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-linux-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/marabu_lin64.zip
electron-packager . Marabu --platform=linux --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-win32-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/marabu_win64.zip
electron-packager . Marabu --platform=win32 --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-darwin-x64/
rm /xxiivv/Nataniev/public/public.projects/builds/marabu_osx64.zip
electron-packager . Marabu --platform=darwin --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /xxiivv/Nataniev/public/public.projects/builds/

~/butler push /xxiivv/Nataniev/public/public.projects/builds/Marabu-linux-x64/ hundredrabbits/marabu:linux-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Marabu-win32-x64/ hundredrabbits/marabu:windows-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Marabu-darwin-x64/ hundredrabbits/marabu:osx-64

rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-darwin-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-linux-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Marabu-win32-x64/

~/butler status hundredrabbits/marabu
```

### Build Linux64 / Darwin64 / Windows64(Local)
```
cd /Users/VillaMoirai/Desktop/
rm -r /Users/VillaMoirai/Desktop/Marabu-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Marabu-linux-x64/ 
rm -r /Users/VillaMoirai/Desktop/Marabu-win32-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Marabu/
electron-packager . Marabu --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Marabu/
electron-packager . Marabu --platform=linux --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico

cd /Users/VillaMoirai/Github/HundredRabbits/Marabu/
electron-packager . Marabu --platform=win32 --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico
```
