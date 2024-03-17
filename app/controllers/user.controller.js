const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const sendEmail = require("../utils/sendEmail");
const Token = require("../auth/token");
const cloudinary = require("cloudinary").v2;
const cloudinaryConfig = require("../config/cloud");
const shortid = require("shortid");

cloudinary.config(cloudinaryConfig);

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.updateDp = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: `User with ID ${id} not found.` });
    }

    // Check if there is an existing display picture
    if (user.displayPicture && user.displayPicture.public_id) {
      // Delete the existing display picture from Cloudinary
      try {
        await cloudinary.uploader.destroy(user.displayPicture.public_id);
      } catch (deleteError) {
        console.error(deleteError);
        return res.status(500).json({
          error: "Error deleting existing display picture",
          message: deleteError.message,
        });
      }
    }
    // Handle file upload
    upload.single("file")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ error: "File upload error", message: err.message });
      } else if (err) {
        return res
          .status(500)
          .json({ error: "Internal server error", message: err.message });
      }
      const folder = "displayPicture";
      // Upload the file to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: folder },
          async (error, result) => {
            if (error) {
              return res
                .status(500)
                .json({ error: "Upload failed", message: error.message });
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
                },
              },
              { new: true }
            );

            if (!updatedUser) {
              return res
                .status(404)
                .json({ message: `User with ID ${id} not found.` });
            }

            // File uploaded and user updated successfully
            res.json({
              public_id: result.public_id,
              url: result.secure_url,
              user: updatedUser,
            });
          }
        )
        .end(req.file.buffer);
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

exports.createUser = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const uniqueId = shortid.generate();

  const {
    email,
    password,
    referenceEmail,
    // createdAt,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
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
        uniqueId,
        username: req.body.username || "",
        displayPicture: req.body.displayPicture || "",
        password: hashedPassword,
        number: req.body.number || "",
        referenceEmail,
        role: req.body.role || "",
        gender: req.body.gender || "",
        location: req.body.location || "",
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
        created_at: req.body.createdAt || "",
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
          .json({ message: "user not found with id " + id });
      }
      const modifiedUser = { ...data._doc };
      delete modifiedUser.password;

      return res.status(200).json(modifiedUser);
    })

    .catch((err) => {
      console.error(`Error retrieving user with id=${id}: ${err.message}`);
      return res
        .status(500)
        .json({ message: "Error retrieving user with id=" + id });
    });
};

exports.findOneByUniqueId = async (req, res) => {
  const uniqueId = req.params.uniqueId;
  try {
    if (!uniqueId) {
      return res.status(400).json({ error: "uniqueId parameter is required" });
    }
    const users = await User.find({ uniqueId });

    // Modify the data before sending the response
    const modifiedUsers = users.map((post) => {
      const { _id, password, isActive, ...modifiedUsers } = post.toObject();
      return modifiedUsers;
    });
    res.json(modifiedUsers);
  } catch (err) {
    // Handle errors
    return res
      .status(500)
      .json({ message: "Error occurred while updating the User." });
  }
};

exports.findByLocation = async (req, res) => {
  try {
    const location = req.query.location;

    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }
    const users = await User.find({ location });

    res.json(users);
  } catch (err) {
    // Handle errors
    return res
      .status(500)
      .json({ message: "Error occurred while updating the User." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is empty." });
    }

    const userId = req.params.id;
    const updateData = req.body;

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

    res.status(200).json({
      generateToken,
      userId: user._id,
      email: user.email,
      username: user.username,
      displayPicture: user.displayPicture,
      uniqueID: user.uniqueId,
    });
  } catch (error) {
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
      to: [user.email], // Replace with the recipient's email address
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
    if (
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
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


exports.findUserByNameOrCountry = async (req, res) => {
  try {
    const { country, name } = req.query;

    if (!country && !name) {
      return res.status(400).json({ message: 'Provide at least id or name parameter' });
    }

    let query = {};

    if (country) {
      query.location = {$regex: new RegExp(country, 'i')};
    }

    if (name) {
      query.username = { $regex: new RegExp(name, 'i') };
    }

    const users = await User.find(query);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Exclude sensitive data like password before sending the response
    const sanitizedUsers = users.map(user => {
      const { password, ...userData } = user._doc;
      return userData;
    });

    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error(`Error retrieving user: ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.findUserByTags = async (req, res) => {
  try {
    const tags = req.params.tags;
    
    // Using a regular expression to perform a case-insensitive search
    const users = await User.find({ tags: { $regex: new RegExp(tags, 'i') } });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during password reset" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User
      .find()
      .sort({ createdAt: -1 });

    const sanitizedUsers = users.map(user => {
      const { password, experience,education, role, gender, offeringToNetwork, lookingForNetwork, preferredLanguage, organization, occupation,skills, isActive, resetPasswordOTP, resetPasswordOTPExpires, mission, ...userData } = user._doc;
      return userData;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during password reset" });
  }
};

exports.getAllUsersLocation = async (req, res) => {
  try {

    const usersLocation = await User.aggregate([
      {
        $group: {
          _id: '$location', // Group by location
          count: { $sum: 1 } // Count occurrences
        }
      }
    ]);
    const formattedUsersLocation = usersLocation.map(location => ({
      location: location._id,
      count: location.count
    }));
    res.json(formattedUsersLocation);
  } catch (error) {
    console.error(error);
      res.status(500).json({ message: "Error occurred during getUsersLocation" });
 }
};


