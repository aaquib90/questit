/**
 * Analyzes the fetched code to understand its structure and functionality
 * @param {Object} repoCode - Object containing the fetched code
 * @returns {Promise<Object>} - Analysis of the code
 */

export async function analyzeCode(repoCode) {
  try {
    const analysis = {
      language: detectPrimaryLanguage(repoCode.files),
      components: [],
      dependencies: [],
      entryPoints: [],
      apis: [],
      complexity: assessComplexity(repoCode.files),
      fileTypes: countFileTypes(repoCode.files)
    };

    // Identify potential entry points
    Object.entries(repoCode.files).forEach(([path, content]) => {
      if (path.includes('index.') || path.includes('main.') || path.includes('app.')) {
        analysis.entryPoints.push(path);
      }

      // Detect components (simplified)
      if (
        (path.includes('/components/') || path.includes('Component')) &&
        (path.endsWith('.js') || path.endsWith('.jsx') || path.endsWith('.vue') || path.endsWith('.tsx'))
      ) {
        analysis.components.push(path);
      }

      // Detect dependencies from package.json
      if (path.includes('package.json')) {
        try {
          const pkg = JSON.parse(content);
          if (pkg.dependencies) {
            analysis.dependencies = [
              ...analysis.dependencies,
              ...Object.keys(pkg.dependencies)
            ];
          }
          if (pkg.devDependencies) {
            analysis.dependencies = [
              ...analysis.dependencies,
              ...Object.keys(pkg.devDependencies)
            ];
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      // Detect API endpoints (simplified)
      if (content.includes('fetch(') || content.includes('axios.') || content.includes('http.') || content.includes('api/')) {
        const apiMatches = content.match(/(https?:\/\/[^\s'"]+)/g) || [];
        analysis.apis = [...analysis.apis, ...apiMatches];
      }
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing code:', error);
    return {
      language: 'unknown',
      components: [],
      dependencies: [],
      entryPoints: [],
      apis: [],
      complexity: 'unknown',
      fileTypes: {}
    };
  }
}

/**
 * Detects the primary programming language used in the code
 * @param {Object} files - Files from the repository
 * @returns {string} - Primary language
 */
function detectPrimaryLanguage(files) {
  const fileTypes = countFileTypes(files);

  // Determine primary language based on file extensions
  const sortedTypes = Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1]);

  if (sortedTypes.length === 0) return 'unknown';

  const extensionToLanguage = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'html': 'HTML',
    'css': 'CSS',
    'jsx': 'React',
    'tsx': 'React with TypeScript',
    'vue': 'Vue.js',
    'rb': 'Ruby',
    'php': 'PHP',
    'java': 'Java',
    'go': 'Go',
    'rs': 'Rust'
  };

  const primaryExt = sortedTypes[0][0];
  return extensionToLanguage[primaryExt] || primaryExt;
}

/**
 * Counts the different file types in the repository
 * @param {Object} files - Files from the repository
 * @returns {Object} - Count of each file type
 */
function countFileTypes(files) {
  const fileTypes = {};

  Object.keys(files).forEach(path => {
    const extension = path.split('.').pop();
    fileTypes[extension] = (fileTypes[extension] || 0) + 1;
  });

  return fileTypes;
}

/**
 * Assesses the complexity of the code
 * @param {Object} files - Files from the repository
 * @returns {string} - Complexity assessment: 'simple', 'moderate', or 'complex'
 */
function assessComplexity(files) {
  const totalFiles = Object.keys(files).length;
  const totalLines = Object.values(files).reduce((acc, content) => {
    return acc + (content ? content.split('\n').length : 0);
  }, 0);

  if (totalFiles <= 5 && totalLines <= 500) {
    return 'simple';
  } else if (totalFiles <= 20 && totalLines <= 3000) {
    return 'moderate';
  } else {
    return 'complex';
  }
}

export default { analyzeCode };

