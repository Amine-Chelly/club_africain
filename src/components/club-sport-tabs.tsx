"use client";

import { useState } from "react";

type Sport = {
  key: string;
  label: string;
};

type Tab = "history" | "titles" | "venue";

type VenueImage = { id: string; url: string; isCover: boolean };

type Props = {
  sports: Sport[];
  defaultSport: string;
  labels: {
    history: string;
    titles: string;
    venue: string;
    noHistory: string;
    noTitles: string;
    noVenue: string;
    capacityLabel: string;
  };
  data: Record<
    string,
    {
      history: string | null;
      titles: Array<{ id: string; year: number; competition: string; detail: string | null; imageUrl: string | null }>;
      venue: {
        name: string;
        city: string;
        capacity: number | null;
        imageUrl: string | null;
        notes: string | null;
        images: VenueImage[];
      } | null;
    }
  >;
};

const TABS: Tab[] = ["history", "titles", "venue"];

export function ClubSportTabs({ sports, defaultSport, labels, data }: Props) {
  const [activeSport, setActiveSport] = useState(defaultSport);
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const sportData = data[activeSport] ?? { history: null, titles: [], venue: null };

  function switchSport(key: string) {
    setActiveSport(key);
    setActiveImageIdx(0);
  }

  const venueImages: VenueImage[] = sportData.venue?.images ?? [];
  const displayImages: VenueImage[] =
    venueImages.length > 0
      ? venueImages
      : sportData.venue?.imageUrl
      ? [{ id: "legacy", url: sportData.venue.imageUrl, isCover: true }]
      : [];

  const clampedIdx = Math.min(activeImageIdx, Math.max(0, displayImages.length - 1));

  return (
    <div>
      {/* Sport selector */}
      <div className="flex flex-wrap gap-2">
        {sports.map((s) => (
          <button
            key={s.key}
            onClick={() => switchSport(s.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeSport === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-foreground hover:bg-muted/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="border-border mt-6 flex gap-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {labels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "history" && (
          <div className="text-foreground max-w-3xl space-y-4 leading-relaxed">
            {sportData.history ? (
              <div dangerouslySetInnerHTML={{ __html: sportData.history.replace(/\n/g, "<br/>") }} />
            ) : (
              <p className="text-muted italic">{labels.noHistory}</p>
            )}
          </div>
        )}

        {activeTab === "titles" && (
          <div>
            {sportData.titles.length === 0 ? (
              <p className="text-muted italic">{labels.noTitles}</p>
            ) : (
              <ul className="divide-border divide-y">
                {sportData.titles.map((title) => (
                  <li key={title.id} className="flex items-center gap-4 py-3">
                    {title.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={title.imageUrl}
                        alt={title.competition}
                        className="h-12 w-12 shrink-0 rounded-lg object-contain border border-border"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-border bg-muted/20 flex items-center justify-center text-xl">
                        🏆
                      </div>
                    )}
                    <div>
                      <span className="text-primary font-bold">{title.year}</span>
                      <p className="text-foreground font-medium">{title.competition}</p>
                      {title.detail && <p className="text-muted text-sm">{title.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "venue" && (
          <div>
            {!sportData.venue ? (
              <p className="text-muted italic">{labels.noVenue}</p>
            ) : (
              <div className="max-w-2xl space-y-5">
                {/* Gallery */}
                {displayImages.length > 0 && (
                  <div className="space-y-2">
                    {/* Main image */}
                    <div
                      className="relative overflow-hidden rounded-2xl bg-muted/20"
                      style={{ aspectRatio: "16/9" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayImages[clampedIdx].url}
                        alt={sportData.venue.name}
                        className="h-full w-full object-contain bg-muted/20 transition-opacity duration-300"
                      />
                      {displayImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveImageIdx((i) => Math.max(0, i - 1))}
                            disabled={clampedIdx === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg disabled:opacity-30 hover:bg-black/70 transition-colors"
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveImageIdx((i) => Math.min(displayImages.length - 1, i + 1))
                            }
                            disabled={clampedIdx === displayImages.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg disabled:opacity-30 hover:bg-black/70 transition-colors"
                            aria-label="Next image"
                          >
                            ›
                          </button>
                          <span className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                            {clampedIdx + 1} / {displayImages.length}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {displayImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {displayImages.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveImageIdx(idx)}
                            className={`shrink-0 h-14 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                              idx === clampedIdx
                                ? "border-primary"
                                : "border-transparent opacity-60 hover:opacity-90"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`${sportData.venue.name} ${idx + 1}`}
                              className="h-full w-full object-contain bg-muted/20"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Venue info */}
                <div>
                  <p className="text-foreground text-xl font-bold">{sportData.venue.name}</p>
                  <p className="text-muted">{sportData.venue.city}</p>
                  {sportData.venue.capacity && (
                    <p className="text-muted mt-1 text-sm">
                      {labels.capacityLabel}: {sportData.venue.capacity.toLocaleString()}
                    </p>
                  )}
                  {sportData.venue.notes && (
                    <p className="text-foreground mt-3 leading-relaxed">{sportData.venue.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
