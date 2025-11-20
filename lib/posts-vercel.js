import fs from 'fs/promises';
import path from 'path';

// Simple file-based storage for Vercel compatibility
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize with sample data if file doesn't exist
async function initializeData() {
  await ensureDataDirectory();
  
  try {
    await fs.access(DATA_FILE);
  } catch {
    // File doesn't exist, create with sample data
    const sampleData = {
      users: [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 2, first_name: 'Max', last_name: 'Schwarz', email: 'max@example.com' }
      ],
      posts: [
        {
          id: 1,
          image_url: '/sample-post1.jpg',
          title: 'Sample Post 1',
          content: 'This is a sample post content for demonstration purposes.',
          created_at: new Date().toISOString(),
          user_id: 1,
          likes: 5
        },
        {
          id: 2,
          image_url: '/sample-post2.jpg',
          title: 'Sample Post 2',
          content: 'Another sample post to show how the application works.',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user_id: 2,
          likes: 3
        }
      ],
      likes: [
        { user_id: 2, post_id: 1 },
        { user_id: 2, post_id: 2 }
      ]
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(sampleData, null, 2));
  }
}

// Read data from file
async function readData() {
  await initializeData();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Ensure data structure is valid
    if (!parsedData.users || !parsedData.posts || !parsedData.likes) {
      throw new Error('Invalid data structure in posts.json');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error reading data file:', error);
    // Return default structure if there's an error
    return {
      users: [],
      posts: [],
      likes: []
    };
  }
}

// Write data to file
async function writeData(data) {
  await ensureDataDirectory();
  try {
    // Validate data structure before writing
    if (!data.users || !data.posts || !data.likes) {
      throw new Error('Invalid data structure');
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
    throw new Error('Failed to save data');
  }
}

export async function getPosts(maxNumber) {
  try {
    const data = await readData();
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let posts = data.posts.map(post => {
      // Add safety checks for post data
      if (!post) return null;
      
      const user = data.users.find(u => u && u.id === post.user_id);
      const likes = data.likes.filter(l => l && l.post_id === post.id).length;
      const isLiked = data.likes.some(l => l && l.post_id === post.id && l.user_id === 2);
      
      return {
        id: post.id || null,
        image: post.image_url || '/sample-post1.jpg',
        title: post.title || 'Untitled Post',
        content: post.content || 'No content available',
        createdAt: post.created_at || new Date().toISOString(),
        userFirstName: (user && user.first_name) || 'Unknown',
        userLastName: (user && user.last_name) || 'User',
        likes: likes || 0,
        isLiked: isLiked || false
      };
    }).filter(post => post !== null); // Remove any null posts
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit if requested
    if (maxNumber) {
      posts = posts.slice(0, maxNumber);
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return []; // Return empty array on error
  }
}

export async function storePost(post) {
  try {
    const data = await readData();
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Validate required post data
    if (!post || !post.imageUrl || !post.title || !post.content) {
      throw new Error('Missing required post data');
    }
    
    // Generate new ID
    const newId = Math.max(...data.posts.map(p => p.id || 0), 0) + 1;
    
    // Create new post
    const newPost = {
      id: newId,
      image_url: post.imageUrl,
      title: post.title,
      content: post.content,
      created_at: new Date().toISOString(),
      user_id: post.userId || 1
    };
    
    // Add to posts
    data.posts.push(newPost);
    
    // Save data
    await writeData(data);
    
    return newPost;
  } catch (error) {
    console.error('Error storing post:', error);
    throw new Error('Failed to save post');
  }
}

export async function updatePostLikeStatus(postId, userId) {
  try {
    const data = await readData();
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Validate inputs
    if (!postId || !userId) {
      throw new Error('Missing postId or userId');
    }
    
    // Check if like exists
    const likeIndex = data.likes.findIndex(l => l && l.user_id === userId && l.post_id === postId);
    
    if (likeIndex === -1) {
      // Add like
      data.likes.push({ user_id: userId, post_id: postId });
    } else {
      // Remove like
      data.likes.splice(likeIndex, 1);
    }
    
    // Save data
    await writeData(data);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating post like status:', error);
    throw new Error('Failed to update like status');
  }
}