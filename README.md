AInts
===

Screeps AI using Ant behavior as a model.

Outline
===

- Spawn
  - Pheromone sensing range?
  - Secrete SP?
  - Creating Creeps
    - Min foragers (2?)
    - Increase max foragers with more EP nearby

- Forager Creep
  - Not Carrying Energy / Hunting
    1. Increase SP at current position by Max(lowest SP of neighboring locations, MaxPossiblePheromone / DistanceFromSpawn)
    2. Move to neighboring location with lowest value of (SP - (2 * EP))
    3. At MST, switch to homing, even if no energy found

  - Carrying Energy / Homing
    1. Increase EP at current position by Max(lowest EP of neighboring locations, MaxPossiblePheromone / DistanceFromSource)
      - Combine with source size?
    2. Move to neighboring location with lowest value of (EP - (2 * SP)) combined with DistanceFromSpawn
    3. Feed spawn with available capacity
    4. Fill container/storage with available capacity
      - Recruit others for group harvesting if source is large enough/has enough access?

- Key
  - EP = Energy Pheromone
  - SP = Spawn Pheromone
  - MST = Max Search Time

Ideas
===

Articles
===

- https://en.wikipedia.org/wiki/Ant
- [Swarm Intelligence](https://en.wikipedia.org/wiki/Swarm_intelligence)
- [Ant Colony Optimization](https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms)
- http://inspiringscience.net/2012/08/28/how-does-an-ant-colony-coordinate-its-behaviour/
- https://www.quantamagazine.org/20140409-the-remarkable-self-organization-of-ants/
- [A computational model of ant nest morphogenesis](https://mitpress.mit.edu/sites/default/files/titles/alife/0262297140chap61.pdf)
- http://www.techtimes.com/articles/7629/20140528/ants-forage-food-highly-efficient-systematic-way-study.htm
- [Chaos–order transition in foraging behavior of ants](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4060675/)
- [Learning Ant Foraging Behaviors](https://cs.gmu.edu/~eclab/papers/panait04learning.pdf)
- http://www.antwiki.org/wiki/Foraging_behaviors_in_Poneroids_and_Ectatomminae
- http://mute-net.sourceforge.net/howAnts.shtml
- http://natureofcode.com/book
