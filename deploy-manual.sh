#!/bin/bash

# Manual GitHub Pages Deployment Script
# This script manually creates and pushes the gh-pages branch

echo "🚀 Starting manual GitHub Pages deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

# Create or reset gh-pages branch
echo "🔧 Setting up gh-pages branch..."
git checkout --orphan gh-pages 2>/dev/null || git checkout gh-pages

# Remove all files
git rm -rf .

# Copy only the build files
echo "📁 Copying build files..."
cp -r frontend/build/* .
cp frontend/public/404.html . 2>/dev/null || echo "404.html not found, continuing..."

# Add all files
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages"

# Push to origin
echo "🚀 Pushing to GitHub..."
git push origin gh-pages --force

# Go back to main branch
echo "🔄 Switching back to main branch..."
git checkout main

echo "✅ Manual deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings → Pages"
echo "3. Select 'Deploy from a branch'"
echo "4. Choose 'gh-pages' branch and '/(root)' folder"
echo "5. Click Save"
echo ""
echo "Your dashboard will be available at:"
echo "https://balajiregt.github.io/local-dashboard-platform"
