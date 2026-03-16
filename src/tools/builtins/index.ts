import type { ToolRegistry } from '../ToolRegistry';
import { createReadFile } from './readFile';
import { createWriteFile } from './writeFile';
import { createEditFile } from './editFile';
import { createListDir } from './listDir';
import { createSearchText } from './searchText';
import { createHttpGet } from './httpGet';
import { createShellExecute } from './shellExecute';

export function registerBuiltins(registry: ToolRegistry): void {
  const fs = registry.fs;
  registry.register(createReadFile(fs));
  registry.register(createWriteFile(fs));
  registry.register(createEditFile(fs));
  registry.register(createListDir(fs));
  registry.register(createSearchText(fs));
  registry.register(createHttpGet());
  registry.register(createShellExecute(fs));
}
