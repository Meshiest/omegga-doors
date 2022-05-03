# doors

doors/moving bricks in brickadia for [omegga](https://github.com/brickadia-community/omegga).

## Install

`omegga install gh:meshiest/doors`

## Usage

### Creating a door

1. copy bricks of a closed door
2. paste template (but don't place bricks)
3. move your template on top of the copied bricks in an "open" orientation
4. `/door` will update your template to a working door

- you can add options (one or more) to your door to change behavior: (these options can be disabled in config)
  - `/door private` - a door only the brick owner can open (there is a config for letting authorized users open private doors)
  - `/door oneway` - a door that can only open, but not close
  - `/door destruction` - a door that simply clears its bricks
  - `/door disabled` - a door that can only be opened via trigger
  - `/door password:1a2b3c4` or `/door pin:1a2b3c4` - a door that needs to be decrypted (literally) with `/doorpass 1a2b3c4` for usage. (these doors cannot be opened by config-authorized users as they are literally encrypted with the password)
  - (example) `/door private destruction` a door only you can click and clear

5. paste/place your door anywhere

### Creating Triggers

1. copy bricks in an area that has or will have a door
2. `/doorregion` will store the region you have selected in memory
3. copy bricks you want to add a trigger component to
4. `/doortrigger` will put those bricks on your clipboard with trigger components
5. paste/place your trigger. Trigger locations are NOT relative.
