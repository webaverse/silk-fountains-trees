import * as THREE from 'three';
import SilkShader from './shaders/SilkShader.js';
import DebugShader from './shaders/DebugShader.js';
import metaversefile from 'metaversefile';

const {useApp, useFrame, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1'); 


export default () => {  

    const app = useApp();
    const physics = usePhysics();
    const physicsIds = [];
    

    //console.log( 'texture path: ' + baseUrl + "textures/silk/silk-contrast-noise.png" );
    //console.log( 'SilkShader = ' + SilkShader.vertexShader )

    const createShaderMaterial = () => {

        let testSilkTexture = new THREE.TextureLoader().load( baseUrl + "textures/silk/silk-contrast-noise.png" );
        testSilkTexture.wrapS = testSilkTexture.wrapT = THREE.RepeatWrapping;

        SilkShader.uniforms.noiseImage.value = testSilkTexture;

        const silkShaderMat = new THREE.ShaderMaterial({
            uniforms: SilkShader.uniforms,
            vertexShader: SilkShader.vertexShader,
            fragmentShader: SilkShader.fragmentShader,
            side: THREE.DoubleSide,
        })

        return silkShaderMat;

        /* let debugMat = new THREE.ShaderMaterial( {
            vertexShader: DebugShader.vertexShader,
            fragmentShader: DebugShader.fragmentShader,
            side: THREE.DoubleSide
        });

        return debugMat; */

    }

    const silkShaderMaterial = createShaderMaterial();

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            //const loader = new GLTFLoader();
            const { gltfLoader } = useLoaders();
            const { dracoLoader } = useLoaders();
            //dracoLoader.setDecoderPath( baseUrl + "draco-decoder/" );
            gltfLoader.setDRACOLoader( dracoLoader );
    
            gltfLoader.load( params.filePath + params.fileName, function( gltf ) {
    
                let numVerts = 0;
    
                gltf.scene.traverse( function ( child ) {

                    const physicsId = physics.addGeometry( child );
                    physicsIds.push( physicsId );
    
                    if ( child.isMesh ) {
    
                        numVerts += child.geometry.index.count / 3;  
    
                        if( child.name == 'Silk-low' ){
                            child.material = silkShaderMaterial;
                            // console.log( 'material is ' + child.name, silkShaderMaterial.uniforms );
                            // child.material = silkShaderMaterial;
                            // child.material.side = THREE.DoubleSide;

                            //child.castShadow = true;
                            //child.receiveShadow = true;
    
                        } else {
                            /* console.log( 'material is ' + child.name, silkShaderMaterial.uniforms );
                            child.material = silkShaderMaterial;
                            child.material.side = THREE.DoubleSide; */

                            //child.material.side = THREE.DoubleSide;
                            child.castShadow = true;
                            child.receiveShadow = true;
                            //child.material.roughness = 1;
                            //child.material.metalness = 0.0;
                            // add light scatter chunk
                        }

                        /* child.material = silkShaderMaterial;
                        child.material.side = THREE.BackSide; */
                    }
                });
    
                console.log( `Silk Fountain Trees modelLoaded() -> ${ params.fileName } num verts: ` + numVerts );
                console.log( 'POSITION PARAMS ', params.pos );
                //gltf.scene.position.set( params.pos.x, params.pos.y, params.pos.z  );

                resolve( gltf.scene );     
            });
        })
    }

    let p1 = loadModel( { 
        filePath: baseUrl,
        fileName: 'SilkFountain_1_Dream.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    let p2 = loadModel( { 
        filePath: baseUrl,
        fileName: 'SilkFountain_2_Dream.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    let p3 = loadModel( { 
        filePath: baseUrl,
        fileName: 'SilkFountain_3_Dream.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    let p4 = loadModel( { 
        filePath: baseUrl,
        fileName: 'SilkFountain_4_Dream.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    Promise.all( 
        [ p1, p2, p3, p4 ]
    ).then( 
        ( values ) => {
            values.forEach( model => {
                app.add( model )
                model.position.y = -400;
            })
        }
    )

    useFrame(( { timestamp } ) => {        

        if( silkShaderMaterial ) silkShaderMaterial.uniforms.time.value += 0.06;
    
    });

    useCleanup(() => {
      for (const physicsId of physicsIds) {
       physics.removeGeometry(physicsId);
      }
    });

    return app;
}