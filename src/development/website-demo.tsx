import i18n from 'i18next';
import App from '../App';
import { bootstrapApplication } from '../application/bootstrap';
import { usePlayerStore } from '../application/player-store';
import { MusicProviderRoot } from '../application/provider-root';
import type { EntityId } from '../domain/music';
import { FakeMusicProvider } from '../providers/fake/fake-music-provider';
import { WEBSITE_SONG_ID, websiteLyrics, websiteNotes, websiteSong } from './website-song';

/** Project website demo: the offline shell plus a feature-tour song, playing with lyrics open. */
class WebsiteMusicProvider extends FakeMusicProvider {
  override async getSong(id: EntityId, signal?: AbortSignal) {
    return id === WEBSITE_SONG_ID ? structuredClone(websiteSong) : super.getSong(id, signal);
  }

  override async getLyrics(songId: EntityId, signal?: AbortSignal) {
    return songId === WEBSITE_SONG_ID
      ? structuredClone(websiteLyrics)
      : super.getLyrics(songId, signal);
  }
}

const parameters = new URLSearchParams(window.location.search);
const chinese = parameters.get('lang') === 'zh';
if (parameters.has('lang')) void i18n.changeLanguage(chinese ? 'zh-CN' : 'en-US');

bootstrapApplication({
  developmentApplication: (
    <MusicProviderRoot provider={new WebsiteMusicProvider()}>
      <App />
    </MusicProviderRoot>
  ),
});

if (parameters.has('autoplay')) {
  const player = usePlayerStore.getState();
  player.playTracks([websiteSong]);
  player.setRepeat('one');
  player.openLyrics();
}

// The fake player is silent, so a small synth plays the melody in step with its position.
const LOOKAHEAD_MS = 250;
let audio: AudioContext | null = null;
let scheduledUntilMs = -1;
let lastPositionMs = 0;
let voices: OscillatorNode[] = [];

function silence() {
  for (const voice of voices) voice.stop();
  voices = [];
}

function playNote(context: AudioContext, midi: number, bass: boolean, at: number, seconds: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = bass ? 'sine' : 'triangle';
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(bass ? 0.1 : 0.16, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds * 0.95);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(at);
  oscillator.stop(at + seconds);
  oscillator.onended = () => (voices = voices.filter((voice) => voice !== oscillator));
  voices.push(oscillator);
}

usePlayerStore.subscribe((state) => {
  const playingSong = state.queue[state.currentIndex]?.id === WEBSITE_SONG_ID;
  const positionMs = state.positionMs;
  const jumped = positionMs < lastPositionMs - 50 || positionMs > lastPositionMs + 2_000;
  lastPositionMs = positionMs;
  if (!audio || audio.state !== 'running' || !state.isPlaying || !playingSong || jumped) {
    if (jumped || !state.isPlaying) silence();
    scheduledUntilMs = positionMs - 1;
    return;
  }
  const untilMs = positionMs + LOOKAHEAD_MS;
  for (const note of websiteNotes) {
    if (note.startMs <= scheduledUntilMs || note.startMs > untilMs) continue;
    const at = audio.currentTime + Math.max(0, note.startMs - positionMs) / 1000;
    playNote(audio, note.midi, note.bass, at, note.durationMs / 1000);
  }
  scheduledUntilMs = untilMs;
});

const labels = chinese ? ['开启声音', '关闭声音'] : ['Sound on', 'Sound off'];
const soundButton = document.createElement('button');
soundButton.type = 'button';
soundButton.className = 'website-sound';
soundButton.textContent = `♪ ${labels[0]}`;
soundButton.setAttribute('aria-pressed', 'false');
soundButton.addEventListener('click', () => {
  // A new context may already be running, so the button's own state decides.
  const on = soundButton.getAttribute('aria-pressed') !== 'true';
  audio ??= new AudioContext();
  void (on ? audio.resume() : audio.suspend());
  if (!on) silence();
  soundButton.textContent = `♪ ${labels[on ? 1 : 0]}`;
  soundButton.setAttribute('aria-pressed', String(on));
});
const soundStyle = document.createElement('style');
soundStyle.textContent = `.website-sound{position:fixed;z-index:2147483647;top:16px;left:50%;transform:translateX(-50%);min-height:40px;padding:0 18px;border:1px solid var(--border-strong);border-radius:999px;background:rgba(17,18,15,.6);color:var(--text);font:600 var(--text-sm) var(--font-ui-text);backdrop-filter:blur(12px);cursor:pointer}.website-sound[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:transparent}@media (max-width:720px){.website-sound{top:auto;bottom:120px;left:auto;right:16px;transform:none}}`;
document.head.append(soundStyle);
document.body.append(soundButton);
