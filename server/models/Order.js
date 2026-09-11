import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  weight: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
});

const CustomerDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  doorNo: { type: String, required: true },
  street: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, default: 'Tamil Nadu' },
  pincode: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderDate: {
      type: String,
      required: true,
    },
    customerDetails: {
      type: CustomerDetailsSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [array => array.length > 0, 'Order must contain at least one item.'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'Online Payment',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
      index: true,
    },
    dispatchStatus: {
      type: String,
      enum: ['Pending', 'Dispatched'],
      default: 'Pending',
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Delivered'],
      default: 'Pending',
      index: true,
    },
    transactionId: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: String,
      default: '',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
