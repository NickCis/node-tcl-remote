const { Finder } = require('../dist');

async function main() {
  // Create a Finder object
  const finder = new Finder();

  // Find the first possible location of a TCL tv
  const location = await finder.find();
  console.log('location', location);

  await finder.close();
}

main();
