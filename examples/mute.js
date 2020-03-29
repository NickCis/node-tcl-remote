const { Device, Remote } = require('../dist');

async function main() {
  // This is the location returned from the Finder
  const location = 'http://192.168.1.104:52368/mstar';

  // Create a Device Object to get information about the device
  const device = new Device(location);
  const props = await device.fetch();

  console.log(props);

  // Should probably use a better regex to match the ip
  const match = location.match(/(\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?)/);

  if (match) {
    // Create a remote instance
    const remote = new Remote(match[1]);

    //Press the mute key
    // More Keys can be found in src/Remote.ts
    await remote.press('TR_KEY_MUTE');

    remote.close();
  }
}

main();
