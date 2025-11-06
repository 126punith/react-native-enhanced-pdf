/**
 * Test Data - Sample PDFs and Test Scenarios
 * Provides various test cases for Pro feature validation
 */

export const SamplePDFs = {
  SMALL: {
    name: 'React Native Book Sample',
    uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf',
    cache: true,
    description: 'Small PDF for quick testing',
    expectedPages: 10,
  },
  MEDIUM: {
    name: 'Lorem Ipsum Document',
    uri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cache: true,
    description: 'Medium-sized PDF',
    expectedPages: 1,
  },
  LARGE: {
    name: 'JavaScript Guide',
    uri: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
    cache: true,
    description: 'Large PDF for performance testing',
    expectedPages: 472,
  },
};

export const TestScenarios = {
  BOOKMARKS: {
    name: 'Test Bookmarks',
    steps: [
      'Open PDF',
      'Navigate to page 3',
      'Create bookmark with Red color',
      'Add notes to bookmark',
      'Navigate to page 5',
      'Create bookmark with Blue color',
      'Open bookmark sidebar',
      'Tap bookmark to jump to page',
    ],
  },
  EXPORT: {
    name: 'Test Export',
    steps: [
      'Open PDF',
      'Navigate to page 1',
      'Tap Export icon',
      'Choose PNG format',
      'Verify export success',
      'Try JPEG export',
      'Test batch export',
    ],
  },
  OPERATIONS: {
    name: 'Test PDF Operations',
    steps: [
      'Open PDF',
      'Tap Operations icon',
      'Test Split (pages 1-2)',
      'Test Extract (pages 1,3,5)',
      'Verify output files',
    ],
  },
  ANALYTICS: {
    name: 'Test Analytics',
    steps: [
      'Open PDF',
      'Navigate through 5 pages',
      'Wait 30 seconds',
      'Open Analytics panel',
      'Verify time tracking',
      'Check reading speed',
    ],
  },
};

export const SampleBookmarks = [
  {
    page: 1,
    name: 'Introduction',
    color: '#FF6B6B',
    notes: 'Start of the document',
  },
  {
    page: 5,
    name: 'Important Section',
    color: '#4ECDC4',
    notes: 'Key information here',
  },
  {
    page: 10,
    name: 'Summary',
    color: '#95E1D3',
    notes: 'Conclusion and takeaways',
  },
];

export default {
  SamplePDFs,
  TestScenarios,
  SampleBookmarks,
};








