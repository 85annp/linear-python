# Linjär Algebra med Python & NumPy 📐🐍
### En interaktiv lärresurs för gymnasiekursen *Matematik – specialisering*

Denna webbplats är utvecklad speciellt för gymnasieelever som läser **Matematik – specialisering** med inriktning mot linjär algebra och vill lära sig använda **Python och NumPy** som ett beräknings- och visualiseringsverktyg.

Webbplatsen kräver **inga tidigare förkunskaper i programmering** och fokuserar helt på matematiken bakom vektorer, matriser och linjära system.

---

## ✨ Huvudfunktioner

1. **Kör Python direkt i webbläsaren (WebAssembly / Pyodide)**
   - Inga installationer krävs! Eleven behöver varken installera Python, Anaconda eller VS Code.
   - Kör riktig Python 3.12 och `numpy` direkt på elevens dator.
   
2. **Interaktiva kodrutor med direkt feedback**
   - Eleven kan ändra värden, testa egna idéer, kopiera kod och återställa med ett klick.
   - Pedagogiska felmeddelanden på svenska vid vanliga misstag (t.ex. dimensionstrassel vid matrismultiplikation, nollbaserad indexering och singulära matriser).

3. **Interaktiv 2D-vektorvisualiserare**
   - Ett inbyggt grafiskt verktyg där eleven kan justera reglage för vektorer $\vec{u}$ och $\vec{v}$ och se vektoraddition (parallellogramregeln), längder, vinklar och skalärprodukt i realtid tillsammans med motsvarande NumPy-kod.

4. **Matematisk typografi (KaTeX)**
   - Alla matematiska formler, ekvationssystem och matriser renderas med knivskarp matematisk notation identisk med gymnasiets läroböcker.

5. **Nivåindelade övningsuppgifter med självrättning**
   - **Nivå 1 (Grundläggande):** Vektorräkning, längd, vinklar och nilpotenta matrispotenser.
   - **Nivå 2 (Tillämpning & geometri):** Kirchhoffs lagar för strömkretsar (3x3 ekvationssystem) och sammansatta geometriska avbildningar (spegling + rotation).
   - **Nivå 3 (Specialisering):** Markovkedjor, jämviktslägen och egenvektorer ($\lambda = 1$).
   - Varje övning har utfällbara ledtrådar och fullständiga, kommenterade lösningsförslag.

6. **Fri kod-sandlåda**
   - Längst ner finns en öppen Python-sandlåda för fria matematiska experiment.

---

## 📚 Kursinnehåll & Kapitelstruktur

| Kapitel | Innehåll | Matematik & Python-begrepp |
|---|---|---|
| **0. Introduktion** | Snabbstart i Python | Variabler, `print()`, `import numpy as np` |
| **1. Vektorer** | Vektorrum i $\mathbb{R}^n$ | `np.array`, addition, norm (`norm`), skalärprodukt (`@`), kryssprodukt (`cross`) |
| **2. Matriser** | Rader och kolumner | 2D-arrays, `.shape`, transponat `.T`, `np.eye()`, `np.zeros()` |
| **3. Multiplikation** | Matriser & Avbildningar | Skillnad mellan `*` och `@`, icke-kommutativitet ($AB \neq BA$), rotationsmatriser |
| **4. Determinant & Invers** | Area/volym & reversibilitet | `np.linalg.det()`, `np.linalg.inv()`, singulära matriser |
| **5. Ekvationssystem** | $A\vec{x} = \vec{b}$ | `np.linalg.solve(A, b)`, Gausselimination i datorn |
| **6. Egenvärden** | Fördjupning: $A\vec{v} = \lambda\vec{v}$ | `np.linalg.eig(A)`, geometrisk tolkning |
| **7. Cheatsheet** | Snabbguide | Sammanfattande tabell över all viktig syntax |
| **8. Övningsuppgifter** | 5 uppgifter (Nivå 1–3) | Praktiska problem med ledtrådar och facit |
| **9. Sandlåda** | Fri experimentyta | Öppen yta för egna idéer |

---

## 🚀 Hur du öppnar och kör webbplatsen

### Alternativ 1: Öppna direkt i webbläsaren
Dubbelklicka bara på filen `index.html` för att öppna den i din favoritwebbläsare (Chrome, Edge, Firefox eller Safari).

### Alternativ 2: Lokal utvecklingsserver (rekommenderas)
Om du har Python installerat kan du starta en snabb lokal webbserver:

```bash
# Kör i mappen där filerna ligger:
python -m http.server 8000
```
Öppna sedan `http://localhost:8000` i webbläsaren.

### Alternativ 3: Publicera online (helt gratis)
Eftersom sidan är en helt statisk webbplats (HTML + CSS + JS + WebAssembly) kan den publiceras direkt på:
- **GitHub Pages:** Ladda upp filerna till ett repo och aktivera Pages under Settings.
- **Netlify / Vercel:** Dra och släpp mappen i deras dashboard.
- **Skolans lärplattform (LMS):** Fungerar direkt i Canvas, Teams, Google Classroom eller It's learning.

---

## 🛠️ Teknologier
- **HTML5 & CSS3:** Modern, responsiv design med mörkt/ljust läge (Dark/Light mode).
- **JavaScript (ES6+):** Vanilla JS utan tunga ramverk.
- **Pyodide v0.26.4:** CPython kompilerat till WebAssembly för att köra Python och NumPy direkt i webbläsaren.
- **KaTeX v0.16.8:** Blixtsnabb rendering av matematisk $\LaTeX$-kod.
- **HTML5 Canvas:** Dynamisk rendering av koordinatsystem och 2D-vektorer.
