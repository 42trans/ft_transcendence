import * as THREE from "three";
import { Magma } from "./Magma";
import { Aura } from "./Aura";
import { InGlow } from "./InGlow";
import { FlareEmitter } from "./FlareEmitter";
import { SparkEmitter } from "./SparkEmitter";
import { OutGlow } from "./OutGlow";
import GUI from "lil-gui";

/**
 * マグマフレアクラスです。
 */
export class MagmaFlare extends THREE.Object3D {
  /** マグマ */
  private readonly _magma: Magma;
  /** オーラ球 */
  private readonly _aura: Aura;
  /** フレアエミッター */
  private readonly _flareEmitter: FlareEmitter;
  /** スパークエミッター */
  private readonly _sparkEmitter: SparkEmitter;

  /**
   * コンストラクター
   * @constructor
   */
  constructor() {
    super();

    // マグマ
    this._magma = new Magma();

    // オーラ
    this._aura = new Aura();

    // イングロー
    const inGlow = new InGlow();

    // フレア
    this._flareEmitter = new FlareEmitter();

    // スパーク
    this._sparkEmitter = new SparkEmitter();

    // アウトグロー
    const outGlow = new OutGlow();

    this.add(this._magma);
    this.add(this._aura);
    this.add(inGlow);
    this.add(this._flareEmitter);
    this.add(this._sparkEmitter);
    this.add(outGlow);

    const layers = {
      Magama: true,
      Aura: true,
      Flare: true,
      Spark: false,
      "Glow Inside": false,
      "Glow Outside": false,
      // Spark: true,
      // "Glow Inside": true,
      // "Glow Outside": true,
    };

    const gui = new GUI();
    // Add checkboxes to GUI and set their initial state
    const checkboxes: { [key: string]: boolean } = {};
    Object.keys(layers).forEach((layer) => {
      checkboxes[layer] = layers[layer];
      gui.add(checkboxes, layer);
    });

    // Function to update object visibility based on checkbox states
    const updateObjectVisibility = () => {
      this._magma.visible = checkboxes["Magama"];
      this._aura.visible = checkboxes["Aura"];
      this._flareEmitter.visible = checkboxes["Flare"];
      this._sparkEmitter.visible = checkboxes["Spark"];
      outGlow.visible = checkboxes["Glow Outside"];
      inGlow.visible = checkboxes["Glow Inside"];
    };

    // Call the update function initially
    updateObjectVisibility();

    // Event listener for checkbox changes
    gui.onChange(() => {
      updateObjectVisibility();
    });
    // Object.values(layers).forEach((layer, index) => {
    //   gui.add(layers, Object.keys(layers)[index]);
    // });
    // gui.onChange((event) => {
    //   this._magma.visible = layers["Magama"];
    //   this._aura.visible = layers["Aura"];
    //   this._flareEmitter.visible = layers["Flare"];
    //   this._sparkEmitter.visible = layers["Spark"];
    //   outGlow.visible = layers["Glow Outside"];
    //   inGlow.visible = layers["Glow Inside"];
    // });
    gui.close();
  }

  /**
   * フレーム毎の更新
   */
  public update() {
    this._magma.update();
    this._aura.update();
    this._flareEmitter.update();
    this._sparkEmitter.update();
  }
}
