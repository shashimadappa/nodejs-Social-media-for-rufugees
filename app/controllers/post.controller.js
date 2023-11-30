const db = require("../models");
const post = db.post;
const userTbl = db.users

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const  cloudinaryConfig = require('../config/cloud');
const userModel = require("../models/user.model");
cloudinary.config(cloudinaryConfig);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to upload image to Cloudinary
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(file.buffer);
  });
};

exports.createPost2 = async (req, res) => {
  try {
    // Construct post data
    const postData = {
      authorId: req.params.userId,
      content: req.body.content,
      tags: req.body.tags,
    };

    // Check if images are provided
    if (req.files && req.files.length > 0) {
      // Upload each image to Cloudinary
      const cloudinaryResults = await Promise.all(
        req.files.map(async (file) => uploadImageToCloudinary(file))
      );

      // Add Cloudinary image URLs to post data
      postData.imageUrls = cloudinaryResults.map(result => result.secure_url);
    }

    console.log(postData);

    // Use your Post model to create a post with the provided data
    const createdPost = await Post.create(postData);

    // Respond with the created post or a success message
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createPost = async (req, res) => {
  const { authorId, content,  tags } = req.body;

  if (!authorId) {
    return res.status(404).json({ error: 'user not found' });
  }

  
  // Check if there are files in the request
  if (req.files && req.files.length > 0) {
    try {
     

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
            authorId: authorId, // Assuming this ID is constant for this example
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
      
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  } else {
    // If no files, create a new post without media
    try {
      const newPost = new post({
        authorId: authorId, // Assuming this ID is constant for this example
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

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.id; // Assuming user information is attached to the request

    const post2 = await post.findById(postId);

    if (!post2) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const existingLike = post2.likes.find((like) => like.equals(userId));
    // If the user already liked the post, remove the like (dislike)
    if (existingLike) {
      post2.likes = post2.likes.filter((like) => !like.equals(userId));
    } else {
      // If the user has not liked the post, add the like
      post2.likes.push(userId);

    }

    const updatedPost = await post2.save();

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  };
  
  exports.findAll = async (req, res) => {
    try {
      // Updated pagination logic: Get posts based on URI parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const posts = await post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  
      const finalArray = posts.map(async (post) => {
        const authorId = post.authorId;
        const userData = await userTbl.findOne({ _id: authorId });
  
        // Embed user data within each post object
        return {
          _id: post._id,
          media: post.media,
          likes: post.likes,
          content: post.content,
          tags: post.tags,
          isActive: post.isActive,
          createdAt: post.createdAt,
          user: {
            _id: userData._id,
            username: userData.username,
            // Include other user fields as needed
            // Add more fields as needed
          },
        };
      });
  
      // Wait for all promises to resolve
      const combinedDataArray = await Promise.all(finalArray);
  
      res.json(combinedDataArray);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


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

exports.getNoOfLikes = async (req, res) => {
  try {
    const {postId } = req.params;
  
    const media = await post.findById(postId);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const likeCount = media.likes.length;

    res.json({ likeCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};