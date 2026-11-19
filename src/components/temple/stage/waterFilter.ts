import type { Filter } from "pixi.js";

type PixiModule = typeof import("pixi.js");

const VERTEX = `
in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  gl_Position = vec4(position, 0.0, 1.0);
  vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

const FRAGMENT = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uAmp;
void main(void) {
  float wave = sin(vTextureCoord.y * 90.0 + uTime * 1.3) * 0.6 + sin(vTextureCoord.y * 37.0 - uTime * 0.8) * 0.4;
  vec2 uv = vTextureCoord + vec2(wave * uAmp * (0.4 + vTextureCoord.y), 0.0);
  finalColor = texture(uTexture, uv);
}
`;

export interface WaterFilter {
  filter: Filter;
  setTime(seconds: number): void;
}

/** Reference sample for stage filters: a horizontal ripple that grows toward the viewer. */
export function createWaterFilter(pixi: PixiModule, amplitude = 0.004): WaterFilter {
  const filter = pixi.Filter.from({
    gl: { vertex: VERTEX, fragment: FRAGMENT },
    resources: {
      waterUniforms: {
        uTime: { value: 0, type: "f32" },
        uAmp: { value: amplitude, type: "f32" },
      },
    },
  });
  return {
    filter,
    setTime(seconds: number) {
      filter.resources.waterUniforms.uniforms.uTime = seconds;
    },
  };
}
