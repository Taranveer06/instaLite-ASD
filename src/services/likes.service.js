const prisma = require('../db');

async function likePost(userId, postId) {
  return prisma.like.create({
    data: {userId, postId},
  });
}

async function unlikePost(userId, postId) {
  return prisma.like.delete({
    where: {userId_postId: {userId, postId}},
  });
}

async function getPostLikes(postId) {
  return prisma.user.findMany({
    where: {likes: {some: {postId}}},
    select: {id: true, username: true, fullname: true},
    orderBy: {username: 'asc'},
  });
}

module.exports = {likePost, unlikePost, getPostLikes};

