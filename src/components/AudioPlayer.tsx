"use client";

import { useEffect, useRef, useState } from "react";

const PLAY_EVENT = "audio-player:play";

const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function AudioPlayer({ id, src, title }: { id: number; src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== id) audioRef.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, [id]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      return;
    }
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
    try {
      await el.play();
    } catch {
      setFailed(true);
    }
  };

  const retry = async () => {
    const el = audioRef.current;
    if (!el) return;
    setFailed(false);
    el.load();
    await toggle();
  };

  return (
    <div className="player" data-testid={`audio-player-${id}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => {
          setPlaying(false);
          setFailed(true);
        }}
      />
      {failed ? (
        <div role="alert" className="player__error">
          <p>Không phát được âm thanh. Bạn có thể thử lại hoặc đọc lời dẫn bên dưới.</p>
          <button type="button" className="button" onClick={retry} data-testid={`audio-retry-${id}`}>
            Thử lại âm thanh
          </button>
        </div>
      ) : (
        <>
          <div className="player__row">
            <button
              type="button"
              className="button"
              onClick={toggle}
              aria-label={`${playing ? "Tạm dừng" : "Phát"}: ${title}`}
              data-testid={`audio-toggle-${id}`}
            >
              {playing ? "Tạm dừng" : "Phát"}
            </button>
            <span className="player__time" aria-live="off" data-testid={`audio-elapsed-${id}`}>
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>
          <label className="player__field">
            <span>Vị trí phát</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(current, duration || 0)}
              disabled={!duration}
              onChange={(e) => {
                const t = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = t;
                setCurrent(t);
              }}
              data-testid={`audio-seek-${id}`}
            />
          </label>
          <label className="player__field">
            <span>Âm lượng</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (audioRef.current) audioRef.current.volume = v;
                setVolume(v);
              }}
              data-testid={`audio-volume-${id}`}
            />
          </label>
        </>
      )}
    </div>
  );
}
