export const FILE_TYPE_CATALOG: { extension: string; mimeType: string; label: string }[] = [
  { extension: 'pdf', mimeType: 'application/pdf', label: 'PDF' },
  { extension: 'doc', mimeType: 'application/msword', label: 'Word (.doc)' },
  { extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word (.docx)' },
  { extension: 'ppt', mimeType: 'application/vnd.ms-powerpoint', label: 'PowerPoint (.ppt)' },
  { extension: 'pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint (.pptx)' },
  { extension: 'xls', mimeType: 'application/vnd.ms-excel', label: 'Excel (.xls)' },
  { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (.xlsx)' },
  { extension: 'jpg', mimeType: 'image/jpeg', label: 'JPG' },
  { extension: 'jpeg', mimeType: 'image/jpeg', label: 'JPEG' },
  { extension: 'png', mimeType: 'image/png', label: 'PNG' },
  { extension: 'txt', mimeType: 'text/plain', label: 'Text' },
  { extension: 'zip', mimeType: 'application/zip', label: 'ZIP' },
];

export function acceptFor(types?: { extension: string; mimeType: string }[]): Record<string, string[]> | undefined {
  if (!types || types.length === 0) return undefined;
  const accept: Record<string, string[]> = {};
  for (const t of types) (accept[t.mimeType] ||= []).push(`.${t.extension}`);
  return accept;
}
