import type { Gym } from "./types";

export const FREE_MEMBER_LIMIT = 40;
export const FREE_TRAINER_LIMIT = 1;
export const PRO_PRICE_INR = 99;

export function isPro(gym: Gym): boolean {
  return gym.subscriptionTier === "pro";
}

export function canAddMember(gym: Gym): boolean {
  if (isPro(gym)) return true;
  return gym.members.length < FREE_MEMBER_LIMIT;
}

export function canAddTrainer(gym: Gym): boolean {
  if (isPro(gym)) return true;
  return gym.trainers.length < FREE_TRAINER_LIMIT;
}
