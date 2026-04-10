import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@/lib/types';

interface OpinionRowProps {
  articles: NewsArticle[];
}

export function OpinionRow({ articles }: OpinionRowProps) {
  if (articles.length === 0) return null;

  return (
    <section className="bg-background border-b border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-bold text-lg uppercase tracking-wider text-foreground mb-6 flex items-center">
          <span className="w-2 h-2 bg-primary rounded-full mr-2" />
          Opinion &amp; Editorial
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((opinion) => (
            <Link key={opinion.id} href={`/article/${opinion.slug}`} className="group block">
              <div className="flex items-start gap-4">
                {/* Author avatar / initial */}
                <div className="w-12 h-12 rounded-full bg-secondary shrink-0 overflow-hidden border border-border relative">
                  {opinion.coverImage ? (
                    <Image
                      src={opinion.coverImage}
                      alt={opinion.authorId || 'Author'}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                      {(opinion.authorId || opinion.title || 'O').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-serif text-[15px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {opinion.title}
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wide">
                    {opinion.tags?.[0] || opinion.category || 'Opinion'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
