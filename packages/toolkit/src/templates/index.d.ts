export interface ToolkitTemplatePreview {
  html?: string;
  css?: string;
  js?: string;
}

export interface ToolkitTemplate {
  id: string;
  slug?: string;
  title: string;
  descriptor?: string | null;
  summary?: string | null;
  prompt?: string | null;
  html?: string;
  css?: string;
  js?: string;
  audience?: string[];
  tags?: string[];
  heroImage?: string | null;
  popularity?: number;
  quickTweaks?: string[];
  modelProvider?: string | null;
  modelName?: string | null;
  preview?: ToolkitTemplatePreview;
  collectionId?: string;
  collectionTitle?: string;
  popularityScore?: number;
  updatedAt?: string;
  previewHtml?: string;
  previewCss?: string;
  previewJs?: string;
}

export interface TemplateCollection {
  id: string;
  title: string;
  description?: string;
  templates: ToolkitTemplate[];
}

export declare const TEMPLATE_COLLECTIONS: TemplateCollection[];

export declare function flattenTemplates(collections?: TemplateCollection[]): ToolkitTemplate[];

export declare function getTemplateById(
  id: string,
  collections?: TemplateCollection[]
): ToolkitTemplate | null;

export declare function templateCategorySlug(value: string): string;

export declare function normaliseTemplateRow(row: Record<string, any> | null): {
  raw: Record<string, any> | null;
  categoryId: string;
  categoryTitle: string;
  categoryDescription: string;
  template: ToolkitTemplate;
} | null;

export declare function mapRowsToCollections(
  rows: Record<string, any>[] | undefined,
  fallbackCollections?: TemplateCollection[]
): TemplateCollection[];
