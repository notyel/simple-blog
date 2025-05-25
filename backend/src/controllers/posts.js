const postsService = require('../services/posts');

/**
 * Controlador para obtener todos los posts (solo metadatos)
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await postsService.getAllPosts();
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener un post específico por su slug
 */
exports.getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await postsService.getPostBySlug(slug);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún post con el slug: ${slug}`
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};