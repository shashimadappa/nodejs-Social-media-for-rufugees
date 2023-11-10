

// Define an API endpoint for following a user
app.post('/api/follow/:userId', async (req, res) => {
  try {
    const followerId = req.body.followerId; // The user who wants to follow
    const userIdToFollow = req.params.userId; // The user to follow

    // Add the user who wants to follow to the following list of the target user
    await User.findByIdAndUpdate(userIdToFollow, {
      $addToSet: { followers: followerId },
    });

    // Add the target user to the follower's following list
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: userIdToFollow },
    });

    res.status(200).json({ message: 'Successfully followed user.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while following the user.' });
  }
});