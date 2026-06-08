
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(tasks) {
  const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At'];
  const escape  = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = tasks.map(t => [
    escape(t.title),
    escape(t.description),
    escape(t.status),
    escape(t.priority),
    escape(t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''),
    escape(new Date(t.createdAt).toLocaleDateString()),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  triggerDownload(csv, `tasks_export_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportJSON(tasks) {
  const json = JSON.stringify(tasks, null, 2);
  triggerDownload(json, `tasks_export_${Date.now()}.json`, 'application/json');
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.name.endsWith('.json')) return reject(new Error('File must be a .json file'));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const items  = Array.isArray(parsed) ? parsed : [parsed];

        const valid = items.filter(item => typeof item.title === 'string' && item.title.trim());
        if (valid.length === 0) {
          return reject(new Error('No valid tasks found — each task must have a "title" field'));
        }

        // Return only safe fields
        const cleaned = valid.map(item => ({
          title:       item.title.trim(),
          description: item.description?.trim() || '',
          priority:    ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
          dueDate:     item.dueDate ? new Date(item.dueDate).toISOString() : null,
        }));

        resolve(cleaned);
      } catch {
        reject(new Error('Invalid JSON file — could not parse'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
