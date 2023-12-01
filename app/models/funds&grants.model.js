module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Assuming there's a User model for author information
        // required: true,
      },
      title: {
        type: String,
        // required: true,
      },
      category: {
        type: String,
        // required: true,
      },
      discription: {
        type: String,
        // required: true,
      },
      tags: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
      location: {
        type: String,
        // required: true,
      },
      applicationDeadline: {
        type: Date,
      },
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

          ref: "Comment",
        },
      ],
      tags: [String],
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
      },
      updatedAt: {
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

  const funds_grants = mongoose.model("funds_grants", schema);
  return funds_grants;
};
