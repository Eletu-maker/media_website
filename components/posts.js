"use client";

import { useOptimistic } from 'react';

import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { togglePostLikeStatus } from '@/actions/posts-vercel';

function Post({ post, action }) {
  // Add safety checks for post data
  if (!post) {
    return <div className="post">Invalid post data</div>;
  }
  
  return (
    <article className="post">
      <div className="post-image">
        <img 
          src={post.image || '/sample-post1.jpg'} 
          alt={post.title || 'Untitled post'} 
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title || 'Untitled Post'}</h2>
            <p>
              Shared by {post.userFirstName || 'Unknown'} {post.userLastName || 'User'} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action ? action.bind(null, post.id) : undefined}
              className={post.isLiked ? 'liked' : ''}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content || 'No content available'}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostId) => {
    // Add safety checks
    if (!prevPosts || !Array.isArray(prevPosts)) {
      return [];
    }
    
    const updatedPostIndex = prevPosts.findIndex(post => post && post.id === updatedPostId);

    if (updatedPostIndex === -1) {
      return prevPosts;
    }

    const updatedPost = { ...prevPosts[updatedPostIndex] };
    updatedPost.likes = (updatedPost.likes || 0) + (updatedPost.isLiked ? -1 : 1);
    updatedPost.isLiked = !updatedPost.isLiked;
    const newPosts = [...prevPosts];
    newPosts[updatedPostIndex] = updatedPost;
    return newPosts;
  });

  // Add safety checks for posts data
  if (!optimisticPosts || !Array.isArray(optimisticPosts) || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    try {
      await togglePostLikeStatus(postId);
    } catch (error) {
      console.error('Failed to toggle post like status:', error);
      // In a real app, you might want to show an error message to the user
    }
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post && post.id ? post.id : `post-${Math.random()}`}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}