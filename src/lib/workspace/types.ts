export type WorkspaceDocument = {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  icon: string;
  archived: boolean;
  published: boolean;
  coverDataUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export const WORKSPACE_STORAGE_KEY = 'akcizur-docs-workspace-v2';

export const DEFAULT_ICONS = ['·', '✦', '◇', '□', '△', '○', '◆', '→', '✚', '⌁'];
