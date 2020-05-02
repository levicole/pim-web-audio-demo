// grr, safari
const AudioContext = window.AudioContext || window.webkitAudioContext;
function init(ppm) {
  const SAMPLE_RATE  = ppm ? 54000 : 220000;
  const TOTAL_VOICES = 4;
  const DURATION     = 20;
  const DC_OFFSET    = 0;
  const AMPLITUDE    = 1;
  const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

  window.audioContext = new AudioContext()

  window.audioBuffer   = audioContext.createBuffer(1, TOTAL_SAMPLES, SAMPLE_RATE);
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

  let current_sample = 0;
  let aggregate_output = 0; // needed for PPM

  while(current_sample < TOTAL_SAMPLES) {
    if(ppm) {
      // pin pulse method
      for(let voice = 0; voice < TOTAL_VOICES; ++voice) {
          if(++pitch_counter[voice] == frequency[voice]) {
            pitch_counter[voice] = 0.0;
          } else if(pitch_counter[voice] <= waveform[voice]) {
            output[voice] = 1.0;
          } else if(pitch_counter[voice] >= waveform[voice]) {
            output[voice] = 0.0;
          }
          aggregate_output = output[voice] | aggregate_output;

          // increase duty cycle over time
          if(current_sample % 12000 == 0)
            ++waveform[voice];
      }
      buffer[++current_sample] = (aggregate_output * AMPLITUDE) + DC_OFFSET;
      aggregate_output = 0;
    } else {
      // pulse interleaving modulation
      for(let voice = 0; voice < TOTAL_VOICES; ++voice) {
        if (++pitch_counter[voice] === frequency[voice]) {
          pitch_counter[voice] = 0.0;
        } else if (pitch_counter[voice] <= waveform[voice]) {
          buffer[++current_sample] = DC_OFFSET + AMPLITUDE;
        } else if (pitch_counter[voice] >= waveform[voice]) {
          buffer[++current_sample] = DC_OFFSET;
        }

        if(current_sample % 25000 == 0) {
          for(let voice = 0; voice < TOTAL_VOICES; ++voice) {
            ++waveform[voice];
          }
        }
      }
    }
  }

  let src = audioContext.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(audioContext.destination);
  src.start();
}
