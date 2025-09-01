const Post = require("../models/Post");

const newPost = async (req, res) => {
  const { id: user } = req.user;
  const { text, images, anonymous } = req.body;
  if (!text)
    return res.json({ error: "You cannot make a post without a text" });
  try {
    const post = await Post.create({
      user,
      text,
      images,
      anonymous,
    });
    res.josn(post);
  } catch (err) {
    console.log(err);
  }
};

const editPost = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    post.body = text;
    await post.save();
    res.json(post);
  } catch (err) {
    console.log(err);
  }
};
const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);
    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { newPost, getPosts, editPost, deletePost };
