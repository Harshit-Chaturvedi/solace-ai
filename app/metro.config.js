const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (ctx, name, platform) => {
  if (name.startsWith('.') && name.endsWith('.js')) {
    try {
      return ctx.resolveRequest(ctx, name.slice(0, -3), platform);
    } catch {}
  }
  return ctx.resolveRequest(ctx, name, platform);
};

module.exports = config;
