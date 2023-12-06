const db = require("../models");
const userModel = require("../models/user.model");
const fundsTbl = db.funds;
const userTbl = db.users

exports.createFunds = async (req, res) => {
    const { authorId,title, category , discription, tags, url, location, applicationDeadline, createdAt } = req.body;
  
    if (!authorId || !title) {
      return res.status(400).json({
        message: " authorId, content or postId not found",
      });
    };
  //    const userId = req.id;
    try {
      // Create a new comment instance
      const fundsData = new fundsTbl({
        authorId, title, category, discription, tags, url, location, applicationDeadline, createdAt
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

//   exports.findAll = async (req, res) => {
//     try {
//       // Pagination logic: Get 10 posts at a time
//       const page = parseInt(req.query.page) || 1;
//       const limit = 10;
//       const skip = (page - 1) * limit;
  
//       const posts = await fundsTbl.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
//       res.json(posts);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.findAll = async (req, res) => {
  try {
    // Updated pagination logic: Get posts based on URI parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await fundsTbl.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

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
    const sortedArray = finalArray.sort((a, b) => posts.findIndex(p => p._id.equals(a._id)) - posts.findIndex(p => p._id.equals(b._id)));

    res.json(sortedArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  