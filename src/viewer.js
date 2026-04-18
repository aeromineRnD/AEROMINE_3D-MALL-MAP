import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader }      from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }     from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader }      from 'three/addons/loaders/KTX2Loader.js';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer }   from 'three/addons/renderers/CSS2DRenderer.js';

export const MODEL_URL_P1 = '/models/mallFinal.gltf';
export const MODEL_URL_P2 = '/models/New_model/new_mall.gltf';

export class Viewer {
  constructor(container) {
    this.container = container;
    this.scene     = null;
    this.camera    = null;
    this.renderer  = null;
    this.css2d     = null;
    this.controls  = null;
    this.content   = null;   // GLTF scene root, set after load()

    this._init();
    this._addLights();
    this._setupResize();
    this._animate();
  }

  // -------------------------------------------------------------------------
  // Setup
  // -------------------------------------------------------------------------

  _init() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new Scene();
    this.scene.background = new Color('#f0f2f5');

    this.camera = new PerspectiveCamera(60, w / h, 0.01, 1000);

    // WebGL renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);

    // CSS2DRenderer — overlaid exactly on top of the canvas.
    // pointer-events: none so OrbitControls on the canvas below still works.
    // Individual .shop-tag elements override this to pointer-events: auto.
    this.css2d = new CSS2DRenderer();
    this.css2d.setSize(w, h);
    this.css2d.domElement.style.position     = 'absolute';
    this.css2d.domElement.style.top          = '0';
    this.css2d.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.css2d.domElement);

    // OrbitControls attach to the WebGL canvas, NOT the CSS2D overlay
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.screenSpacePanning = true;
    this.controls.enableDamping      = true;
    this.controls.dampingFactor      = 0.05;

    // Neutral environment lighting
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;
    pmrem.dispose();
  }

  _addLights() {
    // Lights travel with the camera for consistent shading as user orbits
    const ambient     = new AmbientLight('#ffffff', 0.3);
    const directional = new DirectionalLight('#ffffff', 0.8 * Math.PI);
    directional.position.set(0.5, 0, 0.866);

    this.camera.add(ambient);
    this.camera.add(directional);
    this.scene.add(this.camera);
  }

  // -------------------------------------------------------------------------
  // Render loop
  // -------------------------------------------------------------------------

  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this._render();
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
    // CSS2DRenderer repositions every tag element each frame by projecting
    // its 3D world position into screen space. Must run after WebGL render.
    this.css2d.render(this.scene, this.camera);
  }

  // -------------------------------------------------------------------------
  // Resize
  // -------------------------------------------------------------------------

  _setupResize() {
    window.addEventListener('resize', () => this._resize(), false);
  }

  _resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Both renderers must be resized together to stay in sync
    this.renderer.setSize(w, h);
    this.css2d.setSize(w, h);
  }

  // -------------------------------------------------------------------------
  // Model loading
  // -------------------------------------------------------------------------

  clearContent() {
    if (this.content) {
      this.scene.remove(this.content);
      this.content = null;
    }
  }

  async load(url = MODEL_URL_P1) {
    const loader = new GLTFLoader();

    const draco = new DRACOLoader();
    draco.setDecoderPath(
      `https://unpkg.com/three@0.176.0/examples/jsm/libs/draco/gltf/`
    );
    loader.setDRACOLoader(draco);

    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath(
      `https://unpkg.com/three@0.176.0/examples/jsm/libs/basis/`
    ).detectSupport(this.renderer);
    loader.setKTX2Loader(ktx2);

    const gltf = await loader.loadAsync(url);
    const root = gltf.scene ?? gltf.scenes[0];

    if (!root) throw new Error('[3D Mall] No scene found in GLTF');

    this._fitCamera(root);
    this.scene.add(root);
    this.content = root;

    return root;
  }

  // -------------------------------------------------------------------------
  // Camera fit — centers model and positions camera for a good overview
  // -------------------------------------------------------------------------

  _fitCamera(object) {
    object.updateMatrixWorld();

    const box    = new Box3().setFromObject(object);
    const size   = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    this.controls.reset();

    // Re-center the model at origin (same pattern as the viewer app)
    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    this.controls.maxDistance = size * 10;
    this.camera.near = size / 100;
    this.camera.far  = size * 100;
    this.camera.updateProjectionMatrix();

    // Isometric-ish view from top-front-right
    this.camera.position.set(
      size * 0.6,
      size * 0.5,
      size * 0.6
    );
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.controls.saveState();
  }
}
