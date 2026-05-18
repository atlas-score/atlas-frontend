import feed from '../../atlas-score-examples.json';
import type { AtlasEvaluation, ExamplesFeed } from '../types/evaluation';

const data = feed as ExamplesFeed;

export const evaluations: AtlasEvaluation[] = data.examples;
