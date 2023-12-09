// const db = require("../models");
// const messageTbl = db.message;
// const { sendMessage } = require('../utils/socket');

// exports.createMessage = async (req, res) => {
//   const { authorId,  content } = req.body;
//   const conversationId = "2344566";
//   try {
//     const message = new messageTbl({ conversationId, authorId, content });
//     await message.save();

//     // Emit the message to all connected sockets in the conversation room
//     req.io.to(conversationId.toString()).emit('newMessage', message);

//     res.status(201).json({ message });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// //   if (!authorId || !postId || !comment) {
// //     return res.status(400).json({
// //       message: " authorId, content or postId not found",
// //     });
// //   };
// // try {
// //     // Create a new comment instance
// //     const newComment = new messageTbl({
// //       authorId,
// //       content,

// //     });

// //     // Save the comment to the database
// //     const savedComment = await newComment.save();
// //   // Emit the saved message through Socket.io
// //    sendMessage(authorId, content);
// //     // Respond with the saved comment
// //     res.json(savedComment);
// //   } catch (error) {
// //     // Handle errors
// //     res.status(500).json({ error: error.message });
// //   }
// // };
