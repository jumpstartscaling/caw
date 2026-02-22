import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

export default function FloatingTech() {
    return (
        <div className="h-[400px] w-full cursor-pointer">
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 5, 2]} />
                <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                    <Sphere args={[1, 100, 200]} scale={2.5}>
                        <MeshDistortMaterial
                            color="#4F46E5"
                            attach="material"
                            distort={0.5}
                            speed={2}
                            roughness={0}
                        />
                    </Sphere>
                </Float>
            </Canvas>
        </div>
    );
}
