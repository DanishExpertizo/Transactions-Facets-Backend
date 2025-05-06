import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

export const transferMoney = async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  //Purpose: Starts a new session. All operations in a transaction must be tied to this session.
  //If omitted: You can't start a transaction or associate operations with it — MongoDB won't know what you're trying to group.
  const session = await mongoose.startSession();

  //Purpose: Begins the transaction context. From now on, all operations using this session will be treated as a single atomic unit.
  //If omitted: Your operations will run outside any transaction — no atomicity, no rollback support.
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error('User not found');
    if (sender.balance < amount) throw new Error('Insufficient balance');

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save({ session });
    await receiver.save({ session });

    await Transaction.create([{ senderId, receiverId, amount }], { session });

    //Purpose: Commits (saves) all operations done in the transaction to the database.
    //If omitted: The changes made in the transaction are not persisted. The session remains open and pending.
    await session.commitTransaction();

    res.status(200).json({ message: 'Transfer successful' });
  } catch (err) {

    //Purpose: Aborts (rolls back) all changes made in the transaction if an error occurs.
    //If omitted: In case of errors, your session hangs or might eventually time out. The DB remains in an inconsistent state if commit fails and rollback is not handled.
    await session.abortTransaction();

    next(err);
  } finally {

    //Purpose: Closes the session and releases resources.
    //If omitted: Resources on the server are not freed, which may cause memory leaks or session overflow over time.
    session.endSession();

  }
};