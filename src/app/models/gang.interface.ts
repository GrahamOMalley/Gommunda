export interface Equipment {
	name: string;
	qty: string;
      }
      
      export interface Ganger {
	ganger_id: string;
	name: string;
	type: string;
	cost: string;
	equipment: Equipment[];
	skills: string[];
	injuries: string[];
	image: string | null;
	status: string;
	notes: string;
      
	// Statline properties
	m: number; // Movement
	ws: number; // Weapon Skill
	bs: number; // Ballistic Skill
	s: number; // Strength
	t: number; // Toughness
	w: number; // Wounds
	i: number; // Initiative
	a: number; // Attacks
	ld: number; // Leadership
	cl: number; // Cool
	wil: number; // Willpower
	int: number; // Intelligence
	xp: number; // Experience
      
	// New property for special rules
	specialRules: string[]; // Array of special rules for the ganger
      }
      
      export interface Gang {
	gang_id: string;
	gang_name: string;
	gang_type: string;
	gang_rating: string;
	credits: string;
	reputation: string;
	wealth: string;
	alignment: string;
	allegiance: string;
	gang_notes: string;
	gangers: Ganger[];
	gang_image: string;
      }