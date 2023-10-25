const db = require("../models");
const User = db.users;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = "1234567890";


exports.createUser = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Get the data from the request body
  const {
    email,
    username,
    displayPicture,
    password,
    number,
    referenceEmail,
    role,
    gender,
    location,
    tags,
    mission,
    occupation,
    organization,
    experience,
    education,
    skills,
    offeringToNetwork,
    lookingForNetwork,
    preferredLanguage,
    created_at,
    updated_at,
    createdAt,
    updatedAt,
    id
  } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500).send({
        message: "Error hashing the password."
      });
    } else {
      // Create a new User object with the hashed password and other fields
      const userData = {
        email,
        username,
        displayPicture,
        password: hashedPassword,
        number,
        referenceEmail,
        role,
        gender,
        location,
        tags,
        mission,
        occupation,
        organization,
        experience,
        education,
        skills,
        offeringToNetwork,
        lookingForNetwork,
        preferredLanguage,
        created_at,
        updated_at,
        createdAt,
        updatedAt,
        id
      };

      const newUser = new User(userData);

      // Save User in the database
      newUser
        .save(newUser)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
          });
        });
    }
  });
  };


  exports.updateUser = async (req, res) => {
    try {
      // Validate request
      if (!req.body) {
        return res.status(400).json({ message: "Request body is empty." });
      }
  
      const userId = req.params.id; // Assuming you have a route parameter for user ID
      const updateData = req.body;
  
      // Find the user by their unique ID and update the fields
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: `User with ID ${userId} not found.` });
      }
  
      return res.status(200).json(updatedUser);
    } catch (err) {
      // Handle errors
      console.error(err);
      return res.status(500).json({ message: "Error occurred while updating the User." });
    }
  };


  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate request
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      // Check if the password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, {
        expiresIn: '1h', // Set an appropriate expiration time
      });
  
      res.status(200).json({ token, userId: user._id, email: user.email });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred during login' });
    }
  };