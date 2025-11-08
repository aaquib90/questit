const DENY_PATTERNS = [
  { id: 'eval', re: /\beval\s*\(/i, severity: 'critical', msg: 'Use of eval() is forbidden.' },
  { id: 'new-function', re: /\bnew\s+Function\s*\(/i, severity: 'critical', msg: 'Use of new Function() is forbidden.' },
  { id: 'window-open', re: /\bwindow\.open\s*\(/i, severity: 'warn', msg: 'window.open() discouraged.' },
  { id: 'document-write', re: /\bdocument\.write\s*\(/i, severity: 'warn', msg: 'document.write() discouraged.' },
  { id: 'innerhtml-assign', re: /\.innerHTML\s*=/i, severity: 'warn', msg: 'innerHTML assignment must be sanitized.' }
];

export function staticScan(adaptedCode) {
  const sources = [
    { name: 'html', text: adaptedCode?.html || '' },
    { name: 'css', text: adaptedCode?.css || '' },
    { name: 'js', text: adaptedCode?.js || '' }
  ];
  const issues = [];
  for (const { name, text } of sources) {
    for (const rule of DENY_PATTERNS) {
      if (rule.re.test(text)) {
        issues.push({ file: name, id: rule.id, severity: rule.severity, message: rule.msg });
      }
    }
  }
  const critical = issues.some(i => i.severity === 'critical');
  return { issues, critical };
}

export default { staticScan };


