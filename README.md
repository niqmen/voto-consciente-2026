# ✓ VotoConsciente Perú 2026

Matriz de decisión electoral basada en datos verificables. Evaluamos a candidatos presidenciales, senadores y diputados por integridad legal, propuestas y trayectoria.

**Sin publicidad. Sin financiamiento político. Código abierto.**

---

## 🚀 Cómo publicar en GitHub Pages (paso a paso)

### Paso 1 — Crear cuenta en GitHub
1. Ve a [github.com](https://github.com) y crea una cuenta gratuita (si no tienes).
2. Confirma tu correo electrónico.

### Paso 2 — Crear el repositorio
1. En GitHub, haz clic en el botón verde **"New"** (arriba a la izquierda).
2. En **Repository name** escribe: `voto-consciente-2026`
3. Selecciona **Public** (debe ser público para usar GitHub Pages gratis).
4. **NO** marques ninguna opción de README, .gitignore ni licencia.
5. Haz clic en **"Create repository"**.

### Paso 3 — Subir los archivos

**Opción A — Arrastrando archivos (la más fácil):**
1. En la página del repositorio vacío, haz clic en **"uploading an existing file"**.
2. Arrastra TODOS los archivos y carpetas de este proyecto.
3. En el campo **"Commit changes"** escribe: `Primera versión`
4. Haz clic en **"Commit changes"**.

> ⚠️ **Importante:** GitHub no acepta subir carpetas completas arrastrando.  
> Debes subir los archivos organizados así:
> - Primero sube `index.html` en la raíz
> - Crea la carpeta `css/` y sube `styles.css` dentro
> - Crea la carpeta `js/` y sube `app.js` dentro  
> - Crea la carpeta `data/` y sube los 3 archivos JSON dentro

**Para crear carpetas en GitHub:**
1. Haz clic en **"Add file"** → **"Create new file"**
2. En el nombre escribe: `css/styles.css`
3. Copia y pega el contenido del archivo
4. Haz clic en **"Commit new file"**
5. Repite para `js/app.js` y `data/presidentes.json`, `data/senadores.json`, `data/diputados.json`

### Paso 4 — Activar GitHub Pages
1. En el repositorio, haz clic en **"Settings"** (pestaña con engranaje).
2. En el menú izquierdo, haz clic en **"Pages"**.
3. En **"Source"**, selecciona **"Deploy from a branch"**.
4. En **"Branch"**, selecciona **"main"** y la carpeta **"/ (root)"**.
5. Haz clic en **"Save"**.
6. Espera 2-3 minutos.

### Paso 5 — Ver tu web
Tu web estará disponible en:
```
https://TU_USUARIO.github.io/voto-consciente-2026/
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

---

## 📁 Estructura del proyecto

```
voto-consciente-2026/
├── index.html              ← Página principal
├── css/
│   └── styles.css          ← Estilos visuales
├── js/
│   └── app.js              ← Lógica de la aplicación
├── data/
│   ├── presidentes.json    ← Datos de candidatos presidenciales
│   ├── senadores.json      ← Datos de candidatos al Senado
│   └── diputados.json      ← Datos de candidatos a Diputados
└── README.md               ← Este archivo
```

---

## 📝 Cómo actualizar datos de un candidato

Los archivos en `data/` son JSON simples. Cada candidato tiene esta estructura:

```json
{
  "id": "p01",
  "nombre": "Nombre Completo",
  "partido": "Partido Político",
  "filtro": "ok",
  "filtro_nota": "Explicación del estado legal con fuente.",
  "eliminado": false,
  "puntajes": {
    "integ": 70,
    "econ": 65,
    "capac": 60,
    "inst": 58,
    "segur": 55,
    "soc": 60
  },
  "encuesta_pct": 5,
  "encuesta_fuente": "IEP mar 2026",
  "notas": "Descripción del perfil y trayectoria.",
  "fuentes": ["Fuente 1", "Fuente 2"],
  "links": ["https://link1", "https://link2"]
}
```

### Valores del campo `filtro`:
| Valor | Significado |
|-------|-------------|
| `"ok"` | Sin procesos penales graves |
| `"warn"` | Investigación activa o antecedentes |
| `"bad"` | Sentencia firme o inhabilitación vigente |

Si `eliminado` es `true`, el candidato aparece como descalificado y se oculta por defecto.

### Puntajes (0-100):
- **Para presidentes:** `integ`, `econ`, `capac`, `inst`, `segur`, `soc`
- **Para congresistas:** `integ`, `prop`, `asist`, `repr`

---

## 🤝 Cómo contribuir con datos

Si encuentras un error o quieres agregar información verificada:

1. **Con cuenta de GitHub:** Abre un "Issue" describiendo la corrección y adjunta la fuente.
2. **Sin cuenta:** Escribe al correo del proyecto (agregar aquí).

**Regla fundamental:** Cada cambio de dato debe incluir su fuente verificable (enlace al Poder Judicial, JNE, Ministerio Público, Contraloría o Congreso).

---

## 📊 Fuentes oficiales para verificar

| Institución | URL | Qué verificar |
|-------------|-----|---------------|
| JNE Voto Informado | votoinformado.jne.gob.pe | DDJJ, hoja de vida |
| Poder Judicial | pj.gob.pe | Sentencias y expedientes |
| Ministerio Público | mpfn.gob.pe | Investigaciones fiscales |
| Contraloría | contraloria.gob.pe | Auditorías de gestión |
| Congreso | congreso.gob.pe | Asistencia y proyectos de ley |

---

## ⚖️ Aviso legal

Los puntajes son estimaciones editoriales basadas en información pública disponible. No representan una recomendación de voto. Esta herramienta no tiene financiamiento partidario ni acepta publicidad. Es un proyecto ciudadano independiente.

---

## 📄 Licencia

MIT — Libre para usar, copiar y modificar con atribución.
