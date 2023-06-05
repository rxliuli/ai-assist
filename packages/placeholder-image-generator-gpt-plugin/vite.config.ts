import { Plugin, defineConfig } from 'vite'
import MagicString from 'magic-string'
import { nodeExternals } from 'rollup-plugin-node-externals'

function shims(): Plugin {
  return {
    name: 'node-shims',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js')) {
        return
      }
      // console.log('transform', chunk.fileName)
      const s = new MagicString(code)
      s.prepend(`
import __path from 'path'
import { fileURLToPath as __fileURLToPath } from 'url'
import { createRequire as __createRequire } from 'module'

const __getFilename = () => __fileURLToPath(import.meta.url)
const __getDirname = () => __path.dirname(__getFilename())
const __dirname = __getDirname()
const __filename = __getFilename()
const self = globalThis
const require = __createRequire(import.meta.url)
`)
      return {
        code: s.toString(),
        map: s.generateMap(),
      }
    },
    apply: 'build',
  }
}

function externals(): Plugin {
  return {
    ...nodeExternals(),
    enforce: 'pre',
    apply: 'build',
  }
}

function config(): Plugin {
  return {
    name: 'node-config',
    config() {
      return {
        build: {
          lib: {
            entry: 'src/main.ts',
            formats: ['es'],
            fileName: 'main',
          },
        },
      }
    },
    apply: 'build',
  }
}

function node(): Plugin[] {
  return [shims(), externals(), config()]
}

export default defineConfig({
  plugins: [node()],
})
