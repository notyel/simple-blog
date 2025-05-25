const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');

// Obtener todos los posts (metadatos)
router.get('/posts', postsController.getAllPosts);

// Obtener un post específico por su slug
router.get('/posts/:slug', postsController.getPostBySlug);

module.exports = router;