import moogoose from "mongoose";

const driverSchema = new moogoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    vehicleId: {
      type: String,
      required: true,
    },
    currentLocation: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        type: moogoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default moogoose.model("Driver", driverSchema);
