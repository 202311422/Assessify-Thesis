import programRules from "../data/programRules";

export function scoreAssessment(traitScores) {
  const results = programRules.map((program) => {
    let totalScore = 0;
    let maxScore = 0;

    Object.keys(program.weights).forEach((trait) => {
      const weight = program.weights[trait] || 0;
      const traitScore = traitScores[trait] || 0;

      totalScore += traitScore * weight;
      maxScore += 10 * weight;
    });

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      id: program.id,
      name: program.name,
      reason: program.reason,
      percentage,
    };
  });

  results.sort((a, b) => b.percentage - a.percentage);

  return results;
}