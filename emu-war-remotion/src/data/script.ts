import durations from './durations.json';

export const FPS = 30;

export const SCRIPT = [
  {id: 's01', text: 'Après la Première Guerre mondiale, l\'Australie offre à ses vétérans des terres pour cultiver du blé, en Australie-Occidentale.'},
  {id: 's02', text: 'Petit problème : vingt mille émeus débarquent… et ravagent les récoltes.'},
  {id: 's03', text: 'Les fermiers n\'arrivent pas à abattre ces oiseaux énormes et ultra-rapides. Alors ils appellent l\'armée.'},
  {id: 's04', text: 'Le gouvernement envoie l\'Artillerie royale australienne : des mitrailleuses Lewis, dix mille cartouches, et le major G.P.W. Meredith aux commandes.'},
  {id: 's05', text: 'Spoiler : l\'armée a complètement sous-estimé l\'ennemi.'},
  {id: 's06', text: 'Les émeus encaissent les balles… et passent à la guérilla : ils se dispersent en petits groupes. Bonne chance avec une mitrailleuse.'},
  {id: 's07', text: 'Embuscade près d\'un barrage : mille émeus en vue. La mitrailleuse s\'enraye… après seulement une douzaine d\'oiseaux.'},
  {id: 's08', text: 'Des semaines d\'échecs comiques. La presse se moque.'},
  {id: 's09', text: 'Le major Meredith finit par l\'admettre : les émeus affrontent les mitrailleuses « avec l\'invulnérabilité des chars d\'assaut ».'},
  {id: 's10', text: 'L\'armée se retire. Les émeus ont gagné la guerre.'},
] as const;

export type Word = {w: string; s: number; e: number};
export type SceneTiming = {id: string; file: string | null; seconds: number; frames: number; words: Word[]};

export const TIMINGS = durations.scenes as SceneTiming[];
export const FREEZE_FRAMES = 2 * FPS;

// Frame (scene-local) where the first word containing `needle` starts; `fallback` is a fraction of the scene.
export const cue = (sceneId: string, needle: string, fallback: number): number => {
  const t = TIMINGS.find((s) => s.id === sceneId)!;
  const word = t.words.find((x) => x.w.toLowerCase().includes(needle.toLowerCase()));
  return Math.round((word ? word.s : t.seconds * fallback) * FPS);
};
