const fs = require('fs');
const path = require('path');

async function revertToSnapshot() {
  const filePath = path.join(__dirname, 'snapshotId.txt');
  const snapshotId = fs.readFileSync(filePath, { encoding: 'utf8' }).trim();
  
  const result = await network.provider.send("evm_revert", [snapshotId]);
  console.log("Reverted to snapshot:", result);
}

revertToSnapshot().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
