import mongoose from "mongoose";

const pickupPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  children: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Children",
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  avtar: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model("PickupPerson", pickupPersonSchema);
