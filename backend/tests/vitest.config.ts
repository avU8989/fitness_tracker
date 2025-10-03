import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'node',
        setupFiles: ['tests/setup.ts'],
        include: ['tests/**/*.{test,spec}.ts'],
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
    },
});
