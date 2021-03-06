//
// Copyright (c) Microsoft.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

/*eslint no-console: ["error", { allow: ["log"] }] */

'use strict';

import moment from 'moment';

// Kill bit if this takes more than 90 minutes
setTimeout(() => {
  console.log('Kill bit at 90m');
  process.exit(0);
}, 1000 * 60 * 90);

process.env.DEBUG = 'restapi';

const started = moment().utc();
const startedString = started.format();

const painlessConfigResolver = require('painless-config-resolver')();

painlessConfigResolver.resolve((configurationError, config) => {
  if (configurationError) {
    throw configurationError;
  }
  require('./task')(config);
});
