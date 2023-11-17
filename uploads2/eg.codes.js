
// Delete a post by ID
exports.deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete the post from the database
    await post.remove();

    // Delete associated media from Cloudinary
    post.media.forEach(async (media) => {
      await cloudinary.uploader.destroy(media.url);
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};