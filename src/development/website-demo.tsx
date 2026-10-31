import { bootstrapApplication } from '../application/bootstrap';
import { usePlayerStore } from '../application/player-store';
import { fakeMusicProvider } from '../providers/fake/fake-music-provider';
import { FakeApplication } from './FakeApplication';

/** Project website demo: the offline shell, optionally already playing with lyrics open. */
bootstrapApplication({ developmentApplication: <FakeApplication /> });

if (new URLSearchParams(window.location.search).has('autoplay')) {
  void fakeMusicProvider.getAlbum('album-sunroom').then((album) => {
    const player = usePlayerStore.getState();
    player.playTracks(album.tracks, 'paper-sun');
    // Skip the instrumental intro so the first lyric line is moments away.
    player.seek(3_000);
    player.openLyrics();
  });
}
