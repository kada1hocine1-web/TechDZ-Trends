import durations from './durations.json';

export const FPS = 30;

export const SCRIPT = [
  {id: 's01', text: 'Entre 1974 et 1986, un intrus masqué terrorise la Californie.'},
  {id: 's02', text: 'Au moins treize meurtres, cinquante viols et cent vingt cambriolages.'},
  {id: 's03', text: 'On l\'appelle l\'East Area Rapist, puis l\'Original Night Stalker, et enfin… le Golden State Killer.'},
  {id: 's04', text: 'Il aveugle ses victimes à la lampe torche, traque méticuleusement des quartiers entiers, et sème une terreur psychologique durable.'},
  {id: 's05', text: 'Malgré d\'immenses cellules d\'enquête et des milliers de signalements, la piste se refroidit complètement.'},
  {id: 's06', text: 'La percée arrive plus de quarante ans plus tard, grâce à une technique révolutionnaire : la généalogie génétique d\'investigation.'},
  {id: 's07', text: 'En 2018, l\'enquêteur Paul Holes et la généalogiste génétique Barbara Rae-Venter reprennent l\'ADN laissé sur une scène de crime de 1980.'},
  {id: 's08', text: 'Ils le téléversent sur GEDmatch, une base de données généalogique publique, utilisée par des amateurs pour retrouver des parents éloignés.'},
  {id: 's09', text: 'En recoupant l\'ADN de cousins au troisième et au quatrième degré, ils bâtissent d\'immenses arbres généalogiques…'},
  {id: 's10', text: '… jusqu\'à un seul nom : Joseph James DeAngelo, un ancien policier de soixante-douze ans.'},
  {id: 's11', text: 'Les enquêteurs récupèrent discrètement son ADN sur un mouchoir jeté et sur une poignée de portière. Correspondance parfaite.'},
  {id: 's12', text: 'En 2020, DeAngelo plaide coupable. Il est condamné à plusieurs peines de prison à perpétuité. L\'un des cold cases les plus obsédants d\'Amérique est enfin résolu.'},
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
