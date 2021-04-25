const { withKeystone } = require('@keystone-next/keystone/next');

module.exports = withKeystone({
  // Target must be serverless
  target: 'serverless',
});
