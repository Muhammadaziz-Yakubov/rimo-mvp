const mongoose = require('mongoose');

async function check() {
  const uri = "mongodb://localhost:27017/soliqly";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  const TransactionSchema = new mongoose.Schema({}, { strict: false, collection: 'transactions' });
  const Transaction = mongoose.model('Transaction', TransactionSchema);

  const transactions = await Transaction.find({}).lean();
  console.log(`Total transactions in DB: ${transactions.length}`);

  if (transactions.length > 0) {
    console.log("--- Sample Transactions (first 5) ---");
    transactions.slice(0, 5).forEach((t, i) => {
      console.log(`\n[#${i + 1}] ID: ${t._id}`);
      console.log(`  Type in DB: "${t.type}"`);
      console.log(`  Amount: ${t.amount}`);
      console.log(`  Description: "${t.description}"`);
      console.log("  RawData:", JSON.stringify(t.rawData));
    });

    const typeCounts = {};
    transactions.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });
    console.log("\nType counts in DB:", typeCounts);
  }

  await mongoose.connection.close();
}

check().catch(console.error);
