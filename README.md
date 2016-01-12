# [WIP]LMRemote-Server

**Work in Progress**
## Used Projects

- This Project use Hyperion as a base Comminication Bridge. (https://github.com/tvdzwan/hyperion)
- SunCalc is used to Calculate Sunrise and Darkness (https://github.com/mourner/suncalc)

## Easy Install

### Requiremenst

- Raspberry PI (all Versions)
- Internet Connection (Wifi)
- LED - Stips (WS2801 etc..)

### How TO
1. Download the img File
2. write the Image File to your SD-Card
3. Boot your PI with a Wired Network Connection
4. Get the IP for your PI
5. Connect via SSH (User: root, Password: licht)
6. Go to the config files /etc/lmremote.conf -> Set the Number of used LEDs
7. Create a hyperion conf file to /etc/hyperion.conf.json
8. Edit the Network Config File /etc..
9. Reboot



---
## Advanced Install

### Requiremenst

- LINUX Based System (Debian,Ubuntu,etc.)
- Installted and Running Hyperion
- LED - Stips (WS2801 etc..)
- Internet Connection (Wifi)
