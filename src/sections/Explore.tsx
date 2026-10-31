import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { TopicCard } from '@/components/TopicCard';
import { physicsTopics } from '@/data/topics';
import { useReveal } from '@/hooks/useReveal';
import './Explore.css';

const filters = ['All disciplines', ...physicsTopics.map((topic) => topic.title)];

export function Explore() {
  const { ref, isVisible } = useReveal();
  const [activeFilter, setActiveFilter] = useState('All disciplines');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleTopics = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return physicsTopics.filter((topic) => {
      const matchesFilter = activeFilter === 'All disciplines' || topic.title === activeFilter;
      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
        topic.title,
        topic.description,
        ...topic.topics,
      ].join(' ').toLocaleLowerCase();

      return searchableText.includes(query);
    });
  }, [activeFilter, searchQuery]);

  const resetCatalogue = () => {
    setActiveFilter('All disciplines');
    setSearchQuery('');
  };

  return (
    <section id="explore" className="relative isolate py-20 sm:py-28 lg:py-32">
      <div className="vectra-section-bridge pointer-events-none absolute inset-x-0 -top-16 h-80" aria-hidden="true" />
      <div className="container-vectra relative z-10">
        <div ref={ref} className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Explore the field"
            sectionIndex="01 / 04"
            title="A map of modern physics"
            description="Move between the major disciplines, find a topic, and follow the connections that make physics one coherent picture of nature."
          />
        </div>

        <div className="explore-console mt-10 sm:mt-12">
          <div className="explore-console__topline">
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-accent-cyan/75" aria-hidden="true" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.19em] text-star-white/45">
                Discipline index
              </span>
              <span className="hidden h-px w-8 bg-white/10 sm:block" aria-hidden="true" />
              <span className="font-mono text-[0.62rem] tabular-nums text-star-white/30">
                {String(visibleTopics.length).padStart(2, '0')} / {String(physicsTopics.length).padStart(2, '0')} fields
              </span>
            </div>
            <span className="hidden font-mono text-[0.58rem] uppercase tracking-[0.16em] text-star-white/25 sm:block">
              VECTRA / 01
            </span>
          </div>

          <div className="explore-console__controls">
            <label className="explore-search">
              <Search className="h-4 w-4 shrink-0 text-star-white/35" aria-hidden="true" />
              <span className="sr-only">Search physics disciplines and topics</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search disciplines, concepts, topics..."
                className="min-w-0 flex-1 bg-transparent font-body text-sm text-star-white outline-none placeholder:text-star-white/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="explore-search__clear"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd className="hidden rounded border border-white/[0.09] px-1.5 py-0.5 font-mono text-[0.58rem] text-star-white/25 sm:inline">
                FIND
              </kbd>
            </label>

            <div className="explore-filter-list" role="group" aria-label="Filter by physics discipline">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`explore-filter ${activeFilter === filter ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                >
                  {filter === 'All disciplines' ? 'All fields' : filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {visibleTopics.length} of {physicsTopics.length} physics disciplines.
        </p>
        <div className="mt-7 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="min-w-0"
            >
              <TopicCard topic={topic} index={index} />
            </div>
          ))}
        </div>

        {visibleTopics.length === 0 && (
          <div className="explore-empty mt-7">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-accent-cyan/70">
              No matching records
            </span>
            <p className="mt-2 font-display text-lg text-star-white">
              Nothing found in this part of the catalogue.
            </p>
            <p className="mt-1 text-sm text-star-white/45">
              Try another term or reset the discipline filter.
            </p>
            <button type="button" onClick={resetCatalogue} className="explore-reset mt-5">
              Reset catalogue
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
