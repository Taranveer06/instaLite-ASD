const express = require('express');
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');
const postsController = require('./controllers/posts.controller');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({status: 'OK'});
});

app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// nested user routes
app.get('/users/:id/posts', postsController.getUserPosts);
app.get('/users/:id/liked-posts', postsController.getLikedPosts);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

