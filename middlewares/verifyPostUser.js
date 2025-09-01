const Post = require("../models/Post");

const verifyPostUser = async (req, res, next) => {
  const { PostId } = req.params;
  const user = req?.user?.id;
  const post = await Post.findById(PostId);
  const isMatch = user.toString() === post.user.toString();
  if (!isMatch)
    return res.status(403).json({ error: "No permission to access this Post" });
  next();
};

module.exports = verifyPostUser;
