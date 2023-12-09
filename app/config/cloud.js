// import {v2 as cloudinary} from 'cloudinary';
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dppua0ebn",
  api_key: "283194213517126",
  api_secret: "cpyMIIFzyJWcAIE8i7qi-VkFego",
});

module.exports = cloudinary;
