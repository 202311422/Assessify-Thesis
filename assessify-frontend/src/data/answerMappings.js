const answerMappings = {
  // GETTING TO KNOW YOU

  1: {
    Mathematics: { math: 2, logic: 1 },
    Science: { science: 2, logic: 1 },
    English: { communication: 2 },
    Computer: { technology: 2, programming: 1 },
    Business: { business: 2, leadership: 1 },
  },

  2: {
    Analytical: { logic: 2, math: 1 },
    Creative: { creativity: 2 },
    Caring: { helping: 2 },
    Organized: { leadership: 1, business: 1 },
    Curious: { science: 1, technology: 1 },
  },

  3: {
    "Solving puzzles": { logic: 2 },
    "Helping people": { helping: 2, teaching: 1 },
    "Leading a group": { leadership: 2 },
    "Writing or speaking": { communication: 2 },
    "Using technology": { technology: 2 },
  },

  4: {
    Office: { business: 1, leadership: 1 },
    Laboratory: { science: 2 },
    Classroom: { teaching: 2 },
    Hospital: { helping: 2 },
    "Tech workspace": { technology: 2 },
  },

  5: {
    Innovation: { creativity: 1, technology: 2 },
    "Helping others": { helping: 2 },
    Stability: { business: 1 },
    Leadership: { leadership: 2 },
    "Problem-solving": { logic: 2 },
  },
};

export default answerMappings;