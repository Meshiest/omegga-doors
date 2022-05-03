import OmeggaPlugin, { Brick, OL, PC, PS } from 'omegga';
import {
  checkActiveDoor,
  handleAntispam,
  setAntispamThrottle,
} from 'src/antispam';
import { isAuthorized } from 'src/auth';
import {
  cmdDoor,
  cmdDoorPass,
  cmdDoorRegion,
  cmdDoorTrigger,
  initDebugCommands,
} from 'src/commands';
import { Config } from 'src/config';
import {
  activateDoor,
  getDoorBrickFromInteract,
  getDoorBrickFromTrigger,
  parseDoorConsoleTag,
  parseTriggerConsoleTag,
  validateDoorBrick,
  validateDoorState,
  validateTriggerState,
} from 'src/interact';
// import 'src/test';

type Storage = {};

const DEBUG_MODE = false;

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async init() {
    // debug commands for getting template and brick orientations
    if (DEBUG_MODE) initDebugCommands();

    setAntispamThrottle(this.config['anti-spam-throttle']);

    if (this.config['allow-password']) {
      // door password
      this.omegga.on('cmd:doorpass', cmdDoorPass);
    }

    if (this.config['allow-triggers']) {
      // trigger region setup
      this.omegga.on('cmd:doorregion', cmdDoorRegion(this.config));
      // trigger creation
      this.omegga.on('cmd:doortrigger', cmdDoorTrigger(this.config));
    }

    // command for getting a door setup
    this.omegga.on('cmd:door', cmdDoor(this.config));

    // interaction handling
    this.omegga.on(
      'interact',
      async ({ player: { id }, message, position }) => {
        const player = this.omegga.getPlayer(id);
        if (!player) return;

        if (!isAuthorized(this.config, player.id, 'use')) {
          this.omegga.whisper(
            player.name,
            'You are not authorized to use doors on this server.'
          );
          return;
        }

        if (message.length === 0) return;

        const triggerMatch = this.config['allow-triggers']
          ? parseTriggerConsoleTag(message)
          : null;

        let doorMatch: ReturnType<typeof parseDoorConsoleTag>;
        let scannedBrick: { brick: Brick; ownerId: string };

        // try parsing the trigger message
        if (triggerMatch) {
          // antispam handling
          await handleAntispam(player.id);

          if (
            !validateTriggerState(this.config, player, position, triggerMatch)
          ) {
            return;
          }

          // get a brick this trigger is activating
          scannedBrick = await getDoorBrickFromTrigger(triggerMatch);

          // no brick? no door!
          if (!scannedBrick || checkActiveDoor(scannedBrick.brick.position)) {
            return;
          }

          doorMatch = parseDoorConsoleTag(
            this.config,
            scannedBrick.brick.components.BCD_Interact.ConsoleTag,
            player
          );

          // otherwise parse the door message
        } else if (
          (doorMatch = parseDoorConsoleTag(this.config, message, player))
        ) {
          // antispam handling
          await handleAntispam(player.id);
          // check if a door is active at this location
          if (checkActiveDoor(position)) {
            return;
          }

          // disabled only impacts clicking the door, not a trigger
          if (doorMatch.state.flags.disabled) {
            if (!this.config['allow-disabled'])
              Omegga.middlePrint(player, `Disabled doors are ...disabled?`);
            return false;
          }
        } else {
          // not a trigger, and not a door..
          return;
        }

        if (doorMatch) {
          const { open, state } = doorMatch;

          try {
            // make sure the door config follows the config
            if (!validateDoorState(this.config, player, state)) {
              console.debug('[debug] not valid door');
              return;
            }

            // lookup a door brick if it doesn't found from the trigger
            if (!scannedBrick) {
              scannedBrick = await getDoorBrickFromInteract(position, state);
              if (!scannedBrick) {
                return;
              }
            }

            // get ownerid and brick out of the found brick
            const { brick, ownerId } = scannedBrick;

            // ensure the door brick is valid
            if (!validateDoorBrick(this.config, player, state, ownerId)) {
              console.debug('[debug] not valid', brick);
              return;
            }

            // activate the door
            await activateDoor(player, brick, ownerId, open, state);
          } catch (err) {
            console.error(
              'error interacting with brick',
              player.name,
              message,
              position,
              err
            );
          }
        }
      }
    );

    return {
      registeredCommands: [
        this.config['allow-password'] && 'doorpass',
        this.config['allow-triggers'] && 'doorregion',
        this.config['allow-triggers'] && 'doortrigger',
        'door',
        DEBUG_MODE && 'g',
        DEBUG_MODE && 'o',
      ].filter(Boolean) as string[],
    };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
