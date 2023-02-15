const program = require("commander");
const fs = require("fs");
const nunjucks = require("nunjucks");


program.version("0.0.1");
program.option(
    "-t, --template <template>",
    "TendermintLightClient template file",
    "./contracts/TendermintLightClient.template"
);

program.option(
    "-o, --output <output-file>",
    "TendermintLightClient.sol",
    "./contracts/TendermintLightClient.sol"
)

program.option("--rewardForValidatorSetChange <rewardForValidatorSetChange>",
    "rewardForValidatorSetChange",
    "1e16"); //1e16

program.option("--initConsensusStateBytes <initConsensusStateBytes>",
    "init consensusState bytes, hex encoding, no prefix with 0x",
    "4178696d636861696e2d5068756f6e6700000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000003f9109c80fe80b64f299bb9701031169989879e25a500c8a745f43e53c86db6b65e09b599afa4fb6712b94e50ae0f5d5265e9749b0c6ad9152ee6a8e557a947d0000082f79cd9000");

program.option("--mock <mock>",
    "if use mock",
    false);

program.parse(process.argv);

const data = {
  initConsensusStateBytes: program.initConsensusStateBytes,
  rewardForValidatorSetChange: program.rewardForValidatorSetChange,
  mock: program.mock,
};
const templateString = fs.readFileSync(program.template).toString();
const resultString = nunjucks.renderString(templateString, data);
fs.writeFileSync(program.output, resultString);
console.log("TendermintLightClient file updated.");
