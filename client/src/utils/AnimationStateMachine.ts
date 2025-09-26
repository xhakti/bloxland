/* eslint-disable @typescript-eslint/no-explicit-any */
// Animation State Machine for ReadyPlayerMe Avatar
import * as THREE from "three";

export type AnimationState =
  | "initial_variation"
  | "base_idle"
  | "random_variation"
  | "walking";

export const AnimationStates = {
  INITIAL_VARIATION: "initial_variation" as AnimationState,
  BASE_IDLE: "base_idle" as AnimationState,
  RANDOM_VARIATION: "random_variation" as AnimationState,
  WALKING: "walking" as AnimationState,
};

export interface AnimationAction {
  action: THREE.AnimationAction;
  name: string;
  duration: number;
}

export interface StateMachineConfig {
  initialVariationDuration: number;
  baseIdleDuration: number;
  variationDurationMin: number;
  variationDurationMax: number;
  fadeTime: number;
}

export class AnimationStateMachine {
  private currentState: AnimationState = AnimationStates.INITIAL_VARIATION;
  private currentAction?: AnimationAction;
  private stateStartTime: number = 0;
  private config: StateMachineConfig;

  // Available animation actions
  private idleVariations: AnimationAction[] = [];
  private baseIdleAction?: AnimationAction;
  private walkingAction?: AnimationAction;

  // State machine tracking
  private isInitialized: boolean = false;
  private hasPlayedInitialVariation: boolean = false;

  // Variation history for better randomness
  private lastPlayedVariations: string[] = [];
  private maxHistorySize: number = 2;

  constructor(config?: Partial<StateMachineConfig>) {
    this.config = {
      initialVariationDuration: 20000, // 20 seconds for initial variation
      baseIdleDuration: 15000, // 15 seconds of base idle
      variationDurationMin: 4000, // 4 seconds minimum for variations
      variationDurationMax: 8000, // 8 seconds maximum for variations
      fadeTime: 0.8, // 0.8 seconds fade between animations
      ...config,
    };

    this.stateStartTime = Date.now();
    console.log("AnimationStateMachine initialized with config:", this.config);
  }

  // Register animation actions with the state machine
  registerAnimations(actions: { [key: string]: THREE.AnimationAction }) {
    // Identify and register all idle variations
    const idleVariationNames = [
      "idle_variation_005",
      "idle_variation_006",
      "idle_variation_007",
      "idle_variation_008",
    ];

    idleVariationNames.forEach((variationName) => {
      if (actions[variationName]) {
        this.idleVariations.push({
          action: actions[variationName],
          name: variationName,
          duration: actions[variationName].getClip().duration,
        });
        console.log(`Registered idle variation: ${variationName}`);
      }
    });

    // Register base idle animation
    if (actions["idle_base"]) {
      this.baseIdleAction = {
        action: actions["idle_base"],
        name: "idle_base",
        duration: actions["idle_base"].getClip().duration,
      };
    }

    // Register walking animation
    if (actions["walking"]) {
      this.walkingAction = {
        action: actions["walking"],
        name: "walking",
        duration: actions["walking"].getClip().duration,
      };
    }

    console.log("Registered animations:", {
      idleVariations: this.idleVariations.length,
      hasBaseIdle: !!this.baseIdleAction,
      hasWalking: !!this.walkingAction,
    });

    this.isInitialized = true;
    this.startInitialVariation();
  }

  // Update the state machine (call this in render loop)
  update(_deltaTime: number) {
    if (!this.isInitialized) return;

    const currentTime = Date.now();
    const timeInCurrentState = currentTime - this.stateStartTime;

    switch (this.currentState) {
      case AnimationStates.INITIAL_VARIATION:
        if (
          timeInCurrentState >= this.config.initialVariationDuration &&
          !this.hasPlayedInitialVariation
        ) {
          this.transitionToBaseIdle();
          this.hasPlayedInitialVariation = true;
        }
        break;

      case AnimationStates.BASE_IDLE:
        if (timeInCurrentState >= this.config.baseIdleDuration) {
          this.transitionToRandomVariation();
        }
        break;

      case AnimationStates.RANDOM_VARIATION: {
        const variationDuration =
          this.config.variationDurationMin +
          Math.random() *
            (this.config.variationDurationMax -
              this.config.variationDurationMin);

        if (timeInCurrentState >= variationDuration) {
          this.transitionToBaseIdle();
        }
        break;
      }

      case AnimationStates.WALKING:
        // Walking state is manually controlled
        break;
    }
  }

  // Manual state transitions
  startWalking() {
    if (this.walkingAction) {
      this.transitionToState(AnimationStates.WALKING, this.walkingAction);
    }
  }

  stopWalking() {
    if (this.baseIdleAction) {
      this.transitionToState(AnimationStates.BASE_IDLE, this.baseIdleAction);
    }
  }

  returnToBaseIdle() {
    if (this.baseIdleAction) {
      this.transitionToState(AnimationStates.BASE_IDLE, this.baseIdleAction);
    }
  }

  // Internal state transition methods
  private startInitialVariation() {
    if (this.idleVariations.length > 0) {
      const randomVariation = this.selectRandomVariation();
      if (randomVariation) {
        this.transitionToState(
          AnimationStates.INITIAL_VARIATION,
          randomVariation
        );
        console.log("Started initial variation:", randomVariation.name);
      }
    }
  }

  private transitionToBaseIdle() {
    if (this.baseIdleAction) {
      this.transitionToState(AnimationStates.BASE_IDLE, this.baseIdleAction);
      console.log("Transitioned to base idle");
    }
  }

  private transitionToRandomVariation() {
    if (this.idleVariations.length > 0) {
      const randomVariation = this.selectRandomVariation();
      if (randomVariation) {
        this.transitionToState(
          AnimationStates.RANDOM_VARIATION,
          randomVariation
        );
        console.log("Transitioned to random variation:", randomVariation.name);
      }
    }
  }

  private selectRandomVariation(): AnimationAction | null {
    if (this.idleVariations.length === 0) return null;

    if (this.idleVariations.length <= 2) {
      return this.idleVariations[
        Math.floor(Math.random() * this.idleVariations.length)
      ];
    }

    const availableVariations = this.idleVariations.filter(
      (variation) => !this.lastPlayedVariations.includes(variation.name)
    );

    const variationsToChooseFrom =
      availableVariations.length > 0
        ? availableVariations
        : this.idleVariations;

    const selectedVariation =
      variationsToChooseFrom[
        Math.floor(Math.random() * variationsToChooseFrom.length)
      ];

    this.lastPlayedVariations.push(selectedVariation.name);
    if (this.lastPlayedVariations.length > this.maxHistorySize) {
      this.lastPlayedVariations.shift();
    }

    console.log(
      `Selected variation: ${
        selectedVariation.name
      }, History: [${this.lastPlayedVariations.join(", ")}]`
    );
    return selectedVariation;
  }

  private transitionToState(
    newState: AnimationState,
    newAnimationAction: AnimationAction
  ) {
    // Fade out current animation
    if (this.currentAction) {
      this.currentAction.action.fadeOut(this.config.fadeTime);
    }

    // Fade in new animation
    newAnimationAction.action.reset();
    newAnimationAction.action.fadeIn(this.config.fadeTime);
    newAnimationAction.action.play();

    // Update state
    this.currentState = newState;
    this.currentAction = newAnimationAction;
    this.stateStartTime = Date.now();

    console.log(
      `State transition: ${newState} - Playing: ${newAnimationAction.name}`
    );
  }

  // Getters for debugging and external access
  getCurrentState(): AnimationState {
    return this.currentState;
  }

  getCurrentAnimationName(): string | undefined {
    return this.currentAction?.name;
  }

  getStateTime(): number {
    return Date.now() - this.stateStartTime;
  }

  isInIdleState(): boolean {
    return this.currentState !== AnimationStates.WALKING;
  }

  updateConfig(newConfig: Partial<StateMachineConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("Updated state machine config:", this.config);
  }
}
