'use strict';
const PathRegExp = require('path-to-regexp');
const Promisie = require('promisie');
const ROUTE_MAP = new Map();

const transformRequest = (type,tranforms) => (req, res, next) => {
  let transformsObj = tranforms || this.tranforms;
  let transformType = (type === 'pre') ? transformsObj.pre : transformsObj.post;
  let transformsFilters = (transformType[ req.method ])
    ? findMatchingRoute(transformType[ req.method ], req._parsedOriginalUrl.pathname)
    : false;
  if (transformsFilters && transformsFilters.length > 0) {
    Promisie.pipe(transformType[req.method][transformsFilters])(req)
      .then(newreq => {
        if (!req.sentResponse) {
          req = newreq;
          next();
        }
      })
      .catch((err)=> {
        if (req.error) {
          res.status(500).send({
            result: 'error',
            data: {
              error: req.error,
            },            
          });
        } else {
          next(err);
        }
      });
  } else{
    next();
  }
};

const getParameterized = function (route) {
  if (ROUTE_MAP.has(route)) return ROUTE_MAP.get(route);
  else {
    let keys = [];
    let result = new PathRegExp(route, keys);
    ROUTE_MAP.set(route, {
      re: result,
      keys,
    });
    return { keys, re: result, };
  }
};

const findMatchingRoute = function (routes, location) {
  let matching;
  location = (/\?[^\s]+$/.test(location)) ? location.replace(/^([^\s\?]+)\?[^\s]+$/, '$1') : location;
  Object.keys(routes).forEach(key => {
    let result = getParameterized(key);
    if (result.re.test(location) && !matching) matching = key;
  });
  return matching;
};

module.exports = {
  transformRequest,
  getParameterized,
  findMatchingRoute,
  // posttransform: transformRequest('post'),
  // pretransform: transformRequest('pre'),
};