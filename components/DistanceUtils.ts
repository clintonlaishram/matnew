export const calculateDeliveryCharge = (distanceInKm: number): number => {
    const baseRate = 40; // Base charge
    const ratePerKm = 10; // Charge per km
    return baseRate + distanceInKm * ratePerKm;
  };
  