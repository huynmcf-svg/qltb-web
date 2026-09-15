import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/** Flat config. Next 16 đã bỏ lệnh `next lint`, nên `npm run lint` gọi thẳng eslint. */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    // shadcn sinh ra components/ui — không sửa tay, cũng không lint theo luật
    // của repo. Cần khác thì bọc ở components/common.
    files: ['src/components/ui/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default config;
