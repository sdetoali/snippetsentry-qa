export function uniqueEmail(tag: string): string {
  const [local, domain] = process.env.SS_EMAIL!.split('@');
  return `${local}+${tag}${Date.now()}@${domain}`;
}
