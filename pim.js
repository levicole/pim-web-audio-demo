function init() {
  const SAMPLE_RATE  = 220000;
  const TOTAL_VOICES = 4;
  const DURATION     = 40;
  const AMPLITUDE    = 1.0;
  const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

  let audioContext = new AudioContext()

  const audioBuffer   = audioContext.createBuffer(1, TOTAL_SAMPLES, SAMPLE_RATE);
  const buffer        = audioBuffer.getChannelData(0);
  const waveform      = new Float32Array(TOTAL_VOICES);
  const pitch_counter = new Float32Array(TOTAL_VOICES);
  const frequency     = new Float32Array(TOTAL_VOICES);
  const output        = new Float32Array(TOTAL_VOICES);

  frequency[0] = 1000; // c
  frequency[1] = 334;  // g
  frequency[2] = 223;  // d
  frequency[3] = 198;  // e

  waveform[0]  = frequency[0] / 512; // 0.001% Duty Cycle
  waveform[1]  = frequency[1] / 512; // 0.001% Duty Cycle
  waveform[2]  = frequency[2] / 512; // 0.001% Duty Cycle
  waveform[3]  = frequency[3] / 512; // 0.001% Duty Cycle

  let current_sample = 0

  while(current_sample < TOTAL_SAMPLES) {
    for(let voice = 0; voice < TOTAL_VOICES; ++voice) {
      if (++pitch_counter[voice] === frequency[voice]) {
        pitch_counter[voice] = 0.0;
      } else if (pitch_counter[voice] <= waveform[voice]) {
        buffer[++current_sample] = 1.0;
      } else if (pitch_counter[voice] >= waveform[voice]) {
        buffer[++current_sample] = 0.0;
      }

      if(current_sample % 25000 == 0) {
        for(let voice = 0; voice < TOTAL_VOICES; ++voice) {
          ++waveform[voice];
        }
      }
    }
  }

  let src = audioContext.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(audioContext.destination);
  src.start();
}
