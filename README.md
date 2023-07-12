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

I've tried with a virtual [Blackhole](https://github.com/ExistentialAudio/BlackHole) 16ch device as well as a MOTU UltraLite mk4. It became very apparent that there might be some mixing happening with certain device and browser combos.

In all scenarios there was no difference present between the Worklet and the Oscillator example.

### Chrome v114.0.5735.198

**Blackhole 16ch**

* seem to be unable to output on all 16 channels (tops out at 11)
* channel indexing seems off when setting `context.destination.channelCount` to a value lower than `maxChannelCount`, eg
  * setting destination to 9 channels and source 9 to leads to channels 1-4 and 7-9 being active (5 and 6 remain silent)
  * 6 src to 8 dest channels work as expected, but 6 to 9 leads to only 4 active channels
  * 6 src to 5 dest channels leads to the expected 5 active channels, however it uses channels 1-3 and 5-6 with 4 remaining silent
  * 5 src to 5 dest channels leads to the above
  * setting 4 dest channels leads to a stereo only signal (regardless of src channel count)
  * any src count to 3 dest channels outputs the expected 3 channel signal

**MOTU UltraLike mk4**

* seem to be able to address outputs correctly and experience none of the behaviour from above
* the limit of max 11 channels does not seem to be present and I was able to address all 20 channels

### Firefox v115.0.2

**Blackhole 16ch**

* seem to be unable to output on all 16 channels (tops out at 8 like Chrome) but also maps the channels to 1-11 while 7-9 remain silent
* 7 src channels lead to the expected 7 active channels, mapping remains off like above (7-9 skipped)
* 6 src to 16 dest channels lead to the expected result and mapping
* any src to 4 dest channels lead to 4 active channels on 1-2 and 5-6

**MOTU UltraLike mk4**

* seems to only be able to address 2 channels
* regardles of the dest channel count I can only address channel 1 or 2


### Safari v16.3 (18614.4.6.1.6)

**Blackhole 16ch**

* able to address all 16 channels
* reducing the src channel count on 16 dest channels leads to the expected result and mapping
* mapping seems stable and as expected across all combos
* when changing the destination channel count the output will go silent until the src channels were adjusted

**MOTU UltraLike mk4**

* seem to be able to address outputs correctly
* same as above, when changing the destination channel count the output will go silent until the src channels were adjusted


## Additional links

* [Configuring Channels with AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#configuring-channels-with-audioworkletnodeoptions)
* [Up-mixing and down-mixing](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#up-mixing_and_down-mixing)

