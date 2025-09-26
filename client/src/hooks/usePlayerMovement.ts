import { useCallback } from "react";

interface PlayerMovementOptions {
  avatarLayer: any;
  isEnabled: boolean;
}

export const usePlayerMovement = ({
  avatarLayer,
  isEnabled,
}: PlayerMovementOptions) => {
  const handleMovement = useCallback(() => {
    if (!isEnabled || !avatarLayer) return () => {};

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle player movement with arrow keys or WASD
      switch (event.key) {
        case "ArrowUp":
        case "w":
          console.log("Move forward");
          break;
        case "ArrowDown":
        case "s":
          console.log("Move backward");
          break;
        case "ArrowLeft":
        case "a":
          console.log("Move left");
          break;
        case "ArrowRight":
        case "d":
          console.log("Move right");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarLayer, isEnabled]);

  return { handleMovement };
};
