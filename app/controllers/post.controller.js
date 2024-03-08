const db = require("../models");
const post = db.post;
const userTbl = db.users;

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cloudinaryConfig = require("../config/cloud");
const userModel = require("../models/user.model");
cloudinary.config(cloudinaryConfig);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to upload image to Cloudinary
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(file.buffer);
  });
};

exports.createPost2 = async (req, res) => {
  try {
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
      postData.imageUrls = cloudinaryResults.map((result) => result.secure_url);
    }
    const createdPost = await Post.create(postData);

    res.status(201).json(createdPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createPost = async (req, res) => {
  const { authorId, content, tags, createdAt } = req.body;

  if (!authorId) {
    return res.status(404).json({ error: "user not found" });
  }
  // Check if there are files in the request
  if (req.files && req.files.length > 0) {
    try {
      const folder = "postMedia";
      const uploadResults = [];
      // Upload each file to Cloudinary
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "auto", folder: folder },
              (error, result) => {
                if (error) {
                  reject({ error: "Upload failed", message: error.message });
                } else {
                  const media = {
                    url: result.secure_url,
                    key: result.public_id,
                  };
                  uploadResults.push(media);

                  resolve();
                }
              }
            )
            .end(file.buffer);
        });
      });

      try {
        await Promise.all(uploadPromises);


        const newPost = new post({
          authorId: authorId,
          content: content,
          tags: tags,
          media: uploadResults,
          createdAt: createdAt,
        });
        await newPost.save();

        res.json(newPost);
      } catch (uploadError) {
        // Rollback: Delete uploaded files on Cloudinary if there's an error saving to the database
        uploadResults.forEach(async (data) => {
          await cloudinary.uploader.destroy(data.url); // Assumes the Cloudinary URLs are the public IDs
        });

        return res
          .status(500)
          .json({
            error: "Error processing files",
            message: uploadError.message,
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  } else {
    // If no files, create a new post without media
    try {
      const newPost = new post({
        authorId: authorId, // Assuming this ID is constant for this example
        content: content,
        tags: tags,
        media: [],
        createdAt: createdAt,
      });
      await newPost.save();

      res.json(newPost);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.id; // Assuming user information is attached to the request

    const post2 = await post.findById(postId);

    if (!post2) {
      return res.status(404).json({ error: "Post not found" });
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
    // const 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await post
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const finalArray = await Promise.all(
      posts.map(async (post) => {
        const authorId = post.authorId;
        const userData = await userTbl.findOne({ _id: authorId });
        const commentsNo = await commentTbl.countDocuments({postIdy: post._id})

        // Embed user data within each post object
        return {
          _id: post._id,
          media: post.media,
          likes: post.likes,
          content: post.content,
          tags: post.tags,
          isActive: post.isActive,
          createdAt: post.createdAt,
          commentsNo,
          user: {
            _id: userData._id,
            username: userData.username,
            picture: userData.displayPicture.secure_url,
            occupation: userData.occupation,
            uniqueId: userData.uniqueId
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

// Delete a post by ID
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;
    const Post = await post.findOne({ _id: postId, userId });
    if (!Post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (Post.media && Post.media[0]?.key) {
      // Delete the existing display picture from Cloudinary
      try {
        await cloudinary.uploader.destroy(Post.media[0].key);
      } catch (deleteError) {
        console.error(deleteError);
        return res.status(500).json({
          error: "Error deleting existing post picture",
          message: deleteError.message,
        });
      }
    }

    // Remove the post
    const deletedPost = await post.findByIdAndRemove(postId);

    res.json({ message: "Post deleted successfully", deletedPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
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
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Tutorial with id " + id });
      else res.send(data);
    })
    .catch((err) => {
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
  }

  const posts = await post
    .find({ authorId: id })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found post with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Tutorial with id=" + id });
    });
};

exports.getPostByPostId = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      message: "post not found",
    });
  }

  try {
    // Updated pagination logic: Get posts based on URI parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await post.find({ _id: id })


    const finalArray = await Promise.all(
      posts.map(async (post) => {
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
            picture: userData.displayPicture.secure_url,
            occupation: userData.occupation,
            uniqueId: userData.uniqueId
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

exports.getNoOfLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const media = await post.findById(postId);

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const likeCount = media.likes.length;

    res.json({ likeCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content, tags, updatedAt } = req.body;

  try {
    const existingPost = await post.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (content) {
      existingPost.content = content;
    }
    if (tags) {
      existingPost.tags = tags;
    }
    if (updatedAt) {
      existingPost.editedAt = updatedAt;
    }

    // Check if there are files in the request
    if (req.files && req.files.length > 0) {
      const folder = "postMedia";
      const uploadResults = [];

      // Upload each file to Cloudinary
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: folder },
            (error, result) => {
              if (error) {
                reject({ error: "Upload failed", message: error.message });
              } else {
                const media = {
                  url: result.secure_url,
                  key: result.public_id,
                };
                uploadResults.push(media);
                resolve();
              }
            }
          ).end(file.buffer);
        });
      });

      await Promise.all(uploadPromises);

      // Delete previous pictures from Cloudinary
      if (existingPost.media.length > 0) {
        await Promise.all(
          existingPost.media.map(async (media) => {
            await cloudinary.uploader.destroy(media.key);
          })
        );
      }

      // Update post with new media
      existingPost.media = uploadResults;
    }

    await existingPost.save();
    res.json(existingPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};


