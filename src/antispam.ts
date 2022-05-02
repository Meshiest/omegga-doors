import { Vector } from 'omegga';

const antispam = {};
let throttle = 150;

const throttleAmount = Math.min(Math.max(throttle, 0), 60000);

export type ActiveDoor = { center: Vector; extent: Vector };
const activeDoors: { center: Vector; extent: Vector }[] = [];

export const addActiveDoor = (activeDoor: ActiveDoor) => {
  activeDoors.push(activeDoor);
};

export const cleanupActiveDoor = (activeDoor: ActiveDoor) => {
  const index = activeDoors.indexOf(activeDoor);
  if (index > -1) {
    activeDoors[index] = activeDoors[activeDoors.length - 1];
    activeDoors.pop();
  }
};

export const checkActiveDoor = (position: Vector) =>
  activeDoors.some(
    ({ center, extent }) =>
      position[0] >= center[0] - extent[0] &&
      position[0] <= center[0] + extent[0] &&
      position[1] >= center[1] - extent[1] &&
      position[1] <= center[1] + extent[1] &&
      position[1] >= center[1] - extent[1] &&
      position[1] <= center[1] + extent[1]
  );

export const setAntispamThrottle = (amount: number) => {
  throttle = amount;
};

export const handleAntispam = async (id: string) => {
  if (throttleAmount === 0) return;

  if (id in antispam) {
    // anti spam on second click onward
    clearTimeout(antispam[id]);
    await new Promise(
      resolve => (antispam[id] = setTimeout(resolve, throttleAmount))
    );
    delete antispam[id];
  } else {
    // no antispam on first click
    antispam[id] = setTimeout(() => {
      delete antispam[id];
    }, throttleAmount);
  }
};
