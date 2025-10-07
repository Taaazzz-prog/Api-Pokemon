import { Router } from 'express';
import { userService } from '../services/user.service';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const loginSchema = {
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  })
};

const registerSchema = {
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  })
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  })
};

// Register new user
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    const result = await userService.register({ email, password, username });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Compte créé avec succès'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la création du compte'
    });
  }
});

// Login user
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await userService.login({ email, password });
    
    res.json({
      success: true,
      data: result,
      message: 'Connexion réussie'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Erreur de connexion'
    });
  }
});

// Logout user
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    await userService.logout(userId);
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur de déconnexion'
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await userService.getUserProfile(userId);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération du profil'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const updates = req.body;
    
    const updatedUser = await userService.updateProfile(userId, updates);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour du profil'
    });
  }
});

// Change password
router.put('/change-password', authenticate, validateRequest(changePasswordSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    
    await userService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du changement de mot de passe'
    });
  }
});

// Refresh token
router.post('/refresh', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const result = await userService.refreshToken(userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Token rafraîchi avec succès'
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Erreur lors du rafraîchissement du token'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requis'
      });
    }
    
    await userService.requestPasswordReset(email);
    
    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la demande de réinitialisation'
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token et nouveau mot de passe requis'
      });
    }
    
    await userService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
});

export default router;