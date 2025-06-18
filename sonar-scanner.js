// sonar-scanner.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sonarqubeScanner = require('sonarqube-scanner');

// Ensure this script can access environment variables or use defaults
const sonarServerUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';
const sonarToken = process.env.SONAR_TOKEN || ''; // Token is often required

sonarqubeScanner(
  {
    serverUrl: sonarServerUrl,
    token: sonarToken,
    options: {
      'sonar.projectKey': process.env.SONAR_PROJECT_KEY || 'jobboardly',
      'sonar.projectName': process.env.SONAR_PROJECT_NAME || 'JobBoardly',
      'sonar.projectVersion': process.env.npm_package_version, // Uses version from package.json
      'sonar.sources': 'src',
      'sonar.tests': 'src', // Assuming tests are co-located or within src folders
      'sonar.test.inclusions': '**/*.test.tsx,**/*.test.ts', // Pattern to find test files
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info', // Path to LCOV coverage report
      'sonar.exclusions': [
        // Standard exclusions
        '**/node_modules/**',
        '**/.next/**',
        '**/out/**',
        '**/build/**',
        '**/coverage/**',
        // Config files
        '*.config.js',
        '*.config.ts',
        'jest.setup.js',
        'sonar-scanner.js',
        '.eslintrc.json',
        // Generated or UI library code that might not be directly unit tested
        'src/components/ui/**',
        'src/types/**/*.d.ts', // TypeScript definition files
        'src/ai/**/*', // Genkit flows may be harder to unit test extensively
        'src/lib/firebase.ts', // External service interaction
      ].join(','),
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => {
    console.log('SonarQube analysis complete.');
    process.exit();
  }
).catch((err) => {
  console.error('Error during SonarQube scan:', err);
  process.exit(1);
});
