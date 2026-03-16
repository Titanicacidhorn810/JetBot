import type { Tool } from '../../types/tool';
import type { VirtualFS } from '../VirtualFS';

export function createEditFile(fs: VirtualFS): Tool {
  return {
    definition: {
      type: 'function',
      function: {
        name: 'edit_file',
        description: 'Edit a file by replacing an exact string match. The old_text must be unique in the file.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Absolute path to the file' },
            old_text: { type: 'string', description: 'Exact text to find and replace' },
            new_text: { type: 'string', description: 'Replacement text' },
          },
          required: ['path', 'old_text', 'new_text'],
        },
      },
    },
    permission: 'risky',
    async execute(params) {
      const path = params.path as string;
      const oldText = params.old_text as string;
      const newText = params.new_text as string;
      const content = await fs.readFile(path);
      const count = content.split(oldText).length - 1;
      if (count === 0) throw new Error(`old_text not found in ${path}`);
      if (count > 1) throw new Error(`old_text found ${count} times in ${path}. Must be unique.`);
      const updated = content.replace(oldText, newText);
      await fs.writeFile(path, updated);
      return `File edited: ${path}`;
    },
  };
}
