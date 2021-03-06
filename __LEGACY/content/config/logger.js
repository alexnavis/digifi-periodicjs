/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2015 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var winston = require('winston'),
	logger,
	winstonLogger,
	path = require('path'),
	fs = require('fs-extra'),
	loggerConfig={};

/**
 * A module that represents a logger.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2015 Typesettin. All rights reserved.
 * @license MIT
 * @module config
 * @requires module:winston
 * @todo to do later
 */
var logger = function(env){
	var d = new Date(),
		fileNamePathAddition = env+'-'+d.getUTCFullYear()+'.'+(d.getUTCMonth()+1)+'.'+d.getUTCDay();
	
	fs.ensureDirSync(path.join(__dirname, '../../logs'));

	if(env === 'production'){
		loggerConfig = {
			transports:[
				new (winston.transports.Console)({level:'error',colorize: 'true'}),
				new (winston.transports.File)({ filename: path.join(__dirname, '../../logs/'+fileNamePathAddition+'.app.log'),level:'error'})
			],
			exceptionHandlers:[
				new (winston.transports.Console)({colorize: 'true'}),
				new (winston.transports.File)({ filename: path.join(__dirname, '../../logs/'+fileNamePathAddition+'.exception-errors.log')})
			],
			handleExceptions: true
		};
	}
	else{
		loggerConfig = {
			transports:[
				new (winston.transports.Console)({colorize: 'true',level:'silly',prettyPrint:true, timestamp:true}),
				new (winston.transports.File)({ filename: path.join(__dirname, '../../logs/'+fileNamePathAddition+'.app.log')})
			],
			exceptionHandlers:[
				new (winston.transports.Console)({colorize: 'true',json:'true',prettyPrint:true, timestamp:true}),
				new (winston.transports.File)({ filename: path.join(__dirname, '../../logs/'+fileNamePathAddition+'.exception-errors.log')})
			],
			handleExceptions: true
		};
	}

	winstonLogger = new (winston.Logger)(loggerConfig);
	winstonLogger.exitOnError = false;
	return winstonLogger;
};

module.exports = logger;