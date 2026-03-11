import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import TakeOver from '../models/TakeOver.js';

/*
 Migration: Populate TakeOver collection for legacy loans/customers
 Logic mirrors cron job in routes/takeover.router.js
 Criteria: Any loan whose emiStartDate is >= 12 months old (lte twelveMonthsAgo)
 Avoid duplicates: do not create TakeOver if one already exists for the customer _id
 Also set customer.completed.takeOverList = "true" (string) if not already set
 Safe, idempotent: multiple runs won't duplicate or throw if partial data exists
 */

dotenv.config();

const BATCH_SIZE = 200; // tune for memory/throughput

async function connect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set in environment');
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: false,
  });
  console.log('Connected to MongoDB');
}

function getTwelveMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  return d;
}

async function migrate() {
  const cutoff = getTwelveMonthsAgo();
  console.log('Cutoff (emiStartDate <=):', cutoff.toISOString());

  // Stream / paginate loans to avoid loading all at once
  let processed = 0;
  let created = 0;
  let updatedCustomers = 0;

  const query = { emiStartDate: { $lte: cutoff } };
  const total = await Loan.countDocuments(query);
  console.log(`Total legacy loans to inspect: ${total}`);

  // Paginate using skip/limit; for very large sets consider a cursor on _id
  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const loans = await Loan.find(query)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(BATCH_SIZE)
      .populate('customer');

    for (const loan of loans) {
      processed++;
      if (!loan.customer) continue;

      const customer = loan.customer;
      const existing = await TakeOver.findOne({ _id: customer._id });
      if (!existing) {
        try {
          await TakeOver.create({
            _id: customer._id, // keep same id pattern as service logic
            index: customer.index,
            general: {
              name: customer.general?.name,
              phoneNo: customer.general?.phoneNo,
            },
            emiStartDate: loan.emiStartDate,
            emiEndDate: loan.emiEndDate,
          });
          created++;
        } catch (err) {
          console.error('Failed creating TakeOver for customer', customer._id, err.message);
        }
      }

      // Update customer.completed.takeOverList
      try {
        let dirty = false;
        if (!customer.completed) {
          customer.completed = {};
          dirty = true;
        }
        if (customer.completed.takeOverList !== 'true') {
          customer.completed.takeOverList = 'true';
          dirty = true;
        }
        if (dirty) {
          await customer.save();
          updatedCustomers++;
        }
      } catch (e) {
        console.error('Failed updating customer completion flag', customer._id, e.message);
      }
    }

    console.log(`Progress: ${Math.min(skip + BATCH_SIZE, total)}/${total} processed. TakeOvers created: ${created}. Customers updated: ${updatedCustomers}`);
  }

  console.log('Migration complete');
  console.log({ processed, created, updatedCustomers });
}

async function main() {
  const start = Date.now();
  try {
    await connect();
    await migrate();
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    const ms = Date.now() - start;
    console.log(`Disconnected. Total time ${(ms/1000).toFixed(1)}s`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
