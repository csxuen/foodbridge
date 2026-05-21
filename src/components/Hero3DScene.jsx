import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    
    // SCENE SETUP
    const scene = new THREE.Scene();
    
    // Setup camera — pulled back to show enlarged conveyor
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2.5, 5.5, 10.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(6, 12, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Green glow light inside the machine
    const machineGlow = new THREE.PointLight(0x2d9e5f, 2, 3);
    machineGlow.position.set(0, 0.5, 0);
    scene.add(machineGlow);

    // Subtle blue rim light for premium Dribbble styling
    const blueRimLight = new THREE.DirectionalLight(0x7dd3fc, 0.6);
    blueRimLight.position.set(-6, 2, -4);
    scene.add(blueRimLight);

    // Parent group rotated + scaled up for a bigger scene
    const conveyorAssembly = new THREE.Group();
    conveyorAssembly.rotation.y = -Math.PI / 10;
    conveyorAssembly.scale.setScalar(1.45); // enlarge everything uniformly
    scene.add(conveyorAssembly);

    // MATERIALS
    const matMetal = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
    const matDarkMetal = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    const matMachineBody = new THREE.MeshStandardMaterial({ color: 0xfdfdfc, roughness: 0.2 });
    const matCanopy = new THREE.MeshStandardMaterial({ color: 0x1a5c38, roughness: 0.6 });
    const matGlowGreen = new THREE.MeshBasicMaterial({ color: 0x2d9e5f });
    
    // Food Waste Materials
    const matBone = new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.8 });
    const matMeat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    const matRiceBowl = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const matRice = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const matLeaf = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    
    // Cardboard Box Materials
    const matBox = new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.8 });
    const matStrap = new THREE.MeshStandardMaterial({ color: 0x1a5c38, roughness: 0.5 });

    // 1. CONVEYOR BELT MODEL (Local X direction)
    const beltLength = 7.0;
    const beltWidth = 1.0;
    const beltHeight = 0.1;
    
    const beltGeo = new THREE.BoxGeometry(beltLength, beltHeight, beltWidth);
    const belt = new THREE.Mesh(beltGeo, matDarkMetal);
    belt.position.y = 0.4;
    belt.receiveShadow = true;
    conveyorAssembly.add(belt);

    // Side Rails
    const railGeo = new THREE.BoxGeometry(beltLength, 0.08, 0.05);
    const railFront = new THREE.Mesh(railGeo, matMetal);
    railFront.position.set(0, 0.46, beltWidth/2 + 0.025);
    railFront.castShadow = true;
    conveyorAssembly.add(railFront);

    const railBack = railFront.clone();
    railBack.position.z = -(beltWidth/2 + 0.025);
    conveyorAssembly.add(railBack);

    // Rollers under the belt
    const rollers = [];
    const rollerGeo = new THREE.CylinderGeometry(0.08, 0.08, beltWidth + 0.1, 12);
    rollerGeo.rotateX(Math.PI / 2);
    
    for (let i = 0; i < 6; i++) {
      const roller = new THREE.Mesh(rollerGeo, matMetal);
      const posX = -beltLength/2 + 0.5 + (i * (beltLength - 1.0)/5);
      roller.position.set(posX, 0.28, 0);
      roller.castShadow = true;
      conveyorAssembly.add(roller);
      rollers.push(roller);
    }

    // Legs / supports
    const legGeo = new THREE.BoxGeometry(0.1, 0.4, 0.8);
    const legLeft = new THREE.Mesh(legGeo, matDarkMetal);
    legLeft.position.set(-beltLength/2 + 0.4, 0.2, 0);
    conveyorAssembly.add(legLeft);

    const legRight = legLeft.clone();
    legRight.position.set(beltLength/2 - 0.4, 0.2, 0);
    conveyorAssembly.add(legRight);


    // 2. THE TRANSFORMATION MACHINE (Centered at local X = 0)
    const machineGroup = new THREE.Group();
    machineGroup.position.set(0, 0.4 + beltHeight/2, 0);
    conveyorAssembly.add(machineGroup);

    // Main rounded shell
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.4, 1.4);
    const machineBody = new THREE.Mesh(bodyGeo, matMachineBody);
    machineBody.position.y = 0.7;
    machineBody.castShadow = true;
    machineBody.receiveShadow = true;
    machineGroup.add(machineBody);

    // Dark entrance and exit tunnels (subtly overlapping)
    const tunnelGeo = new THREE.BoxGeometry(0.2, 0.7, 1.05);
    const entranceTunnel = new THREE.Mesh(tunnelGeo, matDarkMetal);
    entranceTunnel.position.set(-0.75, 0.35, 0);
    machineGroup.add(entranceTunnel);

    const exitTunnel = entranceTunnel.clone();
    exitTunnel.position.set(0.75, 0.35, 0);
    machineGroup.add(exitTunnel);

    // Green Canopies above tunnels
    const canopyGeo = new THREE.BoxGeometry(0.3, 0.05, 1.15);
    const entranceCanopy = new THREE.Mesh(canopyGeo, matCanopy);
    entranceCanopy.position.set(-0.75, 0.72, 0);
    entranceCanopy.castShadow = true;
    machineGroup.add(entranceCanopy);

    const exitCanopy = entranceCanopy.clone();
    exitCanopy.position.set(0.75, 0.72, 0);
    machineGroup.add(exitCanopy);

    // Neon indicator bulb on top
    const bulbSupportGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
    const bulbSupport = new THREE.Mesh(bulbSupportGeo, matDarkMetal);
    bulbSupport.position.set(0, 1.5, 0);
    machineGroup.add(bulbSupport);

    const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const bulb = new THREE.Mesh(bulbGeo, matGlowGreen);
    bulb.position.set(0, 1.62, 0);
    machineGroup.add(bulb);


    // 3. PIPELINE OF ITEMS
    const items = [];
    const itemCount = 5;

    // Helper functions to build stylized low-poly models
    const createChickenLeg = () => {
      const group = new THREE.Group();
      // Bone
      const boneGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
      boneGeo.rotateZ(Math.PI / 4);
      const bone = new THREE.Mesh(boneGeo, matBone);
      bone.position.set(0.1, -0.05, 0);
      bone.castShadow = true;
      group.add(bone);

      // Bone knuckles
      const knuckleGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const k1 = new THREE.Mesh(knuckleGeo, matBone);
      k1.position.set(0.2, -0.15, -0.03);
      const k2 = new THREE.Mesh(knuckleGeo, matBone);
      k2.position.set(0.2, -0.15, 0.03);
      group.add(k1, k2);

      // Meat
      const meatGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const meat = new THREE.Mesh(meatGeo, matMeat);
      meat.scale.set(1.3, 1, 1);
      meat.position.set(-0.05, 0, 0);
      meat.castShadow = true;
      group.add(meat);

      group.rotation.x = Math.PI / 8;
      return group;
    };

    const createRiceBowl = () => {
      const group = new THREE.Group();
      // Bowl
      const bowlGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.12, 12);
      const bowl = new THREE.Mesh(bowlGeo, matRiceBowl);
      bowl.castShadow = true;
      group.add(bowl);

      // Rice dome
      const riceGeo = new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const rice = new THREE.Mesh(riceGeo, matRice);
      rice.position.y = 0.06;
      rice.castShadow = true;
      group.add(rice);

      return group;
    };

    const createLeaf = () => {
      const group = new THREE.Group();
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
      const stem = new THREE.Mesh(stemGeo, matBone);
      stem.position.y = -0.05;
      group.add(stem);

      const leafGeo = new THREE.BoxGeometry(0.15, 0.02, 0.28);
      const leafMesh = new THREE.Mesh(leafGeo, matLeaf);
      leafMesh.position.set(0, 0.05, 0.05);
      leafMesh.rotation.x = Math.PI / 6;
      leafMesh.castShadow = true;
      group.add(leafMesh);

      const leafMesh2 = leafMesh.clone();
      leafMesh2.position.set(0.05, 0.02, -0.05);
      leafMesh2.rotation.y = Math.PI / 2;
      leafMesh2.rotation.x = Math.PI / 8;
      group.add(leafMesh2);

      return group;
    };

    const createPackedBox = () => {
      const group = new THREE.Group();
      // Cardboard cube
      const boxGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const box = new THREE.Mesh(boxGeo, matBox);
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);

      // Green packing strap
      const strapGeo = new THREE.BoxGeometry(0.39, 0.39, 0.08);
      const strap = new THREE.Mesh(strapGeo, matStrap);
      group.add(strap);
      
      const strapGeo2 = new THREE.BoxGeometry(0.08, 0.39, 0.39);
      const strap2 = new THREE.Mesh(strapGeo2, matStrap);
      group.add(strap2);

      return group;
    };

    // Instantiate pipeline items
    for (let i = 0; i < itemCount; i++) {
      const itemGroup = new THREE.Group();
      
      // We attach both raw food types (only one visible at a time) and the box
      const rawTypes = [createChickenLeg(), createRiceBowl(), createLeaf()];
      const typeIndex = i % rawTypes.length;
      const rawMesh = rawTypes[typeIndex];
      rawMesh.name = "raw";
      itemGroup.add(rawMesh);

      const boxMesh = createPackedBox();
      boxMesh.name = "box";
      boxMesh.visible = false;
      itemGroup.add(boxMesh);

      // Stagger initial positions along local X
      // Belt spans from -3.5 to 3.5. Items step along this range.
      const initialX = -3.5 + (i * beltLength / itemCount);
      itemGroup.position.set(initialX, 0.45 + beltHeight, 0);
      
      conveyorAssembly.add(itemGroup);
      
      items.push({
        group: itemGroup,
        rawMesh,
        boxMesh,
        typeIndex,
        rawTypes
      });
    }

    // PARTICLE SYSTEM FOR TRANSFORMATION
    const particleCount = 10;
    const particles = [];
    const pGeo = new THREE.SphereGeometry(0.04, 8, 8);
    
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, matGlowGreen);
      p.visible = false;
      conveyorAssembly.add(p);
      particles.push({
        mesh: p,
        velocity: new THREE.Vector3(),
        life: 0
      });
    }

    const triggerPuff = (pos) => {
      let spawned = 0;
      particles.forEach(p => {
        if (!p.mesh.visible && spawned < 5) {
          p.mesh.position.copy(pos);
          p.mesh.position.y += 0.2; // Puff slightly above belt
          p.mesh.visible = true;
          p.life = 1.0;
          p.velocity.set(
            (Math.random() - 0.5) * 1.5,
            Math.random() * 2.0 + 0.5,
            (Math.random() - 0.5) * 1.5
          );
          spawned++;
        }
      });
    };

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    const speed = 0.8; // Units per second

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Slow conveyor rollers rotation
      rollers.forEach(roller => {
        roller.rotation.z += dt * 4.0;
      });

      // Update moving items
      items.forEach(item => {
        item.group.position.x += speed * dt;

        // Reset if it goes off the right end of the belt
        if (item.group.position.x > beltLength / 2 + 0.2) {
          item.group.position.x = -beltLength / 2 - 0.2;
          
          // Reset visibility & rotation
          item.rawMesh.visible = true;
          item.boxMesh.visible = false;
          item.group.rotation.set(0, 0, 0);
          item.group.scale.set(1, 1, 1);

          // Cycle through next raw food type
          item.group.remove(item.rawMesh);
          const nextIndex = (item.typeIndex + 1) % item.rawTypes.length;
          item.typeIndex = nextIndex;
          
          // Re-create raw type to ensure clean geometry/positions
          const newRaw = nextIndex === 0 ? createChickenLeg() : nextIndex === 1 ? createRiceBowl() : createLeaf();
          newRaw.name = "raw";
          item.rawMesh = newRaw;
          item.group.add(newRaw);
        }

        // Before entering center of machine (local X < -0.15)
        if (item.group.position.x < -0.15) {
          item.rawMesh.visible = true;
          item.boxMesh.visible = false;
          
          // Bob food waste slightly
          item.rawMesh.position.y = Math.sin(time * 6 + item.group.position.x * 5) * 0.03;
          item.rawMesh.rotation.y = time * 1.5;
        } 
        // Inside/After machine transformation (local X >= -0.15)
        else {
          if (item.rawMesh.visible) {
            // Trigger transformation event!
            item.rawMesh.visible = false;
            item.boxMesh.visible = true;
            triggerPuff(item.group.position);
            
            // Tiny hop scale animation
            item.group.scale.set(1.3, 1.3, 1.3);
          }
          
          // Smoothly decay hop scale back to normal
          item.group.scale.x = THREE.MathUtils.lerp(item.group.scale.x, 1, 10 * dt);
          item.group.scale.y = THREE.MathUtils.lerp(item.group.scale.y, 1, 10 * dt);
          item.group.scale.z = THREE.MathUtils.lerp(item.group.scale.z, 1, 10 * dt);

          // Slightly rotate box to look dynamic
          item.boxMesh.rotation.y = time * 0.5;
        }

        // Fade scale out at the very end of belt
        const rightThreshold = beltLength / 2 - 0.5;
        if (item.group.position.x > rightThreshold) {
          const fadeProgress = (item.group.position.x - rightThreshold) / 0.7;
          const scale = Math.max(0, 1 - fadeProgress);
          item.group.scale.set(scale, scale, scale);
        }
      });

      // Update Particles
      particles.forEach(p => {
        if (p.mesh.visible) {
          p.life -= dt * 1.8; // decays in ~0.5s
          if (p.life <= 0) {
            p.mesh.visible = false;
          } else {
            p.mesh.position.addScaledVector(p.velocity, dt);
            // Gravity
            p.velocity.y -= 9.8 * 0.2 * dt;
            p.mesh.scale.setScalar(p.life);
          }
        }
      });

      // Slowly pulse neon light on machine
      bulb.material.color.setHSL(0.38, 0.7, 0.4 + Math.sin(time * 8) * 0.15);

      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Dispose Geometries and Materials
      [
        matMetal, matDarkMetal, matMachineBody, matCanopy, matGlowGreen,
        matBone, matMeat, matRiceBowl, matRice, matLeaf, matBox, matStrap
      ].forEach(m => m.dispose());
      
      beltGeo.dispose();
      railGeo.dispose();
      rollerGeo.dispose();
      legGeo.dispose();
      bodyGeo.dispose();
      tunnelGeo.dispose();
      canopyGeo.dispose();
      bulbSupportGeo.dispose();
      bulbGeo.dispose();
      pGeo.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full relative z-10" />;
}
