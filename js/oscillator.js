const ctx = new window.AudioContext();
let oscillators = [];
let merger;

const setupOscillators = async (channelCount) => {
	oscillators.forEach(osc => osc.disconnect());
	if (merger) merger.disconnect();

	merger = ctx.createChannelMerger(channelCount);

	for (let i = 0; i < channelCount; i ++) {
		const osc = ctx.createOscillator();
		osc.type = "square";
		osc.frequency.setValueAtTime(440, ctx.currentTime);
		osc.connect(merger, 0, i);
		osc.start();
		oscillators.push(osc);
	}
	merger.connect(ctx.destination);
};


ctx.destination.channelCount = ctx.destination.maxChannelCount;
ctx.destination.channelCountMode = "explicit";
ctx.destination.channelInterpretation = "discrete";

setupOscillators(ctx.destination.channelCount);

// Source Channel Select
const srcChannelSelect = document.querySelector("#source-channel-select");
for (let i = 1; i <= ctx.destination.maxChannelCount; i++) {
	const option = document.createElement("option");
	option.value = i;
	option.innerText = `${i} Channel${i !== 1 ? "s" : ""}`;
	srcChannelSelect.appendChild(option);
}

srcChannelSelect.value = ctx.destination.maxChannelCount;
srcChannelSelect.onchange = (e) => setupOscillators(e.target.value);

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
