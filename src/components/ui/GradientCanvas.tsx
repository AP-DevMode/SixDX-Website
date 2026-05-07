// ─── GRADIENT CANVAS — SixDX ─────────────────────────────────────────────────
// WebGL canvas with a fully uniform-driven GLSL domain-warp shader.
//
// Effects:
//   • Domain-warp fBm gradient   — organic flowing colour field
//   • Ripple / Lens refraction   — water ripple that DISPLACES gradient colours
//                                  + chromatic aberration split + specular gleam
//   • Glowing rays               — polar burst with noise, falloff & blend modes
//
// Blending modes for both ripple-lens and rays:
//   0 = Additive   1 = Screen   2 = Overlay
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONFIG TYPE ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface GradientConfig {
  speed:     number
  warpScale: number
  grain:     number
  vignette:  number

  colors: {
    ink:    string
    orange: string
    sienna: string
    black:  string
  }

  blends: {
    inkToSienna: [number, number]
    toOrange:    [number, number]
    backToInk:   [number, number]
    toBlack:     [number, number]
  }

  ripple: {
    /** Toggle the entire effect */
    enabled:    boolean
    /** Wave animation speed */
    speed:      number
    /** Wave cycles density (lower = bigger water ripples) */
    frequency:  number
    /** UV colour-displacement strength (this is what makes refraction visible) */
    amplitude:  number
    /** Specular gleam brightness at wave crests */
    lensGlare:  number
    /**
     * Chromatic aberration — splits R/B channels in opposite directions.
     * 0 = off, 1 = strong prismatic fringe
     */
    chromatic:  number
    /** 0 = Add  1 = Screen  2 = Overlay  3 = Plus Light */
    blendMode:  number
    /** Uniform scale of the ripple pattern (1 = normal, 2 = twice as large) */
    scale:      number
  }

  rays: {
    enabled:    boolean
    intensity:  number
    count:      number
    speed:      number
    /** Can go outside 0–1 to place origin off-canvas */
    originX:    number
    /** Can go outside 0–1 to place origin off-canvas */
    originY:    number
    sharpness:  number
    color:      string
    /** Beam noise / irregularity (0 = smooth, 1 = very turbulent) */
    noise:      number
    /** Radial falloff exponent — higher fades rays faster (1–10) */
    falloff:    number
    /** Core halo brightness at the origin point */
    core:       number
    /** 0 = Add  1 = Screen  2 = Overlay  3 = Plus Light */
    blendMode:  number
    /** Uniform scale of the ray burst (1 = normal, 2 = twice as large) */
    scale:      number
  }
}

export const DEFAULT_GRADIENT_CONFIG: GradientConfig = {
  speed:     0.2,
  warpScale: 3.5,
  grain:     0.018,
  vignette:  0.55,
  colors: {
    ink:    '#1C0B05',
    orange: '#CC4D22',
    sienna: '#74331D',
    black:  '#030101',
  },
  blends: {
    inkToSienna: [0.00, 0.42],
    toOrange:    [0.35, 0.60],
    backToInk:   [0.55, 0.75],
    toBlack:     [0.72, 1.00],
  },
  ripple: {
    enabled:   true,
    speed:     2.2,
    frequency: 11.0,
    amplitude: 0.038,
    lensGlare: 0.90,
    chromatic: 0.55,
    blendMode: 1,
    scale:     1.0,
  },
  rays: {
    enabled:   true,
    intensity: 0.38,
    count:     6,
    speed:     0.10,
    originX:   0.50,
    originY:   0.38,
    sharpness: 20.0,
    color:     '#FF6A35',
    noise:     0.50,
    falloff:   2.8,
    core:      0.90,
    blendMode: 1,
    scale:     1.0,
  },
}

// ─── COLOUR UTILITY ───────────────────────────────────────────────────────────

export function hexToVec3(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ]
}

// ─── GLSL SHADERS ─────────────────────────────────────────────────────────────

const VERT = /* glsl */`
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`

const FRAG = /* glsl */`
  precision highp float;

  uniform float u_time;
  uniform vec2  u_resolution;

  // ── Core gradient ──────────────────────────────────────────────────────────
  uniform vec3  u_ink;
  uniform vec3  u_orange;
  uniform vec3  u_sienna;
  uniform vec3  u_black;
  uniform float u_vignette;
  uniform float u_grain;
  uniform float u_warpScale;
  uniform vec2  u_blend0;
  uniform vec2  u_blend1;
  uniform vec2  u_blend2;
  uniform vec2  u_blend3;

  // ── Ripple / lens ──────────────────────────────────────────────────────────
  uniform float u_rippleEnabled;
  uniform float u_rippleSpeed;
  uniform float u_rippleFreq;
  uniform float u_rippleAmp;
  uniform float u_rippleLens;
  uniform float u_rippleChromatic;
  uniform float u_rippleBlendMode;
  uniform float u_rippleScale;

  // ── Rays ───────────────────────────────────────────────────────────────────
  uniform float u_raysEnabled;
  uniform float u_raysIntensity;
  uniform float u_raysCount;
  uniform float u_raysSpeed;
  uniform vec2  u_raysOrigin;
  uniform float u_raysSharpness;
  uniform vec3  u_raysColor;
  uniform float u_raysNoise;
  uniform float u_raysFalloff;
  uniform float u_raysCore;
  uniform float u_raysBlendMode;
  uniform float u_raysScale;

  // ── Noise helpers ──────────────────────────────────────────────────────────
  float hash(vec2 p) {
    p  = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),                 hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float amp = 0.5;
    mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p  = rot * p * 2.0 + vec2(100.0);
      amp *= 0.5;
    }
    return v;
  }

  // ── Domain-warp field evaluator ────────────────────────────────────────────
  // Returns the raw fBm warp value f ∈ [0,1].
  float evalField(vec2 uv, float t) {
    vec2 q = vec2(
      fbm(uv + vec2(0.00, 0.00) + t * 0.80),
      fbm(uv + vec2(5.20, 1.30) + t)
    );
    vec2 r = vec2(
      fbm(uv + u_warpScale * q + vec2(1.70, 9.20) + 0.150 * t),
      fbm(uv + u_warpScale * q + vec2(8.30, 2.80) + 0.126 * t)
    );
    return fbm(uv + (u_warpScale - 0.5) * r + t * 0.04);
  }

  // ── Palette mapper ─────────────────────────────────────────────────────────
  vec3 applyPalette(float f) {
    vec3 c = mix(u_ink,    u_sienna, smoothstep(u_blend0.x, u_blend0.y, f));
    c       = mix(c,       u_orange, smoothstep(u_blend1.x, u_blend1.y, f) * 0.85);
    c       = mix(c,       u_ink,    smoothstep(u_blend2.x, u_blend2.y, f));
    c       = mix(c,       u_black,  smoothstep(u_blend3.x, u_blend3.y, f));
    return c;
  }

  // ── Blend modes ────────────────────────────────────────────────────────────
  vec3 blendScreen(vec3 base, vec3 top) {
    return 1.0 - (1.0 - base) * (1.0 - top);
  }
  vec3 blendOverlay(vec3 base, vec3 top) {
    vec3 dark  = 2.0 * base * top;
    vec3 light = 1.0 - 2.0 * (1.0 - base) * (1.0 - top);
    return mix(dark, light, step(0.5, base));
  }
  // Plus Light (Linear Light): clamp(base + 2*top - 1, 0, 1)
  // top < 0.5 darkens (Linear Burn side), top > 0.5 brightens (Linear Dodge side).
  // Produces a high-key, overexposed bloom in bright areas — great for glows.
  vec3 blendPlusLight(vec3 base, vec3 top) {
    return clamp(base + 2.0 * top - 1.0, 0.0, 1.0);
  }
  vec3 applyBlend(vec3 base, vec3 layer, float mode) {
    // 0 = Add   1 = Screen   2 = Overlay   3 = Plus Light
    vec3 add      = base + layer;
    vec3 screen   = blendScreen(base, layer);
    vec3 overlay  = blendOverlay(base, layer);
    vec3 plusLt   = blendPlusLight(base, layer);
    vec3 r = mix(add,    screen,  step(0.5, mode));
         r = mix(r,      overlay, step(1.5, mode));
         r = mix(r,      plusLt,  step(2.5, mode));
    return r;
  }

  // ── Codrops-style radial ripple ────────────────────────────────────────────
  // Ported from codrops/demo1 vertex shader formula:
  //   ripple = sin(-PI * FREQ * dist + uTime) * (AMP / decay)
  //   pos.y  += ripple;  (vertex displacement → here: UV colour displacement)
  //   color  += vRipple * 2.0;  (crest brightening)
  //
  // Each source computes its own radial direction (normalize(uv - source))
  // and applies the sine wave along that direction.  This produces clean,
  // visible concentric rings — not the blurry interference of a gradient approach.
  //
  // Returns: .xy = total UV offset  .z = lens/crest gleam (vRipple equivalent)
  vec3 computeRipple(vec2 uv, float t) {
    float PI  = 3.14159265359;
    float rt  = t * u_rippleSpeed;

    // Scale UV around canvas centre (u_rippleScale > 1 = larger rings)
    vec2 pivot = vec2(0.5);
    vec2 ruv   = pivot + (uv - pivot) * u_rippleScale;

    // Three drop-point sources at different positions and relative speeds
    vec2 s0 = vec2(0.30, 0.55);
    vec2 s1 = vec2(0.70, 0.42);
    vec2 s2 = vec2(0.50, 0.74);

    vec2  totalOffset = vec2(0.0);
    float totalGleam  = 0.0;

    // ── Source 0 ──────────────────────────────────────────────────────────
    {
      vec2  d    = ruv - s0;
      float dist = length(d) + 0.0001;
      // Amplitude envelope: decays with distance from source (like AMP/decay)
      float env  = 1.0 / (1.0 + dist * 6.0);
      // Codrops sine formula — negative PI*FREQ gives outward-travelling rings
      float wave = sin(-PI * u_rippleFreq * dist + rt * 1.00) * env;
      // Radial displacement: push/pull along the direction from source to pixel
      totalOffset += normalize(d) * wave * u_rippleAmp;
      // vRipple-style crest gleam: only the positive (crest) half contributes
      totalGleam  += max(0.0, wave) * env;
    }

    // ── Source 1 ──────────────────────────────────────────────────────────
    {
      vec2  d    = ruv - s1;
      float dist = length(d) + 0.0001;
      float env  = 1.0 / (1.0 + dist * 6.0);
      float wave = sin(-PI * u_rippleFreq * dist + rt * 0.87) * env;
      totalOffset += normalize(d) * wave * u_rippleAmp;
      totalGleam  += max(0.0, wave) * env;
    }

    // ── Source 2 (slightly different freq multiplier for variety) ──────────
    {
      vec2  d    = ruv - s2;
      float dist = length(d) + 0.0001;
      float env  = 1.0 / (1.0 + dist * 6.0);
      float wave = sin(-PI * u_rippleFreq * 0.8 * dist + rt * 1.15) * env;
      totalOffset += normalize(d) * wave * u_rippleAmp;
      totalGleam  += max(0.0, wave) * env;
    }

    // Average across sources; gleam × u_rippleLens mirrors "color += vRipple * 2."
    float gleam = (totalGleam / 3.0) * u_rippleLens * 2.0;
    return vec3(totalOffset / 3.0, gleam);
  }

  // ── Rays ───────────────────────────────────────────────────────────────────
  float glowRays(vec2 uv, float t) {
    // Divide displacement by scale → larger scale = pattern fills more of the canvas
    vec2  d     = (uv - u_raysOrigin) / max(u_raysScale, 0.01);
    float dist  = length(d) + 0.0001;
    float angle = atan(d.y, d.x);

    float rt    = t * u_raysSpeed;
    float slice = 6.28318 / u_raysCount;
    float a     = mod(angle - rt, slice);
    float mid   = slice * 0.5;

    // Gaussian beam
    float beam = exp(-u_raysSharpness * pow(a - mid, 2.0));

    // Noise irregularity (two octaves of noise along the ray angle)
    float nz = noise(vec2(angle * 2.5 + rt * 0.7, dist * 3.5))        * 0.5
             + noise(vec2(angle * 5.0 - rt * 1.3, dist * 7.0)) * 0.25 + 0.5;
    beam *= mix(1.0, nz, u_raysNoise);

    // Radial falloff — exponential with user-controlled exponent
    float radial = exp(-dist * u_raysFalloff);

    // Core halo
    float core = exp(-dist * 16.0) * u_raysCore;

    return (beam * radial + core) * u_raysIntensity;
  }

  // ─────────────────────────────────────────────────────────────────────────
  void main() {
    vec2  uv = gl_FragCoord.xy / u_resolution;
    float t  = u_time;

    // ── 1. Codrops ripple: offset + crest gleam ────────────────────────────
    vec3  rpl       = computeRipple(uv, t);  // .xy = UV offset  .z = gleam
    vec2  ripOffset = rpl.xy;
    float ripGleam  = rpl.z;

    vec2 sampleUV = uv + ripOffset * u_rippleEnabled;

    // ── 2. Gradient field evaluated at ripple-displaced UV ────────────────
    float f = evalField(sampleUV, t);

    // ── 3. Chromatic aberration — split the palette-lookup value per channel
    // The split direction uses the ripple offset as the axis, so chromatic
    // fringing follows the concentric ring edges.
    float chromaStr  = u_rippleChromatic * u_rippleEnabled * 0.030;
    vec2  ripDir     = normalize(ripOffset + vec2(0.0001));
    float chromaProj = dot(ripDir, vec2(0.707, 0.707));
    float fR = f + chromaProj * chromaStr;
    float fB = f - chromaProj * chromaStr * 0.65;

    // Build base colour — chromatic only when chroma > 0
    vec3 colR = applyPalette(fR);
    vec3 colG = applyPalette(f);
    vec3 colB = applyPalette(fB);
    float chromaMix = min(1.0, u_rippleChromatic * u_rippleEnabled);
    vec3 baseColor  = mix(colG, vec3(colR.r, colG.g, colB.b), chromaMix);

    // ── 4. Crest gleam — mirrors codrops "color += vRipple * 2." ──────────
    // Tinted orange-warm and passed through the chosen blend mode.
    vec3 lensLayer = ripGleam * mix(vec3(1.0), u_orange, 0.65) * u_rippleEnabled;
    vec3 color     = applyBlend(baseColor, lensLayer, u_rippleBlendMode);

    // ── 5. Glowing rays ────────────────────────────────────────────────────
    float rayVal   = glowRays(uv, t) * u_raysEnabled;
    vec3  raysLayer = rayVal * u_raysColor;
    color = applyBlend(color, raysLayer, u_raysBlendMode);

    // ── 6. Vignette ────────────────────────────────────────────────────────
    color *= mix(u_vignette, 1.0, uv.y);

    // ── 7. Film grain ──────────────────────────────────────────────────────
    float grain = (hash(uv * u_resolution + u_time * 47.0) - 0.5) * u_grain;
    color      += grain;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

// ─── WEBGL HELPERS ────────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s); gl.deleteShader(s)
    throw new Error(`[GradientCanvas] Shader compile error:\n${info}`)
  }
  return s
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const p = gl.createProgram()!
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER,   VERT))
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(`[GradientCanvas] Link error:\n${gl.getProgramInfoLog(p)}`)
  return p
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

export interface GradientCanvasProps {
  config?:    GradientConfig
  className?: string
  style?:     CSSProperties
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const GradientCanvas = forwardRef<HTMLCanvasElement, GradientCanvasProps>(
  function GradientCanvas({ config, className, style }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const configRef = useRef<GradientConfig>(config ?? DEFAULT_GRADIENT_CONFIG)

    useImperativeHandle(ref, () => canvasRef.current!, [])

    useEffect(() => {
      configRef.current = config ?? DEFAULT_GRADIENT_CONFIG
    }, [config])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const gl = canvas.getContext('webgl', {
        antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance',
      })
      if (!gl) { console.warn('[GradientCanvas] WebGL not supported.'); return }

      let program: WebGLProgram
      try { program = createProgram(gl) } catch (e) { console.error(e); return }
      gl.useProgram(program)

      const buf = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
      const pos = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(pos)
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

      // ── Uniform locations ──────────────────────────────────────────────────
      const U = (n: string) => gl.getUniformLocation(program, n)
      const uTime       = U('u_time');       const uRes        = U('u_resolution')
      const uInk        = U('u_ink');        const uOrange     = U('u_orange')
      const uSienna     = U('u_sienna');     const uBlack      = U('u_black')
      const uVignette   = U('u_vignette');   const uGrain      = U('u_grain')
      const uWarpScale  = U('u_warpScale')
      const uBlend0     = U('u_blend0');     const uBlend1     = U('u_blend1')
      const uBlend2     = U('u_blend2');     const uBlend3     = U('u_blend3')
      // Ripple
      const uRippleEn   = U('u_rippleEnabled'); const uRippleSpd  = U('u_rippleSpeed')
      const uRippleFreq = U('u_rippleFreq');    const uRippleAmp  = U('u_rippleAmp')
      const uRippleLens = U('u_rippleLens');    const uRippleChr  = U('u_rippleChromatic')
      const uRippleBM   = U('u_rippleBlendMode'); const uRippleSc = U('u_rippleScale')
      // Rays
      const uRaysEn     = U('u_raysEnabled');  const uRaysInt    = U('u_raysIntensity')
      const uRaysCount  = U('u_raysCount');    const uRaysSpd    = U('u_raysSpeed')
      const uRaysOrigin = U('u_raysOrigin');   const uRaysSharp  = U('u_raysSharpness')
      const uRaysColor  = U('u_raysColor');    const uRaysNoise  = U('u_raysNoise')
      const uRaysFall   = U('u_raysFalloff');  const uRaysCore   = U('u_raysCore')
      const uRaysBM     = U('u_raysBlendMode'); const uRaysSc    = U('u_raysScale')

      const setSize = () => {
        const { width, height } = canvas.getBoundingClientRect()
        if (!width || !height) return
        const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
        canvas.width  = Math.round(width  * dpr)
        canvas.height = Math.round(height * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      setSize()
      const ro = new ResizeObserver(setSize)
      ro.observe(canvas)

      let raf: number
      const origin = performance.now()

      const tick = () => {
        const cfg = configRef.current
        const t   = ((performance.now() - origin) / 1000) * cfg.speed

        // Core
        gl.uniform1f(uTime,      t)
        gl.uniform2f(uRes,       canvas.width, canvas.height)
        gl.uniform3fv(uInk,      hexToVec3(cfg.colors.ink))
        gl.uniform3fv(uOrange,   hexToVec3(cfg.colors.orange))
        gl.uniform3fv(uSienna,   hexToVec3(cfg.colors.sienna))
        gl.uniform3fv(uBlack,    hexToVec3(cfg.colors.black))
        gl.uniform1f(uVignette,  cfg.vignette)
        gl.uniform1f(uGrain,     cfg.grain)
        gl.uniform1f(uWarpScale, cfg.warpScale)
        gl.uniform2fv(uBlend0,   cfg.blends.inkToSienna)
        gl.uniform2fv(uBlend1,   cfg.blends.toOrange)
        gl.uniform2fv(uBlend2,   cfg.blends.backToInk)
        gl.uniform2fv(uBlend3,   cfg.blends.toBlack)

        // Ripple
        const rip = cfg.ripple
        gl.uniform1f(uRippleEn,   rip.enabled  ? 1.0 : 0.0)
        gl.uniform1f(uRippleSpd,  rip.speed)
        gl.uniform1f(uRippleFreq, rip.frequency)
        gl.uniform1f(uRippleAmp,  rip.amplitude)
        gl.uniform1f(uRippleLens, rip.lensGlare)
        gl.uniform1f(uRippleChr,  rip.chromatic)
        gl.uniform1f(uRippleBM,   rip.blendMode)
        gl.uniform1f(uRippleSc,   rip.scale)

        // Rays
        const rays = cfg.rays
        gl.uniform1f(uRaysEn,     rays.enabled  ? 1.0 : 0.0)
        gl.uniform1f(uRaysInt,    rays.intensity)
        gl.uniform1f(uRaysCount,  rays.count)
        gl.uniform1f(uRaysSpd,    rays.speed)
        gl.uniform2f(uRaysOrigin, rays.originX, rays.originY)
        gl.uniform1f(uRaysSharp,  rays.sharpness)
        gl.uniform3fv(uRaysColor, hexToVec3(rays.color))
        gl.uniform1f(uRaysNoise,  rays.noise)
        gl.uniform1f(uRaysFall,   rays.falloff)
        gl.uniform1f(uRaysCore,   rays.core)
        gl.uniform1f(uRaysBM,     rays.blendMode)
        gl.uniform1f(uRaysSc,     rays.scale)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      return () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        gl.deleteBuffer(buf)
        gl.deleteProgram(program)
      }
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className={className}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
      />
    )
  },
)

export default GradientCanvas
