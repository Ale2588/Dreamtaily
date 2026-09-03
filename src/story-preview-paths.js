function nextSteps(step) {
  if (step?.decision?.type === "branch") {
    return (step.decision.options || []).map(option => ({
      next: option.next || null,
      decisionKey: step.decision.key,
      optionKey: option.key,
      optionLabel: option.label || option.key
    }));
  }
  return [{next: step?.next || null}];
}

export function enumerateStoryPreviewPaths(story, maxPaths = 32) {
  const byKey = new Map((story?.steps || []).map(step => [step.key, step]));
  const paths = [];

  function walk(key, branches, labels, visited) {
    if (paths.length >= maxPaths) return;
    if (!key) {
      paths.push({branches:{...branches}, label:labels.join(" · ") || "Percorso principale"});
      return;
    }
    if (visited.has(key) || !byKey.has(key)) return;

    const step = byKey.get(key);
    const nextVisited = new Set(visited);
    nextVisited.add(key);
    for (const edge of nextSteps(step)) {
      const nextBranches = {...branches};
      const nextLabels = [...labels];
      if (edge.decisionKey) {
        nextBranches[edge.decisionKey] = edge.optionKey;
        nextLabels.push(edge.optionLabel);
      }
      walk(edge.next, nextBranches, nextLabels, nextVisited);
    }
  }

  walk(story?.start || null, {}, [], new Set());
  return paths;
}
