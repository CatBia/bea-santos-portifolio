# Beatriz Santos - Portfolio

A modern, single-page portfolio website showcasing Lead Architecture and Backend Development projects.

## 🚀 Features

- **Modern Design**: Beautiful gradient background with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Interactive**: Smooth scroll animations and hover effects
- **GitHub Pages Ready**: Easy to deploy to GitHub Pages

## 📋 Projects

### Lead Architecture Projects
1. Microservices Architecture Migration
2. Multi-Cloud Infrastructure Design
3. Security-First Architecture
4. Event-Driven Architecture Platform
5. CI/CD Pipeline Architecture
6. Global CDN & Edge Computing

### Backend Lead Developer Projects
1. High-Performance API Gateway
2. Distributed Database System
3. Real-Time Data Processing Engine
4. Search & Recommendation Engine
5. GraphQL API Platform
6. Authentication & Authorization Service

## 🛠️ Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- JavaScript (ES6+)
- Google Fonts (Inter)

## 📦 Deployment to GitHub Pages

This portfolio is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin master
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - The workflow will automatically deploy your site

3. **Access your site**
   - Your site will be available at: `https://[your-username].github.io/[repository-name]`
   - For example: `https://beatrizsantos.github.io/bea-santos-portfolio`

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Deploy your site whenever you push to the `master` or `main` branch
- Build and deploy the static files
- Make your site available on GitHub Pages

### Manual Deployment

You can also manually trigger a deployment:
- Go to **Actions** tab in your repository
- Select **Deploy to GitHub Pages** workflow
- Click **Run workflow**

### Local Development

To view the site locally, simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then visit http://localhost:8000
```