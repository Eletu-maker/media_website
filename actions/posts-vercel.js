'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { storePost, updatePostLikeStatus } from '@/lib/posts-vercel';
import { uploadImage } from '@/lib/cloudinary';

export async function createPost(prevState, formData) {
  try {
    const title = formData.get('title');
    const image = formData.get('image');
    const content = formData.get('content');

    let errors = [];

    if (!title || title.trim().length === 0) {
      errors.push('Title is required.');
    }

    if (!content || content.trim().length === 0) {
      errors.push('Content is required.');
    }

    if (!image || image.size === 0) {
      errors.push('Image is required.');
    }

    if (errors.length > 0) {
      return { errors };
    }

    let imageUrl;

    try {
      imageUrl = await uploadImage(image);
    } catch (error) {
      console.error('Image upload error:', error);
      return { errors: ['Image upload failed, post was not created. Please try again later.'] };
    }

    try {
      await storePost({
        imageUrl: imageUrl,
        title,
        content,
        userId: 1,
      });
    } catch (error) {
      console.error('Store post error:', error);
      return { errors: ['Failed to save post. Please try again later.'] };
    }

    revalidatePath('/', 'layout');
    redirect('/feed');
  } catch (error) {
    console.error('Unexpected error in createPost:', error);
    return { errors: ['An unexpected error occurred. Please try again later.'] };
  }
}

export async function togglePostLikeStatus(postId) {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }
    
    await updatePostLikeStatus(postId, 2);
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Toggle like error:', error);
    // We're not returning anything here as this is typically used in an action
    // and we want to avoid exposing errors to the client in production
  }
}