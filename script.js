/**
 * Linjär Algebra med Python & NumPy
 * Interaktiv läroplattform för Matematik - Specialisering
 */

// ==========================================================================
// 1. Pyodide Python Runner Setup
// ==========================================================================
let pyodideInstance = null;
let isPyodideLoading = false;
let isPyodideReady = false;

// Pre-computed fallback simulation for instant offline / fallback behavior
const fallbackOutputs = {
  "intro-ex1": "Addition: 10\nMultiplikation: 21\nPotens (7 upphöjt till 2): 49\nKvadratrot via NumPy: 2.6457513110645906",
  "vec-ex1": "Vektor u: [ 2  5 -1]\nVektor v: [ 4 -2  3]\nu + v = [6 3 2]\nu - v = [-2  7 -4]\n3 * u = [ 6 15 -3]\n-2 * v = [-8  4 -6]",
  "vec-ex2": "Längden ||u|| = 5.0\nLängden ||v|| = 5.0\nSkalärprodukt u · v = 0\n-> u och v är ortogonala (vinkelräta)!\n\nKryssprodukt (1,0,0) x (0,1,0) = [0 0 1]",
  "mat-ex1": "Matris A:\n [[1 2 3]\n [4 5 6]]\nForm (rader, kolumner): (2, 3)\nTransponatet A.T:\n [[1 4]\n [2 5]\n [3 6]]\nA.T har formen: (3, 2)",
  "mat-ex2": "Enhetsmatris I (3x3):\n [[1. 0. 0.]\n [0. 1. 0.]\n [0. 0. 1.]]\n\nNollmatris 2x4:\n [[0. 0. 0. 0.]\n [0. 0. 0. 0.]]\n\nElementet på rad 0, kolumn 1: 20\nHela rad index 1: [40 50 60]\nHela kolumn index 2: [30 60 90]",
  "matmul-ex1": "A @ B =\n [[ 4  4]\n [10  8]]\n\nB @ A =\n [[ 2  4]\n [ 7 10]]\n\nÄr AB == BA? Svar: False (Matrismultiplikation är ej kommutativ!)",
  "matmul-ex2": "Ursprunglig vektor v: [1. 0.]\nRotationsmatris R:\n [[ 0. -1.]\n [ 1.  0.]]\nVektor efter 90 graders rotation: [0. 1.]\n-> Som väntat hamnar den nu längs y-axeln på (0, 1)!",
  "det-ex1": "Determinant det(A) = 10.00\n\nInversmatris A^(-1):\n [[ 0.6 -0.7]\n [-0.2  0.4]]\n\nA @ A^(-1):\n [[1. 0.]\n [0. 1.]]\n\nÄr produkten lika med enhetsmatrisen? True",
  "solve-ex1": "Lösningsvektor x:\nx_1 = 2.00\nx_2 = 5.00\nx_3 = 1.00\n\nKontroll A @ x: [  8. -11.  -3.]\nStämmer med b? True",
  "eigen-ex1": "Egenvärden (lambda): [5. 2.]\n\nEgenvektorer (kolumner i matrisen):\n [[ 0.70710678 -0.4472136 ]\n [ 0.70710678  0.89442719]]\n\n--- Verifiering för första egenvärdet ---\nA @ v1        = [3.53553391 3.53553391]\nlambda1 * v1  = [3.53553391 3.53553391]\nÄr de lika? True"
};

async function loadPythonEnvironment() {
  const statusPill = document.getElementById("pyodide-status");
  const statusText = statusPill.querySelector(".status-text");

  if (typeof loadPyodide === "undefined") {
    console.warn("Pyodide script inte tillgängligt (kanske offline). Simuleringsläge aktivt.");
    statusPill.className = "status-pill status-loading";
    statusText.textContent = "Offline-läge (Lokal simulator)";
    return;
  }

  isPyodideLoading = true;
  try {
    statusText.textContent = "Laddar WebAssembly Python...";
    pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });

    statusText.textContent = "Laddar NumPy-matrisbiblioteket...";
    await pyodideInstance.loadPackage("numpy");

    isPyodideReady = true;
    isPyodideLoading = false;

    statusPill.className = "status-pill status-ready";
    statusText.textContent = "Python 3.12 (NumPy redo!)";
    statusPill.setAttribute("title", "Pyodide WebAssembly körs direkt i din webbläsare");
    console.log("Python + NumPy initialized successfully via Pyodide!");
  } catch (error) {
    console.error("Fel vid laddning av Pyodide:", error);
    isPyodideLoading = false;
    statusPill.className = "status-pill status-loading";
    statusText.textContent = "Simuleringsläge (Pyodide offline)";
  }
}

/**
 * Execute Python code in Pyodide or fallback
 */
async function executePythonCode(code, exampleId, outputElement, execTimeElement) {
  const startTime = performance.now();

  if (isPyodideReady && pyodideInstance) {
    try {
      const runnerCode = `
import sys
import io

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

_user_code_error = None
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    import traceback
    _user_code_error = traceback.format_exc()
finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr

_out = _stdout_buffer.getvalue()
_err = _stderr_buffer.getvalue()
`;
      await pyodideInstance.runPythonAsync(runnerCode);
      const output = pyodideInstance.globals.get("_out");
      const err = pyodideInstance.globals.get("_err");
      const userError = pyodideInstance.globals.get("_user_code_error");

      const elapsed = (performance.now() - startTime).toFixed(0);
      execTimeElement.textContent = `Tid: ${elapsed} ms`;

      if (userError) {
        outputElement.className = "output-content error";
        let friendlyHint = "";
        if (userError.includes("IndexError")) {
          friendlyHint = "\n\n💡 Pedagogiskt tips: Ett IndexError betyder att du försöker nå ett index utanför matrisens gränser. Kom ihåg att Python börjar räkna på 0, inte 1!";
        } else if (userError.includes("ValueError: shapes") || userError.includes("matmul: Input operand")) {
          friendlyHint = "\n\n💡 Pedagogiskt tips: Matrisdimensionerna matchar inte för multiplikation! För A @ B måste (m × k) multipliceras med (k × n). Kontrollera A.shape och B.shape.";
        } else if (userError.includes("LinAlgError: Singular matrix")) {
          friendlyHint = "\n\n💡 Pedagogiskt tips: Matrisen är singulär (det(A) = 0)! Den saknar invers och systemet har antingen inga eller oändligt många lösningar.";
        } else if (userError.includes("NameError")) {
          friendlyHint = "\n\n💡 Pedagogiskt tips: Har du stavat variabelnamnet rätt? Glöm inte att köra raderna där variabeln först skapades.";
        }
        outputElement.textContent = userError + friendlyHint;
      } else {
        outputElement.className = "output-content success";
        let fullOutput = output || "";
        if (err) fullOutput += (fullOutput ? "\n" : "") + err;
        if (!fullOutput.trim()) {
          fullOutput = "[Koden kördes utan fel, men skrev inte ut något med print()]";
        }
        outputElement.textContent = fullOutput;
      }
    } catch (err) {
      const elapsed = (performance.now() - startTime).toFixed(0);
      execTimeElement.textContent = `Tid: ${elapsed} ms`;
      outputElement.className = "output-content error";
      outputElement.textContent = "Körfel:\n" + err.message;
    }
  } else if (isPyodideLoading) {
    outputElement.className = "output-content";
    outputElement.textContent = "Python håller fortfarande på att starta i webbläsaren... Vänta ett ögonblick och försök igen!";
  } else {
    // Fallback simulation mode
    const elapsed = (performance.now() - startTime).toFixed(0);
    execTimeElement.textContent = `Tid: ${elapsed} ms (Simulerad)`;
    outputElement.className = "output-content";
    if (fallbackOutputs[exampleId]) {
      outputElement.textContent = fallbackOutputs[exampleId];
    } else {
      outputElement.textContent = "Python-motorn är inte ansluten. Kontrollera internetanslutningen för att ladda Pyodide.";
    }
  }
}

// ==========================================================================
// 2. Exercise Auto-Checkers & Validation Logic
// ==========================================================================
const exerciseCheckers = {
  1: async (code) => {
    const testScript = `
import numpy as np
_report = []
_all_pass = True

# 1. Kontrollera w
try:
    if 'w' in locals() and w is not None:
        if np.allclose(w, [8, -19]):
            _report.append("✅ Del 1: Vektorn w = 3u - 2v är korrekt beräknad till [8, -19]!")
        else:
            _all_pass = False
            _report.append(f"❌ Del 1: w beräknades till {w}, men rätt svar är [8, -19]. Kontrollera 3*u - 2*v.")
    else:
        _all_pass = False
        _report.append("⚠️ Del 1: Variabeln 'w' har inte beräknats eller är None.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 1 fel: {str(e)}")

# 2. Kontrollera norm_u
try:
    if 'norm_u' in locals() and norm_u is not None:
        if np.isclose(norm_u, 5.0):
            _report.append("✅ Del 2: Längden ||u|| är korrekt beräknad till 5.0!")
        else:
            _all_pass = False
            _report.append(f"❌ Del 2: norm_u beräknades till {norm_u}, men längden av [4, -3] är sqrt(4^2 + (-3)^2) = 5.0.")
    else:
        _all_pass = False
        _report.append("⚠️ Del 2: Variabeln 'norm_u' saknas.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 2 fel: {str(e)}")

# 3. Kontrollera dot_uv
try:
    if 'dot_uv' in locals() and dot_uv is not None:
        if np.isclose(dot_uv, -7.0):
            _report.append("✅ Del 3: Skalärprodukten u · v är korrekt beräknad till -7! (Vinkeln är trubbig eftersom -7 < 0)")
        else:
            _all_pass = False
            _report.append(f"❌ Del 3: dot_uv beräknades till {dot_uv}, men u · v = 4*2 + (-3)*5 = 8 - 15 = -7.")
    else:
        _all_pass = False
        _report.append("⚠️ Del 3: Variabeln 'dot_uv' saknas.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 3 fel: {str(e)}")
`;
    return runExerciseTest(code, testScript, 1);
  },

  2: async (code) => {
    const testScript = `
import numpy as np
_report = []
_all_pass = True

exp_N2 = np.array([[0, 0, 6], [0, 0, 0], [0, 0, 0]])
exp_N3 = np.zeros((3, 3))

try:
    if 'N2' in locals() and N2 is not None:
        if np.array_equal(N2, exp_N2):
            _report.append("✅ Del 1: N^2 är korrekt beräknad med matrismultiplikation (@)!")
        else:
            _all_pass = False
            _report.append("❌ Del 1: N^2 stämmer inte. Kom ihåg att använda N @ N (inte N**2 eller N*N)!")
    else:
        _all_pass = False
        _report.append("⚠️ Del 1: Variabeln 'N2' saknas.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 1 fel: {str(e)}")

try:
    if 'N3' in locals() and N3 is not None:
        if np.array_equal(N3, exp_N3):
            _report.append("✅ Del 2: N^3 är nollmatrisen! Matrisen N är nilpotent med ordning 3!")
        else:
            _all_pass = False
            _report.append("❌ Del 2: N^3 stämmer inte. Använd N @ N @ N eller N2 @ N.")
    else:
        _all_pass = False
        _report.append("⚠️ Del 2: Variabeln 'N3' saknas.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 2 fel: {str(e)}")
`;
    return runExerciseTest(code, testScript, 2);
  },

  3: async (code) => {
    const testScript = `
import numpy as np
_report = []
_all_pass = True

exp_A = np.array([[1, -1, -1], [4, 2, 0], [0, 2, -5]])
exp_b = np.array([0, 12, 6])
exp_x = np.array([2.5, 1.0, 1.5])

try:
    if 'A' in locals() and 'b' in locals() and A is not None and b is not None:
        if np.array_equal(A, exp_A) and np.array_equal(b, exp_b):
            _report.append("✅ Del 1: Matris A och vektor b är korrekt uppställda från Kirchhoffs lagar!")
        else:
            _all_pass = False
            _report.append("❌ Del 1: Kontrollera koefficienterna i matris A och b. Tänk på var nollorna ska vara när en variabel saknas i ekvationen.")
    else:
        _all_pass = False
        _report.append("⚠️ Del 1: Matris A eller vektor b saknas.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 1 fel: {str(e)}")

try:
    det_val = np.linalg.det(A) if ('A' in locals() and A is not None) else None
    if det_val is not None and np.isclose(det_val, -28.0):
        _report.append(f"✅ Del 2: Determinanten det(A) = {det_val:.2f} != 0, vilket visar att systemet har en entydig lösning!")
    else:
        _all_pass = False
        _report.append("❌ Del 2: Determinanten stämmer inte. För rätt A ska det(A) = -28.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 2 fel: {str(e)}")

try:
    sol_var = None
    for name in ['strommar', 'x', 'I', 'strom']:
        if name in locals() and locals()[name] is not None:
            sol_var = locals()[name]
            break
    if sol_var is not None and np.allclose(sol_var, exp_x):
        _report.append(f"✅ Del 3: Ekvationssystemet är korrekt löst! I_1 = {sol_var[0]:.2f} A, I_2 = {sol_var[1]:.2f} A, I_3 = {sol_var[2]:.2f} A.")
    else:
        _all_pass = False
        _report.append("❌ Del 3: Lösningen stämmer inte. Använd np.linalg.solve(A, b). Förväntat svar: I_1 = 2.5 A, I_2 = 1.0 A, I_3 = 1.5 A.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 3 fel: {str(e)}")
`;
    return runExerciseTest(code, testScript, 3);
  },

  4: async (code) => {
    const testScript = `
import numpy as np
_report = []
_all_pass = True

th = np.pi / 4
exp_S = np.array([[1, 0], [0, -1]])
exp_R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
exp_M = exp_R @ exp_S
exp_p = exp_M @ np.array([2.0, 1.0])

try:
    if 'S' in locals() and np.allclose(S, exp_S):
        _report.append("✅ Del 1: Speglingsmatrisen S är korrekt!")
    else:
        _all_pass = False
        _report.append("❌ Del 1: Speglingsmatrisen S i x-axeln ska vara [[1, 0], [0, -1]].")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 1 fel: {str(e)}")

try:
    if 'R' in locals() and np.allclose(R, exp_R):
        _report.append("✅ Del 2: Rotationsmatrisen R för 45 grader är korrekt!")
    else:
        _all_pass = False
        _report.append("❌ Del 2: Rotationsmatrisen R stämmer inte. Använd vinkeln np.pi / 4 eller np.radians(45).")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 2 fel: {str(e)}")

try:
    if 'M' in locals() and np.allclose(M, exp_M):
        _report.append("✅ Del 3: Sammansatta matrisen M = R @ S är korrekt (ordningen spelar roll: R först i multiplikationen eftersom den sker sist)!")
    elif 'M' in locals() and np.allclose(M, exp_S @ exp_R):
        _all_pass = False
        _report.append("❌ Del 3: Du har multiplicerat i fel ordning! När punkten först speglas och sedan roteras beräknas R @ (S @ p) = (R @ S) @ p. Alltså ska M = R @ S.")
    else:
        _all_pass = False
        _report.append("❌ Del 3: Sammansatta matrisen M saknas eller är felaktig.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 3 fel: {str(e)}")

try:
    ps_var = None
    for name in ['p_slut', 'p_ny', 'pslut', 'res']:
        if name in locals() and locals()[name] is not None:
            ps_var = locals()[name]
            break
    if ps_var is not None and np.allclose(ps_var, exp_p):
        _report.append(f"✅ Del 4: Slutpunkten är korrekt beräknad till {np.round(ps_var, 4)}!")
    else:
        _all_pass = False
        _report.append("❌ Del 4: Slutpunkten p_slut stämmer inte. Beräkna p_slut = M @ p.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 4 fel: {str(e)}")
`;
    return runExerciseTest(code, testScript, 4);
  },

  5: async (code) => {
    const testScript = `
import numpy as np
_report = []
_all_pass = True

P_mat = np.array([[0.7, 0.2], [0.3, 0.8]])
exp_jamvikt = np.array([0.4, 0.6])

try:
    if 'P' in locals() and np.allclose(P, P_mat):
        _report.append("✅ Del 1: Övergångsmatrisen P är korrekt uppställd!")
    else:
        _all_pass = False
        _report.append("❌ Del 1: Övergångsmatrisen P stämmer inte.")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 1 fel: {str(e)}")

try:
    j_var = None
    for name in ['jamvikt', 'v_norm', 'stabil', 'x_jamvikt']:
        if name in locals() and locals()[name] is not None:
            j_var = locals()[name]
            break
    if j_var is not None and np.allclose(j_var, exp_jamvikt):
        _report.append(f"✅ Del 2 & 3: Jämviktsvektorn är korrekt normaliserad: {np.round(j_var*100, 1)}% (Café 40%, Restaurang 60%)!")
    else:
        _all_pass = False
        _report.append("❌ Del 3: Jämviktsvektorn för lambda = 1 saknas eller är inte normaliserad så att summan blir 1 (eller 100%). Den teoretiska fördelningen ska bli [0.4, 0.6].")
except Exception as e:
    _all_pass = False
    _report.append(f"❌ Del 3 fel: {str(e)}")
`;
    return runExerciseTest(code, testScript, 5);
  }
};

async function runExerciseTest(userCode, testScript, exNum) {
  if (!isPyodideReady || !pyodideInstance) {
    return {
      allPass: false,
      text: "ℹ️ Python håller på att starta eller är i offline-läge. Kör koden med 'Kör kod' eller jämför din lösning med lösningsförslaget nedan!"
    };
  }

  try {
    const combined = `
${userCode}

${testScript}
`;
    await pyodideInstance.runPythonAsync(combined);
    const reportJs = pyodideInstance.globals.get("_report").toJs();
    const allPass = pyodideInstance.globals.get("_all_pass");

    let header = allPass 
      ? `🎉 STRÅLANDE! Alla delar i Uppgift ${exNum} är helt korrekta! Snyggt jobbat!\n\n`
      : `🔍 RÄTTNINGSRAPPORT FÖR UPPGIFT ${exNum}:\n\n`;

    return {
      allPass,
      text: header + reportJs.join('\n')
    };
  } catch (err) {
    return {
      allPass: false,
      text: `❌ Ett fel uppstod när koden skulle rättas:\n${err.message}\n\nKontrollera att koden körs utan fel med knappen "Kör kod" först.`
    };
  }
}

// ==========================================================================
// 3. Interactive Code Boxes Initialization
// ==========================================================================
function initCodeBoxes() {
  const codeBoxes = document.querySelectorAll(".code-box-wrapper");

  codeBoxes.forEach((box) => {
    const exampleId = box.dataset.exampleId;
    const editor = box.querySelector(".code-editor");
    const runBtn = box.querySelector(".btn-run");
    const resetBtn = box.querySelector(".btn-reset");
    const copyBtn = box.querySelector(".btn-copy");
    const outputElem = box.querySelector(".output-content");
    const timeElem = box.querySelector(".output-exec-time");

    // Store initial template code for reset functionality
    const initialCode = editor.value;

    // Run Button Handler
    runBtn.addEventListener("click", async () => {
      runBtn.classList.add("loading");
      runBtn.textContent = "⏳ Kör...";
      outputElem.className = "output-content";
      outputElem.textContent = "Kör Python-kod...";

      await executePythonCode(editor.value, exampleId, outputElem, timeElem);

      runBtn.classList.remove("loading");
      runBtn.textContent = "▶ Kör kod";
    });

    // Reset Button Handler
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        editor.value = initialCode;
        outputElem.className = "output-content";
        outputElem.textContent = "Koden har återställts till ursprungsläget. Tryck på 'Kör kod' för att köra.";
        timeElem.textContent = "";
      });
    }

    // Copy Button Handler
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(editor.value).then(() => {
          const origText = copyBtn.textContent;
          copyBtn.textContent = "✓ Kopierad!";
          setTimeout(() => {
            copyBtn.textContent = origText;
          }, 2000);
        });
      });
    }

    // Keyboard shortcut: Shift+Enter or Ctrl+Enter to run code
    editor.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "Enter") {
        e.preventDefault();
        runBtn.click();
      }
      // Allow tab key indentation
      if (e.key === "Tab") {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + "    " + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
      }
    });
  });

  // Handle "Rätta mitt svar" (Exercise Check Buttons)
  const checkButtons = document.querySelectorAll(".btn-check");
  checkButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const exNum = parseInt(btn.dataset.exercise, 10);
      const box = btn.closest(".code-box-wrapper");
      const editor = box.querySelector(".code-editor");
      const outputElem = box.querySelector(".output-content");
      const timeElem = box.querySelector(".output-exec-time");

      btn.textContent = "⏳ Rättar...";
      outputElem.className = "output-content";
      outputElem.textContent = "Analyserar dina beräkningar och variabler i Python...";

      const checker = exerciseCheckers[exNum];
      if (checker) {
        const result = await checker(editor.value);
        outputElem.className = result.allPass ? "output-content success" : "output-content error";
        outputElem.textContent = result.text;
        timeElem.textContent = "Rättning klar";
      }

      btn.textContent = "✨ Rätta mitt svar";
    });
  });

  // Handle "Kopiera lösningskoden till editorn" Buttons
  const loadSolutionButtons = document.querySelectorAll(".btn-load-solution");
  loadSolutionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const exNum = btn.dataset.exercise;
      const card = document.getElementById(`ex-card-${exNum}`);
      if (!card) return;

      const solutionCodeElem = card.querySelector(".solution-code code");
      const editor = card.querySelector(".code-editor");
      if (solutionCodeElem && editor) {
        editor.value = solutionCodeElem.textContent.trim();
        editor.focus();
        editor.scrollIntoView({ behavior: "smooth", block: "center" });

        // Flash feedback
        const origText = btn.textContent;
        btn.textContent = "✓ Inlagd i editorn ovan!";
        setTimeout(() => {
          btn.textContent = origText;
        }, 2200);
      }
    });
  });
}

// ==========================================================================
// 4. Interactive 2D Vector Visualizer Canvas with Drag & Drop
// ==========================================================================
function initVectorVisualizer() {
  const canvas = document.getElementById("vectorCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const sliderUx = document.getElementById("slider-ux");
  const sliderUy = document.getElementById("slider-uy");
  const sliderVx = document.getElementById("slider-vx");
  const sliderVy = document.getElementById("slider-vy");
  const checkSum = document.getElementById("check-sum");

  const valUx = document.getElementById("val-ux");
  const valUy = document.getElementById("val-uy");
  const valVx = document.getElementById("val-vx");
  const valVy = document.getElementById("val-vy");

  const statNormU = document.getElementById("stat-norm-u");
  const statNormV = document.getElementById("stat-norm-v");
  const statDot = document.getElementById("stat-dot");
  const statAngle = document.getElementById("stat-angle");
  const snippetCode = document.getElementById("vis-code-snippet");

  const width = canvas.width;
  const height = canvas.height;
  const originX = width / 2;
  const originY = height / 2;
  const scale = 32; // 32 pixels per grid unit

  let draggingTarget = null; // 'u' or 'v'

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;

    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.8;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis markings & numbers
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let i = -6; i <= 6; i++) {
      if (i === 0) continue;
      const x = originX + i * scale;
      const y = originY - i * scale;
      if (x > 10 && x < width - 10) {
        ctx.fillText(i.toString(), x, originY + 4);
      }
      if (y > 10 && y < height - 10) {
        ctx.fillText(i.toString(), originX - 10, y - 5);
      }
    }
  }

  function drawArrow(fromX, fromY, toX, toY, color, label, isDashed = false) {
    const headLen = 11;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.8;

    if (isDashed) {
      ctx.setLineDash([4, 4]);
    } else {
      ctx.setLineDash([]);
    }

    // Main line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Drag handle circle on vector tip
    ctx.beginPath();
    ctx.arc(toX, toY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    if (label) {
      ctx.font = "bold 13px Outfit, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(label, toX + 9, toY - 9);
    }
    ctx.restore();
  }

  function update() {
    const ux = parseFloat(sliderUx.value);
    const uy = parseFloat(sliderUy.value);
    const vx = parseFloat(sliderVx.value);
    const vy = parseFloat(sliderVy.value);
    const showSum = checkSum.checked;

    // Update value labels
    valUx.textContent = ux;
    valUy.textContent = uy;
    valVx.textContent = vx;
    valVy.textContent = vy;

    // Calculations
    const normU = Math.hypot(ux, uy);
    const normV = Math.hypot(vx, vy);
    const dotProduct = ux * vx + uy * vy;
    let angleDeg = 0;
    if (normU > 0 && normV > 0) {
      const cosTheta = Math.max(-1, Math.min(1, dotProduct / (normU * normV)));
      angleDeg = (Math.acos(cosTheta) * (180 / Math.PI)).toFixed(1);
    }

    // Update stats DOM
    statNormU.textContent = normU.toFixed(2);
    statNormV.textContent = normV.toFixed(2);
    statDot.textContent = dotProduct.toFixed(2);
    statAngle.textContent = angleDeg + "°";

    // Update code snippet
    const sumX = (ux + vx).toFixed(1).replace(/\.0$/, '');
    const sumY = (uy + vy).toFixed(1).replace(/\.0$/, '');
    snippetCode.textContent = `u = np.array([${ux}, ${uy}])
v = np.array([${vx}, ${vy}])
summa = u + v        # [${sumX}, ${sumY}]
skalarprod = u @ v   # ${dotProduct.toFixed(1)}`;

    // Draw canvas
    drawGrid();

    const canvasUx = originX + ux * scale;
    const canvasUy = originY - uy * scale;
    const canvasVx = originX + vx * scale;
    const canvasVy = originY - vy * scale;

    // If sum is checked, draw parallelogram helper dashed lines
    if (showSum) {
      const canvasSumX = originX + (ux + vx) * scale;
      const canvasSumY = originY - (uy + vy) * scale;

      // Dashed parallelogram sides
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(canvasUx, canvasUy);
      ctx.lineTo(canvasSumX, canvasSumY);
      ctx.moveTo(canvasVx, canvasVy);
      ctx.lineTo(canvasSumX, canvasSumY);
      ctx.stroke();
      ctx.restore();

      // Vector sum (u + v)
      drawArrow(originX, originY, canvasSumX, canvasSumY, "#10b981", "u + v");
    }

    // Vector u (Cyan)
    drawArrow(originX, originY, canvasUx, canvasUy, "#38bdf8", "u");

    // Vector v (Rose)
    drawArrow(originX, originY, canvasVx, canvasVy, "#f43f5e", "v");
  }

  // Interactive Dragging on Canvas
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getCanvasCoords(e);
    const ux = parseFloat(sliderUx.value);
    const uy = parseFloat(sliderUy.value);
    const vx = parseFloat(sliderVx.value);
    const vy = parseFloat(sliderVy.value);

    const canvasUx = originX + ux * scale;
    const canvasUy = originY - uy * scale;
    const canvasVx = originX + vx * scale;
    const canvasVy = originY - vy * scale;

    const distU = Math.hypot(x - canvasUx, y - canvasUy);
    const distV = Math.hypot(x - canvasVx, y - canvasVy);

    if (distU < 22) {
      draggingTarget = "u";
      canvas.classList.add("dragging");
    } else if (distV < 22) {
      draggingTarget = "v";
      canvas.classList.add("dragging");
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!draggingTarget) {
      // Hover detection to update cursor
      const { x, y } = getCanvasCoords(e);
      const ux = parseFloat(sliderUx.value);
      const uy = parseFloat(sliderUy.value);
      const vx = parseFloat(sliderVx.value);
      const vy = parseFloat(sliderVy.value);

      const canvasUx = originX + ux * scale;
      const canvasUy = originY - uy * scale;
      const canvasVx = originX + vx * scale;
      const canvasVy = originY - vy * scale;

      const isNear = Math.hypot(x - canvasUx, y - canvasUy) < 20 || Math.hypot(x - canvasVx, y - canvasVy) < 20;
      canvas.classList.toggle("can-drag", isNear);
      return;
    }

    const { x, y } = getCanvasCoords(e);
    // Snap to nearest 0.5 grid step
    let gridX = Math.round(((x - originX) / scale) * 2) / 2;
    let gridY = Math.round(((originY - y) / scale) * 2) / 2;

    gridX = Math.max(-6, Math.min(6, gridX));
    gridY = Math.max(-6, Math.min(6, gridY));

    if (draggingTarget === "u") {
      sliderUx.value = gridX;
      sliderUy.value = gridY;
    } else if (draggingTarget === "v") {
      sliderVx.value = gridX;
      sliderVy.value = gridY;
    }
    update();
  });

  window.addEventListener("mouseup", () => {
    if (draggingTarget) {
      draggingTarget = null;
      canvas.classList.remove("dragging");
    }
  });

  [sliderUx, sliderUy, sliderVx, sliderVy, checkSum].forEach(el => {
    el.addEventListener("input", update);
  });

  update();
}

// ==========================================================================
// 5. Dark / Light Theme Toggle
// ==========================================================================
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem("la-theme") || "dark";
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }

  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("la-theme", next);
  });
}

// ==========================================================================
// 6. Scrollspy for Active Navigation Link
// ==========================================================================
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id], div[id='vector-visualizer'], div[id='transformations']");
  const navLinks = document.querySelectorAll(".sidebar .nav-link");

  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentId}`) {
          link.classList.add("active");
        }
      });
    }
  }, { passive: true });
}

// ==========================================================================
// 7. KaTeX Auto-Render Initializer
// ==========================================================================
function initKaTeX() {
  if (typeof renderMathInElement !== "undefined") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  } else {
    setTimeout(() => {
      if (typeof renderMathInElement !== "undefined") {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      }
    }, 500);
  }
}

// ==========================================================================
// Main Initialization on DOM Ready
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initKaTeX();
  initCodeBoxes();
  initVectorVisualizer();
  initScrollSpy();
  loadPythonEnvironment();
});
