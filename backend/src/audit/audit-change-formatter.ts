const currency = (v: string | number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v));

function parseSqlBinds(bindsStr: string | null): string[] {
  if (!bindsStr) return [];
  const values: string[] = [];
  const regex = /#(\d+)\([^)]+\):(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(bindsStr)) !== null) {
    values[parseInt(match[1], 10) - 1] = match[2];
  }
  return values;
}

function parseLiteralSql(sql: string | null): string[] {
  if (!sql) return [];
  const parts: string[] = [];
  const rules: Array<{ pattern: RegExp; label: string; money?: boolean }> = [
    { pattern: /HoTen\s*=\s*'([^']*)'/i, label: 'Họ tên' },
    { pattern: /SDT\s*=\s*'([^']*)'/i, label: 'SĐT' },
    { pattern: /MaPB\s*=\s*'([^']*)'/i, label: 'Phòng ban' },
    { pattern: /Luong\s*=\s*([\d.]+)/i, label: 'Lương', money: true },
  ];
  for (const rule of rules) {
    const m = sql.match(rule.pattern);
    if (m) parts.push(`${rule.label}: ${rule.money ? currency(m[1]) : m[1]}`);
  }
  return parts;
}

function extractMaNVFromLiteral(sql: string | null): string | null {
  if (!sql) return null;
  const m = sql.match(/MaNV\s*=\s*'([^']*)'/i);
  return m?.[1] ?? null;
}

export function formatPersonalInfoChange(
  detailSql: string | null,
  detailBinds: string | null,
  maNV: string | null,
): { maNV: string | null; changeSummary: string } {
  const binds = parseSqlBinds(detailBinds);
  const hasLuong = detailSql?.toUpperCase().includes('LUONG') ?? false;
  const parts: string[] = [];

  if (binds.length > 0) {
    if (binds[0] !== undefined) parts.push(`Họ tên: ${binds[0]}`);
    if (binds[1] !== undefined) parts.push(`SĐT: ${binds[1]}`);
    if (binds[2] !== undefined) parts.push(`Phòng ban: ${binds[2]}`);
    if (hasLuong && binds[3] !== undefined) parts.push(`Lương: ${currency(binds[3])}`);
  } else {
    parts.push(...parseLiteralSql(detailSql));
  }

  const resolvedMaNV =
    maNV ||
    (hasLuong ? binds[4] : binds[3]) ||
    extractMaNVFromLiteral(detailSql) ||
    null;

  return {
    maNV: resolvedMaNV,
    changeSummary: parts.length > 0 ? parts.join(' · ') : 'Cập nhật thông tin nhân viên',
  };
}

export function formatSalaryChange(oldValue: string | null, newValue: string | null): string {
  return `${currency(oldValue ?? 0)} → ${currency(newValue ?? 0)}`;
}
