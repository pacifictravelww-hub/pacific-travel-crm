const BANNER_URL = 'https://pacific-travel.vercel.app/banner.jpg';
const LOGO_ICON = '✈️';
const BRAND_NAME = 'Pacific Travel CRM';
const BRAND_COLOR = '#2563eb';
const BRAND_GRADIENT = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';

export function emailLayout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
  ${previewText ? `<span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Banner -->
          <tr>
            <td style="border-radius:16px 16px 0 0;overflow:hidden;position:relative;height:220px;background:#0f1a38;">
              <img src="${BANNER_URL}" width="600" alt="Pacific Travel" 
                style="width:100%;height:220px;object-fit:cover;display:block;border-radius:16px 16px 0 0;" />
              <!-- Overlay -->
              <table width="100%" style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top, rgba(5,10,30,0.9) 0%, transparent 100%);padding:20px 28px;">
                <tr>
                  <td style="text-align:right;">
                    <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                      <tr>
                        <td style="background:${BRAND_GRADIENT};border-radius:10px;padding:8px 16px;vertical-align:middle;">
                          <span style="color:white;font-size:18px;font-weight:bold;">${LOGO_ICON} ${BRAND_NAME}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:rgba(15,26,56,0.98);border-radius:0 0 16px 16px;padding:36px 36px 28px;border:1px solid rgba(255,255,255,0.08);border-top:none;">
              ${content}

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr><td style="height:1px;background:rgba(255,255,255,0.07);"></td></tr>
              </table>

              <!-- Footer -->
              <p style="color:#475569;font-size:12px;text-align:center;margin:20px 0 0;">
                Pacific Travel WW &middot; CRM System<br>
                <a href="https://pacific-travel.vercel.app" style="color:#3b82f6;text-decoration:none;">pacific-travel.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Shared UI primitives ────────────────────────────────────────────────────

export function emailHeading(text: string): string {
  return `<h1 style="color:#f8fafc;font-size:24px;font-weight:bold;margin:0 0 8px;text-align:right;">${text}</h1>`;
}

export function emailSubheading(text: string): string {
  return `<p style="color:#94a3b8;font-size:15px;margin:0 0 24px;text-align:right;line-height:1.6;">${text}</p>`;
}

export function emailInfoCard(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 16px;color:#93c5fd;font-size:14px;white-space:nowrap;width:30%;">${r.label}</td>
      <td style="padding:10px 16px;color:#e2e8f0;font-size:14px;">${r.value}</td>
    </tr>
  `).join('<tr><td colspan="2" style="height:1px;background:rgba(255,255,255,0.05);"></td></tr>');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" 
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:24px;overflow:hidden;">
      <tbody>${rowsHtml}</tbody>
    </table>`;
}

export function emailButton(text: string, url: string, color = BRAND_GRADIENT): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
      <tr>
        <td align="center" style="border-radius:10px;background:${color};box-shadow:0 8px 24px rgba(37,99,235,0.35);">
          <a href="${url}" style="display:inline-block;padding:14px 32px;color:white;font-weight:bold;font-size:15px;text-decoration:none;border-radius:10px;">${text}</a>
        </td>
      </tr>
    </table>`;
}

export function emailStepList(steps: { text: string; done: boolean; active?: boolean }[]): string {
  const stepsHtml = steps.map(s => {
    const bg = s.done ? 'rgba(34,197,94,0.08)' : s.active ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)';
    const border = s.done ? 'rgba(34,197,94,0.2)' : s.active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)';
    const color = s.done ? '#86efac' : s.active ? '#93c5fd' : '#64748b';
    const icon = s.done ? '✅' : s.active ? '🔄' : '○';
    return `
      <tr>
        <td style="padding:4px 0;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:${bg};border:1px solid ${border};border-radius:10px;padding:10px 14px;">
            <tr>
              <td style="font-size:14px;color:${color};">${icon}&nbsp;&nbsp;${s.text}</td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');
  return `<table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:24px;">${stepsHtml}</table>`;
}
