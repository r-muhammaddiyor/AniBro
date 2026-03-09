import { Captions, FastForward, Maximize, Pause, Play, StepForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../utils/formatters.js";

const playbackRates = [0.75, 1, 1.25, 1.5, 2];

const getYouTubeEmbedUrl = (value) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    let videoId = "";

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1).split("/")[0];
    } else if (url.searchParams.get("v")) {
      videoId = url.searchParams.get("v");
    } else if (url.pathname.includes("/embed/")) {
      videoId = url.pathname.split("/embed/")[1]?.split("/")[0] || "";
    } else if (url.pathname.includes("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    }

    if (!videoId) {
      return "";
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
  } catch (_error) {
    return "";
  }
};

const VideoPlayer = ({
  animeId,
  currentEpisode,
  episodes,
  resumeTime = 0,
  onProgressSave,
  onEpisodeChange
}) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentEpisode?.duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const youTubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(currentEpisode?.videoURL), [currentEpisode?.videoURL]);
  const isYouTubeEpisode = Boolean(youTubeEmbedUrl);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !currentEpisode || isYouTubeEpisode) {
      setDuration(currentEpisode?.duration || 0);
      setCurrentTime(0);
      setIsPlaying(false);
      setPlaybackRate(1);
      setCaptionsEnabled(false);
      return undefined;
    }

    setDuration(currentEpisode.duration || 0);
    setCurrentTime(0);
    setIsPlaying(false);
    setPlaybackRate(1);
    setCaptionsEnabled(false);
    video.playbackRate = 1;

    const handleLoaded = () => {
      if (resumeTime > 0 && resumeTime < video.duration) {
        video.currentTime = resumeTime;
        setCurrentTime(resumeTime);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || currentEpisode.duration || 0);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentEpisode, isYouTubeEpisode, resumeTime]);

  useEffect(() => {
    if (!currentEpisode || isYouTubeEpisode) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      void onProgressSave({
        animeId,
        episodeId: currentEpisode._id,
        lastWatchedTimestamp: video.currentTime,
        episodeNumber: currentEpisode.episodeNumber,
        title: currentEpisode.title,
        posterURL: currentEpisode.thumbnailURL || ""
      });
    }, 10000);

    return () => window.clearInterval(interval);
  }, [animeId, currentEpisode, isYouTubeEpisode, onProgressSave]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || isYouTubeEpisode) {
      return;
    }

    video.playbackRate = playbackRate;
  }, [isYouTubeEpisode, playbackRate]);

  const currentIndex = useMemo(
    () => episodes.findIndex((episode) => episode._id === currentEpisode?._id),
    [currentEpisode?._id, episodes]
  );

  const handlePlayPause = async () => {
    const video = videoRef.current;

    if (!video || isYouTubeEpisode) {
      return;
    }

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = async () => {
    if (isYouTubeEpisode) {
      return;
    }

    if (videoRef.current?.requestFullscreen) {
      await videoRef.current.requestFullscreen();
    }
  };

  const handleSkipIntro = () => {
    const video = videoRef.current;

    if (!video || !currentEpisode?.introEndTime || isYouTubeEpisode) {
      return;
    }

    video.currentTime = currentEpisode.introEndTime;
    setCurrentTime(currentEpisode.introEndTime);
  };

  const handleNextEpisode = () => {
    const nextEpisode = episodes[currentIndex + 1];

    if (nextEpisode) {
      onEpisodeChange(nextEpisode);
    }
  };

  const handleCaptionsToggle = () => {
    const video = videoRef.current;
    const track = video?.textTracks?.[0];

    if (!track || isYouTubeEpisode) {
      return;
    }

    const nextValue = !captionsEnabled;
    track.mode = nextValue ? "showing" : "disabled";
    setCaptionsEnabled(nextValue);
  };

  if (!currentEpisode) {
    return null;
  }

  return (
    <div className="panel-strong overflow-hidden rounded-[32px]">
      <div className="relative aspect-video bg-black">
        {isYouTubeEpisode ? (
          <iframe
            src={youTubeEmbedUrl}
            title={currentEpisode.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentEpisode.videoURL}
            poster={currentEpisode.thumbnailURL || undefined}
            preload="metadata"
            playsInline
            controls
            className="h-full w-full"
          >
            {currentEpisode.subtitleURL ? (
              <track kind="subtitles" src={currentEpisode.subtitleURL} srcLang="en" label="Subtitles" default={captionsEnabled} />
            ) : null}
          </video>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              {t("anime.selectEpisode")}
            </p>
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">
              {currentEpisode.episodeNumber}. {currentEpisode.title}
            </h2>
            {isYouTubeEpisode ? <p className="mt-2 text-sm text-slate-400">YouTube video detected. Use the embedded player controls below.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {!isYouTubeEpisode ? (
              <button type="button" onClick={handlePlayPause} className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950 transition hover:scale-[1.02] focus-visible:outline-none">
                <span className="inline-flex items-center gap-2">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? "Pause" : "Play"}
                </span>
              </button>
            ) : null}
            {!isYouTubeEpisode ? (
              <label className="ui-label min-w-[110px]">
                <span className="ui-label-text">{t("anime.speed")}</span>
                <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} className="ui-select focus-visible:outline-none">
                  {playbackRates.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}x
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {currentEpisode.subtitleURL && !isYouTubeEpisode ? (
              <button type="button" onClick={handleCaptionsToggle} className="rounded-full border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5 focus-visible:outline-none">
                <span className="inline-flex items-center gap-2">
                  <Captions size={16} />
                  {captionsEnabled ? t("anime.hideSubtitles") : t("anime.showSubtitles")}
                </span>
              </button>
            ) : null}
            {!isYouTubeEpisode ? (
              <button type="button" onClick={handleFullscreen} className="rounded-full border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5 focus-visible:outline-none">
                <span className="inline-flex items-center gap-2">
                  <Maximize size={16} />
                  Fullscreen
                </span>
              </button>
            ) : null}
            {currentEpisode.introEndTime > 0 && !isYouTubeEpisode ? (
              <button type="button" onClick={handleSkipIntro} className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200 transition hover:bg-cyan-400/20 focus-visible:outline-none">
                <span className="inline-flex items-center gap-2">
                  <FastForward size={16} />
                  {t("anime.skipIntro")}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleNextEpisode}
              disabled={currentIndex === -1 || currentIndex === episodes.length - 1}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-100 transition hover:bg-white/5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <StepForward size={16} />
                {t("anime.nextEpisode")}
              </span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
