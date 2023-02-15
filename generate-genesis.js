const { spawn } = require("child_process")
const program = require("commander")
const nunjucks = require("nunjucks")
const fs = require("fs")
const web3 = require("web3")

const validators = require("./validators")
const init_holders = require("./init_holders")


program.option("--ascChainId <ascChainId>",
    "ascChainId",
    "02CA");
program.option("-c, --chainid <chainid>", "chain id", "714")

program.option(
    "--initValidatorSetBytes <initValidatorSetBytes>",
    "initValidatorSetBytes",
    ""
)

program.option(
    "--initBurnRatio <initBurnRatio>",
    "initBurnRatio",
    "0"
)

program.option("--initConsensusStateBytes <initConsensusStateBytes>",
    "init consensusState bytes, hex encoding, no prefix with 0x",
    "4178696d636861696e2d5068756f6e6700000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000003f9109c80fe80b64f299bb9701031169989879e25a500c8a745f43e53c86db6b65e09b599afa4fb6712b94e50ae0f5d5265e9749b0c6ad9152ee6a8e557a947d0000082f79cd9000");


require("./generate-system");
require("./generate-systemReward");
require("./generate-validatorset");
require("./generate-tokenhub");
require("./generate-tendermintlightclient");
require("./generate-relayerincentivizecontract");
require("./generate-crosschain");
require("./generate-slash");
require("./generate-relayerhub");
require("./generate-staking");

program.version("0.0.1")
program.option(
  "-o, --output <output-file>",
  "Genesis json file",
  "./genesis.json"
)
program.option(
  "-t, --template <template>",
  "Genesis template json",
  "./genesis-template.json"
)
program.parse(process.argv)

// compile contract
function compileContract(key, contractFile, contractName) {
  return new Promise((resolve, reject) => {
    const ls = spawn("solc", [
      "--bin-runtime",
      "/=/",
      "--optimize",
      "--optimize-runs",
      "200",
      contractFile
    ])

    const result = []
    ls.stdout.on("data", data => {
      result.push(data.toString())
    })

    ls.stderr.on("data", data => {
      // console.log(`stderr: ${data}`)
    })

    ls.on("close", code => {
      console.log(`child process exited with code ${code}`)
      resolve(result.join(""))
    })
  }).then(compiledData => {
    compiledData = compiledData.replace(
      `======= ${contractFile}:${contractName} =======\nBinary of the runtime part:`,
      "@@@@"
    )

    const matched = compiledData.match(/@@@@\n([a-f0-9]+)/)
    return { key, compiledData: matched[1], contractName, contractFile }
  })
}

// compile files
Promise.all([
  compileContract(
    "validatorContract",
    "contracts/ASCValidatorSet.sol",
    "ASCValidatorSet"
  ),
  compileContract(
    "systemRewardContract",
    "contracts/SystemReward.sol",
    "SystemReward"
  ),
  compileContract(
      "slashContract",
      "contracts/SlashIndicator.sol",
      "SlashIndicator"
  ),
  compileContract(
      "tendermintLightClient",
      "contracts/TendermintLightClient.sol",
      "TendermintLightClient"
  ),
  compileContract(
      "tokenHub",
      "contracts/TokenHub.sol",
      "TokenHub"
  ),
  compileContract(
      "relayerHub",
      "contracts/RelayerHub.sol",
      "RelayerHub"
  ),
  compileContract(
      "relayerIncentivize",
      "contracts/RelayerIncentivize.sol",
      "RelayerIncentivize"
  ),
  compileContract(
      "govHub",
      "contracts/GovHub.sol",
      "GovHub"
  ),
  compileContract(
      "tokenManager",
      "contracts/TokenManager.sol",
      "TokenManager"
  ),
  compileContract(
      "crossChain",
      "contracts/CrossChain.sol",
      "CrossChain"
  ),
  compileContract(
    "staking",
    "contracts/Staking.sol",
    "Staking"
  )
]).then(result => {

program.option("--initLockedAXCOnTokenHub <initLockedAXCOnTokenHub>",
    "initLockedAXCOnTokenHub",
    "176405560900000000000000000");

  const data = {
    initLockedAXCOnTokenHub: program.initLockedAXCOnTokenHub,
    chainId: program.chainid,
    initHolders: init_holders,
    extraData: web3.utils.bytesToHex(validators.extraValidatorBytes)
  }
  result.forEach(r => {
    data[r.key] = r.compiledData
  })
  const templateString = fs.readFileSync(program.template).toString()
  const resultString = nunjucks.renderString(templateString, data)
  fs.writeFileSync(program.output, resultString)

})
