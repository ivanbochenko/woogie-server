import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema.graphql',
  generates: {
    './resolvers-types.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers', 
        // {
        //   add: {
        //     context: '/* eslint-disable */'
        //   }
        // },
      ],
      // config: {
        
      //   contextType: './context#Context'
      // }
    },
  },
};
export default config;