const db = require("../models");
const userModel = require("../models/user.model");
const fundsTbl = db.funds;
const userTbl = db.users;

exports.createFunds = async (req, res) => {
  const {
    authorId,
    title,
    category,
    discription,
    tags,
    url,
    location,
    applicationDeadline,
    createdAt,
  } = req.body;

  if (!authorId || !title) {
    return res.status(400).json({
      message: " authorId, content or postId not found",
    });
  }
  //    const userId = req.id;
  try {
    // Create a new comment instance
    const fundsData = new fundsTbl({
      authorId,
      title,
      category,
      discription,
      tags,
      url,
      location,
      applicationDeadline,
      createdAt,
    });

    // Save the comment to the database
    const savedFunds = await fundsData.save();

    // Respond with the saved comment
    res.json(savedFunds);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    // Updated pagination logic: Get posts based on URI parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await fundsTbl
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const finalArray = await Promise.all(
      posts.map(async (post) => {
        const authorId = post.authorId;
        const userData = await userTbl.findOne({ _id: authorId });
        // Embed user data within each post object
        return {
          post,
          user: {
            _id: userData._id,
            username: userData.username,
            picture: userData.displayPicture.secure_url,
            occupation: userData.occupation,
            // Include other user fields as needed
            // Add more fields as needed
          },
        };
      })
    );

    // Sort the finalArray based on the original order of posts
    const sortedArray = finalArray.sort(
      (a, b) =>
        posts.findIndex((p) => p._id.equals(a._id)) -
        posts.findIndex((p) => p._id.equals(b._id))
    );

    res.json(sortedArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.deleteFunds = async (req, res) => {
  try {
    const fundsId = req.params.fundsId;
    const userId = req.userId;
    const funds = await fundsTbl.findOne({ _id: fundsId, userId });

    if (!funds) {
      return res.status(404).json({ message: "Post not found" });
    }
    const deletedfunds = await fundsTbl.findByIdAndRemove(fundsId);

    res.json({ message: "Funds deleted successfully", deletedPost: deletedfunds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateFunds = async (req, res) => {
  try {
    const fundsId = req.params.fundsId;
    const userId = req.userId;
    const updateData = req.body; 

    const funds = await fundsTbl.findOne({ _id: fundsId });

    if (!funds) {
      return res.status(404).json({ message: "funds not found" });
    }

    const updatedFunds = await fundsTbl.findByIdAndUpdate(fundsId, updateData, {
      new: true,
    });

    res.json({ message: "funds updated successfully", updatedFunds: updatedFunds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFundsById = async (req, res) => {
  try {
    const fundsId = req.params.fundsId;
    const userId = req.userId;
    const updateData = req.body; 

    const funds = await fundsTbl.findOne({ _id: fundsId });

    if (!funds) {
      return res.status(404).json({ message: "fundraising post not found" });
    }
const response = {
  api: 'getFundsById',
  data: funds
}
    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
