import type { Tool } from '../../types/tool';
import type { VirtualFS } from '../VirtualFS';

export function createWriteFile(fs: VirtualFS): Tool {
  return {
    definition: {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Write content to a file. Creates parent directories automatically.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Absolute path to the file' },
            content: { type: 'string', description: 'Content to write' },
          },
          required: ['path', 'content'],
        },
      },
    },
    permission: 'risky',
    async execute(params) {
      await fs.writeFile(params.path as string, params.content as string);
      return `File written: ${params.path} (${(params.content as string).length} bytes)`;
    },
  };
}
