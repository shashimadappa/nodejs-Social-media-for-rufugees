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

// if (!authorId || !content) {
//   return res.status(400).json({
//     message: " authorId content not found",
//   });
// }

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
                 url : result.secure_url,
                 key : result.public_id
              }
            // const url =  result.secure_url
            // const key = result.public_id
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
          // authorId: "653b66225652f73ae41252bd",
          authorId: authorId,
          content: content,
          tags: tags,
          media: uploadResults,
        });
        await newPost.save();

        res.json(newPost);
      } catch (uploadError) {
        // Rollback: Delete uploaded files on Cloudinary if there's an error saving to the database
        uploadResults.forEach(async (data) => {
          // console.log('url'.url);
          await cloudinary.uploader.destroy(data.url); // Assumes the Cloudinary URLs are the public IDs
        });

        return res.status(500).json({ error: 'Error processing files', message: uploadError.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
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