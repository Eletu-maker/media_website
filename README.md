# Next.js Posts Application

A social media-like application built with Next.js that allows users to create and browse posts.

## Features

- Create new posts with images and content
- Browse all posts in a feed
- Like/unlike posts
- Responsive design

## Tech Stack

- Next.js 14.1.0 (App Router)
- React 18
- File-based storage (JSON) for Vercel compatibility
- Cloudinary for image hosting

## Deployment to Vercel

1. Push this code to a GitHub repository
2. Sign up/in to Vercel
3. Click "New Project" and select your repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
5. Add environment variables:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
6. Deploy!

## Environment Variables

For the application to work properly, you need to set the following environment variables in your Vercel project settings:

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Vercel Deployment Notes

This application includes Vercel-specific configurations:

1. `vercel.json` - Configures the build process for Next.js
2. `lib/posts-vercel.js` - Uses file-based JSON storage instead of SQLite for Vercel compatibility
3. `actions/posts-vercel.js` - Server actions that work with the file-based storage

The application will automatically use the file-based storage when deployed to Vercel, while maintaining SQLite functionality for local development.