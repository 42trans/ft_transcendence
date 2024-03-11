async function main() {
	const snapshotId = await network.provider.send("evm_snapshot");
	console.log("Snapshot ID:", snapshotId);
  }
  
  main().then(() => process.exit(0)).catch(error => {
	console.error(error);
	process.exit(1);
  });
  