async function revertToSnapshot(snapshotId) {
	const result = await network.provider.send("evm_revert", [snapshotId]);
	console.log("Reverted to snapshot:", result);
  }
  
    
//   const snapshotId = process.argv[7]; 
//   if (!snapshotId) {
// 	console.error("Please provide a snapshot ID");
// 	process.exit(1);
//   }
// revertToSnapshot(snapshotId).then(() => process.exit(0)).catch(error => {

  revertToSnapshot("0x2").then(() => process.exit(0)).catch(error => {
	console.error(error);
	process.exit(1);
  });
  