const db = require("../models");
const fundsTbl = db.funds;

exports.createFunds = async (req, res) => {
    const { authorId,title, category , discription, tags, url, location, applicationDeadline } = req.body;
  
    if (!authorId || !title) {
      return res.status(400).json({
        message: " authorId, content or postId not found",
      });
    };
  //    const userId = req.id;
    try {
      // Create a new comment instance
      const fundsData = new fundsTbl({
        authorId, title, category, discription, tags, url, location, applicationDeadline
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
      // Pagination logic: Get 10 posts at a time
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      const posts = await fundsTbl.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};
  