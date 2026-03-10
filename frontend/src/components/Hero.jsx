import React from 'react';

export default function Hero({
  title = 'Demon City: Requiem',
  tagline = 'A cursed city. A chosen outcast.',
  description = 'When ancient demons awaken beneath Neo-Tokyo, a rebellious exorcist must face the darkness he helped unleash.',
  maturityRating = '16+',
  episodes = '24 Episodes',
  year = '2025',
  genres = ['Action', 'Supernatural', 'Dark Fantasy'],
  backgroundImageUrl = '/images/anime-hero.jpg',
}) {
  return (
    <section className="relative w-full overflow-hidden text-white" aria-label="Featured anime">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%), url('${backgroundImageUrl}')`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-32 lg:min-h-[80vh] lg:flex-row lg:items-center lg:justify-between lg:pt-40">
        {/* Left */}
        <div className="max-w-xl lg:max-w-2xl">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-red-600 px-3 py-1 font-semibold">NEW</span>
            <span className="rounded bg-white/10 px-3 py-1 backdrop-blur">Trending</span>
            <span className="rounded border border-white/30 px-3 py-1">Top 10</span>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>

          {/* Tagline */}
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-red-300">{tagline}</p>

          {/* Meta */}
          <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-300">
            <span className="border border-gray-400 px-2 py-0.5 font-semibold">
              {maturityRating}
            </span>

            <span>{year}</span>

            <span>{episodes}</span>

            <span className="flex flex-wrap gap-2 text-gray-400">
              {genres.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </span>
          </div>

          {/* Description */}
          <p className="mb-6 max-w-xl text-sm text-gray-200 md:text-base">{description}</p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200">
              ▶ Play
            </button>

            <button className="flex items-center gap-2 rounded bg-white/20 px-6 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
              ℹ More info
            </button>
          </div>
        </div>

        {/* Right Poster */}
        <div className="mt-10 hidden lg:block">
          <div className="relative h-[260px] w-[180px] overflow-hidden rounded-lg border border-white/20 shadow-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${backgroundImageUrl}')`,
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 text-xs">
              <p className="font-semibold">{title}</p>
              <p className="text-gray-300">{episodes}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
