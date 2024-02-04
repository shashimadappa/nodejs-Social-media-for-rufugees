const db = require("../models");
const helpmycaseTbl = db.helpmycase;
const userTbl = db.users;

exports.createFunds = async (req, res) => {
  const {
    authorId,
    title,
    fundsNeeded,
    discription,
    tags,
    url,
    location,
    applicationDeadline,
    createdAt,
    updatedAt,
  } = req.body;

  if (!authorId || !title) {
    return res.status(400).json({
      message: " authorId or title  not found",
    });
  }
  //    const userId = req.id;
  try {
    // Create a new comment instance
    const fundsData = new helpmycaseTbl({
      authorId,
      title,
      discription,
      tags,
      location,
      url,
      fundsNeeded,
      applicationDeadline,
      createdAt,
      updatedAt,
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

    const posts = await helpmycaseTbl
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

exports.deleteCase = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.userId;
    const caase = await helpmycaseTbl.findOne({ _id: caseId, userId });

    if (!caase) {
      return res.status(404).json({ message: "case not found" });
    }
    const deletedCase = await helpmycaseTbl.findByIdAndRemove({_id : caseId});

    res.json({ message: "case deleted successfully", deletedPost: deletedCase });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
