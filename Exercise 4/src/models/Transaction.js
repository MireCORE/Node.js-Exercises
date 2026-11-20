import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required.'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    // Income waa positive; expense waa negative.
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      validate: {
        validator(value) {
          if (this.type === 'income') return value > 0;
          if (this.type === 'expense') return value < 0;
          return false;
        },
        message: 'Income amount must be positive and expense amount must be negative.'
      }
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense']
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
