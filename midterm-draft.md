## Title

Mayor Climate Game

Hu Yunhan

Research Advisor: Lawted Wu

## Research Question & Hypothesis

Research Question: How does Mayor Climate Game affect energy layout choices for undergraduate students in a social science or urban climate class?

Hypothesis: I hypothesize that after using Mayor Climate Game, undergraduate students will choose fewer high-carbon coal plants and show better understanding of the tradeoff between cost, carbon emissions, and urban ventilation.

## Background

Cities are facing hotter summers, higher cooling demand, and pressure to reduce carbon emissions.

Urban heat is not only a weather problem. It is also connected to energy use, public health, and city planning.

When a city depends only on air conditioning, electricity demand and emissions can rise. The International Energy Agency notes that cooling demand is growing fast, and that city design also matters.

My project asks a small version of this problem: if a player has limited money, will they still choose cleaner energy when the page shows the climate cost of each choice?

## Literature Review

Research on urban ventilation corridors shows that wind paths can help cities move heat and pollution out of dense areas. The Beijing and Guiyang cases show that parks, green space, water systems, roads, and prevailing wind direction can all be part of ventilation planning.

Other studies use GIS, remote sensing, WRF, and CFD to find heat islands and ventilation barriers. These tools are powerful, but they are hard for non-experts to use.

The International Energy Agency argues that cooling is not only about air conditioners. Building design, natural ventilation, and urban green space can reduce cooling pressure.

Serious games offer another path. Energy and heat-planning games can help non-expert users learn tradeoffs by making choices. This supports my project: a small browser game can make an abstract planning problem easier to understand.

The gap is that many tools are either professional simulation tools or public education games. My project is a small research prototype that both teaches a concept and records player choices.

## Research Design / Method

My artifact is a single-file browser game called Mayor Climate Game.

The player acts as a mayor with a budget of 10 million yuan. The city is a 12 by 12 grid with normal areas, residential areas, ventilation corridors, wind outlets, and low basins.

The player can place three facilities: coal power, wind power, and ground-source heat pumps.

The page updates three indicators in real time: average temperature, average wind speed, and carbon emissions.

At the end, the player answers two short questions and downloads a JSON file. The file records the layout, budget used, score, metrics, and survey answers.

For the user study, I plan to invite classmates or workshop participants to play one round. I will analyze whether they choose coal power, where they place it, and whether they understand the ventilation rule.

## Research Plan & Challenges

Current status: the MVP page, research folder, and spec file are already in the GitHub repository. The prototype is deployed on Vercel and can also run locally as index.html.

Next steps:

1. Polish the page and deploy it online.
2. Ask several classmates to play one short round.
3. Collect the exported JSON files.
4. Compare layouts, carbon emissions, budget use, and answers to the two questions.
5. Decide whether the questionnaire needs one open-ended question.

Main challenges:

- The physics model is simplified, so I cannot claim it is a real city simulation.
- The sample size may be small.
- Some players may treat the page as a game only, not as a research task.
- The Vercel site is live, but some networks may have trouble opening vercel.app, so I will keep the local file as a backup.

## Expected Results — user study not yet run

The user study has not been run yet.

I expect some students will first choose coal because it is cheaper.

I also expect that after seeing carbon emissions and ventilation feedback, some students will shift toward wind power or heat pumps.

I expect the JSON files to show different strategies: low-cost coal-heavy layouts, cleaner but more expensive layouts, and mixed layouts.

I will not report user numbers, percentages, or conclusions until I collect real user data.

## References

Guan, Y., Chen, H., & Zhou, X. (2015). Study of urban ventilation corridor planning method based on a case study of Guiyang, China.

International Energy Agency. (2023). Staying cool without overheating the energy system.

International Energy Agency. (2023). Sustainable, affordable cooling can save tens of thousands of lives each year.

Zheng et al. (2022). Urban ventilation planning and its associated benefits based on numerical experiments: A case study in Beijing, China.

## Acknowledgements

Thank you to Lawted Wu for the course structure, comments, and guidance.

Thank you to my classmates for future testing and feedback.