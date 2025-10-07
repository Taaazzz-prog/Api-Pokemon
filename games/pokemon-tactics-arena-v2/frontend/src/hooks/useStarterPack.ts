import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import { starterPackService, StarterPackResult } from '../services/starterPackService';
import { toast } from 'react-hot-toast';

export const useStarterPack = () => {
  const { user, refreshUser } = useUser();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [starterPack, setStarterPack] = useState<StarterPackResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vérifier si l'utilisateur a besoin du starter pack
  useEffect(() => {
    const checkStarterPack = async () => {
      if (!user) return;

      console.log('🔍 Vérification du starter pack pour l\'utilisateur:', user.id);

      try {
        const hasReceived = await starterPackService.hasReceivedStarterPack();
        
        console.log('📊 Résultat vérification starter pack:', { hasReceived });
        
        // Si l'utilisateur n'a pas encore reçu son starter pack
        if (!hasReceived) {
          console.log('🎁 Génération du starter pack...');
          setIsGenerating(true);
          
          // Générer le starter pack
          const generatedPack = await starterPackService.generateStarterPack();
          setStarterPack(generatedPack);
          setIsModalOpen(true);
          
          toast.success('🎁 Votre pack de démarrage vous attend !');
        } else {
          console.log('✅ L\'utilisateur a déjà reçu son starter pack');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du starter pack:', error);
        toast.error('Erreur lors du chargement du pack de démarrage');
      } finally {
        setIsGenerating(false);
      }
    };

    checkStarterPack();
  }, [user]);

  const acceptStarterPack = async () => {
    if (!starterPack) return;

    try {
      console.log('🎁 Début application du starter pack...');
      await starterPackService.applyStarterPack(starterPack);
      
      console.log('🔄 Rafraîchissement des données utilisateur...');
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      // Petit délai pour s'assurer que le rafraîchissement est terminé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🎯 Invalidation du cache roster...');
      // Invalider le cache du roster pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['roster'] });
      
      // Fermer le modal
      setIsModalOpen(false);
      
      toast.success(
        starterPack.hasLegendary 
          ? '🌟 Pack de démarrage accepté ! Vous avez un Pokémon légendaire !'
          : '✅ Pack de démarrage accepté ! Bonne aventure !'
      );
      
      console.log('✅ Starter pack accepté avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'acceptation du starter pack:', error);
      toast.error('Erreur lors de l\'acceptation du pack de démarrage');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStarterPack(null);
  };

  return {
    isModalOpen,
    starterPack,
    isGenerating,
    acceptStarterPack,
    closeModal
  };
};