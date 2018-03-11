const appName1 = 'app1', appName2 = 'busWatcherApp';

var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
		template:  './public/js/reactApps/' +  appName1 + '/index.html',
		filename: 'index.html',
		inject: 'body'
});

module.exports = {
	entry: __dirname + '\\public\\js\\reactApps\\'+ appName1 +'\\indexApp.js',
	module : {
		loaders: [
			{
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	},
	output:{
		filename: 'indexAppTransformed.js',
		path: __dirname + '/public/js/transformedApps/' + appName1
	},
	plugins: [HTMLWebpackPluginConfig]
};