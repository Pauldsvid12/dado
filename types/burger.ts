export type IngredientType = 'panarriba' | 'lechuga' | 'queso' | 'carne' | 'tomates' | 'panabajo';

export interface Ingredient {
  id: string; // único (ej: 'queso-123')
  type: IngredientType;
}

export interface BurgerState {
  ingredients: Ingredient[];
}
