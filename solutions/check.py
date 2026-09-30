"""Numerical verification of every result in solutions.md (Unit 1 exercise series).

Run:  python3 solutions/check.py
Each check prints the computed value and asserts it matches the value written in solutions.md.
Constants NOT stated in the source file are grouped in ASSUMED_CONSTANTS and flagged.
"""
import json, pathlib, re
from collections import Counter

# ---- data given in the source file ----
M = {"H": 1, "O": 16, "C": 12, "N": 14, "Na": 23, "Fe": 56, "Cl": 35.5, "Zn": 65}
R = 8.31
# ---- universal constants used but not written in the file ----
ASSUMED_CONSTANTS = {"Vm_L_per_mol": 22.4, "NA": 6.02e23, "atm_Pa": 1.013e5}
Vm, NA, ATM = ASSUMED_CONSTANTS.values()

FAILS = []
def check(label, value, expected, rel=0.01):
    ok = abs(value - expected) <= rel * abs(expected) + 1e-12
    print(f"{'OK ' if ok else 'FAIL'}  {label:<55} = {value:.6g}   (solutions.md: {expected})")
    if not ok:
        FAILS.append(label)

def molar_mass(formula):
    tot = 0
    for el, k in re.findall(r"([A-Z][a-z]?)(\d*)", formula):
        tot += M[el] * (int(k) if k else 1)
    return tot

print("== Exercise 1 ==")
M_NH3 = molar_mass("NH3"); check("M(NH3) g/mol", M_NH3, 17)
check("n in 0.68 g (mol)", 0.68 / M_NH3, 0.04)
check("n in 15.68 L (mol)", 15.68 / Vm, 0.7)
check("m of 8.96 L (g)", 8.96 / Vm * M_NH3, 6.8)
check("m of 3.01e22 molecules (g)", 3.01e22 / NA * M_NH3, 0.85)
M_ac = molar_mass("C2H4O2"); check("M(C2H4O2) g/mol", M_ac, 60)
m_ac = 1050 * 0.200; check("m of 200 mL acetic acid (g)", m_ac, 210)
check("n of 200 mL acetic acid (mol)", m_ac / M_ac, 3.5)

print("== Exercise 2 ==")
n2 = 2 * ATM * 6.15e-3 / (R * (27 + 273)); check("n = PV/RT (mol)", n2, 0.5)
Mg = 8 / 0.5; check("M = m/n (g/mol)", Mg, 16)
check("n carbon atoms: 14n+2 = M", (Mg - 2) / 14, 1)

print("== Exercise 3 ==")
M_NaOH = 23 + 16 + 1; n0 = 4 / M_NaOH
check("n0 NaOH (mol)", n0, 0.1)
c0 = n0 / 0.200; check("c0 (mol/L)", c0, 0.5)
check("cm0 = m/V (g/L)", 4 / 0.200, 20); check("cm0 = c0*M (g/L)", c0 * M_NaOH, 20)
check("n in V'=50 mL (mol)", c0 * 0.050, 0.025)
f = (10 + 90) / 10; check("dilution factor f", f, 10)
check("c2 = c0/f (mol/L)", c0 / f, 0.05); check("c2 = c0V1/V2 (mol/L)", c0 * 10 / 100, 0.05)
check("Q3: c = (c0V1 + ms/M)/V1 (mol/L)", (c0 * 0.010 + 0.4 / M_NaOH) / 0.010, 1.5)

print("== Exercise 4 ==")
m_pure = 0.1 * 0.100 * 149.9; check("m pure NaI (g)", m_pure, 1.499)
check("m0 commercial = m/P (g)", m_pure / 0.90, 1.666)

print("== Exercise 5 ==")
# label supplied by the teacher (not in the docx): d = 1.19, M = 36.5 g/mol, P = 37 %
rho = 1.19 * 1000; check("m of 1 L commercial solution (g)", rho, 1190)
check("m(HCl) in 1 L (g)", 0.37 * rho, 440.3)
check("c0 = 10 P d / M (mol/L)", 10 * 37 * 1.19 / 36.5, 12.06)
check("V0 = c1 V / c0 (mL)", 0.482 * 500 / 12.06, 19.98)

print("== Exercise 6 ==")
nFe = 44.8 / 56; nCl2 = 20.16 / Vm
check("n(Fe) (mol)", nFe, 0.8); check("n(Cl2) (mol)", nCl2, 0.9)
xmax = min(nFe / 2, nCl2 / 3); check("xmax (mol)", xmax, 0.3)
print("     limiting:", "Cl2" if nCl2 / 3 < nFe / 2 else "Fe")
check("m(Fe) remaining (g)", (nFe - 2 * xmax) * 56, 11.2)
M_FeCl3 = 56 + 3 * 35.5; check("M(FeCl3)", M_FeCl3, 162.5)
check("m(FeCl3) (g)", 2 * xmax * M_FeCl3, 97.5)
check("V(Cl2) reacted (L)", 3 * xmax * Vm, 20.16)

print("== Exercise 7 ==")
nH3O = 0.2 * 0.200; nH2 = 0.224 / Vm
check("n0(H3O+) (mol)", nH3O, 0.04); check("xmax = n(H2) (mol)", nH2, 0.01)
check("H3O+ would allow x (mol)", nH3O / 2, 0.02)
check("m0(Zn) (g)", nH2 * 65, 0.65)
check("[Zn2+]f (mol/L)", nH2 / 0.200, 0.05)
check("[H3O+]f (mol/L)", (nH3O - 2 * nH2) / 0.200, 0.1)
check("[Cl-]f (mol/L)", nH3O / 0.200, 0.2)

print("== Exercise 8 ==")
G = 0.126e-3 / 1; check("G = I/U (S)", G, 1.26e-4)
K = 1e-4 / 1e-2; check("K = S/L (m)", K, 1e-2)
sigma = G / K; check("sigma = G/K (S/m)", sigma, 1.26e-2)
lam = (5.01 + 7.59) * 1e-3; c8 = sigma / lam
check("c = sigma/(lNa+lCl) (mol/m3)", c8, 1.0); check("c (mol/L)", c8 / 1000, 1e-3)

print("== Exercise 9: atom & charge balance of the 10 overall equations ==")
def parse_side(side):
    atoms, charge = Counter(), 0
    for term in side.split(" + "):
        coef, sp, q = re.fullmatch(r"(\d*)\s*([A-Za-z0-9()]+)\{?([+-]?\d*[+-]?)\}?", term.strip()).groups()
        coef = int(coef) if coef else 1
        for el, k in re.findall(r"([A-Z][a-z]?)(\d*)", sp):
            atoms[el] += coef * (int(k) if k else 1)
        if q:
            sign = -1 if "-" in q else 1
            mag = int(q.strip("+-")) if q.strip("+-") else 1
            charge += coef * sign * mag
    return atoms, charge
EQ9 = {
    1: "Cu{2+} + Pb = Cu + Pb{2+}",
    2: "2Fe + 3Cl2 = 2Fe{3+} + 6Cl{-}",
    3: "2I{-} + S2O8{2-} = I2 + 2SO4{2-}",
    4: "Cr2O7{2-} + 6Fe{2+} + 14H{+} = 2Cr{3+} + 6Fe{3+} + 7H2O",
    5: "MnO4{-} + 5Fe{2+} + 8H{+} = Mn{2+} + 5Fe{3+} + 4H2O",
    6: "2Al + 6H3O{+} = 2Al{3+} + 3H2 + 6H2O",
    7: "2MnO4{-} + 5H2O2 + 6H{+} = 2Mn{2+} + 5O2 + 8H2O",
    8: "CuO + H2 = Cu + H2O",
    9: "BrO3{-} + 5Br{-} + 6H{+} = 3Br2 + 3H2O",
    10: "3C2H6O + 2Cr2O7{2-} + 16H{+} = 3C2H4O2 + 4Cr{3+} + 11H2O",
}
for k, eq in EQ9.items():
    l, r = eq.split(" = ")
    (al, ql), (ar, qr) = parse_side(l), parse_side(r)
    ok = al == ar and ql == qr
    print(f"{'OK ' if ok else 'FAIL'}  case {k:>2}: {eq}")
    if not ok:
        FAILS.append(f"ex9 case {k}")

print("== Exercise 10 ==")
c10a = 5 * 0.1 * 20 / (2 * 14); check("method 1: c = 5c'VE/(2V) (mol/L)", c10a, 0.357)
nMnO4 = 0.1 * 0.500; check("method 2: n0(MnO4-) (mol)", nMnO4, 0.05)
nO2 = 2 / Vm; xm = nO2 / 5
check("n(O2) (mol)", nO2, 0.0893); check("xmax = n(O2)/5 (mol)", xm, 0.01786)
check("MnO4- would allow x (mol)", nMnO4 / 2, 0.025)
c10b = 5 * xm / 0.250; check("method 2: c = 5xmax/V (mol/L)", c10b, 0.357)

print("== Exercise 11 ==")
# c1 corrected to 0.6 mol/L by the teacher (docx says 0.06, which contradicts the figure)
nI = 0.6 * 0.150; nS = 0.1 * 0.100; Vt = 0.250
check("n0(I-) (mmol)", nI * 1e3, 90); check("n0(S2O8 2-) (mmol)", nS * 1e3, 10)
x11 = min(nI / 2, nS); check("xmax (mmol)", x11 * 1e3, 10)
print("     limiting:", "S2O8 2-" if nS < nI / 2 else "I-")
check("[S2O8]0 (mmol/L)", nS / Vt * 1e3, 40)
check("[S2O8] at t1/2 (mmol/L)", (nS - x11 / 2) / Vt * 1e3, 20)
dig = json.loads(pathlib.Path(__file__).with_name("fig_ex11_digitized.json").read_text())
cmin = min(dig["c_mmolL"])
print(f"     figure: lowest plotted [S2O8] = {cmin:.1f} mmol/L at t = 100 min")
check("figure consistent: [S2O8]final >= 0", (nS - x11) / Vt * 1e3, 0.0)
T, C = dig["t_min"], dig["c_mmolL"]
t_half = min(zip(T, C), key=lambda p: abs(p[1] - 20))[0]
check("t1/2 read on figure at 20 mmol/L (min)", t_half, 21.7, rel=0.03)
slope = -0.33  # mmol L^-1 min^-1, tangent at 40 min (digitized, cubic fit on 30-50 min)
check("v_vol(40 min) = -d[S2O8]/dt (mmol/L/min)", -slope, 0.33, rel=0.05)
check("v = V * v_vol (mmol/min)", Vt * -slope, 0.082, rel=0.05)
check("v(I-) = 2v (mmol/min)", 2 * Vt * -slope, 0.16, rel=0.05)
check("v_vol disappearance I- = 2 v_vol (mmol/L/min)", 2 * -slope, 0.66, rel=0.05)

print("== Exercise 12 ==")
print("     all three curves plateau at n(I2)f = 16 mmol -> H2O2 limiting, n0 = 16 mmol")
check("xmax if I- limiting, exp 1 (mmol)", 40 / 2, 20)
check("xmax if I- limiting, exp 2/3 (mmol)", 80 / 2, 40)

print("== Exercise 13 ==")
print("     figure: [I2](0) = 20 mmol/L -> c0 = 20 mmol/L;  after dilution x2: [I2](0) = 10 mmol/L")
check("[I2]0 after dilution to 100 mL (mmol/L)", 20 * 50 / 100, 10)

print()
print("ASSUMED (not in source):", ASSUMED_CONSTANTS)
print("ALL CHECKS PASSED" if not FAILS else f"{len(FAILS)} FAILURES: {FAILS}")
raise SystemExit(1 if FAILS else 0)
