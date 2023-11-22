// module.exports = (mongoose) => {
//     var schema = mongoose.Schema(
//       {
//         authorId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "user", // Assuming there's a User model for author information
//           // required: true,
//         },
//         conversationId: {
//             type: String,
//             // required: true,
//           },
//         content: {
//           type: String,
//           // required: true,
//         },

//         isActive: {
//           type: Boolean,
//           default: true,
//         },
//         created_at: {
//           type: Date,
      
//         },
//         updated_at: {
//           type: Date,
     
//         },
//       }
//       // { timestamps: true }
//     );
  
//     schema.method("toJSON", function () {
//       const { __v, _id, ...object } = this.toObject();
//       object.id = _id;
//       return object;
//     });
  
//     const message = mongoose.model("message", schema);
//     return message;
//   };
  