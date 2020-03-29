# TCL Remote

The idea of this proyect is to provide a node interface for interacting with the TCL remote control protocol.

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Install

```
# yarn
yarn add tcl-remote

# node
node install --save tcl-remote
```

## Examples

```ts
import { Finder, Device, Remote } from 'tcl-remote';
import { Keys } from 'tcl-remote/Remote';

async function main(): void {
  const finder = new Finder();

  // Find the first possible location of a TCL tv
  const location = await finder.find();
  await finder.close();

  console.log('location', location);

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
    await remote.press(Keys.Mute);

    remote.close();
  }
}

main();
```

See [Examples](./examples)

## Related projects

- http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf
- https://github.com/Zigazou/opentclremote/blob/master/opentclremote
- https://github.com/Charykun/SymconTCLRemote
- https://github.com/popeen/WebRemote-TCL-S69/blob/master/index.php

