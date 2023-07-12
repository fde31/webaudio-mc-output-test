const ctx = new window.AudioContext();
let workletNode = null;

const setupWorklet = async (channelCount) => {

	if (!workletNode) {
		// first one
		await ctx.audioWorklet.addModule("js/whitenoise.js");
	} else {
		workletNode.disconnect();
	}

	workletNode = new AudioWorkletNode(
		ctx,
		"white-noise",
		{
			numberOfInputs: 0,
			numberOfOutputs: 1,
			outputChannelCount: [channelCount],
		}
	);

	workletNode.connect(ctx.destination);

	// Write Worklet Channel Info
	document.querySelector("#worklet").innerText = `channelCount option: ${channelCount}, node.channelCount: ${workletNode.channelCount}`;
};


ctx.destination.channelCount = ctx.destination.maxChannelCount;
ctx.destination.channelCountMode = "explicit";
ctx.destination.channelInterpretation = "discrete";

setupWorklet(ctx.destination.channelCount);

// Source Channel Select
const srcChannelSelect = document.querySelector("#source-channel-select");
for (let i = 1; i <= ctx.destination.maxChannelCount; i++) {
	const option = document.createElement("option");
	option.value = i;
	option.innerText = `${i} Channel${i !== 1 ? "s" : ""}`;
	srcChannelSelect.appendChild(option);
}

srcChannelSelect.value = ctx.destination.maxChannelCount;
srcChannelSelect.onchange = (e) => setupWorklet(e.target.value);

// Destination Channel Select
const destChannelSelect = document.querySelector("#destination-channel-select");
for (let i = 1; i <= ctx.destination.maxChannelCount; i++) {
	const option = document.createElement("option");
	option.value = i;
	option.innerText = `${i} Channel${i !== 1 ? "s" : ""}`;
	destChannelSelect.appendChild(option);
}

destChannelSelect.value = ctx.destination.maxChannelCount;
destChannelSelect.onchange = (e) => ctx.destination.channelCount = parseInt(e.target.value, 10);

// Context Resume Handler
document.querySelector("#resume").onclick = () => ctx.state === "suspended" && ctx.resume();
