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
    }

    const silkShaderMaterial = createShaderMaterial();

    const pointLight = new THREE.PointLight( 0x00deff, 50, 100 );

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            //const loader = new GLTFLoader();
            const { gltfLoader } = useLoaders();
            const { dracoLoader } = useLoaders();

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
    
                        } else {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }

                        
                    }
                });
    
                //console.log( `Silk Fountain Trees modelLoaded() -> ${ params.fileName } num verts: ` + numVerts );
               

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
        fileName: 'SilkFountain_5_Dream.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    Promise.all( 
        [ p1, p2, p3, p4 ]
    ).then( 
        ( values ) => {
            values.forEach( model => {
                app.add( model ) 

                
                //model.position.y = -400;
            })

            addLights();
        }
    )

    const addLights = () => {

        let positions = [
            { x: -26, y: 36, z: -43 },
            { x: 5, y: 28, z: -6 },
            { x: -25, y: 21, z: 19 },
            { x: -54, y: 31, z: -19 },
        ];

        for( let i = 0; i < positions.length; i++ ){
            let pLight = pointLight.clone();
            app.add( pLight );
            pLight.position.set( positions[ i ].x, positions[ i ].y, positions[ i ].z );
            pLight.updateMatrixWorld();
        }
    }

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