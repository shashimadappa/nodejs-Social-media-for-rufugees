module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Assuming there's a User model for author information
        // required: true,
      },
      content: {
        type: String,
        // required: true,
      },
      media: [
        // Define the media schema if needed
      ],
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          // ref: "like",
          ref: "user",
          },
      ],
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,

          ref: "comment",
        },
      ],
      tags: [String],
      isActive: {
        type: Boolean,
        default: true,
      },
      created_at: {
        type: Date,
    
      },
      updated_at: {
        type: Date,
   
      },
    }
    // { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const post = mongoose.model("post", schema);
  return post;
};
