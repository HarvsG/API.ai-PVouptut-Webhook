'use strict';
//a version from scratch built using Actions on Google Client Library

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const FETCH_INFO = 'fetch.info';


// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

// API.AI Contexts/lifespans
const SOLAR = 'solar';
const INFORMATION_GIVEN = 'information-given'
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

const PVoutputParameter = {
  // consider adding more like 'peak'
  POWER: 'power',
  ENERGY: 'energy',
  EFFICIENCY: 'efficiency'
};
