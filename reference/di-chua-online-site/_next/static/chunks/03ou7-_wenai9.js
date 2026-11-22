(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,41303,e=>{"use strict";var t=e.i(47760);let r=[];async function i(e){if(!e)for(let e=0;e<r.length;e++){let t=r[e];if(t.value.test())return void await t.value.load()}}async function a(e){return i(!e)}t.H.handleByNamedList(t.x.Environment,r),e.s(["K",0,a,"g",0,i])},15433,18771,72933,85421,83527,85103,64225,59151,27302,32072,28502,73660,64997,77745,30015,88564,19314,52179,81768,e=>{"use strict";var t=e.i(47760),r=e.i(28353);let i={f32:4,i32:4,"vec2<f32>":8,"vec3<f32>":12,"vec4<f32>":16,"vec2<i32>":8,"vec3<i32>":12,"vec4<i32>":16,u32:4,"vec2<u32>":8,"vec3<u32>":12,"vec4<u32>":16,"mat2x2<f32>":32,"mat3x3<f32>":48,"mat4x4<f32>":64};function a(e){let t=e.map(e=>({data:e,offset:0,size:0})),r=0,a=0;for(let e=0;e<t.length;e++){let n=t[e];if(!(r=i[n.data.type]))throw Error(`Unknown type ${n.data.type}`);n.data.size>1&&(r=Math.max(r,16)*n.data.size);let s=12===r?16:r;n.size=r;let o=a%16;o>0&&16-o<s?a+=(16-o)%16:a+=(r-o%r)%r,n.offset=a,a+=r}return{uboElements:t,size:a=16*Math.ceil(a/16)}}e.s(["T",0,i,"f",0,a],18771);var n=e.i(62039),s=e.i(33156);function o(e,t){let r=Math.max(i[e.data.type]/16,1),a=e.data.value.length/e.data.size,n=(4-a%4)%4,s=e.data.type.indexOf("i32")>=0?"dataInt32":"data";return`
        v = uv.${e.data.name};
        offset += ${t};

        arrayOffset = offset;

        t = 0;

        for(var i=0; i < ${e.data.size*r}; i++)
        {
            for(var j = 0; j < ${a}; j++)
            {
                ${s}[arrayOffset++] = v[t++];
            }
            ${0!==n?`arrayOffset += ${n};`:""}
        }
    `}function f(e){return(0,n.f)(e,s.E,o)}e.s(["f",0,o],72933),e.s(["f",0,f],85421);class u extends r.f{constructor(){super({createUboElements:a,generateUboSync:f})}}u.extension={type:[t.x.WebGLSystem],name:"ubo"},e.s(["f",0,u],15433);var c=e.i(85830),l=e.i(87784),v=e.i(32543),h=e.i(95627),d=e.i(95932),m=e.i(24314);class g extends d.f{constructor(e,t){super(),this._resourceType="textureView",this._resourceId=(0,m.e)("resource"),this.source=e,this.viewDescriptor=t,this._onChange=this._onChange.bind(this),this._onDestroy=this._onDestroy.bind(this),this.source.on("change",this._onChange),this.source.on("destroy",this._onDestroy)}_onChange(){this.emit("change",this)}_onDestroy(){this.destroy()}get destroyed(){return this.source.destroyed}destroy(){this.source&&(this.source.off("change",this._onChange),this.source.off("destroy",this._onDestroy)),this.emit("destroy",this),this.removeAllListeners()}}function _(e,t){let r=[],i=[`
        var g = s.groups;
        var sS = r.shader;
        var p = s.glProgram;
        var ugS = r.uniformGroup;
        var resources;
    `],a=!1,n=0,s=t._getProgramData(e.glProgram);for(let o in e.groups){let f=e.groups[o],u=f.layout?function(e){let t={};for(let r in e)t[e[r]]=r;return t}(f.layout):e._uniformBindMap[o];for(let c in r.push(`
            resources = g[${o}].resources;
        `),f.resources){let o=f.resources[c];if(o instanceof v.f&&!o.ubo)r.push(`
                    ugS.updateUniformGroup(resources[${c}], p, sD);
                `);else if(o instanceof v.f||o instanceof l.f){let t=u[Number(c)];e.glProgram._uniformBlockData[t]&&r.push(`
                        sS.bindUniformBlock(
                            resources[${c}],
                            '${t}'
                        );
                    `)}else if(o instanceof h.f||o instanceof g){let e=u[Number(c)],o=s.uniformData[e];o&&(a||(a=!0,i.push(`
                        var tS = r.texture;
                        `)),t._gl.uniform1i(o.location,n),r.push(`
                        tS.bind(resources[${c}], ${n});
                    `),n++)}}}return Function("r","s","sD",[...i,...r].join("\n"))}e.s(["f",0,g],83527),e.s(["f",0,_],85103);class y{constructor(e,t){this.program=e,this.uniformData=t,this.uniformGroups={},this.uniformDirtyGroups={}}destroy(){this.uniformData=null,this.uniformGroups=null,this.uniformDirtyGroups=null,this.program=null}}function p(e,t,r){let i=e.createShader(t);return e.shaderSource(i,r),e.compileShader(i),i}function b(e){let t=Array(e);for(let e=0;e<t.length;e++)t[e]=!1;return t}function x(e,t){switch(e){case"float":case"int":case"uint":case"sampler2D":case"sampler2DArray":case"sampler3D":return 0;case"vec2":return new Float32Array(2*t);case"vec3":return new Float32Array(3*t);case"vec4":return new Float32Array(4*t);case"ivec2":return new Int32Array(2*t);case"ivec3":return new Int32Array(3*t);case"ivec4":return new Int32Array(4*t);case"uvec2":return new Uint32Array(2*t);case"uvec3":return new Uint32Array(3*t);case"uvec4":return new Uint32Array(4*t);case"bool":return!1;case"bvec2":return b(2*t);case"bvec3":return b(3*t);case"bvec4":return b(4*t);case"mat2":return new Float32Array([1,0,0,1]);case"mat3":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}e.s(["B",0,y,"y",0,class{}],64225),e.s(["f",0,p],59151),e.s(["f",0,x],27302);var w=e.i(46820);let S=null,A={FLOAT:"float",FLOAT_VEC2:"vec2",FLOAT_VEC3:"vec3",FLOAT_VEC4:"vec4",INT:"int",INT_VEC2:"ivec2",INT_VEC3:"ivec3",INT_VEC4:"ivec4",UNSIGNED_INT:"uint",UNSIGNED_INT_VEC2:"uvec2",UNSIGNED_INT_VEC3:"uvec3",UNSIGNED_INT_VEC4:"uvec4",BOOL:"bool",BOOL_VEC2:"bvec2",BOOL_VEC3:"bvec3",BOOL_VEC4:"bvec4",FLOAT_MAT2:"mat2",FLOAT_MAT3:"mat3",FLOAT_MAT4:"mat4",SAMPLER_2D:"sampler2D",INT_SAMPLER_2D:"sampler2D",UNSIGNED_INT_SAMPLER_2D:"sampler2D",SAMPLER_2D_SHADOW:"sampler2DShadow",SAMPLER_CUBE:"samplerCube",INT_SAMPLER_CUBE:"samplerCube",UNSIGNED_INT_SAMPLER_CUBE:"samplerCube",SAMPLER_CUBE_SHADOW:"samplerCubeShadow",SAMPLER_2D_ARRAY:"sampler2DArray",INT_SAMPLER_2D_ARRAY:"sampler2DArray",UNSIGNED_INT_SAMPLER_2D_ARRAY:"sampler2DArray",SAMPLER_2D_ARRAY_SHADOW:"sampler2DArrayShadow",SAMPLER_3D:"sampler3D",INT_SAMPLER_3D:"sampler3D",UNSIGNED_INT_SAMPLER_3D:"sampler3D"},D={float:"float32",vec2:"float32x2",vec3:"float32x3",vec4:"float32x4",int:"sint32",ivec2:"sint32x2",ivec3:"sint32x3",ivec4:"sint32x4",uint:"uint32",uvec2:"uint32x2",uvec3:"uint32x3",uvec4:"uint32x4",bool:"uint32",bvec2:"uint32x2",bvec3:"uint32x3",bvec4:"uint32x4"};function U(e,t){if(!S){let t=Object.keys(A);S={};for(let r=0;r<t.length;++r){let i=t[r];S[e[i]]=A[i]}}return S[t]}function E(e,t){return D[U(e,t)]||"float32"}function P(e,t,r=!1){let i={},a=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<a;r++){let a=t.getActiveAttrib(e,r);if(a.name.startsWith("gl_"))continue;let n=E(t,a.type);i[a.name]={location:0,format:n,stride:(0,w.f)(n).stride,offset:0,instance:!1,start:0}}let n=Object.keys(i);if(r){n.sort((e,t)=>e>t?1:-1);for(let r=0;r<n.length;r++)i[n[r]].location=r,t.bindAttribLocation(e,r,n[r]);t.linkProgram(e)}else for(let r=0;r<n.length;r++)i[n[r]].location=t.getAttribLocation(e,n[r]);return i}function I(e,t,r=0){if(!t.ACTIVE_UNIFORM_BLOCKS)return{};let i={},a=t.getProgramParameter(e,t.ACTIVE_UNIFORM_BLOCKS);for(let n=0;n<a;n++){let a=t.getActiveUniformBlockName(e,n),s=t.getUniformBlockIndex(e,a),o=t.getActiveUniformBlockParameter(e,n,t.UNIFORM_BLOCK_DATA_SIZE);i[a]={name:a,index:s,binding:s+r,size:o}}return i}function T(e,t){let r={},i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;a++){let i=t.getActiveUniform(e,a),n=i.name.replace(/\[.*?\]$/,""),s=!!i.name.match(/\[.*?\]$/),o=U(t,i.type);r[n]={name:n,index:a,type:o,size:i.size,isArray:s,value:x(o,i.size)}}return r}function C(e,t){let r=e.getShaderSource(t);if(null===r)return void console.error("PixiJS Error: Could not retrieve shader source (WebGL context may be lost).");let i=r.split("\n").map((e,t)=>`${t}: ${e}`),a=e.getShaderInfoLog(t)??"",n=a.split("\n"),s={},o=n.map(e=>parseFloat(e.replace(/^ERROR\: 0\:([\d]+)\:.*$/,"$1"))).filter(e=>!!e&&!s[e]&&(s[e]=!0,!0)),f=[""];o.forEach(e=>{i[e-1]=`%c${i[e-1]}%c`,f.push("background: #FF0000; color:#FFFFFF; font-size: 10px","font-size: 10px")});let u=i.join("\n");f[0]=u,console.error(a),console.groupCollapsed("click to view full shader code"),console.warn(...f),console.groupEnd()}function O(e,t,r,i){e.getProgramParameter(t,e.LINK_STATUS)||(e.getShaderParameter(r,e.COMPILE_STATUS)||C(e,r),e.getShaderParameter(i,e.COMPILE_STATUS)||C(e,i),console.error("PixiJS Error: Could not initialize shader."),""!==e.getProgramInfoLog(t)&&console.warn("PixiJS Warning: gl.getProgramInfoLog()",e.getProgramInfoLog(t)))}function z(e,t){let r=p(e,e.VERTEX_SHADER,t.vertex),i=p(e,e.FRAGMENT_SHADER,t.fragment),a=e.createProgram();e.attachShader(a,r),e.attachShader(a,i);let n=t.transformFeedbackVaryings;for(let s in n&&("function"!=typeof e.transformFeedbackVaryings?(0,c.f)("TransformFeedback is not supported but TransformFeedbackVaryings are given."):e.transformFeedbackVaryings(a,n.names,"separate"===n.bufferMode?e.SEPARATE_ATTRIBS:e.INTERLEAVED_ATTRIBS)),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS)||O(e,a,r,i),t._attributeData=P(a,e,!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(t.vertex)),t._uniformData=T(a,e),t._uniformBlockData=I(a,e,+!!n),t._uniformBlockData){let{index:r,binding:i}=t._uniformBlockData[s];e.uniformBlockBinding(a,r,i)}e.deleteShader(r),e.deleteShader(i);let s={};for(let r in t._uniformData){let i=t._uniformData[r];s[r]={location:e.getUniformLocation(a,r),value:x(i.type,i.size)}}return new y(a,s)}e.s(["R",0,E,"m",0,U],32072),e.s(["f",0,P],28502),e.s(["f",0,I],73660),e.s(["f",0,T],64997),e.s(["f",0,O],77745),e.s(["f",0,z],30015);let B={textureCount:0};class L{constructor(e){this._activeProgram=null,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._renderer=e}contextChange(e){this._gl=e,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._activeProgram=null}bind(e,t){if(this._setProgram(e.glProgram),t)return;B.textureCount=0;let r=this._shaderSyncFunctions[e.glProgram._key];r||(r=this._shaderSyncFunctions[e.glProgram._key]=this._generateShaderSync(e,this)),r(this._renderer,e,B)}updateUniformGroup(e){this._renderer.uniformGroup.updateUniformGroup(e,this._activeProgram,B)}bindUniformBlock(e,t){let r=this._renderer.buffer,{binding:i}=this._activeProgram._uniformBlockData[t],a=e._bufferResource;a||this._renderer.ubo.updateUniformGroup(e);let n=r.updateBuffer(e.buffer);if(!a)return void r.bindBufferBase(n,i);let{offset:s,size:o}=e;if(0===s&&(void 0===o||o===n.byteLength))return void r.bindBufferBase(n,i);let f=this._renderer.limits.minUniformBufferOffsetAlignment;s%f!=0&&(0,c.f)(`[GlShaderSystem] uniform block "${t}" has a BufferResource offset of ${s}, which is not a multiple of renderer.limits.minUniformBufferOffsetAlignment (${f}). WebGL will not bind it.`),r.bindBufferRange(n,i,s,o)}_setProgram(e){if(this._activeProgram===e)return;this._activeProgram=e;let t=this._getProgramData(e);this._gl.useProgram(t.program),this._renderer.renderTarget.adaptor.setFragmentOutputs(e)}_getProgramData(e){return this._programDataHash[e._key]||this._createProgramData(e)}_createProgramData(e){let t=e._key;return this._programDataHash[t]=z(this._gl,e),this._programDataHash[t]}destroy(){for(let e of Object.keys(this._programDataHash))this._programDataHash[e].destroy();this._programDataHash=null,this._shaderSyncFunctions=null,this._activeProgram=null,this._renderer=null,this._gl=null}_generateShaderSync(e,t){return _(e,t)}resetState(){this._activeProgram=null}}L.extension={type:[t.x.WebGLSystem],name:"shader"},e.s(["f",0,L],88564);var R=e.i(92715);let F={f32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1f(location, v);
        }`,"vec2<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }`,"vec3<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }`,"vec4<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }`,i32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,u32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1ui(location, v);
        }`,"vec2<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2ui(location, v[0], v[1]);
        }`,"vec3<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3ui(location, v[0], v[1], v[2]);
        }`,"vec4<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
        }`,bool:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,"mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);"},V={f32:"gl.uniform1fv(location, v);","vec2<f32>":"gl.uniform2fv(location, v);","vec3<f32>":"gl.uniform3fv(location, v);","vec4<f32>":"gl.uniform4fv(location, v);","mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);",i32:"gl.uniform1iv(location, v);","vec2<i32>":"gl.uniform2iv(location, v);","vec3<i32>":"gl.uniform3iv(location, v);","vec4<i32>":"gl.uniform4iv(location, v);",u32:"gl.uniform1iv(location, v);","vec2<u32>":"gl.uniform2iv(location, v);","vec3<u32>":"gl.uniform3iv(location, v);","vec4<u32>":"gl.uniform4iv(location, v);",bool:"gl.uniform1iv(location, v);","vec2<bool>":"gl.uniform2iv(location, v);","vec3<bool>":"gl.uniform3iv(location, v);","vec4<bool>":"gl.uniform4iv(location, v);"};function $(e,t){let r=[`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
        var name = null;
    `];for(let i in e.uniforms){if(!t[i]){e.uniforms[i]instanceof v.f?e.uniforms[i].ubo?r.push(`
                        renderer.shader.bindUniformBlock(uv.${i}, "${i}");
                    `):r.push(`
                        renderer.shader.updateUniformGroup(uv.${i});
                    `):e.uniforms[i]instanceof l.f&&r.push(`
                        renderer.shader.bindBufferResource(uv.${i}, "${i}");
                    `);continue}let a=e.uniformStructures[i],n=!1;for(let e=0;e<R.f.length;e++){let t=R.f[e];if(a.type===t.type&&t.test(a)){r.push(`name = "${i}";`,R.f[e].uniform),n=!0;break}}if(!n){let e=(1===a.size?F:V)[a.type].replace("location",`ud["${i}"].location`);r.push(`
            cu = ud["${i}"];
            cv = cu.value;
            v = uv["${i}"];
            ${e};`)}}return Function("ud","uv","renderer","syncData",r.join("\n"))}e.s(["$",0,V,"K",0,F],19314),e.s(["f",0,$],52179);class N{constructor(e){this._cache={},this._uniformGroupSyncHash={},this._renderer=e,this.gl=null,this._cache={}}contextChange(e){this.gl=e}updateUniformGroup(e,t,r){let i=this._renderer.shader._getProgramData(t);e.isStatic&&e._dirtyId===i.uniformDirtyGroups[e.uid]||(i.uniformDirtyGroups[e.uid]=e._dirtyId,this._getUniformSyncFunction(e,t)(i.uniformData,e.uniforms,this._renderer,r))}_getUniformSyncFunction(e,t){return this._uniformGroupSyncHash[e._signature]?.[t._key]||this._createUniformSyncFunction(e,t)}_createUniformSyncFunction(e,t){let r=this._uniformGroupSyncHash[e._signature]||(this._uniformGroupSyncHash[e._signature]={}),i=this._getSignature(e,t._uniformData,"u");return this._cache[i]||(this._cache[i]=this._generateUniformsSync(e,t._uniformData)),r[t._key]=this._cache[i],r[t._key]}_generateUniformsSync(e,t){return $(e,t)}_getSignature(e,t,r){let i=e.uniforms,a=[`${r}-`];for(let e in i)a.push(e),t[e]&&a.push(t[e].type);return a.join("-")}destroy(){this._renderer=null,this._cache=null}}N.extension={type:[t.x.WebGLSystem],name:"uniformGroup"},e.s(["f",0,N],81768)},41881,69236,70468,22807,e=>{"use strict";var t=e.i(47760),r=e.i(28353);let i={i32:{align:4,size:4},u32:{align:4,size:4},f32:{align:4,size:4},f16:{align:2,size:2},"vec2<i32>":{align:8,size:8},"vec2<u32>":{align:8,size:8},"vec2<f32>":{align:8,size:8},"vec2<f16>":{align:4,size:4},"vec3<i32>":{align:16,size:12},"vec3<u32>":{align:16,size:12},"vec3<f32>":{align:16,size:12},"vec3<f16>":{align:8,size:6},"vec4<i32>":{align:16,size:16},"vec4<u32>":{align:16,size:16},"vec4<f32>":{align:16,size:16},"vec4<f16>":{align:8,size:8},"mat2x2<f32>":{align:8,size:16},"mat2x2<f16>":{align:4,size:8},"mat3x2<f32>":{align:8,size:24},"mat3x2<f16>":{align:4,size:12},"mat4x2<f32>":{align:8,size:32},"mat4x2<f16>":{align:4,size:16},"mat2x3<f32>":{align:16,size:32},"mat2x3<f16>":{align:8,size:16},"mat3x3<f32>":{align:16,size:48},"mat3x3<f16>":{align:8,size:24},"mat4x3<f32>":{align:16,size:64},"mat4x3<f16>":{align:8,size:32},"mat2x4<f32>":{align:16,size:32},"mat2x4<f16>":{align:8,size:16},"mat3x4<f32>":{align:16,size:48},"mat3x4<f16>":{align:8,size:24},"mat4x4<f32>":{align:16,size:64},"mat4x4<f16>":{align:8,size:32}};function a(e){let t=e.map(e=>({data:e,offset:0,size:0})),r=0;for(let e=0;e<t.length;e++){let a=t[e],n=i[a.data.type].size,s=i[a.data.type].align;if(!i[a.data.type])throw Error(`[Pixi.js] WebGPU UniformBuffer: Unknown type ${a.data.type}`);a.data.size>1&&(n=Math.max(n,s)*a.data.size),r=Math.ceil(r/s)*s,a.size=n,a.offset=r,r+=n}return{uboElements:t,size:r=16*Math.ceil(r/16)}}e.s(["k",0,i,"U",0,a],69236);var n=e.i(62039),s=e.i(33156);function o(e,t){let{size:r,align:a}=i[e.data.type],n=(Math.max(r,a)-r)/4,s=e.data.type.indexOf("i32")>=0?"dataInt32":"data";return`
         v = uv.${e.data.name};
         ${0!==t?`offset += ${t};`:""}

         arrayOffset = offset;

         t = 0;

         for(var i=0; i < ${e.data.size}; i++)
         {
             for(var j = 0; j < ${r/4}; j++)
             {
                 ${s}[arrayOffset++] = v[t++];
             }
             ${0!==n?`arrayOffset += ${n};`:""}
         }
     `}function f(e){return(0,n.f)(e,s.c,o)}e.s(["f",0,o],70468),e.s(["f",0,f],22807);class u extends r.f{constructor(){super({createUboElements:a,generateUboSync:f})}}u.extension={type:[t.x.WebGPUSystem],name:"ubo"},e.s(["f",0,u],41881)},28353,92715,62039,33156,87784,e=>{"use strict";var t=e.i(55364),r=e.i(85465),i=e.i(64957);e.s(["f",0,class{constructor(e){this._syncFunctionHash=Object.create(null),this._adaptor=e,this._systemCheck()}_systemCheck(){if(!(0,t.f)())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(e){let t=this.getUniformGroupData(e);e.buffer||(e.buffer=new r.f({data:new Float32Array(t.layout.size/4),usage:i.f.UNIFORM|i.f.COPY_DST}))}getUniformGroupData(e){return this._syncFunctionHash[e._signature]||this._initUniformGroup(e)}_initUniformGroup(e){let t=e._signature,r=this._syncFunctionHash[t];if(!r){let i=Object.keys(e.uniformStructures).map(t=>e.uniformStructures[t]),a=this._adaptor.createUboElements(i),n=this._generateUboSync(a.uboElements);r=this._syncFunctionHash[t]={layout:a,syncFunction:n}}return this._syncFunctionHash[t]}_generateUboSync(e){return this._adaptor.generateUboSync(e)}syncUniformGroup(e,t,a){let n=this.getUniformGroupData(e);e.buffer||(e.buffer=new r.f({data:new Float32Array(n.layout.size/4),usage:i.f.UNIFORM|i.f.COPY_DST}));let s=null;return t||(t=e.buffer.data,s=e.buffer.dataInt32),a||(a=0),n.syncFunction(e.uniforms,t,s,a),!0}updateUniformGroup(e){if(e.isStatic&&!e._dirtyId)return!1;e._dirtyId=0;let t=this.syncUniformGroup(e);return e.buffer.update(),t}destroy(){this._syncFunctionHash=null}}],28353);let a=[{type:"mat3x3<f32>",test:e=>void 0!==e.value.a,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:e=>"vec4<f32>"===e.type&&1===e.size&&void 0!==e.value.width,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:e=>"vec2<f32>"===e.type&&1===e.size&&void 0!==e.value.x,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:e=>"vec4<f32>"===e.type&&1===e.size&&void 0!==e.value.red,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:e=>"vec3<f32>"===e.type&&1===e.size&&void 0!==e.value.red,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}];function n(e,t){return`
        for (let i = 0; i < ${e*t}; i++) {
            data[offset + (((i / ${e})|0) * 4) + (i % ${e})] = v[i];
        }
    `}e.s(["f",0,a],92715),e.s(["f",0,function(e,t,r){let i=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],n=0;for(let s=0;s<e.length;s++){let o=e[s],f=o.data.name,u=!1,c=0;for(let e=0;e<a.length;e++)if(a[e].test(o.data)){c=o.offset/4,i.push(`name = "${f}";`,`offset += ${c-n};`,a[e].ubo),u=!0;break}if(!u)if(o.data.size>1)c=o.offset/4,i.push(r(o,c-n));else{let e=t[o.data.type];c=o.offset/4,i.push(`
                    v = uv.${f};
                    offset += ${c-n};
                    ${e};
                `)}n=c}return Function("uv","data","dataInt32","offset",i.join("\n"))}],62039);let s={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,u32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"vec2<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<u32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":n(3,2),"mat4x2<f32>":n(4,2),"mat2x3<f32>":n(2,3),"mat4x3<f32>":n(4,3),"mat2x4<f32>":n(2,4),"mat3x4<f32>":n(3,4)},o={...s,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `};e.s(["E",0,s,"c",0,o],33156);var f=e.i(95932),u=e.i(24314);class c extends f.f{constructor({buffer:e,offset:t,size:r,watch:i=!0}){super(),this.uid=(0,u.e)("buffer"),this._resourceType="bufferResource",this._resourceId=(0,u.e)("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=e,this.offset=0|t,this.size=r,this.watch=i,i&&this.buffer.on("change",this.onBufferChange,this)}get _gcLastUsed(){return this.buffer?._gcLastUsed??-1}set _gcLastUsed(e){this.buffer&&(this.buffer._gcLastUsed=e)}onBufferChange(){this._resourceId=(0,u.e)("resource"),this.emit("change",this)}destroy(e=!1){this.destroyed=!0,e&&this.buffer.destroy(),this.emit("change",this),this.watch&&this.buffer.off("change",this.onBufferChange,this),this.buffer=null,this.removeAllListeners()}}e.s(["f",0,c],87784)},2351,69510,3197,e=>{"use strict";var t,r=e.i(57471),i=e.i(41303),a=e.i(50147),n=e.i(55364),s=e.i(24314),o=e.i(49864),f=e.i(48446),u=((t=u||{})[t.NONE=0]="NONE",t[t.COLOR=16384]="COLOR",t[t.STENCIL=1024]="STENCIL",t[t.DEPTH=256]="DEPTH",t[t.COLOR_DEPTH=16640]="COLOR_DEPTH",t[t.COLOR_STENCIL=17408]="COLOR_STENCIL",t[t.DEPTH_STENCIL=1280]="DEPTH_STENCIL",t[t.ALL=17664]="ALL",t);e.s(["f",0,u],69510);class c{constructor(e){this.items=[],this._name=e}emit(e,t,r,i,a,n,s,o){let{name:f,items:u}=this;for(let c=0,l=u.length;c<l;c++)u[c][f](e,t,r,i,a,n,s,o);return this}add(e){return e[this._name]&&(this.remove(e),this.items.push(e)),this}remove(e){let t=this.items.indexOf(e);return -1!==t&&this.items.splice(t,1),this}contains(e){return -1!==this.items.indexOf(e)}removeAll(){return this.items.length=0,this}destroy(){this.removeAll(),this.items=null,this._name=null}get empty(){return 0===this.items.length}get name(){return this._name}}e.s(["f",0,c],3197);var l=e.i(95932);let v=["init","destroy","contextChange","resolutionChange","resetState","renderEnd","renderStart","render","update","postrender","prerender"],h=class e extends l.f{constructor(e){super(),this.tick=0,this.uid=(0,s.e)("renderer"),this.runners=Object.create(null),this.renderPipes=Object.create(null),this._initOptions={},this._systemsHash=Object.create(null),this.type=e.type,this.name=e.name,this.config=e;let t=[...v,...this.config.runners??[]];this._addRunners(...t),this._unsafeEvalCheck()}async init(t={}){let r=!0===t.skipExtensionImports||!1===t.manageImports;for(let e in await (0,i.g)(r),!r&&this.config.loaders&&await Promise.all(this.config.loaders.map(e=>e.value.load())),this._addSystems(this.config.systems),this._addPipes(this.config.renderPipes,this.config.renderPipeAdaptors),this._systemsHash)t={...this._systemsHash[e].constructor.defaultOptions,...t};t={...e.defaultOptions,...t},this._roundPixels=+!!t.roundPixels;for(let e=0;e<this.runners.init.items.length;e++)await this.runners.init.items[e].init(t);this._initOptions=t}render(e,t){this.tick++;let i=e;if(i instanceof a.t&&(i={container:i},t&&((0,o.K)(o.e,"passing a second argument is deprecated, please use render options instead"),i.target=t.renderTexture)),i.target||(i.target=this.view.renderTarget),i.target===this.view.renderTarget&&(this._lastObjectRendered=i.container,i.clearColor??(i.clearColor=this.background.colorRgba),i.clear??(i.clear=this.background.clearBeforeRender)),i.clearColor){let e=Array.isArray(i.clearColor)&&4===i.clearColor.length;i.clearColor=e?i.clearColor:r.f.shared.setValue(i.clearColor).toArray()}i.transform||(i.container.updateLocalTransform(),i.transform=i.container.localTransform),i.container.visible&&(i.container.enableRenderGroup(),this.runners.prerender.emit(i),this.runners.renderStart.emit(i),this.runners.render.emit(i),this.runners.renderEnd.emit(i),this.runners.postrender.emit(i))}resize(e,t,r){let i=this.view.resolution;this.view.resize(e,t,r),this.emit("resize",this.view.screen.width,this.view.screen.height,this.view.resolution),void 0!==r&&r!==i&&this.runners.resolutionChange.emit(r)}clear(e={}){e.target||(e.target=this.renderTarget.renderTarget),e.clearColor||(e.clearColor=this.background.colorRgba),e.clear??(e.clear=u.ALL);let{clear:t,clearColor:i,target:a,mipLevel:n,layer:s}=e;r.f.shared.setValue(i??this.background.colorRgba),this.renderTarget.clear(a,t,r.f.shared.toArray(),n??0,s??0)}get resolution(){return this.view.resolution}set resolution(e){this.view.resolution=e,this.runners.resolutionChange.emit(e)}get width(){return this.view.texture.frame.width}get height(){return this.view.texture.frame.height}get canvas(){return this.view.canvas}get lastObjectRendered(){return this._lastObjectRendered}get renderingToScreen(){return this.renderTarget.renderingToScreen}get screen(){return this.view.screen}_addRunners(...e){e.forEach(e=>{this.runners[e]=new c(e)})}_addSystems(e){let t;for(t in e){let r=e[t];this._addSystem(r.value,r.name)}}_addSystem(e,t){let r=new e(this);if(this[t])throw Error(`Whoops! The name "${t}" is already in use`);for(let e in this[t]=r,this._systemsHash[t]=r,this.runners)this.runners[e].add(r);return this}_addPipes(e,t){let r=t.reduce((e,t)=>(e[t.name]=t.value,e),{});e.forEach(e=>{let t=e.value,i=e.name,a=r[i];this.renderPipes[i]=new t(this,a?new a:null),this.runners.destroy.add(this.renderPipes[i])})}destroy(e=!1){this.runners.destroy.items.reverse(),this.runners.destroy.emit(e),(!0===e||"object"==typeof e&&e.releaseGlobalResources)&&f.f.release(),Object.values(this.runners).forEach(e=>{e.destroy()}),this._systemsHash=null,this.renderPipes=null,this.removeAllListeners()}generateTexture(e){return this.textureGenerator.generateTexture(e)}get roundPixels(){return!!this._roundPixels}_unsafeEvalCheck(){if(!(0,n.f)())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}resetState(){this.runners.resetState.emit()}};h.defaultOptions={resolution:1,failIfMajorPerformanceCaveat:!1,roundPixels:!1},e.s(["f",0,h],2351)},17291,66798,37105,e=>{"use strict";var t=e.i(85465),r=e.i(64957),i=e.i(60406),a=e.i(46820),n=e.i(37024);function s(e,t=null){let r=6*e;if(r>65535?t||(t=new Uint32Array(r)):t||(t=new Uint16Array(r)),t.length!==r)throw Error(`Out buffer length is incorrect, got ${t.length} and expected ${r}`);for(let e=0,i=0;e<r;e+=6,i+=4)t[e+0]=i+0,t[e+1]=i+1,t[e+2]=i+2,t[e+3]=i+0,t[e+4]=i+2,t[e+5]=i+3;return t}function o(e){return{dynamicUpdate:f(e,!0),staticUpdate:f(e,!1)}}function f(e,t){let r=[];r.push(`

        var index = 0;

        for (let i = 0; i < ps.length; ++i)
        {
            const p = ps[i];

            `);let i=0;for(let n in e){let s=e[n];t===s.dynamic&&(r.push(`offset = index + ${i}`),r.push(s.code),i+=(0,a.f)(s.format).stride/4)}return r.push(`
            index += stride * 4;
        }
    `),r.unshift(`
        var stride = ${i};
        var offset = 0, w0 = 0, w1 = 0, h0 = 0, h1 = 0;
    `),Function("ps","f32v","u32v",r.join("\n"))}e.s(["f",0,s],66798),e.s(["f",0,o],37105),e.s(["f",0,class{constructor(e){this._size=0,this._generateParticleUpdateCache={};let o=this._size=e.size??1e3,f=e.properties,u=0,c=0;for(let e in f){let t=f[e],r=(0,a.f)(t.format);t.dynamic?c+=r.stride:u+=r.stride}this._dynamicStride=c/4,this._staticStride=u/4,this.staticAttributeBuffer=new n.f(4*o*u),this.dynamicAttributeBuffer=new n.f(4*o*c),this.indexBuffer=s(o);let l=new i.f,v=0,h=0;for(let e in this._staticBuffer=new t.f({data:new Float32Array(1),label:"static-particle-buffer",shrinkToFit:!1,usage:r.f.VERTEX|r.f.COPY_DST}),this._dynamicBuffer=new t.f({data:new Float32Array(1),label:"dynamic-particle-buffer",shrinkToFit:!1,usage:r.f.VERTEX|r.f.COPY_DST}),f){let t=f[e],r=(0,a.f)(t.format);t.dynamic?(l.addAttribute(t.attributeName,{buffer:this._dynamicBuffer,stride:4*this._dynamicStride,offset:4*v,format:t.format}),v+=r.size):(l.addAttribute(t.attributeName,{buffer:this._staticBuffer,stride:4*this._staticStride,offset:4*h,format:t.format}),h+=r.size)}l.addIndex(this.indexBuffer);let d=this.getParticleUpdate(f);this._dynamicUpload=d.dynamicUpdate,this._staticUpload=d.staticUpdate,this.geometry=l}getParticleUpdate(e){let t=function(e){let t=[];for(let r in e){let i=e[r];t.push(r,i.code,i.dynamic?"d":"s")}return t.join("_")}(e);return this._generateParticleUpdateCache[t]||(this._generateParticleUpdateCache[t]=this.generateParticleUpdate(e)),this._generateParticleUpdateCache[t]}generateParticleUpdate(e){return o(e)}update(e,t){e.length>this._size&&(t=!0,this._size=Math.max(e.length,1.5*this._size|0),this.staticAttributeBuffer=new n.f(this._size*this._staticStride*16),this.dynamicAttributeBuffer=new n.f(this._size*this._dynamicStride*16),this.indexBuffer=s(this._size),this.geometry.indexBuffer.setDataWithSize(this.indexBuffer,this.indexBuffer.byteLength,!0));let r=this.dynamicAttributeBuffer;if(this._dynamicUpload(e,r.float32View,r.uint32View),this._dynamicBuffer.setDataWithSize(this.dynamicAttributeBuffer.float32View,e.length*this._dynamicStride*4,!0),t){let t=this.staticAttributeBuffer;this._staticUpload(e,t.float32View,t.uint32View),this._staticBuffer.setDataWithSize(t.float32View,e.length*this._staticStride*4,!0)}}destroy(){this._staticBuffer.destroy(),this._dynamicBuffer.destroy(),this.geometry.destroy()}}],17291)},55364,e=>{"use strict";let t;e.s(["f",0,function(){if("boolean"==typeof t)return t;try{let e=Function("param1","param2","param3","return param1[param2] === param3;");t=!0===e({a:"b"},"a","b")}catch(e){t=!1}return t}])},37024,e=>{"use strict";e.s(["f",0,class{constructor(e){"number"==typeof e?this.rawBinaryData=new ArrayBuffer(e):e instanceof Uint8Array?this.rawBinaryData=e.buffer:this.rawBinaryData=e,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(e){return this[`${e}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(e){switch(e){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw Error(`${e} isn't a valid view type`)}}}])}]);