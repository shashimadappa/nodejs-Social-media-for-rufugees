const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const sendEmail = require('../utils/sendEmail')
const Token = require("../auth/token");
const cloudinary = require('cloudinary').v2;
const  cloudinaryConfig = require('../config/cloud')

cloudinary.config(cloudinaryConfig);

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


exports.updateDp = async (req, res) => {
  try {
    const id = req.params.id;

    // Handle file upload
    upload.single('file')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error', message: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Internal server error', message: err.message });
      }
      const folder = 'displayPicture'; 
      // Upload the file to Cloudinary
      cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Upload failed', message: error.message });
        }

        // Update the user's display picture in the database
        const filePath = result.secure_url;
        const { public_id, secure_url } = result;
        const updatedUser = await User.findByIdAndUpdate(
          id,
          {
          displayPicture: {
            public_id,
            secure_url,
          }
        },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: `User with ID ${id} not found.` });
        }

        // File uploaded and user updated successfully
        res.json({ public_id: result.public_id, url: result.secure_url, user: updatedUser });
      }).end(req.file.buffer);
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

exports.createUser = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Get the data from the request body
  const {
    email,
    password,
    referenceEmail,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser.email) {
    // Email is already registered
    return res.status(409).send({ message: "Email is already registered." });
  }

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500).send({
        message: "Error hashing the password.",
      });
    } else {
      // Create a new User object with the hashed password and other fields
      const userData = {
        email,
        username: req.body.username || "",
        displayPicture: req.body.displayPicture || "",
        password: hashedPassword,
        number: req.body.number || "",
        referenceEmail,
        role: req.body.role || "",
        gender: req.body.gender || "",
        location: req.body.location || {
          city: "",
          state: "",
          country: ""
        },
        tags: req.body.tags || [],
        mission: req.body.mission || "",
        occupation: req.body.occupation || "",
        organization: req.body.organization || "",
        experience: req.body.experience || [],
        education: req.body.education || [],
        skills: req.body.skills || [],
        offeringToNetwork: req.body.offeringToNetwork || "",
        lookingForNetwork: req.body.lookingForNetwork || "",
        preferredLanguage: req.body.preferredLanguage || "",
        created_at: req.body.created_at || "",
        updated_at: req.body.updated_at || "",
        isActive: req.body.isActive || true,
      };
      

      const newUser = new User(userData);

      // Save User in the database
      newUser
        .save(newUser)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User.",
          });
        });
    }
  });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .json({ message: "Tutorial not found with id " + id });
      }
      return res.status(200).json(data);
    })
    .catch((err) => {
      console.error(`Error retrieving Tutorial with id=${id}: ${err.message}`);
      return res
        .status(500)
        .json({ message: "Error retrieving Tutorial with id=" + id });
    });
};

exports.updateUser = async (req, res) => {
  console.log(req.email);
  try {
    // Validate request
    if (!req.body) {
      return res.status(400).json({ message: "Request body is empty." });
    }

    const userId = req.params.id; // Assuming you have a route parameter for user ID
    const updateData = req.body;

    // Find the user by their unique ID and update the fields
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: `User with ID ${userId} not found.` });
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    // Handle errors
    return res
      .status(500)
      .json({ message: "Error occurred while updating the User." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const generateToken = Token.generateToken(user);

    res
      .status(200)
      .json({ generateToken, userId: user._id, email: user.email, username : user.username, displayPicture: user.displayPicture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during login" });
  }
};



exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const random6DigitNumber = Math.floor(100000 + Math.random() * 900000);

    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 15); // OTP expires in 15 minutes
    user.resetPasswordOTP = random6DigitNumber;
    user.resetPasswordOTPExpires = otpExpiration;

    await user.save();

    sendEmail({
      to:  [
        user.email
      ], // Replace with the recipient's email address
      subject: "OTP for password change AWON",
      html: random6DigitNumber,
    });

    res.status(200).json({ message: "OTP sent to the user's email" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during OTP generation" });
  }
};


exports.resetForgotPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the OTP
    if (user.resetPasswordOTP !== otp || user.resetPasswordOTPExpires < Date.now()) {
      console.log(user.resetPasswordOTP);
      console.log(otp);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during password reset" });
  }
};

