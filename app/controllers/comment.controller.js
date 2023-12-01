const db = require("../models");
const commentTbl = db.comment;
const userTbl = db.users

exports.createComment = async (req, res) => {
  const { authorId, postId, comment, createdAt, likes, replies } = req.body;

  if (!authorId || !postId || !comment) {
    return res.status(400).json({
      message: "authorId, content or postId not found",
    });
  };
//    const userId = req.id;
  try {
    // Create a new comment instance
    const newComment = new commentTbl({
      authorId,
      postId,
      comment,
      createdAt,
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

exports.getAllComments = async (req, res) => {
const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({
      message: "postId not found",
    });
  };
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

   const comments = await commentTbl.find({postId}).sort({createdAt: -1}).skip(skip).limit(limit);

   const finalArray = await Promise.all(
    comments.map(async (post) => {
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
  const sortedArray = finalArray.sort((a, b) => comments.findIndex(p => p._id.equals(a._id)) - comments.findIndex(p => p._id.equals(b._id)));


  //  const authorId = comments.map(comment => comment.authorId);
  //  console.log(authorId);
    res.json(sortedArray);
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


  // exports.createComment = async (req, res) => {
  //   const { authorId, postId, comment, timestamp, likes, replies } = req.body;
  
  //   if (!authorId || !postId || !comment) {
  //     return res.status(400).json({
  //       message: " authorId, content or postId not found",
  //     });
  //   };
  // //    const userId = req.id;
  //   try {
  //     // Create a new comment instance
  //     const newComment = new commentTbl({
  //       authorId,
  //       postId,
  //       comment,
  //       timestamp,
  //       likes,
  //       replies,
  //     });
  
  //     // Save the comment to the database
  //     const savedComment = await newComment.save();
  
  //     // Respond with the saved comment
  //     res.json(savedComment);
  //   } catch (error) {
  //     // Handle errors
  //     res.status(500).json({ error: error.message });
  //   }
  // };

  
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