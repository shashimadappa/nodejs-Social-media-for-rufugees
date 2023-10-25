module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        email: {
                type: String,
                required: true,
                unique: true,
              },
              username: {
                type: String,
                // required: true,
                // unique: true
              },
              password: {
                type: String,
                required: true,
              },
              number: String,
              referenceEmail: String,
              displayPicture : String,
              role: String,
              gender: String,
              location: {
                city: String,
                state: String,
                country: String,
              },
              tags: [String],
              mission: String,
              occupation: String,
              organization: String,
              experience: [
                {
                  title: String,
                  company: String,
                  start_date: Date,
                  end_date: Date,
                  description: String,
                },
              ],
              education: [
                {
                  degree: String,
                  major: String,
                  university: String,
                  graduation_year: Number,
                },
              ],
              skills: [String],
              offeringToNetwork: String,
              lookingForNetwork: String,
              preferredLanguage: String,
              created_at: { type: Date, default: Date.now },
              updated_at: { type: Date, default: Date.now },
      
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const user = mongoose.model("user", schema);
    return user;
  };
  