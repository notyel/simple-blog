const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');

// Configurar marked con highlight.js para resaltar código
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// Ruta a la carpeta de posts
const POSTS_DIR = path.join(__dirname, '../../posts');

/**
 * Obtiene la lista de todos los posts con sus metadatos
 */
exports.getAllPosts = async () => {
  try {
    // Leer todos los archivos .md en la carpeta de posts
    const files = await fs.readdir(POSTS_DIR);
    const markdownFiles = files.filter(file => path.extname(file) === '.md');
    
    // Procesar cada archivo para extraer metadatos
    const postsPromises = markdownFiles.map(async (filename) => {
      const filePath = path.join(POSTS_DIR, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      // Extraer frontmatter (metadatos) con gray-matter
      const { data } = matter(fileContent);
      
      // Crear slug a partir del nombre del archivo
      const slug = filename.replace('.md', '');
      
      return {
        ...data,
        slug,
        date: new Date(data.date)
      };
    });
    
    // Esperar a que se procesen todos los archivos
    let posts = await Promise.all(postsPromises);
    
    // Ordenar posts por fecha (más recientes primero)
    posts = posts.sort((a, b) => b.date - a.date);
    
    return posts;
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    throw error;
  }
};

/**
 * Obtiene un post específico por su slug
 */
exports.getPostBySlug = async (slug) => {
  try {
    // Construir la ruta al archivo basado en el slug
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    
    // Leer el contenido del archivo
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Extraer frontmatter y contenido con gray-matter
    const { data, content } = matter(fileContent);
    
    // Convertir el contenido Markdown a HTML usando marked
    const htmlContent = marked(content);
    
    return {
      ...data,
      slug,
      date: new Date(data.date),
      content: htmlContent
    };
  } catch (error) {
    // Si el archivo no existe, retornar null
    if (error.code === 'ENOENT') {
      return null;
    }
    
    console.error(`Error al obtener el post con slug ${slug}:`, error);
    throw error;
  }
};