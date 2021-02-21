import { useState, useEffect, useCallback } from 'react';
import audioFile from '../assets/ace_of_spades_snippet.mp3';

export const useAudio = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext] = useState(new AudioContext());
  const [playing, setPlaying] = useState(false);

  // Fetch and decode audio
  useEffect(() => {
    audioContext.src = audioFile;
    fetch(audioFile, { mode: 'cors' })
      .then((res) => res.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer))
      .then((decodedBuffer) => setAudioBuffer(decodedBuffer))
  }, [audioContext]);

  const playLoop = useCallback((buffer) => {
    let { audioData, destination } = audioContext;

    // Setup gain node (to control volume)
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;

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
    console.log(audioContext);
  }, [audioContext]);

  useEffect(() => {
    if (playing) {
      console.log('Playing audio');
      playLoop(audioBuffer);
    } else if (audioContext) {
      console.log('Pausing audio');
      audioContext.srcNode?.stop();
      audioContext.srcNode = null;
    }
  }, [audioBuffer, audioContext, playing, playLoop]);

  return [playing, setPlaying];
};
