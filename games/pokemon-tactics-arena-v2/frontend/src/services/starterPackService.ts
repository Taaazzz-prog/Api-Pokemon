import { apiClient } from './apiClient';

export interface StarterPackInfo {
  hasReceived: boolean;
  rosterCount: number;
  rewards: {
    pokeCredits: number;
    pokeGems: number;
    starterPokemon: number;
  };
}

export const starterPackService = {
  async getInfo(): Promise<StarterPackInfo> {
    return apiClient.get('/starter-pack/info');
  },

  async getStatus(): Promise<{ hasReceived: boolean }> {
    return apiClient.get('/starter-pack/status');
  },

  async apply(): Promise<any> {
    return apiClient.post('/starter-pack/apply');
  },
};

export default starterPackService;
