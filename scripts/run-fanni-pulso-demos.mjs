import { runAllFanniPulsoDemos } from '../src/runtime/fanniPulsoDemo.js';

const results = runAllFanniPulsoDemos();

for (const result of results) {
  const receipt = result.actionReceipt;
  console.log(`\n# ${result.title}`);
  console.log(`Demo: ${result.demoId}`);
  console.log(`Synthetic: ${result.synthetic}`);
  console.log(`Leading topic: ${result.leadingTopic?.topic || 'none'}`);
  console.log(`Confidence: ${receipt.confidence}`);
  console.log(`Recommendation: ${receipt.recommendation}`);
  console.log(`Approval: ${receipt.approval.status}`);
  console.log(`External write performed: ${receipt.externalWritePerformed}`);
  console.log(`Coverage gaps: ${receipt.coverage.unavailableSources.join(', ') || 'none'}`);
}
