class LLMProvider {
  constructor(modelConfig = {}) {
    this.modelConfig = modelConfig;
  }

  async generate(systemPrompt, userPrompt) {
    // TODO: Replace mock implementation with @mariozechner/pi-ai integration.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const payloadPreview = {
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      model: this.modelConfig.model || 'mock-model',
    };

    return JSON.stringify({
      tasks: [
        { id: 1, description: 'Summarize the uploaded context relevant to the query.' },
        { id: 2, description: 'Extract actionable steps to solve the user query.' },
        { id: 3, description: `Validate assumptions using model ${payloadPreview.model}.` },
      ],
      meta: payloadPreview,
    });
  }

  async stream(systemPrompt, userPrompt, onToken) {
    // TODO: Replace mock implementation with @mariozechner/pi-ai streaming integration.
    const fakeTokens = [
      'Analyzing',
      ' task',
      ' with',
      ' provided',
      ' context',
      '...done.',
    ];

    return new Promise((resolve) => {
      let index = 0;
      const timer = setInterval(() => {
        if (index >= fakeTokens.length) {
          clearInterval(timer);
          resolve(fakeTokens.join(''));
          return;
        }

        onToken(fakeTokens[index]);
        index += 1;
      }, 120);
    });
  }
}

module.exports = {
  LLMProvider,
};
