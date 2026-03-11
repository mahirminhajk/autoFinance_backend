import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer.js';
import { DispDateService } from '../service/dispDateService.js';

/*
 Migration: Backfill DispDate collection for legacy customers
 Logic source: controllers/customerFormC.updateCustomerLoanDesp
 - For every customer with loanDesp.despAmount > 0
 - Determine dispDate: use loanDesp.dispDate if present; otherwise fall back to customer.updatedAt
 - Upsert DispDate document with id = customer._id
 - Fields: general { name, phoneNo }, day, amount
 Idempotent: uses service layer which updates existing or creates new
 Safe for production: streams through customers, logs progress, handles errors, avoids duplicates
*/

dotenv.config();

const PROGRESS_INTERVAL = 200; // log every N processed

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in environment');
  await mongoose.connect(uri, { autoIndex: false });
  console.log('Connected to MongoDB');
}

function toValidDate(value, fallback) {
  const d = value ? new Date(value) : null;
  return d && !isNaN(d.getTime()) ? d : new Date(fallback || Date.now());
}

async function migrate() {
  const query = { 'loanDesp.despAmount': { $gt: 0 } };

  const total = await Customer.countDocuments(query);
  console.log(`Customers with despAmount > 0: ${total}`);

  let processed = 0;
  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  const cursor = Customer.find(query).sort({ _id: 1 }).cursor();

  for await (const cus of cursor) {
    processed++;
    try {
      const amount = Number(cus.loanDesp?.despAmount || 0);
      if (!amount || amount <= 0) {
        skipped++;
        continue;
      }

      // Prefer explicit dispDate; fallback to customer.updatedAt
      const rawDispDate = cus.loanDesp?.dispDate;
      const day = toValidDate(rawDispDate, cus.updatedAt);

      const general = {
        name: cus.general?.name || '',
        phoneNo: cus.general?.phoneNo || '',
      };

      await DispDateService.createDispDate({
        _id: cus._id,
        general,
        day,
        amount,
      });
      upserted++;
    } catch (err) {
      errors++;
      console.error(`Failed processing customer ${cus._id}:`, err.message);
    }

    if (processed % PROGRESS_INTERVAL === 0) {
      console.log(`Progress: ${processed}/${total} | upserted: ${upserted}, skipped: ${skipped}, errors: ${errors}`);
    }
  }

  console.log('Migration complete');
  console.log({ processed, upserted, skipped, errors });
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
    console.log(`Disconnected. Total time ${(ms / 1000).toFixed(1)}s`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
