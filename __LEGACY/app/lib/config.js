/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
	extend = require('util-extend'),
	path = require('path'),
	argv = require('optimist').argv;
/**
 * A module that loads configurations for express and periodic.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module config
 * @requires module:fs
 * @requires module:util-extent
 * @requires module:optimist
 * @throws {Error} If missing configuration files
 * @todo to do later
 */
var config = function (periodicConfigOptions={}) {
	var appEnvironment = argv.e,
		appPort = (periodicConfigOptions && periodicConfigOptions.port) ? periodicConfigOptions.port : argv.p,
		packagejsonFileJSON,
		configurationFile,
		configurationOverrideFile = periodicConfigOptions.configurationOverrideFile || path.join(path.resolve(__dirname, '../../content/config/'), 'config.json'),
		configurationDefaultFile,
		configurationFileJSON,
		configurationOverrideFileJSON,
		configurationDefaultFileJSON,
		lastRuntimeEnvironment,
		lastRuntimeEnvironmentFilePath = periodicConfigOptions.lastRuntimeEnvironmentFilePath || path.resolve(__dirname, '../../content/config/process/runtime.json'),
		config = {};

	/** 
	 * gets the configuration information
	 * @return { object } current instance configuration
	 */
	this.settings = function () {
		return config;
	};

	/** 
	 * augments the configuration information
	 * @augments {object} appends instance configuration
	 * @param {string} name name of new configuration setting
	 * @param {value} value value of new configuration setting
	 */
	this.setConfig = function (name, value) {
		this[name] = value;
	}.bind(this);


	/** 
	 * augments the configuration information
	 * @augments {object} appends instance configuration
	 * @param {string} name name of new configuration setting
	 * @param {value} value value of new configuration setting
	 */
	this.setSetting = function (name, value) {
		config[name] = value;
	}.bind(this);

	/** 
	 * generate file path for config files
	 * @return { string } file path for config file
	 */
	this.getConfigFilePath = function (config) {
		var directory = periodicConfigOptions.configurationDefaultFileDIRECTORY ||  path.resolve(__dirname, '../../content/config/environment/'),
			file = config + '.json';
		return path.join(directory, file);
	};

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 * @this {object} configuration instance
	 */
	this.init = function () {
		/** get info from package.json */
		packagejsonFileJSON =  periodicConfigOptions.packagejsonFileJSON || fs.readJSONSync(path.resolve(__dirname, '../../package.json'));
		/** get info from last runtime environemnt */
		if(fs.existsSync(lastRuntimeEnvironmentFilePath)){
			var runtimeJSON = fs.readJSONSync(lastRuntimeEnvironmentFilePath, {throws: false});
			if(runtimeJSON){
				lastRuntimeEnvironment = runtimeJSON.environment;
			}
		}

		/** load user config file: content/config/config.json */
		configurationOverrideFileJSON = fs.readJSONSync(configurationOverrideFile);

		/** set path of default config: content/config/environment/default.json */
		configurationDefaultFile = this.getConfigFilePath('default');
		configurationDefaultFileJSON = fs.readJSONSync(configurationDefaultFile);

		/** if no command line argument, use environment from user config file */
		if (process.env.NODE_ENV) {
			appEnvironment = process.env.NODE_ENV;
		}
		else if(periodicConfigOptions && periodicConfigOptions.env){
			appEnvironment = periodicConfigOptions.env;
		}
		else if(argv.e){
			appEnvironment = argv.e;
		}
		else if(lastRuntimeEnvironment){
			appEnvironment = lastRuntimeEnvironment;
		}
		else if(typeof configurationOverrideFileJSON.application !== 'undefined' && typeof configurationOverrideFileJSON.application.environment !== 'undefined'){
			appEnvironment = configurationOverrideFileJSON.application.environment;
		}
		else {
			appEnvironment = 'development';
		}

		//** save last runtime environment to load as a backup */
		fs.outputJson(periodicConfigOptions.last_runtime_path || path.resolve(__dirname,'../../content/config/process/runtime.json'),{environment:appEnvironment},function(err){
			if(err){
				console.error(err);
			}
		});

		/** set & load file path for base environment config */
		configurationFile = this.getConfigFilePath(appEnvironment);

		/** override environment data with user config */
		config = extend(config, configurationDefaultFileJSON);
		if (fs.existsSync(configurationFile)) {
			configurationFileJSON = fs.readJSONSync(configurationFile);
			config = extend(config, configurationFileJSON);
		}
		config = extend(config, configurationOverrideFileJSON);
		config.version = packagejsonFileJSON.version;

		/** override port with command line argument */
		config.application.port = (appPort) ? appPort : config.application.port;

		/** if theme is set in configuration, set filepath */
		if (config.theme) {
			config.themepath = (periodicConfigOptions.themepath_root) ? path.join(periodicConfigOptions.themepath_app_root, 'content/themes', config.theme) : path.join(__dirname, '../../content/themes', config.theme);
		}

		if(config.debug){
			console.log('saved runtime environment',appEnvironment);
		}
	}.bind(this);

	this.init();
};

module.exports = config;
