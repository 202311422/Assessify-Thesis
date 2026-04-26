import answerMappings from "../data/answerMappings";

export function calculateTraits(formattedAnswers) {
  const traitScores = {};

  formattedAnswers.forEach((item) => {
    const questionId = item.questionId;
    const answer = item.answer;

    const mapping = answerMappings[questionId]?.[answer];

    if (mapping) {
      Object.keys(mapping).forEach((trait) => {
        if (!traitScores[trait]) {
          traitScores[trait] = 0;
        }
        traitScores[trait] += mapping[trait];
      });
    }
  });

  return traitScores;
}