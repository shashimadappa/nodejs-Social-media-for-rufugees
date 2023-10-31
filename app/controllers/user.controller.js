const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const Token = require("../auth/token");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({ storage: storage });
exports.updateDp = async (req, res) => {
  const id = req.params.id;

  try {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;

      try {
        // Update the user's displayPicture field in the database
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { displayPicture: filePath },
          { new: true }
        );

        if (!updatedUser) {
          return res
            .status(404)
            .json({ message: `User with ID ${id} not found.` });
        }

        res
          .status(200)
          .json({ message: "File uploaded and path saved successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error updating user in the database" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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

    // Check if the email exists in your database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random OTP (6 digits in this example)
    const random6DigitNumber = Math.floor(100000 + Math.random() * 900000);

    // Save the OTP and its expiration time in the user's document
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 15); // OTP expires in 15 minutes
    user.resetPasswordOTP = random6DigitNumber;
    user.resetPasswordOTPExpires = otpExpiration;

    await user.save();

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

