(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,92206,89698,e=>{"use strict";var t=e.i(85830);let r=(e,t,r=!1)=>(Array.isArray(e)||(e=[e]),t)?e.map(e=>"string"==typeof e||r?t(e):e):e;e.s(["f",0,r],89698);let i=new class{constructor(){this._parsers=[],this._cache=new Map,this._cacheMap=new Map}reset(){this._cacheMap.clear(),this._cache.clear()}has(e){return this._cache.has(e)}get(e){let r=this._cache.get(e);return r||(0,t.f)(`[Assets] Asset id ${e} was not found in the Cache`),r}set(e,i){let a,n=r(e);for(let e=0;e<this.parsers.length;e++){let t=this.parsers[e];if(t.test(i)){a=t.getCacheableAssets(n,i);break}}let s=new Map(Object.entries(a||{}));a||n.forEach(e=>{s.set(e,i)});let o=[...s.keys()],l={cacheKeys:o,keys:n};n.forEach(e=>{this._cacheMap.set(e,l)}),o.forEach(e=>{let r=a?a[e]:i;this._cache.has(e)&&this._cache.get(e)!==r&&(0,t.f)("[Cache] already has key:",e),this._cache.set(e,s.get(e))})}remove(e){if(!this._cacheMap.has(e))return void(0,t.f)(`[Assets] Asset id ${e} was not found in the Cache`);let r=this._cacheMap.get(e);r.cacheKeys.forEach(e=>{this._cache.delete(e)}),r.keys.forEach(e=>{this._cacheMap.delete(e)})}get parsers(){return this._parsers}};e.s(["f",0,i],92206)},68750,e=>{"use strict";var t=e.i(94359),r=e.i(31320);let i={};e.s(["f",0,function(e,a,n){let s=0x811c9dc5;for(let t=0;t<a;t++)s^=e[t].uid,s=Math.imul(s,0x1000193)>>>0;return i[s]||function(e,a,n,s){let o={},l=0;for(let t=0;t<s;t++){let i=t<a?e[t]:r.f.EMPTY.source;o[l++]=i.source,o[l++]=i.style}let u=new t.f(o);return i[n]=u,u}(e,a,s,n)}])},87323,18102,96108,60728,28028,94433,40940,45284,e=>{"use strict";var t,r=e.i(24314),i=e.i(37024),a=e.i(49864),n=e.i(48446);function s(e,t,r,i){if(r??(r=0),i??(i=Math.min(e.byteLength-r,t.byteLength)),7&r||7&i)if(3&r||3&i)new Uint8Array(t).set(new Uint8Array(e,r,i));else{let a=i/4;new Float32Array(t,0,a).set(new Float32Array(e,r,a))}else{let a=i/8;new Float64Array(t,0,a).set(new Float64Array(e,r,a))}}e.s(["f",0,s],18102);let o={normal:"normal-npm",add:"add-npm",screen:"screen-npm"};var l=((t=l||{})[t.DISABLED=0]="DISABLED",t[t.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",t[t.MASK_ACTIVE=2]="MASK_ACTIVE",t[t.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",t[t.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",t[t.NONE=5]="NONE",t);function u(e,t){return"no-premultiply-alpha"===t.alphaMode&&o[e]||e}e.s(["q",0,o,"U",0,l],96108),e.s(["f",0,u],60728);var h=e.i(29281);function f(e,t){if(0===e)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let r=t.createShader(t.FRAGMENT_SHADER);try{for(;;){let i="precision mediump float;\nvoid main(void){\nfloat test = 0.1;\n%forloop%\ngl_FragColor = vec4(0.0);\n}".replace(/%forloop%/gi,function(e){let t="";for(let r=0;r<e;++r)r>0&&(t+="\nelse "),r<e-1&&(t+=`if(test == ${r}.0){}`);return t}(e));if(t.shaderSource(r,i),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS))break;e=e/2|0}}finally{t.deleteShader(r)}return e}e.s(["f",0,f],28028);let c=null;function d(){if(c)return c;let e=(0,h.f)();return c=f(c=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),e),e.getExtension("WEBGL_lose_context")?.loseContext(),c}e.s(["f",0,d],94433);class m{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let e=0;e<this.count;e++){let t=this.textures[e];this.textures[e]=null,this.ids[t.uid]=null}this.count=0}}e.s(["f",0,m],40940);class x{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new m,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}}let p=[],v=0;function g(){return v>0?p[--v]:new x}function b(e){e.elements=null,p[v++]=e}n.f.register({clear:()=>{if(p.length>0)for(let e of p)e&&e.destroy();p.length=0,v=0}});let _=0,S=class e{constructor(t){this.uid=(0,r.e)("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],(t={...e.defaultOptions,...t}).maxTextures||((0,a.K)("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),t.maxTextures=d());let{maxTextures:n,attributesInitialSize:s,indicesInitialSize:o}=t;this.attributeBuffer=new i.f(4*s),this.indexBuffer=new Uint16Array(o),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let e=0;e<this.batchIndex;e++)b(this.batches[e]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(e){this._elements[this.elementSize++]=e,e._indexStart=this.indexSize,e._attributeStart=this.attributeSize,e._batcher=this,this.indexSize+=e.indexSize,this.attributeSize+=e.attributeSize*this.vertexSize}checkAndUpdateTexture(e,t){let r=e._batch.textures.ids[t._source.uid];return(!!r||0===r)&&(e._textureId=r,e.texture=t,!0)}updateElement(e){this.dirty=!0;let t=this.attributeBuffer;e.packAsQuad?this.packQuadAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId):this.packAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId)}break(e){let t=this._elements;if(!t[this.elementStart])return;let r=g(),i=r.textures;i.clear();let a=t[this.elementStart],n=u(a.blendMode,a.texture._source),s=a.topology;4*this.attributeSize>this.attributeBuffer.size&&this._resizeAttributeBuffer(4*this.attributeSize),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let o=this.attributeBuffer.float32View,l=this.attributeBuffer.uint32View,h=this.indexBuffer,f=this._batchIndexSize,c=this._batchIndexStart,d="startBatch",m=[],x=this.maxTextures;for(let a=this.elementStart;a<this.elementSize;++a){let p=t[a];t[a]=null;let v=p.texture._source,b=u(p.blendMode,v),S=n!==b||s!==p.topology;if(v._batchTick===_&&!S){p._textureId=v._textureBindLocation,f+=p.indexSize,p.packAsQuad?(this.packQuadAttributes(p,o,l,p._attributeStart,p._textureId),this.packQuadIndex(h,p._indexStart,p._attributeStart/this.vertexSize)):(this.packAttributes(p,o,l,p._attributeStart,p._textureId),this.packIndex(p,h,p._indexStart,p._attributeStart/this.vertexSize)),p._batch=r,m.push(p);continue}(i.count>=x||S)&&(this._finishBatch(r,c,f-c,i,n,s,e,d,m),d="renderBatch",c=f,n=b,s=p.topology,(i=(r=g()).textures).clear(),m=[],++_),v._batchTick=_,p._textureId=v._textureBindLocation=i.count,i.ids[v.uid]=i.count,i.textures[i.count++]=v,p._batch=r,m.push(p),f+=p.indexSize,p.packAsQuad?(this.packQuadAttributes(p,o,l,p._attributeStart,p._textureId),this.packQuadIndex(h,p._indexStart,p._attributeStart/this.vertexSize)):(this.packAttributes(p,o,l,p._attributeStart,p._textureId),this.packIndex(p,h,p._indexStart,p._attributeStart/this.vertexSize))}i.count>0&&(this._finishBatch(r,c,f-c,i,n,s,e,d,m),c=f,++_),this.elementStart=this.elementSize,this._batchIndexStart=c,this._batchIndexSize=f}_finishBatch(e,t,r,i,a,n,s,o,l){e.gpuBindGroup=null,e.bindGroup=null,e.action=o,e.batcher=this,e.textures=i,e.blendMode=a,e.topology=n,e.start=t,e.size=r,e.elements=l,++_,this.batches[this.batchIndex++]=e,s.add(e)}finish(e){this.break(e)}ensureAttributeBuffer(e){4*e<=this.attributeBuffer.size||this._resizeAttributeBuffer(4*e)}ensureIndexBuffer(e){e<=this.indexBuffer.length||this._resizeIndexBuffer(e)}_resizeAttributeBuffer(e){let t=Math.max(e,2*this.attributeBuffer.size),r=new i.f(t);s(this.attributeBuffer.rawBinaryData,r.rawBinaryData),this.attributeBuffer=r}_resizeIndexBuffer(e){let t=this.indexBuffer,r=Math.max(e,1.5*t.length);r+=r%2;let i=r>65535?new Uint32Array(r):new Uint16Array(r);if(i.BYTES_PER_ELEMENT!==t.BYTES_PER_ELEMENT)for(let e=0;e<t.length;e++)i[e]=t[e];else s(t.buffer,i.buffer);this.indexBuffer=i}packQuadIndex(e,t,r){e[t]=r+0,e[t+1]=r+1,e[t+2]=r+2,e[t+3]=r+0,e[t+4]=r+2,e[t+5]=r+3}packIndex(e,t,r,i){let a=e.indices,n=e.indexSize,s=e.indexOffset,o=e.attributeOffset;for(let e=0;e<n;e++)t[r++]=i+a[e+s]-o}destroy(e={}){if(null!==this.batches){for(let e=0;e<this.batchIndex;e++)b(this.batches[e]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,e.shader&&(this.shader?.destroy(),this.shader=null);for(let e=0;e<this._elements.length;e++)this._elements[e]&&(this._elements[e]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};S.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6},e.s(["H",0,x,"x",0,S],87323);var y=e.i(85465),I=e.i(64957),M=e.i(60406);let C=new Float32Array(1),T=new Uint32Array(1);class w extends M.f{constructor(){let e=new y.f({data:C,label:"attribute-batch-buffer",usage:I.f.VERTEX|I.f.COPY_DST,shrinkToFit:!1});super({attributes:{aPosition:{buffer:e,format:"float32x2",stride:24,offset:0},aUV:{buffer:e,format:"float32x2",stride:24,offset:8},aColor:{buffer:e,format:"unorm8x4",stride:24,offset:16},aTextureIdAndRound:{buffer:e,format:"uint16x2",stride:24,offset:20}},indexBuffer:new y.f({data:T,label:"index-batch-buffer",usage:I.f.INDEX|I.f.COPY_DST,shrinkToFit:!1})})}}e.s(["f",0,w],45284)},97828,75392,33219,e=>{"use strict";var t=e.i(47760),r=e.i(87323),i=e.i(45284),a=e.i(81491),n=e.i(68372),s=e.i(94111),o=e.i(55443),l=e.i(77953),u=e.i(65654);class h extends u.f{constructor(e){super({glProgram:(0,a.L)({name:"batch",bits:[n.z,(0,s.k)(e),o.a]}),gpuProgram:(0,a.M)({name:"batch",bits:[n.O,(0,s.u)(e),o.Z]}),resources:{batchSamplers:(0,l.f)(e)}}),this.maxTextures=e}}e.s(["f",0,h],75392);let f=null,c=class e extends r.x{constructor(t){super(t),this.geometry=new i.f,this.name=e.extension.name,this.vertexSize=6,f??(f=new h(t.maxTextures)),this.shader=f}packAttributes(e,t,r,i,a){let n=a<<16|65535&e.roundPixels,s=e.transform,o=s.a,l=s.b,u=s.c,h=s.d,f=s.tx,c=s.ty,{positions:d,uvs:m}=e,x=e.color,p=e.attributeOffset,v=p+e.attributeSize;for(let e=p;e<v;e++){let a=2*e,s=d[a],p=d[a+1];t[i++]=o*s+u*p+f,t[i++]=h*p+l*s+c,t[i++]=m[a],t[i++]=m[a+1],r[i++]=x,r[i++]=n}}packQuadAttributes(e,t,r,i,a){let n=e.texture,s=e.transform,o=s.a,l=s.b,u=s.c,h=s.d,f=s.tx,c=s.ty,d=e.bounds,m=d.maxX,x=d.minX,p=d.maxY,v=d.minY,g=n.uvs,b=e.color,_=a<<16|65535&e.roundPixels;t[i+0]=o*x+u*v+f,t[i+1]=h*v+l*x+c,t[i+2]=g.x0,t[i+3]=g.y0,r[i+4]=b,r[i+5]=_,t[i+6]=o*m+u*v+f,t[i+7]=h*v+l*m+c,t[i+8]=g.x1,t[i+9]=g.y1,r[i+10]=b,r[i+11]=_,t[i+12]=o*m+u*p+f,t[i+13]=h*p+l*m+c,t[i+14]=g.x2,t[i+15]=g.y2,r[i+16]=b,r[i+17]=_,t[i+18]=o*x+u*p+f,t[i+19]=h*p+l*x+c,t[i+20]=g.x3,t[i+21]=g.y3,r[i+22]=b,r[i+23]=_}_updateMaxTextures(e){this.shader.maxTextures!==e&&(f=new h(e),this.shader=f)}destroy(){this.shader=null,super.destroy()}};c.extension={type:[t.x.Batcher],name:"default"},e.s(["f",0,c],97828),e.s(["f",0,class{constructor(e){this.items=Object.create(null);let{renderer:t,type:r,onUnload:i,priority:a,name:n}=e;this._renderer=t,t.gc.addResourceHash(this,"items",r,a??0),this._onUnload=i,this.name=n}add(e){return!this.items[e.uid]&&(this.items[e.uid]=e,e.once("unload",this.remove,this),e._gcLastUsed=this._renderer.gc.now,!0)}remove(e,...t){if(!this.items[e.uid])return;let r=e._gpuData[this._renderer.uid];r&&(this._onUnload?.(e,...t),e.off("unload",this.remove,this),r.destroy(),e._gpuData[this._renderer.uid]=null,this.items[e.uid]=null)}removeAll(...e){Object.values(this.items).forEach(t=>t&&this.remove(t,...e))}destroy(...e){this.removeAll(...e),this.items=Object.create(null),this._renderer=null,this._onUnload=null}}],33219)},81491,94571,19273,49008,38939,58313,41183,83438,1560,68372,94111,55443,e=>{"use strict";var t=e.i(81107),r=e.i(27076),i=e.i(85830);function a(e,t,r){if(e)for(let a in e){let n=t[a.toLocaleLowerCase()];if(n){let t=e[a];"header"===a&&(t=t.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),r&&n.push(`//----${r}----//`),n.push(t)}else(0,i.f)(`${a} placement hook does not exist in shader`)}}e.s(["f",0,a],94571);let n=/\{\{(.*?)\}\}/g;function s(e){let t={};return(e.match(n)?.map(e=>e.replace(/[{()}]/g,""))??[]).forEach(e=>{t[e]=[]}),t}function o(e,t){let r,i=/@in\s+([^;]+);/g;for(;null!==(r=i.exec(e));)t.push(r[1])}function l(e,t,r=!1){let i=[];o(t,i),e.forEach(e=>{e.header&&o(e.header,i)}),r&&i.sort();let a=i.map((e,t)=>`       @location(${t}) ${e},`).join("\n"),n=t.replace(/@in\s+[^;]+;\s*/g,"");return n.replace("{{in}}",`
${a}
`)}function u(e,t){let r,i=/@out\s+([^;]+);/g;for(;null!==(r=i.exec(e));)t.push(r[1])}function h(e,t){let r=[];u(t,r),e.forEach(e=>{e.header&&u(e.header,r)});let i=0,a=r.sort().map(e=>e.indexOf("builtin")>-1?e:`@location(${i++}) ${e}`).join(",\n"),n=r.sort().map(e=>`       var ${e.replace(/@.*?\s+/g,"")};`).join("\n"),s=`return VSOutput(
            ${r.sort().map(e=>{let t;return` ${(t=/\b(\w+)\s*:/g.exec(e))?t[1]:""}`}).join(",\n")});`,o=t.replace(/@out\s+[^;]+;\s*/g,"");return(o=(o=o.replace("{{struct}}",`
${a}
`)).replace("{{start}}",`
${n}
`)).replace("{{return}}",`
${s}
`)}function f(e,t){let r=e;for(let e in t){let i=t[e];r=i.join("\n").length?r.replace(`{{${e}}}`,`//-----${e} START-----//
${i.join("\n")}
//----${e} FINISH----//`):r.replace(`{{${e}}}`,"")}return r}e.s(["f",0,s],19273),e.s(["f",0,l],49008),e.s(["f",0,h],38939),e.s(["f",0,f],58313);let c=Object.create(null),d=new Map,m=0;function x({template:e,bits:t}){var r,i;let a,n,s,o=v(e,t);if(c[o])return c[o];let{vertex:u,fragment:f}=(r=e,a=(i=t).map(e=>e.vertex).filter(e=>!!e),n=i.map(e=>e.fragment).filter(e=>!!e),s=l(a,r.vertex,!0),{vertex:s=h(a,s),fragment:l(n,r.fragment,!0)});return c[o]=g(u,f,t),c[o]}function p({template:e,bits:t}){let r=v(e,t);return c[r]||(c[r]=g(e.vertex,e.fragment,t)),c[r]}function v(e,t){return t.map(e=>(d.has(e)||d.set(e,m++),d.get(e))).sort((e,t)=>e-t).join("-")+e.vertex+e.fragment}function g(e,t,r){let i=s(e),n=s(t);return r.forEach(e=>{a(e.vertex,i,e.name),a(e.fragment,n,e.name)}),{vertex:f(e,i),fragment:f(t,n)}}e.s(["Y",0,x,"i",0,p],41183);let b=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,_=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,S=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,y=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`;e.s(["v",0,_,"f",0,y,"L",0,b,"y",0,S],83438);let I={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},M={name:"global-uniforms-ubo-bit",vertex:{header:`
          uniform globalUniforms {
            mat3 uProjectionMatrix;
            mat3 uWorldTransformMatrix;
            vec4 uWorldColorAlpha;
            vec2 uResolution;
          };
        `}},C={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};e.s(["I",0,I,"t",0,C,"x",0,M],1560),e.s(["L",0,function({bits:e,name:r}){return new t.f({name:r,...p({template:{vertex:S,fragment:y},bits:[C,...e]})})},"M",0,function({bits:e,name:t}){let i=x({template:{fragment:_,vertex:b},bits:[I,...e]});return r.f.from({name:t,vertex:{source:i.vertex,entryPoint:"main"},fragment:{source:i.fragment,entryPoint:"main"}})}],81491);let T={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},w={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}};e.s(["O",0,T,"z",0,w],68372);let A={},U={};e.s(["u",0,function(e){return A[e]||(A[e]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${function(e){let t=[];if(1===e)t.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),t.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let r=0;for(let i=0;i<e;i++)t.push(`@group(1) @binding(${r++}) var textureSource${i+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${r++}) var textureSampler${i+1}: sampler;`)}return t.join("\n")}(e)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${function(e){let t=[];if(1===e)t.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{t.push("switch vTextureId {");for(let r=0;r<e;r++)r===e-1?t.push("  default:{"):t.push(`  case ${r}:{`),t.push(`      outColor = textureSampleGrad(textureSource${r+1}, textureSampler${r+1}, vUV, uvDx, uvDy);`),t.push("      break;}");t.push("}")}return t.join("\n")}(e)}
            `}}),A[e]},"k",0,function(e){return U[e]||(U[e]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${e}];

            `,main:`

                ${function(e){let t=[];for(let r=0;r<e;r++)r>0&&t.push("else"),r<e-1&&t.push(`if(vTextureId < ${r}.5)`),t.push("{"),t.push(`	outColor = texture(uTextures[${r}], vUV);`),t.push("}");return t.join("\n")}(e)}
            `}}),U[e]}],94111);let E={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},B={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};e.s(["Z",0,E,"a",0,B],55443)},35066,90532,35656,39391,87567,e=>{"use strict";let t={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},r={...t,vertex:{...t.vertex,header:t.vertex.header.replace("group(1)","group(2)")}},i={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}};e.s(["q",0,t,"Y",0,i,"M",0,r],35066);let a={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},n={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};e.s(["S",0,a,"X",0,n],90532);var s=e.i(85830),o=e.i(46820);e.s(["f",0,function(e,t){for(let r in e.attributes){let i=e.attributes[r],a=t[r];a?(i.format??(i.format=a.format),i.offset??(i.offset=a.offset),i.instance??(i.instance=a.instance)):i.format||(0,s.f)(`Attribute ${r} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}!function(e){let{buffers:t,attributes:r}=e,i={},a={};for(let e in t){let r=t[e];i[r.uid]=0,a[r.uid]=0}for(let e in r){let t=r[e];i[t.buffer.uid]+=(0,o.f)(t.format).stride}for(let e in r){let t=r[e];t.stride??(t.stride=i[t.buffer.uid]),t.start??(t.start=a[t.buffer.uid]),a[t.buffer.uid]+=(0,o.f)(t.format).stride}}(e)}],35656);var l=e.i(96108);let u=[];u[l.U.NONE]=void 0,u[l.U.DISABLED]={stencilWriteMask:0,stencilReadMask:0},u[l.U.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}},u[l.U.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}},u[l.U.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}},u[l.U.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}},e.s(["f",0,u],39391),e.s(["f",0,function(e,t,r,i,a){if((e=Math.max(0,e))>=(t=Math.min(t,r*i)))return 0;let n=Math.floor(e/r),s=e-n*r,o=Math.floor(t/r),l=t-o*r;if(n===o)return a[0].set(s,n,l-s,1),1;let u=0,h=n;return s>0&&(a[u++].set(s,n,r-s,1),h++),o>h&&a[u++].set(0,h,r,o-h),l>0&&a[u++].set(0,o,l,1),u}],87567)},61805,77718,e=>{"use strict";let t;var r=e.i(57471),i=e.i(27402),a=e.i(56881);function n(e){let t=i.f.get().createCanvas(6,1),r=t.getContext("2d");return r.fillStyle=e,r.fillRect(0,0,6,1),t}function s(){if(void 0!==t)return t;try{let e=n("#ff00ff"),r=n("#ffff00"),a=i.f.get().createCanvas(6,1).getContext("2d");a.globalCompositeOperation="multiply",a.drawImage(e,0,0),a.drawImage(r,2,0);let s=a.getImageData(2,0,1,1);if(s){let e=s.data;t=255===e[0]&&0===e[1]&&0===e[2]}else t=!1}catch(e){t=!1}return t}e.s(["f",0,s],77718);let o={canvas:null,convertTintToImage:!1,cacheStepsPerColorChannel:8,_canUseMultiply:void 0,get canUseMultiply(){return this._canUseMultiply??(this._canUseMultiply=s())},set canUseMultiply(e){this._canUseMultiply=e},_tintMethod:null,get tintMethod(){return this._tintMethod??(this._tintMethod=this.canUseMultiply?this.tintWithMultiply:this.tintWithPerPixel)},set tintMethod(e){this._tintMethod=e},_canvasSourceCache:new WeakMap,_unpremultipliedCache:new WeakMap,getCanvasSource:e=>{let t=e.source,r=t?.resource;if(!r)return null;let a="premultiplied-alpha"===t.alphaMode,n=t.resourceWidth??t.pixelWidth,s=t.resourceHeight??t.pixelHeight,l=n!==t.pixelWidth||s!==t.pixelHeight;if(a){if((r instanceof HTMLCanvasElement||"u">typeof OffscreenCanvas&&r instanceof OffscreenCanvas)&&!l)return r;let e=o._unpremultipliedCache.get(t);if(e?.resourceId===t._resourceId)return e.canvas}if(r instanceof Uint8Array||r instanceof Uint8ClampedArray||r instanceof Int8Array||r instanceof Uint16Array||r instanceof Int16Array||r instanceof Uint32Array||r instanceof Int32Array||r instanceof Float32Array||r instanceof ArrayBuffer){let e=o._canvasSourceCache.get(t);if(e?.resourceId===t._resourceId)return e.canvas;let a=i.f.get().createCanvas(t.pixelWidth,t.pixelHeight),n=a.getContext("2d"),s=n.createImageData(t.pixelWidth,t.pixelHeight),l=s.data,u=r instanceof ArrayBuffer?new Uint8Array(r):new Uint8Array(r.buffer,r.byteOffset,r.byteLength);if("bgra8unorm"===t.format)for(let e=0;e<l.length&&e+3<u.length;e+=4)l[e]=u[e+2],l[e+1]=u[e+1],l[e+2]=u[e],l[e+3]=u[e+3];else l.set(u.subarray(0,l.length));return n.putImageData(s,0,0),o._canvasSourceCache.set(t,{canvas:a,resourceId:t._resourceId}),a}if(a){let e=i.f.get().createCanvas(t.pixelWidth,t.pixelHeight),a=e.getContext("2d",{willReadFrequently:!0});e.width=t.pixelWidth,e.height=t.pixelHeight,a.drawImage(r,0,0);let n=a.getImageData(0,0,e.width,e.height),s=n.data;for(let e=0;e<s.length;e+=4){let t=s[e+3];if(t>0){let r=255/t;s[e]=Math.min(255,s[e]*r+.5),s[e+1]=Math.min(255,s[e+1]*r+.5),s[e+2]=Math.min(255,s[e+2]*r+.5)}}return a.putImageData(n,0,0),o._unpremultipliedCache.set(t,{canvas:e,resourceId:t._resourceId}),e}if(l){let e=o._canvasSourceCache.get(t);if(e?.resourceId===t._resourceId)return e.canvas;let a=i.f.get().createCanvas(t.pixelWidth,t.pixelHeight),n=a.getContext("2d");return a.width=t.pixelWidth,a.height=t.pixelHeight,n.drawImage(r,0,0),o._canvasSourceCache.set(t,{canvas:a,resourceId:t._resourceId}),a}return r},getTintedCanvas:(e,t)=>{let a=e.texture,n=r.f.shared.setValue(t).toHex(),s=a.tintCache||(a.tintCache={}),l=s[n],u=a.source._resourceId;if(l?.tintId===u)return l;let h=l&&"getContext"in l?l:i.f.get().createCanvas();if(o.tintMethod(a,t,h),h.tintId=u,o.convertTintToImage&&void 0!==h.toDataURL){let e=i.f.get().createImage();e.src=h.toDataURL(),e.tintId=u,s[n]=e}else s[n]=h;return s[n]},getTintedPattern:(e,t)=>{let a=r.f.shared.setValue(t).toHex(),n=e.patternCache||(e.patternCache={}),s=e.source._resourceId,l=n[a];return l?.tintId===s||(o.canvas||(o.canvas=i.f.get().createCanvas()),o.tintMethod(e,t,o.canvas),(l=o.canvas.getContext("2d").createPattern(o.canvas,"repeat")).tintId=s,n[a]=l),l},applyPatternTransform:(e,t,r=!0)=>{if(!t||!e.setTransform)return;let i=globalThis.DOMMatrix;if(!i)return;let a=new i([t.a,t.b,t.c,t.d,t.tx,t.ty]);e.setTransform(r?a.inverse():a)},tintWithMultiply:(e,t,i)=>{let n=i.getContext("2d"),s=e.frame.clone(),l=e.source._resolution??e.source.resolution??1,u=e.rotate;s.x*=l,s.y*=l,s.width*=l,s.height*=l;let h=a.f.isVertical(u),f=h?s.height:s.width,c=h?s.width:s.height;i.width=Math.ceil(f),i.height=Math.ceil(c),n.save(),0xffffff!==t&&(n.fillStyle=r.f.shared.setValue(t).toHex(),n.fillRect(0,0,f,c),n.globalCompositeOperation="multiply");let d=o.getCanvasSource(e);d&&(u&&o._applyInverseRotation(n,u,s.width,s.height),n.drawImage(d,s.x,s.y,s.width,s.height,0,0,s.width,s.height),0xffffff!==t&&(n.globalCompositeOperation="destination-atop",n.drawImage(d,s.x,s.y,s.width,s.height,0,0,s.width,s.height))),n.restore()},tintWithOverlay:(e,t,i)=>{let n=i.getContext("2d"),s=e.frame.clone(),l=e.source._resolution??e.source.resolution??1,u=e.rotate;s.x*=l,s.y*=l,s.width*=l,s.height*=l;let h=a.f.isVertical(u),f=h?s.height:s.width,c=h?s.width:s.height;i.width=Math.ceil(f),i.height=Math.ceil(c),n.save(),n.globalCompositeOperation="copy",n.fillStyle=r.f.shared.setValue(t).toHex(),n.fillRect(0,0,f,c),n.globalCompositeOperation="destination-atop";let d=o.getCanvasSource(e);d&&(u&&o._applyInverseRotation(n,u,s.width,s.height),n.drawImage(d,s.x,s.y,s.width,s.height,0,0,s.width,s.height)),n.restore()},tintWithPerPixel:(e,t,r)=>{let i=r.getContext("2d"),n=e.frame.clone(),s=e.source._resolution??e.source.resolution??1,l=e.rotate;n.x*=s,n.y*=s,n.width*=s,n.height*=s;let u=a.f.isVertical(l),h=u?n.height:n.width,f=u?n.width:n.height;r.width=Math.ceil(h),r.height=Math.ceil(f),i.save(),i.globalCompositeOperation="copy";let c=o.getCanvasSource(e);if(!c)return void i.restore();l&&o._applyInverseRotation(i,l,n.width,n.height),i.drawImage(c,n.x,n.y,n.width,n.height,0,0,n.width,n.height),i.restore();let d=t>>16&255,m=t>>8&255,x=255&t,p=i.getImageData(0,0,h,f),v=p.data;for(let e=0;e<v.length;e+=4)v[e]=v[e]*d/255,v[e+1]=v[e+1]*m/255,v[e+2]=v[e+2]*x/255;i.putImageData(p,0,0)},_applyInverseRotation:(e,t,r,i)=>{let n=a.f.inv(t),s=a.f.uX(n),o=a.f.uY(n),l=a.f.vX(n),u=a.f.vY(n),h=-Math.min(0,s*r,l*i,s*r+l*i),f=-Math.min(0,o*r,u*i,o*r+u*i);e.transform(s,o,l,u,h,f)}};e.s(["f",0,o],61805)},77953,e=>{"use strict";var t=e.i(32543);let r={};e.s(["f",0,function(e){let i=r[e];if(i)return i;let a=new Int32Array(e);for(let t=0;t<e;t++)a[t]=t;return r[e]=new t.f({uTextures:{value:a,type:"i32",size:e}},{isStatic:!0})}])},16203,e=>{"use strict";var t=e.i(47760),r=e.i(95627);class i extends r.f{constructor(e){super(e),this.uploadMethodId="image",this.autoGarbageCollect=!0}static test(e){return globalThis.HTMLImageElement&&e instanceof HTMLImageElement||"u">typeof ImageBitmap&&e instanceof ImageBitmap||globalThis.VideoFrame&&e instanceof VideoFrame}}i.extension=t.x.TextureSource,e.s(["f",0,i])}]);