# WebAudio Multi-Channel Output Test

## Setup

To run the test simply start an HTTP Server in the root of the repo (eg `npx http-server`, `python3 -m http.server 8080`) and visit the website, eg http://localhost:8080,  in your browser.

Each of the included examples lets you set the number of channels on the sound generater as well as the active channels on the context's [AudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode)

Note that initially the destination is configured with the following

```js
context.destination.channelCount = context.destination.maxChannelCount; // Set to the maximum amount of channels available
context.destination.channelCountMode = "explicit";
context.destination.channelInterpretation = "discrete";
```

## Tests

This repo includes two examples in order to test some of the up- and down-mixing that is taking place, the relationship between [channelCountMode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelCountMode) and [channelInterpretation](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelInterpretation) as well as some of the initially unexpected channel mapping that seems to happen with certain virtual and hardware audio interfaces :

**Oscillator**

Runs the selected number of native [OscillatorNodes](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) into a [ChannelMergerNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelMergerNode) and connects its output to `context.destination`.

**Worklet**

Creates a single [AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode) with zero inputs generating white noise on a single output with the selected number of channels and connects it to `context.destination`.

## Observations

Both examples show that it's possible to talk to distinct audio channels on an audio output device. However, albeit `channelCountMode` being set to `explicit` and `channelInterpretation` to `discrete` there seems to be some mixing and summing in the mix when the `channelCount` of the destination is not set to its `maxChannelCount`.

I've tried with a virtual [Blackhole](https://github.com/ExistentialAudio/BlackHole) 16ch device as well as a MOTU UltraLite mk4. It became very apparent that there might be some mixing happening with the Blackhole virtual device when the `channelCount` does not equal `maxChannelCount`. One example is setting the destination count to 4 which leads to me always ending up with 2 active output channels, regardless of the selected source count.

Additional links:

* [Configuring Channels with AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#configuring-channels-with-audioworkletnodeoptions)
* [Up-mixing and down-mixing](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#up-mixing_and_down-mixing)

