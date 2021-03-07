import { useState, useEffect, useCallback } from 'react';
import audioFile from '../assets/ace_of_spades_snippet.mp3';

export const useAudio = (muted) => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext] = useState(new AudioContext());
  const [playing, setPlaying] = useState(false);

  // Fetch and decode audio
  useEffect(() => {
    audioContext.src = audioFile;
    fetch(audioFile, { mode: 'cors' })
      .then((res) => res.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer))
      .then((decodedBuffer) => setAudioBuffer(decodedBuffer));
  }, [audioContext]);

  const playLoop = useCallback(
    (buffer) => {
      if (audioContext.srcNode) return;
      let { audioData, destination } = audioContext;

      // Setup gain node (to control volume)
      const gainNode = audioContext.createGain();
      audioContext.gainNode = gainNode;
      gainNode.gain.value = muted ? 0 : 0.15;

      // Setup source node
      if (!audioData) audioData = buffer;
      const srcNode = audioContext.createBufferSource();
      srcNode.buffer = buffer;
      srcNode.loop = true;

      // Connect nodes
      srcNode.connect(gainNode);
      gainNode.connect(destination);

      // Begin playback
      srcNode.start();
      audioContext.srcNode = srcNode;
    },
    [audioContext, muted]
  );

  useEffect(() => {
    if (audioContext.gainNode) {
      audioContext.gainNode.gain.value = muted ? 0 : 0.15;
    }
  }, [audioContext, muted]);

  useEffect(() => {
    if (playing) {
      console.debug('Playing audio');
      playLoop(audioBuffer);
    } else if (audioContext) {
      console.debug('Pausing audio');
      audioContext.srcNode?.stop();
      audioContext.srcNode = null;
    }
  }, [audioBuffer, audioContext, playing, playLoop]);

  return [playing, setPlaying];
};
