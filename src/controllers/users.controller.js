const usersService = require('../services/users.service');
const {parsePagination} = require('../utils/pagination');

async function create(req, res) {
  const {username, email, fullname, bio} = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({error: 'username, email and fullname are required'});
  }

  try {
    const user = await usersService.createUser({username, email, fullname, bio});
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({error: 'username or email already taken'});
    }
    throw err;
  }
}

async function list(req, res) {
  const parsed = parsePagination(req.query);
  if (parsed.error) {
    return res.status(400).json({error: parsed.error});
  }
  const {page, limit} = parsed;

  const allowedSort = ['createdAt', 'username', 'fullname'];
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  if (!allowedSort.includes(sortBy)) {
    return res.status(400).json({error: 'sortBy must be one of: createdAt, username, fullname'});
  }
  if (order !== 'asc' && order !== 'desc') {
    return res.status(400).json({error: 'order must be asc or desc'});
  }

  // build where clause
  const where = {};

  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate !== 'true' && req.query.isPrivate !== 'false') {
      return res.status(400).json({error: 'isPrivate must be true or false'});
    }
    where.isPrivate = req.query.isPrivate === 'true';
  }

  if (req.query.search) {
    where.OR = [
      {username: {contains: req.query.search, mode: 'insensitive'}},
      {fullname: {contains: req.query.search, mode: 'insensitive'}},
    ];
  }

  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts !== 'true' && req.query.hasPosts !== 'false') {
      return res.status(400).json({error: 'hasPosts must be true or false'});
    }
    if (req.query.hasPosts === 'true') {
      where.posts = {some: {}};
    } else {
      where.posts = {none: {}};
    }
  }

  const result = await usersService.listUsers({page, limit, sortBy, order, where});
  return res.json(result);
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  const user = await usersService.getUserById(id);

  if (!user) {
    return res.status(404).json({error: 'User not found'});
  }
  return res.json(user);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const {fullname, bio, isPrivate} = req.body;
  const data = {};

  if (fullname !== undefined) data.fullname = fullname;
  if (bio !== undefined) data.bio = bio;
  if (isPrivate !== undefined) data.isPrivate = isPrivate;

  try {
    const user = await usersService.updateUser(id, data);
    return res.json(user);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({error: 'User not found'});
    }
    throw err;
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({error: 'User not found'});
    }
    throw err;
  }
}

module.exports = {create, list, getOne, update, remove};

