/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QRCodeSVG } from "qrcode.react";
import Lenis from "lenis";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const SITE_URL = "https://mercedes-ar.netlify.app";
const MODEL_PATH = "/models/eqs.glb";
const AR_URL = `${SITE_URL}/ar?model=${encodeURIComponent(MODEL_PATH)}`;

function Car({
  sp,
  on,
}: {
  sp: React.MutableRefObject<number>;
  on: React.MutableRefObject<boolean>;
}) {
  const { scene } = useGLTF("/models/eqs.glb");
  const g = useRef<THREE.Group>(null);
  const beamL = useRef<THREE.SpotLight>(null);
  const beamR = useRef<THREE.SpotLight>(null);
  const tL = useRef<THREE.Object3D>(null);
  const tR = useRef<THREE.Object3D>(null);
  const barL = useRef<THREE.Mesh>(null);
  const barR = useRef<THREE.Mesh>(null);
  const ok = useRef(false);

  useFrame(() => {
    if (!g.current) return;
    if (!ok.current) {
      const b = new THREE.Box3().setFromObject(g.current);
      const sz = b.getSize(new THREE.Vector3());
      g.current.scale.setScalar(4 / Math.max(sz.x, sz.y, sz.z));
      const c = new THREE.Box3()
        .setFromObject(g.current)
        .getCenter(new THREE.Vector3());
      g.current.position.set(-c.x, -c.y, -c.z);
      ok.current = true;
    }

    const p = sp.current;
    g.current.position.z = on.current ? p * 9 : 0;

    const target = on.current ? 1 : 0;
    if (beamL.current)
      beamL.current.intensity = THREE.MathUtils.lerp(
        beamL.current.intensity,
        target * 140,
        0.05,
      );
    if (beamR.current)
      beamR.current.intensity = THREE.MathUtils.lerp(
        beamR.current.intensity,
        target * 140,
        0.05,
      );
    const matL = barL.current?.material as
      | THREE.MeshStandardMaterial
      | undefined;
    const matR = barR.current?.material as
      | THREE.MeshStandardMaterial
      | undefined;
    if (matL)
      matL.emissiveIntensity = THREE.MathUtils.lerp(
        matL.emissiveIntensity,
        target * 6,
        0.06,
      );
    if (matR)
      matR.emissiveIntensity = THREE.MathUtils.lerp(
        matR.emissiveIntensity,
        target * 6,
        0.06,
      );
  });

  return (
    <group ref={g}>
      <primitive object={scene} />
      <mesh ref={barL} position={[-0.55, 0.18, 1.9]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#eaf2ff"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={barR} position={[0.55, 0.18, 1.9]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#eaf2ff"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
      <object3D ref={tL} position={[-1, -0.4, 12]} />
      <object3D ref={tR} position={[1, -0.4, 12]} />
      <spotLight
        ref={beamL}
        position={[-0.6, 0.3, 2]}
        angle={0.7}
        penumbra={0.6}
        intensity={0}
        distance={30}
        color="#f0f6ff"
        target={tL.current || undefined}
      />
      <spotLight
        ref={beamR}
        position={[0.6, 0.3, 2]}
        angle={0.7}
        penumbra={0.6}
        intensity={0}
        distance={30}
        color="#f0f6ff"
        target={tR.current || undefined}
      />
    </group>
  );
}

function QRModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: 320,
          width: "90%",
        }}
      >
        <p
          style={{
            fontFamily: "Inter,sans-serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#999",
          }}
        >
          Scan with your phone
        </p>
        <QRCodeSVG
          value={AR_URL}
          size={200}
          bgColor="#fff"
          fgColor="#000"
          level="H"
        />
        <p
          style={{
            fontFamily: "Inter,sans-serif",
            fontSize: 13,
            color: "#aaa",
            textAlign: "center" as const,
            lineHeight: 1.6,
          }}
        >
          Scan · park the EQS in your driveway
        </p>
        <button
          onClick={onClose}
          style={{
            fontFamily: "Inter,sans-serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#bbb",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ARButton() {
  const [qr, setQr] = useState(false);
  const handleAR = () => {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod|Android/.test(ua)) window.location.href = AR_URL;
    else setQr(true);
  };
  return (
    <>
      {qr && <QRModal onClose={() => setQr(false)} />}
      <button onClick={handleAR} className="cta">
        Park it in your driveway
      </button>
    </>
  );
}

export default function Home() {
  const sp = useRef(0);
  const on = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const t1 = useRef<HTMLHeadingElement>(null);
  const t2 = useRef<HTMLParagraphElement>(null);
  const audioStarted = useRef(false);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !audioStarted.current) {
        audioStarted.current = true;
        audioRef.current.volume = 0.8;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        document.removeEventListener("pointerdown", playAudio);
      }
    };

    document.addEventListener("pointerdown", playAudio);

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ({ progress }: { progress: number }) => {
      sp.current = progress;
      if (progress > 0.015 && !on.current) {
        on.current = true;
        if (audioRef.current && !audioStarted.current) {
          audioStarted.current = true;
          audioRef.current.volume = 0.8;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        gsap.to(hint.current, { opacity: 0, duration: 0.5 });
        gsap.fromTo(
          [t1.current, t2.current],
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.2,
            ease: "power4.out",
            delay: 0.6,
          },
        );
      }
    });
    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    gsap.set([t1.current, t2.current], { opacity: 0, y: 40 });
    gsap.utils
      .toArray<Element>(".ru")
      .forEach((el) =>
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 82%" },
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: "power4.out",
        }),
      );
    gsap.utils.toArray<HTMLElement>(".count").forEach((el) => {
      const tgt = parseInt(el.dataset.t || "0");
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: tgt,
          duration: 2,
          ease: "power2.out",
          snap: { innerText: 1 },
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: function () {
            el.innerText = Math.round(Number(el.innerText)).toString();
          },
        },
      );
    });
    return () => {
      lenis.destroy();
      document.removeEventListener("pointerdown", playAudio);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{background:#000;overflow-x:hidden;font-family:'Inter',sans-serif}
        .cta{font-family:'Inter',sans-serif;background:#fff;color:#000;border:none;border-radius:9999px;padding:16px 48px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:all .4s}
        .cta:hover{background:#0a84ff;color:#fff;transform:scale(1.05)}
      `}</style>

      <audio ref={audioRef} src="/models/car.mp3" preload="auto" />

      <div style={{ position: "fixed", inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0.3, 8], fov: 42 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.04} />
          <Environment preset="night" environmentIntensity={0.15} />
          <Car sp={sp} on={on} />
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.7}
            scale={14}
            blur={3}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      <div
        ref={hint}
        style={{
          position: "fixed",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Scroll to wake it
        <br />
        <span style={{ fontSize: 18 }}>↓</span>
      </div>

      <main style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <section style={{ height: "100vh" }} />

        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            textAlign: "center",
            padding: "0 24px 100px",
          }}
        >
          <h1
            ref={t1}
            style={{
              color: "#fff",
              fontSize: "clamp(48px,9vw,110px)",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              lineHeight: 0.95,
            }}
          >
            EQS 580
          </h1>
          <p
            ref={t2}
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 16,
              fontWeight: 300,
              letterSpacing: "0.08em",
              marginTop: 20,
              maxWidth: 440,
            }}
          >
            Silence, then power. The future of Mercedes-Benz — now in your
            space.
          </p>
        </section>

        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 8vw",
          }}
        >
          <div className="ru" style={{ pointerEvents: "all", maxWidth: 900 }}>
            <h2
              style={{
                color: "#fff",
                fontSize: "clamp(42px,6.5vw,90px)",
                fontWeight: 200,
                lineHeight: 1.15,
                marginBottom: 32,
              }}
            >
              The Aura Standard makes{" "}
              <span style={{ color: "#0a84ff" }}>experiences.</span>
              <br />
              Stop static sites.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.8,
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              When the website is the experience, the customer becomes your
              marketer. They don&apos;t just see the car — they park it in their
              driveway. They own it, virtually. They share it. They become you.
            </p>
          </div>
        </section>

        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8vw",
          }}
        >
          <div
            className="ru"
            style={{
              pointerEvents: "all",
              textAlign: "center",
              maxWidth: 1000,
            }}
          >
            <p
              style={{
                color: "#0a84ff",
                fontSize: 11,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                marginBottom: 48,
              }}
            >
              Proof
            </p>
            <div
              style={{
                display: "flex",
                gap: "6vw",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "clamp(48px,7vw,90px)",
                    fontWeight: 200,
                  }}
                >
                  <span className="count" data-t="94">
                    0
                  </span>
                  %
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: 8,
                  }}
                >
                  Recall vs static ads
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "clamp(48px,7vw,90px)",
                    fontWeight: 200,
                  }}
                >
                  <span className="count" data-t="11">
                    0
                  </span>
                  ×
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: 8,
                  }}
                >
                  More engagement
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "clamp(48px,7vw,90px)",
                    fontWeight: 200,
                  }}
                >
                  <span className="count" data-t="66">
                    0
                  </span>
                  %
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: 8,
                  }}
                >
                  Purchase intent lift
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <div
            className="ru"
            style={{
              pointerEvents: "all",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              See it in your reality
            </p>
            <ARButton />
            <p
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 12,
                letterSpacing: "0.1em",
                marginTop: 20,
              }}
            >
              The Aura Standard · aura_ceo@icloud.com
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
