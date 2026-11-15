'use strict';

const GroupManager = require('./lib/group-manager');

module.exports = GroupManager;
module.exports.createGroupManager = (api, options) => new GroupManager(api, options);
