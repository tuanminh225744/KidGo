import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  seatCount: {
    type: Number,
    required: true,
  },
  hasChildSeat: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model("Vehicle", vehicleSchema);
