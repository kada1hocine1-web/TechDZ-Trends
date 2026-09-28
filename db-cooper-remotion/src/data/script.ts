import durations from './durations.json';

export const FPS = 30;

export const SCRIPT = [
  {id: 's01', text: '24 novembre 1971. Un homme monte dans un avion… et disparaît à jamais. Voici l\'énigme D.B. Cooper.'},
  {id: 's02', text: 'Costume sombre, cravate noire à clip. Il achète un aller simple à vingt dollars sur le vol 305 de la Northwest Orient, de Portland à Seattle, sous le nom de Dan Cooper.'},
  {id: 's03', text: 'Peu après le décollage, il tend un mot à une hôtesse. Elle l\'ignore. Alors il se penche et murmure : "Mademoiselle, vous feriez mieux de lire ce mot. J\'ai une bombe."'},
  {id: 's04', text: 'Il ouvre sa mallette : des cylindres rouges, des fils.'},
  {id: 's05', text: 'Ses exigences : deux cent mille dollars en billets de vingt, soit plus d\'un million et demi aujourd\'hui, quatre parachutes, et un camion-citerne prêt à Seattle.'},
  {id: 's06', text: 'Le FBI livre la rançon et les parachutes sur le tarmac. Cooper libère les passagers… mais garde l\'équipage.'},
  {id: 's07', text: 'Il ordonne de mettre le cap sur Mexico, à dix mille pieds d\'altitude, train d\'atterrissage sorti.'},
  {id: 's08', text: 'Quelque part au-dessus des montagnes sombres, glacées et boisées du Nord-Ouest Pacifique, il abaisse l\'escalier arrière du Boeing 727… et saute dans la nuit.'},
  {id: 's09', text: 'Une traque massive. Plus de huit cents suspects interrogés. Cooper n\'est jamais retrouvé.'},
  {id: 's10', text: 'En 1980, un jeune garçon découvre, enfoui dans le sable au bord du fleuve Columbia, un paquet de billets décomposés : cinq mille huit cents dollars de la rançon.'},
  {id: 's11', text: 'Mais aucune trace du pirate de l\'air, du reste de l\'argent, ni de son parachute.'},
  {id: 's12', text: 'C\'est encore aujourd\'hui le seul détournement d\'avion commercial jamais élucidé de toute l\'histoire de l\'aviation.'},
] as const;

export type Word = {w: string; s: number; e: number};
export type SceneTiming = {id: string; file: string; seconds: number; frames: number; words: Word[]};

export const TIMINGS = durations.scenes as SceneTiming[];
export const FREEZE_FRAMES = 2 * FPS;

// Frame (scene-local) where the first word containing `needle` starts; `fallback` is a fraction of the scene.
export const cue = (sceneId: string, needle: string, fallback: number): number => {
  const t = TIMINGS.find((s) => s.id === sceneId)!;
  const word = t.words.find((x) => x.w.toLowerCase().includes(needle.toLowerCase()));
  return Math.round((word ? word.s : t.seconds * fallback) * FPS);
};
