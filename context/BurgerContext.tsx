import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ingredient, IngredientType } from '@/types/burger';

interface BurgerContextType {
  ingredients: Ingredient[];
  addIngredient: (type: IngredientType) => void;
  removeIngredient: (id: string) => void; // Corregido: usa id en lugar de index
  resetBurger: () => void;
}

const BurgerContext = createContext<BurgerContextType | undefined>(undefined);

export const BurgerProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 'base-panabajo', type: 'panabajo' },
  ]);

  const addIngredient = (type: IngredientType) => {
    setIngredients((prev) => {
      const newIng = { id: `${type}-${Date.now()}`, type };
      
      // Lógica de inserción inteligente (antes del pan de arriba si existe)
      const topBunIndex = prev.findIndex(i => i.type === 'panarriba');
      
      if (type === 'panarriba') {
        if (topBunIndex !== -1) return prev; // Solo 1 pan arriba
        return [...prev, newIng];
      }

      if (topBunIndex !== -1) {
        const newArr = [...prev];
        newArr.splice(topBunIndex, 0, newIng);
        return newArr;
      }

      return [...prev, newIng];
    });
  };

  const removeIngredient = (id: string) => {
    if (id === 'base-panabajo') return; // Proteger base
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const resetBurger = () => {
    setIngredients([{ id: 'base-panabajo', type: 'panabajo' }]);
  };

  return (
    <BurgerContext.Provider value={{ ingredients, addIngredient, removeIngredient, resetBurger }}>
      {children}
    </BurgerContext.Provider>
  );
};

export const useBurger = () => {
  const context = useContext(BurgerContext);
  if (!context) throw new Error('useBurger debe usarse dentro de BurgerProvider');
  return context;
};