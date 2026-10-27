const likesService = require('../services/likes.service');
const postsService = require('../services/posts.service');
const usersService = require('../services/users.service');

async function getLikes(req, res) {
  const postId = Number(req.params.id);

  const post = await postsService.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const likes = await likesService.getPostLikes(postId);
  return res.json(likes);
}

async function like(req, res) {
  const postId = Number(req.params.id);
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const post = await postsService.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const user = await usersService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const created = await likesService.likePost(userId, postId);
    return res.status(201).json(created);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already liked' });
    }
    throw err;
  }
}

async function unlike(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  try {
    await likesService.unlikePost(userId, postId);
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Like not found' });
    }
    throw err;
  }
}

module.exports = { getLikes, like, unlike };