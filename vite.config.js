import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import graphql from '@rollup/plugin-graphql'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact(), graphql()]
})
