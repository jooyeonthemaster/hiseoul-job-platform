'use client';

import { useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  CodeBracketSquareIcon,
  GlobeAltIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  EXTERNAL_PORTFOLIO_LINK_TYPES,
  getHostnameLabel,
  isLikelyEmbeddableLink,
  normalizeExternalPortfolioLinks,
} from '@/lib/externalPortfolioLinks';
import type { ExternalPortfolioLink } from '../../types/portfolio.types';

interface ExternalPortfolioLinksProps {
  links?: ExternalPortfolioLink[];
}

function typeLabel(type: ExternalPortfolioLink['type']) {
  return EXTERNAL_PORTFOLIO_LINK_TYPES.find((option) => option.value === type)?.label || '외부 링크';
}

export default function ExternalPortfolioLinks({ links }: ExternalPortfolioLinksProps) {
  const normalizedLinks = normalizeExternalPortfolioLinks(links);
  const [failedEmbeds, setFailedEmbeds] = useState<Record<number, boolean>>({});

  if (normalizedLinks.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <CodeBracketSquareIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="truncate font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
              웹 작업물
            </h2>
            <p className="mt-1 text-base leading-relaxed text-ink-500">
              실제 배포된 웹 프로그램과 외부 포트폴리오를 확인할 수 있습니다.
            </p>
          </div>
        </div>
        <Badge tone="azure">{normalizedLinks.length}개 링크</Badge>
      </div>

      <div className="space-y-8">
        {normalizedLinks.map((link, index) => {
          const embeddable = isLikelyEmbeddableLink(link) && !failedEmbeds[index];

          return (
            <section key={`${link.url}-${index}`} className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-glass">
              <div className="flex flex-col gap-4 border-b border-ink-100 bg-azure-50/40 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-display text-xl font-bold tracking-tight text-ink-900 md:text-2xl">
                      {link.title}
                    </h3>
                    <Badge tone={link.type === 'webapp' ? 'azure' : link.type === 'notion' ? 'mint' : 'neutral'}>
                      {typeLabel(link.type)}
                    </Badge>
                    {embeddable && <Badge tone="mint">임베드</Badge>}
                  </div>
                  <div className="mt-2 flex min-w-0 items-center gap-2 text-sm font-semibold text-ink-500">
                    <GlobeAltIcon className="h-4 w-4 flex-shrink-0 text-azure-500" />
                    <span className="break-all">{getHostnameLabel(link.url)}</span>
                  </div>
                  {link.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-ink-600 md:text-lg">
                      {link.description}
                    </p>
                  )}
                </div>

                <GlassButton href={link.url} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" className="flex-shrink-0">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  새 창
                </GlassButton>
              </div>

              {embeddable ? (
                <div className="bg-ink-900/5 p-2 sm:p-3 md:p-4">
                  <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-inner">
                    <iframe
                      src={link.url}
                      title={link.title}
                      className="h-[560px] w-full bg-white sm:h-[640px] lg:h-[760px]"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                      onError={() => setFailedEmbeds((prev) => ({ ...prev, [index]: true }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[15rem] items-center justify-center bg-azure-50/35 p-8 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-azure-100 bg-white text-azure-500 shadow-glass-sm">
                      <LinkIcon className="h-7 w-7" />
                    </div>
                    <p className="mb-5 text-base font-semibold text-ink-600 md:text-lg">
                      {link.title}
                    </p>
                    <GlassButton href={link.url} target="_blank" rel="noopener noreferrer">
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      작업물 열기
                    </GlassButton>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
