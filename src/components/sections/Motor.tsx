// ─── MOTOR SECTION — SixDX ────────────────────────────────────────────────────
// Sticky scroll 3D viewer for the motor asset.
//
// Camera journey  : frontal (Z-axis, eye-level) → top-down (Y-axis, bird's-eye)
// Scroll config   : pin:true  scrub:1  end:'+=560%'  (matches StackSection)
//
// ⚠  ASSET REQUIREMENT — read before deploying:
//   Three.js cannot load .blend files directly.
//   You must export the motor from Blender first:
//     Blender → File → Export → glTF 2.0 (.glb/.gltf)
//     ✔ Include  : Geometry, Materials, Textures
//     ✔ Format   : GLB (single binary file)
//     ✔ Output   : /public/3D asset/motor.glb
//   The TGA textures in /public/3D asset/text/ will be embedded
//   automatically if you select "Export Textures" in the exporter.
//
// File loaded     : /public/3D asset/motor.glb
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'

// ─── CONFIG — edit freely ────────────────────────────────────────────────────
const MODEL_SRC = '/3D asset/motor.glb'

// Scroll budget — must match StackSection so they feel part of one system
const SCROLL_END = '+=560%'

// Camera positions (tweak these to reframe the shot)
const CAM_FRONTAL: [number, number, number] = [0,  1.2,  5.5]   // eye-level, in front
const CAM_TOPDOWN: [number, number, number] = [0,  7.0,  0.5]   // above, slight tilt

// Look-at targets — what the camera points at in each position
const LOOK_FRONTAL: [number, number, number] = [0, 0.4, 0]
const LOOK_TOPDOWN: [number, number, number] = [0, 0,   0]

// Ambient + directional lighting
const AMBIENT_INTENSITY   = 1.2
const DIRECTIONAL_COLOR   = 0xffffff
const DIRECTIONAL_INTENSITY = 2.5
const DIRECTIONAL_POS: [number, number, number] = [5, 10, 7]
// ─────────────────────────────────────────────────────────────────────────────

export default function MotorSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas  = canvasRef.current
    if (!section || !canvas) return

    // ── Three.js scene setup ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping       = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true

    const scene  = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.01,
      100,
    )
    camera.position.set(...CAM_FRONTAL)
    camera.lookAt(...LOOK_FRONTAL)

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY)
    scene.add(ambient)

    const dirLight = new THREE.DirectionalLight(DIRECTIONAL_COLOR, DIRECTIONAL_INTENSITY)
    dirLight.position.set(...DIRECTIONAL_POS)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffd0a0, 0.8)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)

    // ── Model loading ─────────────────────────────────────────────────────────
    let animationId = 0
    let modelLoaded = false

    const loader = new GLTFLoader()
    loader.load(
      MODEL_SRC,
      (gltf) => {
        const model = gltf.scene

        // Centre and scale the model so it fits the camera frame
        const box    = new THREE.Box3().setFromObject(model)
        const size   = box.getSize(new THREE.Vector3())
        const centre = box.getCenter(new THREE.Vector3())

        const maxDim  = Math.max(size.x, size.y, size.z)
        const scale   = 2.5 / maxDim     // normalise to ~2.5 units tall
        model.scale.setScalar(scale)
        model.position.sub(centre.multiplyScalar(scale))

        // Enable shadows on every mesh
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow    = true
            child.receiveShadow = true
          }
        })

        scene.add(model)
        modelLoaded = true
        ScrollTrigger.refresh()
      },
      undefined,
      (err) => {
        console.warn(
          '[MotorSection] Could not load motor.glb. ' +
          'Export motor.blend from Blender: File → Export → glTF 2.0 (.glb), ' +
          'save to /public/3D asset/motor.glb',
          err,
        )
      },
    )

    // ── GSAP scroll-driven camera ─────────────────────────────────────────────
    // `progress` runs 0 → 1 over the pinned scroll distance.
    // Camera position and look-at both lerp between frontal and top-down.
    const state = { progress: 0 }

    const trigger = ScrollTrigger.create({
      trigger:             section,
      start:               'top top',
      end:                 SCROLL_END,
      pin:                 true,
      scrub:               1,
      anticipatePin:       1,
      refreshPriority:     -1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        state.progress = self.progress
      },
    })

    // ── Resize handler ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Render loop ───────────────────────────────────────────────────────────
    const vFrontal = new THREE.Vector3(...CAM_FRONTAL)
    const vTopdown = new THREE.Vector3(...CAM_TOPDOWN)
    const vLookF   = new THREE.Vector3(...LOOK_FRONTAL)
    const vLookT   = new THREE.Vector3(...LOOK_TOPDOWN)

    const camPos  = new THREE.Vector3()
    const lookAt  = new THREE.Vector3()

    const tick = () => {
      animationId = requestAnimationFrame(tick)

      // Smooth ease: ease-in-out curve so the camera doesn't snap at extremes
      const p = state.progress
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p

      camPos.lerpVectors(vFrontal, vTopdown, eased)
      lookAt.lerpVectors(vLookF,   vLookT,   eased)

      camera.position.copy(camPos)
      camera.lookAt(lookAt)

      renderer.render(scene, camera)
    }
    tick()

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      trigger.kill()
      renderer.dispose()
      scene.clear()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Motor — 3D viewer"
      style={{
        position:        'relative',
        width:           '100%',
        height:          '100svh',
        overflow:        'hidden',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Full-viewport canvas — renderer draws directly here */}
      <canvas
        ref={canvasRef}
        style={{
          display:  'block',
          width:    '100%',
          height:   '100%',
        }}
      />

      {/* Optional loading overlay — hidden once model loads via CSS */}
      <div
        aria-hidden="true"
        id="motor-loading"
        style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'rgba(255,255,255,0.3)',
          fontSize:       '0.875rem',
          fontFamily:     'HelveticaNeue, "Helvetica Neue", Helvetica, Arial, sans-serif',
          letterSpacing:  '0.08em',
          pointerEvents:  'none',
        }}
      >
        Loading
      </div>
    </section>
  )
}
