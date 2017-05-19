# AInts (WIP)

Screeps AI using ants and other social colony insects as a model.

## Foraging

1. Check Surroundings
    - Spawn Exists
      - Creep not empty - Transfer energy to spawn
      - Creep empty - Switch to search mode
    - Source Exits
      - Creep not full - Harvest energy
      - Creep full - Switch to homing mode
2. Deposit Pheromone
    - Amount - increase level to `(Max level - steps from last site) * per-step change`
      - Max level - `CostMatrix` max value (255)
      - Min level - Enough that the pheromone won't decay completely within longest action time (ie. harvesting)
      - Per-step change - `(max level - min level) / max search length`
    - Pheromone type
      - Search Mode - homing pheromone
      - Homing Mode - previous search pheromone.
        - If max search steps was reached, don't deposit pheromones while homing
3. Move
    - Don't move if harvesting
    - Move to tile with lowest value for `deposit pheromone - (2 * search pheromone)`

## Spawning

- Spawn as many creeps as possible

---

## Articles

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
- [Composite collective decision-making](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4590433/)
- http://www.huffingtonpost.com/marc-bekoff/study-rats-empathy_b_1138675.html
