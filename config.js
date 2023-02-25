// https://stackoverflow.com/questions/42109813/node-js-environment-variables-and-heroku-deployment

import { config } from 'dotenv';
import lodash from 'lodash';
const { each } = lodash;

const result = config();

let envs;

if (!('error' in result)) {
    envs = result.parsed;
} else {
    envs = {};
    each(process.env, (value, key) => envs[key] = value);
}

export default envs;