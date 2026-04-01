import Parent from "../models/Parent";

const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id).populate(
      "children trustedDrivers",
    );
    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getParentProfile };
