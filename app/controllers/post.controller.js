const db = require("../models");
const post = db.post;

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const  cloudinaryConfig = require('../config/cloud')
cloudinary.config(cloudinaryConfig);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createPost = async (req, res) => {
  const { authorId, content, media, tags } = req.body;
  
  // Check if there are files in the request
  if (req.files && req.files.length > 0) {
    try {
      // Handle file upload
      upload.array('files', 5)(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: 'File upload error', message: err.message });
        } else if (err) {
          return res.status(500).json({ error: 'Internal server error', message: err.message });
        }

        const folder = 'postMedia';
        const uploadResults = [];

        // Upload each file to Cloudinary
        const uploadPromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
              if (error) {
                reject({ error: 'Upload failed', message: error.message });
              } else {
                const media = {
                  url: result.secure_url,
                  key: result.public_id
                }
                uploadResults.push(media);
                
                resolve();
              }
            }).end(file.buffer);
          });
        });

        try {
          await Promise.all(uploadPromises);

          // Create a new post object with the required data
          const newPost = new post({
            authorId: "653b66225652f73ae41252bd", // Assuming this ID is constant for this example
            content: content,
            tags: tags,
            media: uploadResults,
          });
          await newPost.save();

          res.json(newPost);
        } catch (uploadError) {
          // Rollback: Delete uploaded files on Cloudinary if there's an error saving to the database
          uploadResults.forEach(async (data) => {
            await cloudinary.uploader.destroy(data.url); // Assumes the Cloudinary URLs are the public IDs
          });

          return res.status(500).json({ error: 'Error processing files', message: uploadError.message });
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  } else {
    // If no files, create a new post without media
    try {
      const newPost = new post({
        authorId: "653b66225652f73ae41252bd", // Assuming this ID is constant for this example
        content: content,
        tags: tags,
        media: [],
      });
      await newPost.save();

      res.json(newPost);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};


// exports.createPost = async (req, res) => {
//   const { authorId, content, media, tags } = req.body;
// if(req.files){

// }
//   try {
//     // Handle file upload
//     upload.array('files', 5)(req, res, async (err) => {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ error: 'File upload error', message: err.message });
//       } else if (err) {
//         return res.status(500).json({ error: 'Internal server error', message: err.message });
//       }

//       const folder = 'postMedia';
//       const uploadResults = [];

//       // Upload each file to Cloudinary
//       const uploadPromises = req.files.map(file => {
//         return new Promise((resolve, reject) => {
//           cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
//             if (error) {
//               reject({ error: 'Upload failed', message: error.message });
//             } else {
//               const media = {
//                  url : result.secure_url,
//                  key : result.public_id
//               }
//             // const url =  result.secure_url
//             // const key = result.public_id
//               uploadResults.push(media);
              
//               resolve();
//             }
//           }).end(file.buffer);
//         });
//       });

//       try {
//         await Promise.all(uploadPromises);

//         // Create a new post object with the required data
//         const newPost = new post({
//           authorId: "653b66225652f73ae41252bd",
//           // authorId: authorId,
//           content: content,
//           tags: tags,
//           media: uploadResults,
//         });
//         await newPost.save();

//         res.json(newPost);
//       } catch (uploadError) {
//         // Rollback: Delete uploaded files on Cloudinary if there's an error saving to the database
//         uploadResults.forEach(async (data) => {
//           // console.log('url'.url);
//           await cloudinary.uploader.destroy(data.url); // Assumes the Cloudinary URLs are the public IDs
//         });

//         return res.status(500).json({ error: 'Error processing files', message: uploadError.message });
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error', message: error.message });
//   }
// };

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.id; // Assuming user information is attached to the request

    // Find the post by its ID
    const post2 = await post.findById(postId);
    // console.log(post2)

    if (!post2) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already liked the post
    const existingLike = post2.likes.find((like) => like.equals(userId));
    console.log(existingLike)
    // If the user already liked the post, remove the like (dislike)
    if (existingLike) {
      post2.likes = post2.likes.filter((like) => !like.equals(userId));
    } else {
      // If the user has not liked the post, add the like
      post2.likes.push(userId);
      console.log(post2);
    }

    // Save the updated post with the new like/dislike
    const updatedPost = await post2.save();

    // Respond with the updated post
    res.json(updatedPost);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
  };

    exports.findAll = async (req, res) => {
      try {
        // Pagination logic: Get 10 posts at a time
        const page = parseInt(req.query.page) || 2;
        const limit = 1;
        const skip = (page - 1) * limit;
    
        const posts = await post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.json(posts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  };


  // exports.findAll = async (req, res) => {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const pageSize = 4;
  //     const skip = (page - 1) * pageSize;
  
  //     const [latestPost, posts] = await Promise.all([
  //       getLatestPost(),
  //       getPosts(skip, pageSize)
  //     ]);
  
  //     res.json({ latestPost, posts });
  //   } catch (error) {
  //     console.error('Error fetching posts:', error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // };

  // async function getLatestPost() {
  //   const latestPost = await post.findOne({}, { sort: { createdAt: -1 } });
  //   return latestPost;
  // }
  
  // async function getPosts(skip = 0, limit = 10) {
  //   const posts = await post.find({})
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(limit)
  //    // .toArray(); // This is not needed, as `find` in MongoDB driver returns a cursor
  
  //   return posts;
  // }




// Delete a post by ID
exports.deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by ID
    const postData = await post.findById(postId);

    // Check if the post exists
    if (!postData) {
      return res.status(404).json({ error: 'Post not found' });
    }
    await postData.remove();

    postData.media.forEach(async (media) => {
      try {
        // Use the provided public ID (key) to delete the media file from Cloudinary
        await cloudinary.uploader.destroy(media.key);

        // Alternatively, you can use the URL to delete the media file:
        // await cloudinary.uploader.destroy(media.url);
      } catch (deleteError) {
        console.error(deleteError);
        // Handle any errors that occur during media deletion
      }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log(id);
    if (!id) {
        return res.status(400).json({
          message: "Invalid post data",
        });
      }
  
    Tutorial.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Tutorial with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Tutorial with id=" + id });
      });
  };


exports.getAllById = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    if (!id) {
        return res.status(400).json({
          message: "User not found",
        });
      };
    
      const posts = await post.find({ authorId: id })
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found post with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Tutorial with id=" + id });
      });
  
};