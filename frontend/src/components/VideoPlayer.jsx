import { FastForward, Maximize, Pause, Play, StepForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../utils/formatters.js";

const VideoPlayer = ({
  animeId,
  currentEpisode,
  episodes,
  resumeTime = 0,
  isAuthenticated,
  onProgressSave,
  onEpisodeChange
}) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentEpisode?.duration || 0);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !currentEpisode) {
      return undefined;
    }

    setDuration(currentEpisode.duration || 0);
    setCurrentTime(0);
    setIsPlaying(false);

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
  }, [currentEpisode, resumeTime]);

  useEffect(() => {
    if (!currentEpisode || !isAuthenticated) {
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
        lastWatchedTimestamp: video.currentTime
      });
    }, 10000);

    return () => window.clearInterval(interval);
  }, [animeId, currentEpisode, isAuthenticated, onProgressSave]);

  const currentIndex = useMemo(
    () => episodes.findIndex((episode) => episode._id === currentEpisode?._id),
    [currentEpisode?._id, episodes]
  );

  const handlePlayPause = async () => {
    const video = videoRef.current;

    if (!video) {
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
    if (videoRef.current?.requestFullscreen) {
      await videoRef.current.requestFullscreen();
    }
  };

  const handleSkipIntro = () => {
    const video = videoRef.current;

    if (!video || !currentEpisode?.introEndTime) {
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

  if (!currentEpisode) {
    return null;
  }

  return (
    <div className="panel-strong overflow-hidden rounded-[32px]">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} src={currentEpisode.videoURL} controls className="h-full w-full" />
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
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handlePlayPause} className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950">
              <span className="inline-flex items-center gap-2">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause" : "Play"}
              </span>
            </button>
            <button type="button" onClick={handleFullscreen} className="rounded-full border border-white/10 px-4 py-2 text-slate-100">
              <span className="inline-flex items-center gap-2">
                <Maximize size={16} />
                Fullscreen
              </span>
            </button>
            {currentEpisode.introEndTime > 0 ? (
              <button type="button" onClick={handleSkipIntro} className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200">
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
              className="rounded-full border border-white/10 px-4 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
