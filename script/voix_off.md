# Cristallogenèse du silicium — script de voix off

Auteur : Kada Hocine · Master 2 Physique des matériaux · Encadré par : Dr Sehabi
Source : `Cristallogenese_du_silicium.pptx` (16 diapositives, notes orateur, 2 graphiques natifs, 8 images).

**Conventions**

- Les lignes `>` sont le texte lu par la voix off. Les nombres y sont écrits comme ils seront prononcés.
- « À l'écran » décrit l'animation. Les équations notées `Éq.` sont révélées terme à terme, synchronisées avec la phrase qui les énonce.
- Durée totale **mesurée** : **16 min 40 s** (1000,5 s). Voix edge-tts fr-FR-HenriNeural, débit −15 % (≈ 140 mots/min). Chaque scène = 0,6 s de silence + durée réelle de l'audio + 1 s de respiration ; générique tenu 20 s.
- `[À VÉRIFIER]` : valeur ou formule absente du PPT et dont je ne suis pas certain. Liste récapitulative en fin de document.
- Valeurs dérivées par calcul exact à partir des données du PPT (signalées « calcul ») : distance premiers voisins, densité atomique, fractions atomiques, angles cristallographiques, compacité.

---

## Scène 00 — Ouverture · 00:00 (0:15 · audio 12,6 s)

À l'écran : fond #1B2A3A. Titre « Cristallogenèse du silicium » (Cambria, blanc), sous-titre « Du sable de quartz au monocristal parfait ». Puis « Kada Hocine », « Master 2 Physique des matériaux », « Encadré par : Dr Sehabi ». Photo du lingot Cz en Ken Burns à droite, crédit visible : *Lingot de Si monocristallin — Stahlkocher, GFDL, Wikimedia Commons*.

> Cristallogenèse du silicium : du sable de quartz au monocristal parfait. Un exposé de Kada Hocine, Master 2 Physique des matériaux, encadré par le docteur Sehabi.

## Scène 01 — Plan · 00:14 (0:32 · audio 30,5 s)

À l'écran : les six cartes numérotées du plan apparaissent une à une, synchronisées.

> Nous suivrons le silicium en six temps. D'abord sa structure cristalline, puis les raisons qui imposent un monocristal ultra-pur. Viennent ensuite la réduction du quartz et la purification par le procédé Siemens. Le cœur de l'exposé porte sur le tirage Czochralski : principe, paramètres, défauts ponctuels et ségrégation. Nous terminerons par la fusion de zone, la comparaison des deux méthodes et le passage du lingot à la plaquette.

## Scène 02 — Un cristal covalent de structure diamant · 00:46 (0:58 · audio 56,4 s)

À l'écran : maille diamant en 3D (react-three-fiber), rotation lente. Apparition des 4 atomes CFC, puis du motif décalé de (¼,¼,¼)a, puis des liaisons tétraédriques. Cartes « 5,43 Å — paramètre de maille a (Kittel) » et « 1414 °C — température de fusion ».

Éq. 2.1 (calcul) : d = a√3/4 = 2,35 Å
Éq. 2.2 (calcul) : n = 8/a³ ≈ 5,0·10²² cm⁻³
Éq. 2.3 : θ = arccos(−1/3) = 109,47°
Éq. 2.4 : compacité = π√3/16 ≈ 0,34

> Le silicium cristallise dans la structure diamant : un réseau cubique à faces centrées, avec un motif de deux atomes décalés d'un quart de la grande diagonale. La maille conventionnelle contient donc huit atomes. Chaque atome a quatre voisins aux sommets d'un tétraèdre, signature de l'hybridation s p trois, avec un angle de 109,47 degrés. Le paramètre de maille vaut 5,43 ångströms, d'après Kittel. On en déduit la distance entre premiers voisins, 2,35 ångströms, et la densité atomique, environ cinq fois dix puissance vingt-deux atomes par centimètre cube. La structure est peu compacte : 34 % seulement de l'espace est occupé. Le silicium fond à 1414 degrés et se dilate d'environ 10 % en se solidifiant : on ne peut pas le couler dans un moule si l'on veut un cristal sans contraintes.

## Scène 03 — Pourquoi un monocristal ultra-pur ? · 01:45 (0:43 · audio 41,6 s)

À l'écran : photo de la plaquette multicristalline (Ken Burns), crédit : *Plaquette multicristalline — Radiotrefoil, CC BY-SA 4.0, Wikimedia Commons*. Cartes « 10¹⁵–10¹⁹ atomes dopants par cm³ » et « < 10¹² métaux contaminants par cm³ ».

Éq. 3.1 (calcul) : 10¹⁵ / 5·10²² = 2·10⁻⁸ ; 10¹⁹ / 5·10²² = 2·10⁻⁴
Éq. 3.2 (calcul) : 10¹² / 5·10²² = 2·10⁻¹¹

> Pourquoi exiger un monocristal ? Sur cette plaquette multicristalline, les grains se voient à l'œil nu. Joints de grains et dislocations introduisent des niveaux dans la bande interdite : ils piègent électrons et trous, et dégradent transistors et cellules. Le dopage contrôle la conduction, avec dix puissance quinze à dix puissance dix-neuf atomes par centimètre cube, soit deux atomes sur cent millions à deux sur dix mille. Les métaux contaminants doivent rester sous dix puissance douze, soit deux atomes sur cent milliards. Il faut donc un cristal où rien d'autre n'est présent, et un réseau parfait sur tout un lingot de plusieurs dizaines de kilogrammes.

## Scène 04 — Du sable à la plaquette · 02:28 (0:38 · audio 36,6 s)

À l'écran : chaîne en six étapes (Quartz SiO₂ → Si métallurgique ≈ 98 % → Trichlorosilane SiHCl₃ distillé → Polysilicium 9N à 11N → Monocristal Cz ou FZ → Plaquettes), étiquettes Réduction / Purification chimique / Cristallogenèse / Usinage. L'étape 5 s'allume en orange.

> La chaîne de fabrication compte six maillons. Le quartz est réduit en silicium métallurgique, pur à 98 % environ. Celui-ci est converti en trichlorosilane, que l'on distille, puis en polysilicium de pureté neuf N à onze N. La cristallogenèse transforme ce polysilicium en monocristal, par tirage Czochralski ou par fusion de zone. L'usinage livre enfin les plaquettes. C'est l'étape de cristallogenèse qui nous occupera surtout : elle change un solide pur mais désordonné en un réseau unique et orienté.

## Scène 05 — Étape 1 : réduction carbothermique · 03:06 (0:50 · audio 48,6 s)

À l'écran : schéma de four à arc (pictogramme), températures « ≈ 2000 °C zone chaude », « > 1780 °C en bas du four ». Réactions écrites terme à terme.

Éq. 5.1 : SiO₂ + 3 C → SiC + 2 CO
Éq. 5.2 : SiO₂ + 2 SiC → 3 Si + 2 CO
Éq. 5.3 : bilan SiO₂ + 2 C → Si + 2 CO

> Première étape : la réduction carbothermique. Quartz et carbone sont chargés dans un four électrique à arc immergé. La zone chaude atteint environ 2000 degrés, et le bas du four dépasse 1780 degrés. Deux réactions dominent. Le carbone attaque d'abord la silice et forme du carbure de silicium. Ce carbure réduit ensuite la silice restante en silicium. Au bilan, une silice et deux carbones donnent un silicium et deux monoxydes de carbone, qui quittent le four sous forme gazeuse. Le silicium métallurgique obtenu titre environ 98 %. Il reste deux pour cent de fer, d'aluminium, de bore et de phosphore : bien trop pour l'électronique.

## Scène 06 — Étape 2 : procédé Siemens · 03:56 (0:52 · audio 50,3 s)

À l'écran : trois étapes numérotées (Chloration, Distillation, Dépôt CVD) avec réactions ; puis graphique en barres animé reproduisant `chart1` (données exactes : Si métallurgique 2, Si UMG 6, Solaire multi 8, Solaire mono 10, Électronique 11 ; titre « Pureté maximale : nombre de « 9 » (N) »).

Éq. 6.1 : Si + 3 HCl → SiHCl₃ + H₂
Éq. 6.2 : SiHCl₃ + H₂ → Si + 3 HCl (≈ 1150 °C)
Éq. 6.3 : 9N = 99,9999999 %

> Deuxième étape : le procédé Siemens. Chloré par l'acide chlorhydrique, le silicium donne du trichlorosilane et de l'hydrogène. Le trichlorosilane bout à 31,8 degrés : on le sépare des impuretés par distillation. On le décompose ensuite sous hydrogène, par dépôt chimique en phase vapeur, sur des filaments portés vers 1150 degrés. On obtient des barreaux de polysilicium de 15 à 20 centimètres de diamètre. Le graphique donne la pureté maximale en nombre de neuf, d'après Bernreuter Research : deux pour le silicium métallurgique, six pour le métallurgique amélioré, huit et dix pour le solaire multi et monocristallin, onze pour l'électronique. Onze neuf, c'est un atome étranger sur cent milliards.

## Scène 07 — Historique du tirage Czochralski · 04:48 (0:26 · audio 24,8 s)

À l'écran : frise 1916 → 1948–1950. Photo du lingot Cz en Ken Burns, crédit : *Stahlkocher, GFDL, Wikimedia Commons*.

> Le tirage Czochralski porte le nom de Jan Czochralski. En 1916, chez A E G à Berlin, il tire des monocristaux d'étain, de zinc et de plomb depuis un bain fondu. Entre 1948 et 1950, Gordon Teal, aux Bell Labs, applique la méthode au germanium. Elle devient ensuite la base du silicium électronique.

## Scène 08 — Principe du tirage Cz · 05:14 (0:38 · audio 35,9 s)

À l'écran : four Cz animé (composant maison, d'après le schéma du PPT) : creuset de quartz, résistances graphite, bain orange, atmosphère d'argon ; le germe descend, touche le bain, col, épaulement, corps du lingot ; flèches de contre-rotation germe/creuset ; flèches de flux thermique. Les cinq étapes numérotées s'affichent en synchronisation.

> Le procédé tient en cinq étapes. On fond du polysilicium dans un creuset de quartz, sous argon, au-dessus de 1414 degrés. On met en contact un germe monocristallin orienté avec la surface du bain. On tire alors un col, fin et rapide, où les dislocations s'éliminent. On élargit ensuite le cristal en un épaulement jusqu'au diamètre voulu, puis on tire lentement le corps du lingot, pendant que germe et creuset tournent en sens inverse. Enfin, on réduit le diamètre en un cône avant de quitter le bain.

## Scène 09 — Approfondissement : le col de Dash · 05:52 (0:51 · audio 49,6 s)

À l'écran : zoom sur le col. Plan {111} incliné dans un cylindre de diamètre d ; une ligne de dislocation glisse dans le plan et sort par la surface latérale. Cotes d et h.

Éq. 9.1 : cos θ = [100]·[111] / (|[100]| |[111]|) = 1/√3
Éq. 9.2 : θ = 54,7°
Éq. 9.3 : h = d tan θ
Éq. 9.4 : tan θ = √2 ⇒ h = √2 d ≈ 1,4 d

> Pourquoi le col élimine-t-il les dislocations ? Au contact du bain, le choc thermique en crée dans le germe. Dans la structure diamant, elles glissent sur les plans un un un. Pour une croissance selon l'axe un zéro zéro, l'angle thêta entre l'axe et la normale à ces plans a pour cosinus un sur racine de trois : 54,7 degrés. Dans un col de diamètre d, un tel plan s'étend sur une hauteur d tangente thêta, soit racine de deux fois d. Une dislocation qui y glisse atteint donc la surface latérale en moins d'un diamètre et demi de col, et disparaît. Avec un col de 2 à 5 millimètres, quelques diamètres de longueur suffisent en principe. Mais ce col fin porte tout le lingot : sa section limite la masse tirable.

## Scène 10 — Paramètres et bilan thermique à l'interface · 06:43 (1:23 · audio 81,7 s)

À l'écran : cartes « ≤ 1 mm/min — corps », « 3–6 mm/min — col, diamètre 2–5 mm », « 300 mm — production de masse (450 mm démontré) ». Puis schéma 1D de l'interface avec flux K_l G_l (liquide → interface), chaleur latente ρLV, flux K_s G_s (interface → solide). Puis lingot rayonnant (flèches radiales).

Éq. 10.1 : K_s G_s = K_l G_l + ρ L V
Éq. 10.2 : G_l → 0 ⇒ V_max = K_s G_s / (ρ L)
Éq. 10.3 : rappel PPT : V · ρ · L = K · dT/dx
Éq. 10.4 : K d²T/dx² = (2εσ/r) T⁴
Éq. 10.5 : × dT/dx et intégration : (K/2)(dT/dx)² = (2εσ/5r) T⁵
Éq. 10.6 : V_max = (1/ρL) √(4εσ K T_m⁵ / 5r) ∝ r^(−1/2)

> Le corps du lingot se tire à un millimètre par minute au plus ; le col, entre 3 et 6 millimètres par minute, avec un diamètre de 2 à 5 millimètres. On produit en masse du 300 millimètres, et le 450 a été démontré. Qu'est-ce qui limite la vitesse ? Écrivons le bilan d'énergie à l'interface. En avançant à la vitesse V, elle libère par unité de surface la puissance rho L V. Cette chaleur, ajoutée au flux venu du liquide, doit partir par conduction dans le solide. La vitesse est maximale quand le liquide n'apporte plus rien : c'est la relation V rho L égale K d T sur d x. Allons plus loin : le gradient dans le solide dépend du refroidissement radiatif du lingot. Pour un cylindre de rayon r, d'émissivité epsilon et de conductivité constante, le bilan sur une tranche donne cette équation. Multiplions par d T sur d x et intégrons : la vitesse maximale varie comme l'inverse de la racine du rayon. Les gros lingots se tirent donc plus lentement. Enfin, la contre-rotation du germe et du creuset homogénéise le bain et aplanit l'interface ; l'argon protège le bain et évacue le monoxyde de silicium ; un asservissement de la puissance garde le diamètre constant.

Note : σ = 5,670·10⁻⁸ W·m⁻²·K⁻⁴ (constante de Stefan-Boltzmann) ; T_m = 1414 + 273,15 = 1687 K (calcul). Le préfacteur 4/5 résulte des hypothèses énoncées (K constant, ambiance à 0 K, lingot long) ; d'autres hypothèses (K ∝ 1/T) donnent un préfacteur différent, la loi en r^(−1/2) restant la même. Pas de valeur numérique de V_max affichée : ρ, L, K et ε ne figurent pas dans le PPT.

## Scène 11 — Approfondissement : critère de Voronkov v/G · 08:07 (1:04 · audio 62,0 s)

À l'écran : axe du lingot, deux populations de défauts (lacunes en bleu #2E6F8E, interstitiels en or #F2B544) incorporées à l'interface, recombinaison. Puis coupe radiale d'une plaquette : G croît du centre au bord, anneau à v/G = ξ_t, cœur riche en lacunes, périphérie riche en interstitiels.

Éq. 11.1 : Δ = C_V − C_I
Éq. 11.2 : J_conv = v · Δ_m
Éq. 11.3 : J_diff = G · Γ, avec Γ = D_I ∂C_I^eq/∂T − D_V ∂C_V^eq/∂T
Éq. 11.4 : J_net = v Δ_m − G Γ = 0 ⇒ ξ_t = (v/G)_crit = Γ / Δ_m

> Le rapport entre vitesse et gradient gouverne aussi les défauts ponctuels. À l'interface, lacunes et auto-interstitiels sont incorporés à leur concentration d'équilibre. En refroidissant, ils se recombinent vite : seule compte leur différence, delta. Deux flux la transportent. Le flux convectif, porté par le cristal, vaut v fois delta. Le flux diffusif suit le gradient thermique G et favorise l'espèce la plus mobile, l'interstitiel. Le bilan change de signe pour un rapport critique v sur G, noté ksi t. Au-dessus, les lacunes l'emportent et s'agglomèrent en cavités, visibles en surface comme défauts C O P. Au-dessous, les interstitiels dominent et forment des boucles de dislocation. Comme G croît du centre vers le bord, la frontière dessine un anneau dans la plaquette. Rester près de ksi t sur tout le rayon limite les deux familles de défauts.

## Scène 12 — Ségrégation : dérivation de la loi de Scheil · 09:10 (1:27 · audio 85,1 s)

À l'écran : lingot partiellement solidifié, fraction g. Dérivation pas à pas. Puis reproduction animée de `chart2` (données exactes, g de 0 à 90 % par pas de 5 %) : courbe orange #E8702A « k = 0,1 » et courbe #2E6F8E « k = 0,5 (illustratif) », tracées progressivement. Dégradé de concentration le long du lingot, tête claire, pied foncé.

Éq. 12.1 : k = C_s / C_l
Éq. 12.2 : soluté dans le liquide : C_l (1 − g)
Éq. 12.3 : d[C_l (1 − g)] = − k C_l dg
Éq. 12.4 : (1 − g) dC_l = (1 − k) C_l dg
Éq. 12.5 : ∫ dC_l / C_l = (1 − k) ∫ dg / (1 − g) ⇒ ln(C_l / C_0) = −(1 − k) ln(1 − g)
Éq. 12.6 : C_s = k C_0 (1 − g)^(k − 1)
Annotations des courbes (données du PPT) : g = 90 % → 0,794 (k = 0,1) ; 1,581 (k = 0,5).
Légende de la courbe k = 0,1 : « k = 0,1 (illustratif) » (corrigé ; le PPT indiquait « Al dans Si »).

> Passons à la ségrégation. Le solide n'incorpore qu'une fraction du soluté du liquide : c'est le coefficient de partage k, rapport de C s sur C l. Dérivons la loi de Scheil, avec quatre hypothèses : pas de diffusion dans le solide, mélange complet du liquide, k constant, densités égales. Soit g la fraction solidifiée. Le liquide contient la quantité de soluté C l fois un moins g. Quand une fraction d g se solidifie, elle emporte k C l d g. En développant ce bilan, il vient : un moins g fois d C l égale un moins k, fois C l d g. On sépare les variables et on intègre depuis C zéro. D'où la loi de Scheil : C s égale k C zéro, fois un moins g, puissance k moins un. Traçons-la pour k égal 0,1 et 0,5. La tête du lingot démarre à k C zéro. Si k est inférieur à un, le soluté rejeté s'accumule dans le liquide : le bas du lingot est plus dopé que la tête. À 90 % de solidification, C s sur C zéro atteint 0,79 pour k égal 0,1, et 1,58 pour k égal 0,5. Seule une partie du lingot respecte donc une tolérance de résistivité donnée.

## Scène 13 — Approfondissement : coefficient effectif de Burton-Prim-Slichter · 10:37 (1:13 · audio 71,2 s)

À l'écran : zoom sur l'interface ; couche limite d'épaisseur δ, profil C(z) exponentiel ; au-delà, liquide brassé à C_l. Puis tracé de k_eff en fonction de vδ/D (courbe analytique, sans donnée numérique matérielle), asymptotes k_0 et 1.

Éq. 13.1 : D d²C/dz² + v dC/dz = 0
Éq. 13.2 : C(δ) = C_l ; D dC/dz|₀ + v (C_i − C_s) = 0 ; C_s = k_0 C_i
Éq. 13.3 : C(z) = C_s + (C_i − C_s) e^(−vz/D)
Éq. 13.4 : (C_i − C_s)/(C_l − C_s) = e^(vδ/D)
Éq. 13.5 : k_eff = C_s/C_l = k_0 / [k_0 + (1 − k_0) e^(−vδ/D)]
Éq. 13.6 : vδ/D → 0 : k_eff → k_0 ; vδ/D → ∞ : k_eff → 1
Éq. 13.7 : δ ∝ D^(1/3) ν^(1/6) ω^(−1/2)

> Scheil suppose un liquide parfaitement brassé. Or, près de l'interface, la convection s'éteint dans une couche limite d'épaisseur delta, où le soluté ne se déplace que par diffusion. Dans le repère de l'interface, en régime stationnaire, la concentration obéit à cette équation de diffusion et d'advection. Au bord de la couche, elle rejoint celle du bain ; à l'interface, le soluté rejeté doit partir par diffusion. La solution est une exponentielle, et l'excès à l'interface vaut l'excès dans le bain multiplié par exponentielle de v delta sur D. En posant k effectif égal C s sur C l, on obtient la formule de Burton, Prim et Slichter. Si v delta sur D tend vers zéro, k effectif tend vers k zéro : le mélange est parfait. S'il devient grand, k effectif tend vers un : le soluté n'a plus le temps de s'échapper. Pour un cristal en rotation, delta varie comme l'inverse de la racine de la vitesse de rotation : tourner plus vite rapproche k effectif de k zéro. On remplace alors k par k effectif dans la loi de Scheil.

## Scène 14 — Approfondissement : surfusion constitutionnelle · 11:50 (1:01 · audio 59,9 s)

À l'écran : deux courbes devant l'interface : liquidus T_L(z) (or #F2B544) qui remonte, température réelle T(z) (orange #E8702A) droite de pente G. La zone où T < T_L se hachure. Puis interface plane qui devient cellulaire.

Éq. 14.1 : C_l(z) = C_0 [1 + ((1 − k)/k) e^(−vz/D)]
Éq. 14.2 : T_L(z) = T_f + m C_l(z), m < 0
Éq. 14.3 : T(z) = T_i + G z
Éq. 14.4 : dT_L/dz|₀ = − m C_0 (1 − k) v / (k D)
Éq. 14.5 : interface stable ⇔ G / v ≥ − m C_0 (1 − k) / (k D)

> La couche limite enrichie a une autre conséquence. En régime stationnaire, avec k inférieur à un, la concentration décroît exponentiellement devant l'interface jusqu'à C zéro. Le liquidus suit la concentration, avec une pente m négative : il est plus bas à l'interface que loin d'elle. La température réelle croît linéairement, avec le gradient G. Si G est plus faible que la pente du liquidus à l'interface, une couche de liquide passe sous son liquidus : elle est surfondue par sa composition. En dérivant le liquidus en z égale zéro, on obtient la condition de stabilité : G sur v doit rester supérieur à moins m C zéro, fois un moins k, sur k D. Sinon, l'interface devient cellulaire, piège le soluté en stries, et peut perdre la monocristallinité. Le risque croît avec la vitesse et le dopage : c'est une limite de plus pour les lingots fortement dopés.

## Scène 15 — Oxygène. Cz magnétique et nombre de Hartmann · 12:51 (1:06 · audio 64,1 s)

À l'écran : bain dans le creuset ; flèches d'oxygène depuis la paroi de quartz, SiO évacué par l'argon en surface, rouleaux de convection. Carte « 6·10¹⁷ à 1,1·10¹⁸ atomes/cm³ ». Puis champ B (lignes de champ), courant induit j, force de Laplace qui s'oppose au mouvement ; les rouleaux ralentissent.

Éq. 15.1 : j ≈ σ (u × B)
Éq. 15.2 : f = j × B ~ σ u B²
Éq. 15.3 : f_visq ~ μ u / L²
Éq. 15.4 : f / f_visq = σ B² L² / μ = Ha²
Éq. 15.5 : Ha = B L √(σ / μ) = B L √(σ / ρν)

> L'oxygène est l'impureté principale du Cz. Le creuset de quartz se dissout lentement dans le bain. Une partie de l'oxygène s'évapore en monoxyde de silicium, évacué par l'argon ; le reste est porté par la convection jusqu'à l'interface. La teneur typique va de six fois dix puissance dix-sept à 1,1 fois dix puissance dix-huit atomes par centimètre cube. L'oxygène précipite et favorise des défauts, mais il renforce mécaniquement le cristal. Pour le réduire, le Cz magnétique, ou M C Z, applique un champ B au bain, qui est un bon conducteur. Un écoulement de vitesse u y induit un courant, donc une force de Laplace d'ordre sigma u B carré, qui s'oppose au mouvement. Rapportée à la force visqueuse, d'ordre mu u sur L carré, elle définit le carré du nombre de Hartmann. Quand celui-ci est grand devant un, la convection est freinée, l'oxygène quitte moins vite la paroi, et la teneur incorporée diminue.

## Scène 16 — La fusion de zone (Float Zone) · 13:57 (0:43 · audio 41,7 s)

À l'écran : barreau vertical animé (composant maison, d'après le schéma du PPT) : barreau polycristallin en haut, bobine HF, zone fondue orange qui remonte, monocristal formé dessous, germe en bas. Puis photo de la plaquette FZ 4 pouces en Ken Burns, crédit : *Plaquette FZ 4 pouces — Radiotrefoil, CC BY-SA 4.0, Wikimedia Commons*. Carte « < 10¹⁶ O/cm³ dans un Si FZ de référence ».

> La fusion de zone supprime le creuset. Une bobine à induction fond une zone étroite d'un barreau polycristallin vertical. La zone monte le long du barreau, et le monocristal se forme sous elle, à partir d'un germe. La zone fondue ne touche que le gaz, vide ou gaz inerte : il n'y a plus de source d'oxygène. Les impuretés sont entraînées par la zone liquide, ce qui purifie le cristal. Le procédé est développé en 1962, et son diamètre est limité à 200 millimètres. Un silicium F Z de référence contient moins de dix puissance seize atomes d'oxygène par centimètre cube.

## Scène 17 — Czochralski ou fusion de zone ? · 14:40 (0:39 · audio 37,6 s)

À l'écran : tableau comparatif du PPT, ligne par ligne (Creuset, Oxygène, Résistivité, Diamètre, Usages), puis encadré « À retenir ».

> Comparons. Le Cz utilise un creuset de quartz au contact du bain ; la F Z n'en a aucun. L'oxygène atteint dix puissance dix-sept à dix puissance dix-huit par centimètre cube en Cz, moins de dix puissance seize en F Z, dont la résistivité est plus élevée. Le Cz atteint 300 millimètres en masse ; la F Z, 200. Le Cz sert aux circuits intégrés et aux cellules solaires ; la F Z, à l'électronique de puissance et aux détecteurs. Le Cz domine en volume grâce aux grands diamètres ; la F Z gagne là où la pureté prime.

## Scène 18 — Du lingot à la plaquette · 15:19 (0:28 · audio 26,1 s)

À l'écran : quatre étapes numérotées (Rectification, Découpe, Rodage et gravure, Polissage) ; le lingot est tranché à la scie à fil. Photo de la plaquette de 300 mm en Ken Burns, crédit : *Plaquette de 300 mm (12 pouces) — Peellden, CC BY-SA 3.0, Wikimedia Commons*.

> Le lingot doit encore devenir plaquette. On le rectifie au diamètre et on y marque un repère d'orientation. On le découpe en tranches à la scie à fil. Le rodage et la gravure éliminent la zone écrouie par la découpe. Le polissage donne enfin une surface miroir, prête pour la lithographie. Voici une plaquette de 300 millimètres, soit douze pouces.

## Scène 19 — Conclusion · 15:47 (0:33 · audio 31,3 s)

À l'écran : fond #1B2A3A, trois points de conclusion du PPT. Photo de la chercheuse en Ken Burns, crédit : *U.S. Department of Energy, domaine public, Wikimedia Commons*.

> Trois étapes transforment le sable en cristal parfait : réduction, purification chimique, cristallogenèse. Le Czochralski fournit l'essentiel du silicium mondial ; la fusion de zone, le plus pur. Tout se joue à l'interface solide-liquide. Le bilan thermique y fixe la vitesse maximale. Le rapport v sur G y choisit le défaut ponctuel dominant. La couche limite y règle la ségrégation et la stabilité du front.

## Scène 20 — Générique · 16:20 (0:20 · audio 7,0 s)

À l'écran : défilement des références [1] à [8] et des crédits d'images complets, tels que dans la diapositive 16 :

- [1] Kittel C., *Introduction to Solid State Physics*, 8ᵉ éd., Wiley, 2005.
- [2] Ashcroft N. W., Mermin N. D., *Physique des solides*, EDP Sciences, 2002.
- [3] Válek L., Šik J., « Defect Engineering During Czochralski Crystal Growth and Silicon Wafer Manufacturing », *Modern Aspects of Bulk Crystal and Thin Film Preparation*, InTech, 2012.
- [4] Stamenov P., *Czochralski & Float-Zone growth*, cours PY2N20, Trinity College Dublin, 2014.
- [5] PV Manufacturing (UNSW), « Polysilicon production ».
- [6] Bernreuter Research, « Polysilicon production processes ».
- [7] IEEE/ETHW, « Milestones: Czochralski Process, 1916 ».
- [8] Wafer World, « Float Zone Wafer: The Float Zone Process ».
- Crédits : Lingot Cz — Stahlkocher, GFDL · Plaquette multicristalline — Radiotrefoil, CC BY-SA 4.0 · Plaquette FZ 4″ — Radiotrefoil, CC BY-SA 4.0 · Plaquette 300 mm — Peellden, CC BY-SA 3.0 · Chercheuse et plaquette — U.S. DOE, domaine public. Toutes via Wikimedia Commons.
- Schémas (maille diamant, Cz, FZ) et graphiques : réalisés pour l'exposé. Animations : réalisées pour cette vidéo.

> Les références et les crédits des images sont affichés à l'écran. Merci de votre attention.

---

## Valeurs et points [À VÉRIFIER]

Corrections appliquées après relecture :

- Scène 11 : la valeur numérique de ξ_t est retirée ; seul le symbole ξ_t est affiché.
- Scène 13 : le préfacteur 1,6 est retiré ; la couche limite est affichée en proportionnalité, δ ∝ D^(1/3) ν^(1/6) ω^(−1/2).
- Scène 12 : la légende devient « k = 0,1 (illustratif) » ; les données de la courbe sont inchangées.

Points restants :

1. **Scène 10 — préfacteur 4/5 de V_max** : exact sous les hypothèses énoncées à l'écran (K constant, ambiance à 0 K, lingot long), mais la littérature (par ex. réf. [4]) peut utiliser un autre modèle et un autre préfacteur. Seule la loi en r^(−1/2) est commentée oralement.

Points repris du PPT, à confirmer de votre côté :

2. **Scène 16 — « développé en 1962 »** pour la fusion de zone : c'est la valeur du PPT, mais la méthode est souvent datée du début des années 1950 (Bell Labs) ; 1962 pourrait être une date de brevet.
3. **Scène 06 — « 2N » pour le silicium métallurgique** : 98 % est en toute rigueur inférieur à 99 % (2N) ; la note orateur dit « ≈ 2N ». Je garde le graphique tel quel.
4. **Scène 02 — dilatation « d'environ 10 % » à la solidification** : valeur de la note orateur, conservée.

Constantes utilisées sans marquage (certaines) : arccos(−1/3) = 109,47° ; arccos(1/√3) = 54,74° et tan = √2 ; compacité diamant π√3/16 ≈ 0,340 ; σ_SB = 5,670·10⁻⁸ W·m⁻²·K⁻⁴ ; T(K) = T(°C) + 273,15.
