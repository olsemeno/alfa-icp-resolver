module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Увеличиваем память для TypeScript компилятора
      if (webpackConfig.plugins) {
        const forkTsCheckerPlugin = webpackConfig.plugins.find(
          (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
        );
        
        if (forkTsCheckerPlugin) {
          forkTsCheckerPlugin.options.memoryLimit = 4096; // 4GB
        }
      }
      
      return webpackConfig;
    },
  },
}; 