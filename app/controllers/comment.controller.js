const db = require("../models");
const commentTbl = db.comment;

exports.createComment = async (req, res) => {
  const { authorId, postId, comment, timestamp, likes, replies } = req.body;

  if (!authorId || !postId || !comment) {
    return res.status(400).json({
      message: " authorId, content or postId not found",
    });
  };
//    const userId = req.id;
  try {
    // Create a new comment instance
    const newComment = new commentTbl({
      authorId,
      postId,
      comment,
      timestamp,
      likes,
      replies,
    });

    // Save the comment to the database
    const savedComment = await newComment.save();

    // Respond with the saved comment
    res.json(savedComment);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};


exports.replyComment = async (req, res) => {
    const authorId = req.id;
    const {  postId, comment, timestamp, likes, replies } = req.body;
  
    if (!authorId || !postId || !comment) {
      return res.status(400).json({
        message: " authorId, content or postId not found",
      });
    };
  //    const userId = req.id;
    try {
      // Create a new comment instance
      const newComment = new commentTbl({
        authorId,
        postId,
        comment,
        timestamp,
        likes,
        replies,
      });
  
      // Save the comment to the database
      const savedComment = await newComment.save();
  
      // Respond with the saved comment
      res.json(savedComment);
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: error.message });
    }
  };


  exports.createComment = async (req, res) => {
    const { authorId, postId, comment, timestamp, likes, replies } = req.body;
  
    if (!authorId || !postId || !comment) {
      return res.status(400).json({
        message: " authorId, content or postId not found",
      });
    };
  //    const userId = req.id;
    try {
      // Create a new comment instance
      const newComment = new commentTbl({
        authorId,
        postId,
        comment,
        timestamp,
        likes,
        replies,
      });
  
      // Save the comment to the database
      const savedComment = await newComment.save();
  
      // Respond with the saved comment
      res.json(savedComment);
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: error.message });
    }
  };

  
//   exports.likeComment = async (req, res) => {
//       const authorId = req.id;
//       const {  postId, commentId, timestamp, likes, replies } = req.body;

//       const comment2 = await comment.findById(commentId);
//     console.log(comment2);
//       if (!authorId || !postId ) {
//         return res.status(400).json({
//           message: " authorId, content or postId not found",
//         });
//       };

//     };