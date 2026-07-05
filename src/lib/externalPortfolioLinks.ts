export type ExternalPortfolioLinkType = 'webapp' | 'notion' | 'website' | 'github' | 'other';

export interface ExternalPortfolioLink {
  url: string;
  title: string;
  type: ExternalPortfolioLinkType;
  description?: string;
  embed?: boolean;
  addedAt?: Date | string | any;
}

export const EXTERNAL_PORTFOLIO_LINK_TYPES: Array<{
  value: ExternalPortfolioLinkType;
  label: string;
}> = [
  { value: 'webapp', label: '웹 프로그램' },
  { value: 'notion', label: '노션 포트폴리오' },
  { value: 'website', label: '웹사이트' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: '기타 링크' },
];

export function normalizeUrl(value: string) {
  const url = value.trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function getHostnameLabel(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function isLikelyEmbeddableLink(link: ExternalPortfolioLink) {
  if (link.embed === false) return false;
  if (!link.url) return false;
  if (link.type === 'github') return false;
  return ['webapp', 'notion', 'website', 'other'].includes(link.type);
}

export function normalizeExternalPortfolioLinks(value: unknown): ExternalPortfolioLink[] {
  if (!Array.isArray(value)) return [];

  const links: ExternalPortfolioLink[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const raw = item as Partial<ExternalPortfolioLink>;
    const url = normalizeUrl(String(raw.url || ''));
    if (!url) return;

    const type = EXTERNAL_PORTFOLIO_LINK_TYPES.some((option) => option.value === raw.type)
      ? (raw.type as ExternalPortfolioLinkType)
      : 'website';

    links.push({
      url,
      title: String(raw.title || getHostnameLabel(url)),
      type,
      description: raw.description ? String(raw.description) : '',
      embed: raw.embed !== false,
      addedAt: raw.addedAt || new Date(),
    });
  });

  return links;
}
