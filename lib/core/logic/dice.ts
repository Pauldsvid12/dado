export const rollDice = (): number => {
    return Math.floor(Math.random() * 6) + 1;
  };
  
  export const getDiceRotation = (value: number) => {
    //Rotaciones para cara del dado
    const rotations = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: 90, z: 0 },
      3: { x: 0, y: 0, z: -90 },
      4: { x: 0, y: 0, z: 90 },
      5: { x: 0, y: -90, z: 0 },
      6: { x: 180, y: 0, z: 0 },
    };
    return rotations[value as keyof typeof rotations] || rotations[1];
  };  