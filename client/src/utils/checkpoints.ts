export interface Checkpoint {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  createdAt: string;
  // Sponsor fields
  sponsorName?: string;
  description?: string;
  logoUrl?: string;
  reward?: number;
  task?: string;
  participations?: number;
  // Bloxland provided checkpoints
  isBloxlandProvided?: boolean;
}

// Temporary dummy checkpoints provided by Bloxland
export const BLOXLAND_CHECKPOINTS: Checkpoint[] = [
  {
    id: "bloxland-1",
    latitude: 28.568136,
    longitude: 77.035883,
    name: "Bloxland Central Hub",
    createdAt: new Date().toISOString(),
    isBloxlandProvided: true,
    description: "Welcome to the heart of Bloxland! Complete challenges here to earn your first rewards.",
    reward: 50,
    task: "Complete the Bloxland tutorial",
    participations: 0,
  },
  {
    id: "bloxland-2",
    latitude: 28.568136 + 0.001, // Slightly offset
    longitude: 77.035883 + 0.001,
    name: "Bloxland Adventure Zone",
    createdAt: new Date().toISOString(),
    isBloxlandProvided: true,
    description: "Test your skills in this adventure zone with special rewards.",
    reward: 75,
    task: "Play the Adventure Challenge",
    participations: 0,
  },
  {
    id: "bloxland-3",
    latitude: 28.568136 - 0.001, // Slightly offset
    longitude: 77.035883 - 0.001,
    name: "Bloxland Training Ground",
    createdAt: new Date().toISOString(),
    isBloxlandProvided: true,
    description: "Perfect your skills in our training ground before taking on bigger challenges.",
    reward: 25,
    task: "Complete training exercises",
    participations: 0,
  }
];

// Initialize checkpoints in localStorage with Bloxland provided ones
export const initializeBloxlandCheckpoints = () => {
  try {
    const existingCheckpoints = localStorage.getItem('checkpoints');
    let allCheckpoints: Checkpoint[] = [];
    
    if (existingCheckpoints) {
      allCheckpoints = JSON.parse(existingCheckpoints);
    }
    
    // Add Bloxland checkpoints if they don't exist
    BLOXLAND_CHECKPOINTS.forEach(bloxlandCheckpoint => {
      const exists = allCheckpoints.some(cp => cp.id === bloxlandCheckpoint.id);
      if (!exists) {
        allCheckpoints.push(bloxlandCheckpoint);
      }
    });
    
    // Save updated checkpoints
    localStorage.setItem('checkpoints', JSON.stringify(allCheckpoints));
    console.log('Bloxland checkpoints initialized');
  } catch (error) {
    console.error('Error initializing Bloxland checkpoints:', error);
  }
};

// Get all checkpoints from localStorage
export const getAllCheckpoints = (): Checkpoint[] => {
  try {
    const savedCheckpoints = localStorage.getItem('checkpoints');
    return savedCheckpoints ? JSON.parse(savedCheckpoints) : [];
  } catch (error) {
    console.error('Error loading checkpoints:', error);
    return [];
  }
};

// Get only Bloxland provided checkpoints
export const getBloxlandCheckpoints = (): Checkpoint[] => {
  return getAllCheckpoints().filter(cp => cp.isBloxlandProvided);
};

// Get only user/sponsor created checkpoints
export const getUserCheckpoints = (): Checkpoint[] => {
  return getAllCheckpoints().filter(cp => !cp.isBloxlandProvided);
};

// Add a new checkpoint
export const addCheckpoint = (checkpoint: Checkpoint) => {
  try {
    const existingCheckpoints = getAllCheckpoints();
    const updatedCheckpoints = [...existingCheckpoints, checkpoint];
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    return true;
  } catch (error) {
    console.error('Error adding checkpoint:', error);
    return false;
  }
};

// Update checkpoint participations
export const updateCheckpointParticipations = (checkpointId: string) => {
  try {
    const allCheckpoints = getAllCheckpoints();
    const updatedCheckpoints = allCheckpoints.map(cp => {
      if (cp.id === checkpointId) {
        return {
          ...cp,
          participations: (cp.participations || 0) + 1
        };
      }
      return cp;
    });
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    return true;
  } catch (error) {
    console.error('Error updating checkpoint participations:', error);
    return false;
  }
};
