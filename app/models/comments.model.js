module.exports = (mongoose) => {
    var schema = mongoose.Schema(
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        postId: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
        comment: { type: String, required: true },
        timestamp: { type: Date, },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
        replies: [String],
      }
      // { timestamps: true }
    );
  
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const comment = mongoose.model("comment", schema);
    return comment;
  };
  