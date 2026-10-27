const postsService = require('../services/posts.service');
const usersService = require('../services/users.service');
const {parsePagination} = require('../utils/pagination');

async function create(req, res) {
  const {imageUrl, caption, location, authorId} = req.body;

  if (!imageUrl || !authorId) {
    return res.status(400).json({error: 'imageUrl and authorId are required'});
  }

  // check if user exists
  const user = await usersService.getUserById(authorId);
  if (!user) {
    return res.status(404).json({error: 'User not found'});
  }

  const post = await postsService.createPost({imageUrl, caption, location, authorId});
  return res.status(201).json(post);
}

async function list(req, res) {
  const parsed = parsePagination(req.query);
  if (parsed.error) {
    return res.status(400).json({error: parsed.error});
  }
  const {page, limit} = parsed;

  const allowedSort = ['createdAt', 'updatedAt', 'likes'];
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  if (!allowedSort.includes(sortBy)) {
    return res.status(400).json({error: 'sortBy must be one of: createdAt, updatedAt, likes'});
  }
  if (order !== 'asc' && order !== 'desc') {
    return res.status(400).json({error: 'order must be asc or desc'});
  }

  const where = {};

  if (req.query.location) {
    where.location = {equals: req.query.location, mode: 'insensitive'};
  }

  if (req.query.search) {
    where.caption = {contains: req.query.search, mode: 'insensitive'};
  }

  if (req.query.from || req.query.to) {
    const fromDate = req.query.from ? new Date(req.query.from) : null;
    const toDate = req.query.to ? new Date(req.query.to) : null;

    if ((req.query.from && isNaN(fromDate.getTime())) || (req.query.to && isNaN(toDate.getTime()))) {
      return res.status(400).json({error: 'from and to must be valid dates'});
    }

    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lt = toDate;
  }

  const result = await postsService.listPosts({page, limit, sortBy, order, where});
  return res.json(result);
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  const post = await postsService.getPostById(id);

  if (!post) {
    return res.status(404).json({error: 'Post not found'});
  }
  return res.json(post);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const {caption, location} = req.body;
  const data = {};

  if (caption !== undefined) data.caption = caption;
  if (location !== undefined) data.location = location;

  try {
    const post = await postsService.updatePost(id, data);
    return res.json(post);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({error: 'Post not found'});
    }
    throw err;
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({error: 'Post not found'});
    }
    throw err;
  }
}

async function getUserPosts(req, res) {
  const userId = Number(req.params.id);

  const parsed = parsePagination(req.query);
  if (parsed.error) {
    return res.status(400).json({error: parsed.error});
  }

  const user = await usersService.getUserById(userId);
  if (!user) {
    return res.status(404).json({error: 'User not found'});
  }

  const result = await postsService.getPostsByUser(userId, parsed);
  return res.json(result);
}

async function getLikedPosts(req, res) {
  const userId = Number(req.params.id);

  const parsed = parsePagination(req.query);
  if (parsed.error) {
    return res.status(400).json({error: parsed.error});
  }

  const user = await usersService.getUserById(userId);
  if (!user) {
    return res.status(404).json({error: 'User not found'});
  }

  const result = await postsService.getLikedPosts(userId, parsed);
  return res.json(result);
}

module.exports = {create, list, getOne, update, remove, getUserPosts, getLikedPosts};

