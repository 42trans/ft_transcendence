const fs = require('fs');
const path = require('path');

async function main() {
  const snapshotId = await network.provider.send("evm_snapshot");
  console.log("Snapshot ID:", snapshotId);

  // スナップショットIDをファイルに保存
  const filePath = path.join(__dirname, 'snapshotId.txt');
  console.log("filePath:", filePath);
  fs.writeFileSync(filePath, snapshotId, { encoding: 'utf8' });
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
