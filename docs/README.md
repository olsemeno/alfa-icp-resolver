# Alfa ICP Resolver Documentation

This directory contains the documentation for the Alfa ICP Resolver project, a cross-chain atomic swap solution between Ethereum and Internet Computer Protocol (ICP).

## 📚 Documentation Structure

- **Overview** (`index.html`) - Main project overview and architecture
- **Ethereum** (`ethereum.html`) - Ethereum smart contracts documentation
- **ICP** (`icp.html`) - Internet Computer canisters documentation
- **Frontend** (`frontend.html`) - React web interface documentation
- **Resolver** (`resolver.html`) - Cross-chain coordination service

## 🚀 Local Development

### Prerequisites
- Python 3.x or Node.js
- Web browser

### Running Locally

**Option 1: Python HTTP Server**
```bash
cd docs
python3 -m http.server 8000
# Open http://localhost:8000
```

**Option 2: Node.js HTTP Server**
```bash
cd docs
npx http-server -p 8000
# Open http://localhost:8000
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

## 🌐 GitHub Pages Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Deployment URL
```
https://your-username.github.io/alfa-icp-resolver/
```

### Manual Deployment
1. Push changes to main branch
2. GitHub Actions will automatically build and deploy
3. Check the Actions tab for deployment status

## 📝 Contributing

To update the documentation:

1. **Edit HTML files** in the `docs/` directory
2. **Test locally** using one of the methods above
3. **Commit and push** changes to main branch
4. **GitHub Actions** will automatically deploy

### File Structure
```
docs/
├── index.html          # Main overview page
├── ethereum.html       # Ethereum contracts docs
├── icp.html           # ICP canisters docs
├── frontend.html      # Frontend interface docs
├── resolver.html      # Cross-chain resolver docs
├── _config.yml        # GitHub Pages config
└── README.md          # This file
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Bootstrap 5
- **JavaScript** - Interactive features
- **Bootstrap 5** - Responsive framework
- **Font Awesome** - Icons
- **Prism.js** - Syntax highlighting

## 📋 Features

- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Clean, professional appearance
- ✅ **Interactive Navigation** - Easy navigation between sections
- ✅ **Code Highlighting** - Syntax highlighting for code examples
- ✅ **Search Engine Optimized** - SEO-friendly structure
- ✅ **Fast Loading** - Optimized for performance

## 🔧 Customization

### Adding New Pages
1. Create new HTML file in `docs/` directory
2. Follow the same structure as existing pages
3. Update navigation in all pages
4. Test locally before pushing

### Styling
- Main styles are in `<style>` tags in each HTML file
- Bootstrap 5 classes for responsive design
- Custom CSS for project-specific styling

### Content Updates
- Update content directly in HTML files
- Ensure all links work correctly
- Test navigation between pages
- Validate HTML structure

## 📞 Support

For documentation issues or questions:
- Create an issue in the repository
- Check the GitHub Actions logs for deployment issues
- Test locally before reporting problems

---

**Last Updated:** August 2025  
**Version:** 1.0.0 