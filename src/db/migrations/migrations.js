// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_acoustic_echo.sql';
import m0001 from './0001_aspiring_ravenous.sql';
import m0002 from './0002_perfect_random.sql';
import m0003 from './0003_salty_bloodaxe.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  