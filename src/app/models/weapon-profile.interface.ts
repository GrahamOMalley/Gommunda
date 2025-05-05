export interface WeaponProfile {
	name: string;
	range: {
	  short: string;
	  long: string;
	};
	accuracy: {
	  short: string;
	  long: string;
	};
	strength: string;
	damage: string;
	armor_penetration: string;
	ammo_roll: string;
	traits: string[];
}

export class Weapon {
  name: string;
  profiles: WeaponProfile[];

  constructor(name: string, profiles: WeaponProfile[]) {
    this.name = name;
    this.profiles = profiles;
  }
}
