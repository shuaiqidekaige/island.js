import { Plugin } from 'vite';

export function pluginMdxHMR(): Plugin {
  let viteReactPlugin: Plugin;
  return {
    name: 'vite-plugin-mdx-hmr',
    apply: 'serve',
    configResolved(config) {
      viteReactPlugin = config.plugins.find(
        (plugin) => plugin.name === 'vite:react-babel'
      ) as Plugin;
    },
    async transform(code, id, opts) {
      if (/\.mdx?/.test(id)) {
        // Inject babel refresh template code by @vitejs/plugin-react
        const result = await viteReactPlugin.transform?.call(
          this,
          code,
          id + '?.jsx',
          opts
        );
        const selfAcceptCode = 'import.meta.hot.accept();';
        if (
          typeof result === 'object' &&
          !result!.code?.includes(selfAcceptCode)
        ) {
          result!.code += selfAcceptCode;
        }
        return result;
      }
    },
    handleHotUpdate(ctx) {
      if (/\.mdx?/.test(ctx.file)) {
        ctx.server.ws!.send({
          type: 'custom',
          event: 'md(x)-changed'
        });
      }
    }
  };
}
