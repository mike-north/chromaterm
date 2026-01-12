module.exports = {
  sortFirst: ['name', 'version', 'description', 'type', 'engines', 'exports'],
  versionGroups: [
    {
      label: 'Use workspace version for internal packages',
      dependencies: ['$LOCAL'],
      dependencyTypes: ['dev', 'prod'],
      pinVersion: 'workspace:*',
    },
  ],
  semverGroups: [
    {
      label: 'Use caret ranges for production dependencies',
      dependencyTypes: ['prod'],
      range: '^',
    },
    {
      label: 'Use caret ranges for dev dependencies',
      dependencyTypes: ['dev'],
      range: '^',
    },
  ],
};
