import { Request, Response } from 'express';
import starterPackService from '../services/starterPack.service';
import { logger } from '../utils/logger';

export class StarterPackController {
  
  /**
   * Get starter pack info
   */
  async getStarterPackInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const info = await starterPackService.getStarterPackInfo(userId);
      res.json({
        success: true,
        data: info
      });
    } catch (error: any) {
      logger.error('Get starter pack info failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get starter pack info'
      });
    }
  }

  /**
   * Apply starter pack
   */
  async applyStarterPack(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const result = await starterPackService.applyStarterPack(userId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: 'Starter pack applied successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to apply starter pack'
        });
      }
    } catch (error: any) {
      logger.error('Apply starter pack failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to apply starter pack'
      });
    }
  }

  /**
   * Check starter pack status
   */
  async hasReceivedStarterPack(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const hasReceived = await starterPackService.hasReceivedStarterPack(userId);
      res.json({
        success: true,
        data: { hasReceived }
      });
    } catch (error: any) {
      logger.error('Check starter pack status failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to check starter pack status'
      });
    }
  }
}

export default new StarterPackController();