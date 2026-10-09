var Lo="169";var Lh=1,ic=2,Hn=3,xn=0,Ht=1,_r=2;var rc=2;var Mi=100;var Uo=204,Do=205;var Uh=0,hu=1,uu=2,ei=0,du=1,pu=2,fu=3,mu=4,gu=5,vu=6,sc=7;var Dh=300,rr=301,sr=302,No=303,Oo=304,Oa=306,ni=1e3,Xr=1001,Fo=1002,an=1003,_u=1004;var Ms=1005;var Rn=1006,Ya=1007;var Qi=1008;var Vn=1009,Nh=1010,Oh=1011,jr=1012,ac=1013,Ei=1014,Cn=1015,us=1016,oc=1017,lc=1018,ar=1020,Fh=35902,Bh=1021,zh=1022,vn=1023,Hh=1024,kh=1025,qr=1026,or=1027,cc=1028,hc=1029,Gh=1030,uc=1031;var dc=1033,Qs=33776,ea=33777,ta=33778,na=33779,Bo=35840,zo=35841,Ho=35842,ko=35843,Go=36196,Vo=37492,Wo=37496,Xo=37808,jo=37809,qo=37810,Yo=37811,Zo=37812,Jo=37813,Ko=37814,$o=37815,Qo=37816,el=37817,tl=37818,nl=37819,il=37820,rl=37821,ia=36492,sl=36494,al=36495,Vh=36283,ol=36284,ll=36285,cl=36286;var sa=2300,hl=2301,Za=2302,Rc=2400,Cc=2401,Pc=2402;var $i="",$t="srgb",ai="srgb-linear",pc="display-p3",Fa="display-p3-linear",aa="linear",vt="srgb",oa="rec709",la="p3";var Di=7680;var Wh=515;var ul=35044;var Ic="300 es",lr=2e3,ca=2001,ii=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let i=n.indexOf(t);i!==-1&&n.splice(i,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let i=0,s=n.length;i<s;i++)n[i].call(this,e);e.target=null}}},Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Lc=1234567,tr=Math.PI/180,Yr=180/Math.PI;function Pn(){let r=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0;return(Ft[255&r]+Ft[r>>8&255]+Ft[r>>16&255]+Ft[r>>24&255]+"-"+Ft[255&e]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[63&t|128]+Ft[t>>8&255]+"-"+Ft[t>>16&255]+Ft[t>>24&255]+Ft[255&n]+Ft[n>>8&255]+Ft[n>>16&255]+Ft[n>>24&255]).toLowerCase()}function Ct(r,e,t){return Math.max(e,Math.min(t,r))}function dl(r,e){return(r%e+e)%e}function kr(r,e,t){return(1-t)*r+t*e}function gn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ft(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("Invalid component type.")}}var fc={DEG2RAD:tr,RAD2DEG:Yr,generateUUID:Pn,clamp:Ct,euclideanModulo:dl,mapLinear:function(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)},inverseLerp:function(r,e,t){return r!==e?(t-r)/(e-r):0},lerp:kr,damp:function(r,e,t,n){return kr(r,e,1-Math.exp(-t*n))},pingpong:function(r,e=1){return e-Math.abs(dl(r,2*e)-e)},smoothstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*(3-2*r)},smootherstep:function(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e))*r*r*(r*(6*r-15)+10)},randInt:function(r,e){return r+Math.floor(Math.random()*(e-r+1))},randFloat:function(r,e){return r+Math.random()*(e-r)},randFloatSpread:function(r){return r*(.5-Math.random())},seededRandom:function(r){r!==void 0&&(Lc=r);let e=Lc+=1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296},degToRad:function(r){return r*tr},radToDeg:function(r){return r*Yr},isPowerOfTwo:function(r){return(r&r-1)==0&&r!==0},ceilPowerOfTwo:function(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))},floorPowerOfTwo:function(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))},setQuaternionFromProperEuler:function(r,e,t,n,i){let s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),d=s((e-n)/2),u=a((e-n)/2),p=s((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":r.set(o*h,l*d,l*u,o*c);break;case"YZY":r.set(l*u,o*h,l*d,o*c);break;case"ZXZ":r.set(l*d,l*u,o*h,o*c);break;case"XZX":r.set(o*h,l*m,l*p,o*c);break;case"YXY":r.set(l*p,o*h,l*m,o*c);break;case"ZYZ":r.set(l*m,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}},normalize:ft,denormalize:gn},pe=class r{constructor(e=0,t=0){r.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Qe=class r{constructor(e,t,n,i,s,a,o,l,c){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],m=n[8],y=i[0],v=i[3],f=i[6],_=i[1],x=i[4],M=i[7],T=i[2],w=i[5],C=i[8];return s[0]=a*y+o*_+l*T,s[3]=a*v+o*x+l*w,s[6]=a*f+o*M+l*C,s[1]=c*y+h*_+d*T,s[4]=c*v+h*x+d*w,s[7]=c*f+h*M+d*C,s[2]=u*y+p*_+m*T,s[5]=u*v+p*x+m*w,s[8]=u*f+p*M+m*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*s,p=c*s-a*l,m=t*d+n*u+i*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/m;return e[0]=d*y,e[1]=(i*c-h*n)*y,e[2]=(o*n-i*a)*y,e[3]=u*y,e[4]=(h*t-i*l)*y,e[5]=(i*s-o*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*s)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ja.makeScale(e,t)),this}rotate(e){return this.premultiply(Ja.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ja.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ja=new Qe;function Xh(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function ha(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function xu(){let r=ha("canvas");return r.style.display="block",r}var Uc={};function ra(r){r in Uc||(Uc[r]=!0,console.warn(r))}var Dc=new Qe().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Nc=new Qe().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Rr={[ai]:{transfer:aa,primaries:oa,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r,fromReference:r=>r},[$t]:{transfer:vt,primaries:oa,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[Fa]:{transfer:aa,primaries:la,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.applyMatrix3(Nc),fromReference:r=>r.applyMatrix3(Dc)},[pc]:{transfer:vt,primaries:la,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.convertSRGBToLinear().applyMatrix3(Nc),fromReference:r=>r.applyMatrix3(Dc).convertLinearToSRGB()}},yu=new Set([ai,Fa]),ut={enabled:!0,_workingColorSpace:ai,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!yu.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,e,t){if(this.enabled===!1||e===t||!e||!t)return r;let n=Rr[e].toReference;return(0,Rr[t].fromReference)(n(r))},fromWorkingColorSpace:function(r,e){return this.convert(r,this._workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this._workingColorSpace)},getPrimaries:function(r){return Rr[r].primaries},getTransfer:function(r){return r===$i?aa:Rr[r].transfer},getLuminanceCoefficients:function(r,e=this._workingColorSpace){return r.fromArray(Rr[e].luminanceCoefficients)}};function nr(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function Ka(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}var Ni,pl=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ni===void 0&&(Ni=ha("canvas")),Ni.width=e.width,Ni.height=e.height;let n=Ni.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ni}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ha("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=255*nr(s[a]/255);return n.putImageData(i,0,0),t}if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(255*nr(t[n]/255)):t[n]=nr(t[n]);return{data:t,width:e.width,height:e.height}}return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Mu=0,ua=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Mu++}),this.uuid=Pn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push($a(i[a].image)):s.push($a(i[a]))}else s=$a(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function $a(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?pl.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Su=0,Yt=class r extends ii{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,n=1001,i=1001,s=1006,a=1008,o=vn,l=Vn,c=r.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Su++}),this.uuid=Pn(),this.name="",this.source=new ua(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Dh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ni:e.x=e.x-Math.floor(e.x);break;case Xr:e.x=e.x<0?0:1;break;case Fo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ni:e.y=e.y-Math.floor(e.y);break;case Xr:e.y=e.y<0?0:1;break;case Fo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Yt.DEFAULT_IMAGE=null,Yt.DEFAULT_MAPPING=Dh,Yt.DEFAULT_ANISOTROPY=1;var dt=class r{constructor(e=0,t=0,n=0,i=1){r.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],m=l[9],y=l[2],v=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(m-v)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(m+v)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,M=(p+1)/2,T=(f+1)/2,w=(h+u)/4,C=(d+y)/4,G=(m+v)/4;return x>M&&x>T?x<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(x),i=w/n,s=C/n):M>T?M<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(M),n=w/i,s=G/i):T<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(T),n=C/s,i=G/s),this.set(n,i,s,t),this}let _=Math.sqrt((v-m)*(v-m)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(_)<.001&&(_=1),this.x=(v-m)/_,this.y=(d-y)/_,this.z=(u-h)/_,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},fl=class extends ii{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t);let i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Rn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let s=new Yt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new ua(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Wn=class extends fl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},da=class extends Yt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=an,this.minFilter=an,this.wrapR=Xr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ml=class extends Yt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=an,this.minFilter=an,this.wrapR=Xr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Gt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],d=n[i+3],u=s[a+0],p=s[a+1],m=s[a+2],y=s[a+3];if(o===0)return e[t+0]=l,e[t+1]=c,e[t+2]=h,void(e[t+3]=d);if(o===1)return e[t+0]=u,e[t+1]=p,e[t+2]=m,void(e[t+3]=y);if(d!==y||l!==u||c!==p||h!==m){let v=1-o,f=l*u+c*p+h*m+d*y,_=f>=0?1:-1,x=1-f*f;if(x>Number.EPSILON){let T=Math.sqrt(x),w=Math.atan2(T,f*_);v=Math.sin(v*w)/T,o=Math.sin(o*w)/T}let M=o*_;if(l=l*v+u*M,c=c*v+p*M,h=h*v+m*M,d=d*v+y*M,v===1-o){let T=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=T,c*=T,h*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,i,s,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],d=s[a],u=s[a+1],p=s[a+2],m=s[a+3];return e[t]=o*m+h*d+l*p-c*u,e[t+1]=l*m+h*u+c*d-o*p,e[t+2]=c*m+h*p+o*u-l*d,e[t+3]=h*m-o*d-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),d=o(s/2),u=l(n/2),p=l(i/2),m=l(s/2);switch(a){case"XYZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"YXZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"ZXY":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"ZYX":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"YZX":this._x=u*h*d+c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d-u*p*m;break;case"XZY":this._x=u*h*d-c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d+u*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+o+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(s-c)*p,this._z=(a-i)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(s+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(s-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-i)/p,this._x=(s+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ct(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),d=Math.sin((1-t)*h)/c,u=Math.sin(t*h)/c;return this._w=a*d+this._w*u,this._x=n*d+this._x*u,this._y=i*d+this._y*u,this._z=s*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},E=class r{constructor(e=0,t=0,n=0){r.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Oc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Oc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),d=2*(s*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-s*d,this.z=i+l*d+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Qa.copy(this).projectOnVector(e),this.sub(Qa)}reflect(e){return this.sub(Qa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Qa=new E,Oc=new Gt,yn=class{constructor(e=new E(1/0,1/0,1/0),t=new E(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,pn):pn.fromBufferAttribute(s,a),pn.applyMatrix4(e.matrixWorld),this.expandByPoint(pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ss.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ss.copy(n.boundingBox)),Ss.applyMatrix4(e.matrixWorld),this.union(Ss)}let i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,pn),pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Cr),bs.subVectors(this.max,Cr),Oi.subVectors(e.a,Cr),Fi.subVectors(e.b,Cr),Bi.subVectors(e.c,Cr),Yn.subVectors(Fi,Oi),Zn.subVectors(Bi,Fi),fi.subVectors(Oi,Bi);let t=[0,-Yn.z,Yn.y,0,-Zn.z,Zn.y,0,-fi.z,fi.y,Yn.z,0,-Yn.x,Zn.z,0,-Zn.x,fi.z,0,-fi.x,-Yn.y,Yn.x,0,-Zn.y,Zn.x,0,-fi.y,fi.x,0];return!!eo(t,Oi,Fi,Bi,bs)&&(t=[1,0,0,0,1,0,0,0,1],!!eo(t,Oi,Fi,Bi,bs)&&(Es.crossVectors(Yn,Zn),t=[Es.x,Es.y,Es.z],eo(t,Oi,Fi,Bi,bs)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(pn).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Nn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Nn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Nn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Nn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Nn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Nn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Nn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Nn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Nn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Nn=[new E,new E,new E,new E,new E,new E,new E,new E],pn=new E,Ss=new yn,Oi=new E,Fi=new E,Bi=new E,Yn=new E,Zn=new E,fi=new E,Cr=new E,bs=new E,Es=new E,mi=new E;function eo(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){mi.fromArray(r,s);let o=i.x*Math.abs(mi.x)+i.y*Math.abs(mi.y)+i.z*Math.abs(mi.z),l=e.dot(mi),c=t.dot(mi),h=n.dot(mi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var bu=new yn,Pr=new E,to=new E,Mn=class{constructor(e=new E,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):bu.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Pr.subVectors(e,this.center);let t=Pr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=.5*(n-this.radius);this.center.addScaledVector(Pr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(to.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Pr.copy(e.center).add(to)),this.expandByPoint(Pr.copy(e.center).sub(to))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},On=new E,no=new E,ws=new E,Jn=new E,io=new E,Ts=new E,ro=new E,cr=class{constructor(e=new E,t=new E(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,On)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=On.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(On.copy(this.origin).addScaledVector(this.direction,t),On.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){no.copy(e).add(t).multiplyScalar(.5),ws.copy(t).sub(e).normalize(),Jn.copy(this.origin).sub(no);let s=.5*e.distanceTo(t),a=-this.direction.dot(ws),o=Jn.dot(this.direction),l=-Jn.dot(ws),c=Jn.lengthSq(),h=Math.abs(1-a*a),d,u,p,m;if(h>0)if(d=a*l-o,u=a*o-l,m=s*h,d>=0)if(u>=-m)if(u<=m){let y=1/h;d*=y,u*=y,p=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u=-s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-a*s+o)),u=d>0?-s:Math.min(Math.max(-s,-l),s),p=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-s,-l),s),p=u*(u+2*l)+c):(d=Math.max(0,-(a*s+o)),u=d>0?s:Math.min(Math.max(-s,-l),s),p=-d*d+u*(u+2*l)+c);else u=a>0?-s:s,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(no).addScaledVector(ws,u),p}intersectSphere(e,t){On.subVectors(e.center,this.origin);let n=On.dot(this.direction),i=On.dot(On)-n*n,s=e.radius*e.radius;if(i>s)return null;let a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,i=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,i=(e.min.x-u.x)*c),h>=0?(s=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(s=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||s>i?null:((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||o>i?null:((o>n||n!=n)&&(n=o),(l<i||i!=i)&&(i=l),i<0?null:this.at(n>=0?n:i,t)))}intersectsBox(e){return this.intersectBox(e,On)!==null}intersectTriangle(e,t,n,i,s){io.subVectors(t,e),Ts.subVectors(n,e),ro.crossVectors(io,Ts);let a,o=this.direction.dot(ro);if(o>0){if(i)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}Jn.subVectors(this.origin,e);let l=a*this.direction.dot(Ts.crossVectors(Jn,Ts));if(l<0)return null;let c=a*this.direction.dot(io.cross(Jn));if(c<0||l+c>o)return null;let h=-a*Jn.dot(ro);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Xe=class r{constructor(e,t,n,i,s,a,o,l,c,h,d,u,p,m,y,v){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,d,u,p,m,y,v)}set(e,t,n,i,s,a,o,l,c,h,d,u,p,m,y,v){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=i,f[1]=s,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=m,f[11]=y,f[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/zi.setFromMatrixColumn(e,0).length(),s=1/zi.setFromMatrixColumn(e,1).length(),a=1/zi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let u=a*h,p=a*d,m=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=p+m*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=m+p*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,p=l*d,m=c*h,y=c*d;t[0]=u+y*o,t[4]=m*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=p*o-m,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,p=l*d,m=c*h,y=c*d;t[0]=u-y*o,t[4]=-a*d,t[8]=m+p*o,t[1]=p+m*o,t[5]=a*h,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,p=a*d,m=o*h,y=o*d;t[0]=l*h,t[4]=m*c-p,t[8]=u*c+y,t[1]=l*d,t[5]=y*c+u,t[9]=p*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,p=a*c,m=o*l,y=o*c;t[0]=l*h,t[4]=y-u*d,t[8]=m*d+p,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*d+m,t[10]=u-y*d}else if(e.order==="XZY"){let u=a*l,p=a*c,m=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+y,t[5]=a*h,t[9]=p*d-m,t[2]=m*d-p,t[6]=o*h,t[10]=y*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Eu,e,wu)}lookAt(e,t,n){let i=this.elements;return Jt.subVectors(e,t),Jt.lengthSq()===0&&(Jt.z=1),Jt.normalize(),Kn.crossVectors(n,Jt),Kn.lengthSq()===0&&(Math.abs(n.z)===1?Jt.x+=1e-4:Jt.z+=1e-4,Jt.normalize(),Kn.crossVectors(n,Jt)),Kn.normalize(),As.crossVectors(Jt,Kn),i[0]=Kn.x,i[4]=As.x,i[8]=Jt.x,i[1]=Kn.y,i[5]=As.y,i[9]=Jt.y,i[2]=Kn.z,i[6]=As.z,i[10]=Jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],m=n[2],y=n[6],v=n[10],f=n[14],_=n[3],x=n[7],M=n[11],T=n[15],w=i[0],C=i[4],G=i[8],F=i[12],q=i[1],H=i[5],k=i[9],Y=i[13],X=i[2],ee=i[6],te=i[10],ne=i[14],fe=i[3],be=i[7],Ne=i[11],le=i[15];return s[0]=a*w+o*q+l*X+c*fe,s[4]=a*C+o*H+l*ee+c*be,s[8]=a*G+o*k+l*te+c*Ne,s[12]=a*F+o*Y+l*ne+c*le,s[1]=h*w+d*q+u*X+p*fe,s[5]=h*C+d*H+u*ee+p*be,s[9]=h*G+d*k+u*te+p*Ne,s[13]=h*F+d*Y+u*ne+p*le,s[2]=m*w+y*q+v*X+f*fe,s[6]=m*C+y*H+v*ee+f*be,s[10]=m*G+y*k+v*te+f*Ne,s[14]=m*F+y*Y+v*ne+f*le,s[3]=_*w+x*q+M*X+T*fe,s[7]=_*C+x*H+M*ee+T*be,s[11]=_*G+x*k+M*te+T*Ne,s[15]=_*F+x*Y+M*ne+T*le,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],p=e[14];return e[3]*(+s*l*d-i*c*d-s*o*u+n*c*u+i*o*p-n*l*p)+e[7]*(+t*l*p-t*c*u+s*a*u-i*a*p+i*c*h-s*l*h)+e[11]*(+t*c*d-t*o*p-s*a*d+n*a*p+s*o*h-n*c*h)+e[15]*(-i*o*h-t*l*d+t*o*u+i*a*d-n*a*u+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],p=e[11],m=e[12],y=e[13],v=e[14],f=e[15],_=d*v*c-y*u*c+y*l*p-o*v*p-d*l*f+o*u*f,x=m*u*c-h*v*c-m*l*p+a*v*p+h*l*f-a*u*f,M=h*y*c-m*d*c+m*o*p-a*y*p-h*o*f+a*d*f,T=m*d*l-h*y*l-m*o*u+a*y*u+h*o*v-a*d*v,w=t*_+n*x+i*M+s*T;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/w;return e[0]=_*C,e[1]=(y*u*s-d*v*s-y*i*p+n*v*p+d*i*f-n*u*f)*C,e[2]=(o*v*s-y*l*s+y*i*c-n*v*c-o*i*f+n*l*f)*C,e[3]=(d*l*s-o*u*s-d*i*c+n*u*c+o*i*p-n*l*p)*C,e[4]=x*C,e[5]=(h*v*s-m*u*s+m*i*p-t*v*p-h*i*f+t*u*f)*C,e[6]=(m*l*s-a*v*s-m*i*c+t*v*c+a*i*f-t*l*f)*C,e[7]=(a*u*s-h*l*s+h*i*c-t*u*c-a*i*p+t*l*p)*C,e[8]=M*C,e[9]=(m*d*s-h*y*s-m*n*p+t*y*p+h*n*f-t*d*f)*C,e[10]=(a*y*s-m*o*s+m*n*c-t*y*c-a*n*f+t*o*f)*C,e[11]=(h*o*s-a*d*s-h*n*c+t*d*c+a*n*p-t*o*p)*C,e[12]=T*C,e[13]=(h*y*i-m*d*i+m*n*u-t*y*u-h*n*v+t*d*v)*C,e[14]=(m*o*i-a*y*i-m*n*l+t*y*l+a*n*v-t*o*v)*C,e[15]=(a*d*i-h*o*i+h*n*l-t*d*l-a*n*u+t*o*u)*C,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,d=o+o,u=s*c,p=s*h,m=s*d,y=a*h,v=a*d,f=o*d,_=l*c,x=l*h,M=l*d,T=n.x,w=n.y,C=n.z;return i[0]=(1-(y+f))*T,i[1]=(p+M)*T,i[2]=(m-x)*T,i[3]=0,i[4]=(p-M)*w,i[5]=(1-(u+f))*w,i[6]=(v+_)*w,i[7]=0,i[8]=(m+x)*C,i[9]=(v-_)*C,i[10]=(1-(u+y))*C,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=zi.set(i[0],i[1],i[2]).length(),a=zi.set(i[4],i[5],i[6]).length(),o=zi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],fn.copy(this);let l=1/s,c=1/a,h=1/o;return fn.elements[0]*=l,fn.elements[1]*=l,fn.elements[2]*=l,fn.elements[4]*=c,fn.elements[5]*=c,fn.elements[6]*=c,fn.elements[8]*=h,fn.elements[9]*=h,fn.elements[10]*=h,t.setFromRotationMatrix(fn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=2e3){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),d=(t+e)/(t-e),u=(n+i)/(n-i),p,m;if(o===lr)p=-(a+s)/(a-s),m=-2*a*s/(a-s);else{if(o!==ca)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);p=-a/(a-s),m=-a*s/(a-s)}return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=2e3){let l=this.elements,c=1/(t-e),h=1/(n-i),d=1/(a-s),u=(t+e)*c,p=(n+i)*h,m,y;if(o===lr)m=(a+s)*d,y=-2*d;else{if(o!==ca)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);m=s*d,y=-1*d}return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},zi=new E,fn=new Xe,Eu=new E(0,0,0),wu=new E(1,1,1),Kn=new E,As=new E,Jt=new E,Fc=new Xe,Bc=new Gt,Qt=class r{constructor(e=0,t=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],d=i[2],u=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(Ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ct(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ct(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ct(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Fc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Fc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bc.setFromEuler(this),this.setFromQuaternion(Bc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Qt.DEFAULT_ORDER="XYZ";var pa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!=0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},Tu=0,zc=new E,Hi=new Gt,Fn=new Xe,Rs=new E,Ir=new E,Au=new E,Ru=new Gt,Hc=new E(1,0,0),kc=new E(0,1,0),Gc=new E(0,0,1),Vc={type:"added"},Cu={type:"removed"},ki={type:"childadded",child:null},so={type:"childremoved",child:null},bt=class r extends ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tu++}),this.uuid=Pn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let e=new E,t=new Qt,n=new Gt,i=new E(1,1,1);t._onChange(function(){n.setFromEuler(t,!1)}),n._onChange(function(){t.setFromQuaternion(n,void 0,!1)}),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Xe},normalMatrix:{value:new Qe}}),this.matrix=new Xe,this.matrixWorld=new Xe,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.premultiply(Hi),this}rotateX(e){return this.rotateOnAxis(Hc,e)}rotateY(e){return this.rotateOnAxis(kc,e)}rotateZ(e){return this.rotateOnAxis(Gc,e)}translateOnAxis(e,t){return zc.copy(e).applyQuaternion(this.quaternion),this.position.add(zc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Hc,e)}translateY(e){return this.translateOnAxis(kc,e)}translateZ(e){return this.translateOnAxis(Gc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Fn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Rs.copy(e):Rs.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Ir.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fn.lookAt(Ir,Rs,this.up):Fn.lookAt(Rs,Ir,this.up),this.quaternion.setFromRotationMatrix(Fn),i&&(Fn.extractRotation(i.matrixWorld),Hi.setFromRotationMatrix(Fn),this.quaternion.premultiply(Hi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Vc),ki.child=e,this.dispatchEvent(ki),ki.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Cu),so.child=e,this.dispatchEvent(so),so.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Vc),ki.child=e,this.dispatchEvent(ki),ki.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let s=this.children[n].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ir,e,Au),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ir,Ru,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()})),this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),p=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};bt.DEFAULT_UP=new E(0,1,0),bt.DEFAULT_MATRIX_AUTO_UPDATE=!0,bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var mn=new E,Bn=new E,ao=new E,zn=new E,Gi=new E,Vi=new E,Wc=new E,oo=new E,lo=new E,co=new E,ho=new dt,uo=new dt,po=new dt,Gn=class r{constructor(e=new E,t=new E,n=new E){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),mn.subVectors(e,t),i.cross(mn);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){mn.subVectors(i,t),Bn.subVectors(n,t),ao.subVectors(e,t);let a=mn.dot(mn),o=mn.dot(Bn),l=mn.dot(ao),c=Bn.dot(Bn),h=Bn.dot(ao),d=a*c-o*o;if(d===0)return s.set(0,0,0),null;let u=1/d,p=(c*l-o*h)*u,m=(a*h-o*l)*u;return s.set(1-p-m,m,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,zn)!==null&&zn.x>=0&&zn.y>=0&&zn.x+zn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,zn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,zn.x),l.addScaledVector(a,zn.y),l.addScaledVector(o,zn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return ho.setScalar(0),uo.setScalar(0),po.setScalar(0),ho.fromBufferAttribute(e,t),uo.fromBufferAttribute(e,n),po.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(ho,s.x),a.addScaledVector(uo,s.y),a.addScaledVector(po,s.z),a}static isFrontFacing(e,t,n,i){return mn.subVectors(n,t),Bn.subVectors(e,t),mn.cross(Bn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return mn.subVectors(this.c,this.b),Bn.subVectors(this.a,this.b),.5*mn.cross(Bn).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return r.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,a,o;Gi.subVectors(i,n),Vi.subVectors(s,n),oo.subVectors(e,n);let l=Gi.dot(oo),c=Vi.dot(oo);if(l<=0&&c<=0)return t.copy(n);lo.subVectors(e,i);let h=Gi.dot(lo),d=Vi.dot(lo);if(h>=0&&d<=h)return t.copy(i);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Gi,a);co.subVectors(e,s);let p=Gi.dot(co),m=Vi.dot(co);if(m>=0&&p<=m)return t.copy(s);let y=p*c-l*m;if(y<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(Vi,o);let v=h*m-p*d;if(v<=0&&d-h>=0&&p-m>=0)return Wc.subVectors(s,i),o=(d-h)/(d-h+(p-m)),t.copy(i).addScaledVector(Wc,o);let f=1/(v+y+u);return a=y*f,o=u*f,t.copy(n).addScaledVector(Gi,a).addScaledVector(Vi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},jh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$n={h:0,s:0,l:0},Cs={h:0,s:0,l:0};function fo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+6*(e-r)*t:t<.5?e:t<2/3?r+6*(e-r)*(2/3-t):r}var He=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=$t){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,ut.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=ut.workingColorSpace){return this.r=e,this.g=t,this.b=n,ut.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=ut.workingColorSpace){if(e=dl(e,1),t=Ct(t,0,1),n=Ct(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=fo(a,s,e+1/3),this.g=fo(a,s,e),this.b=fo(a,s,e-1/3)}return ut.toWorkingColorSpace(this,i),this}setStyle(e,t=$t){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=$t){let n=jh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=nr(e.r),this.g=nr(e.g),this.b=nr(e.b),this}copyLinearToSRGB(e){return this.r=Ka(e.r),this.g=Ka(e.g),this.b=Ka(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=$t){return ut.fromWorkingColorSpace(Bt.copy(this),e),65536*Math.round(Ct(255*Bt.r,0,255))+256*Math.round(Ct(255*Bt.g,0,255))+Math.round(Ct(255*Bt.b,0,255))}getHexString(e=$t){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ut.workingColorSpace){ut.fromWorkingColorSpace(Bt.copy(this),t);let n=Bt.r,i=Bt.g,s=Bt.b,a=Math.max(n,i,s),o=Math.min(n,i,s),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(i-s)/d+(i<s?6:0);break;case i:l=(s-n)/d+2;break;case s:l=(n-i)/d+4}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ut.workingColorSpace){return ut.fromWorkingColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=$t){ut.fromWorkingColorSpace(Bt.copy(this),e);let t=Bt.r,n=Bt.g,i=Bt.b;return e!==$t?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*n)},${Math.round(255*i)})`}offsetHSL(e,t,n){return this.getHSL($n),this.setHSL($n.h+e,$n.s+t,$n.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL($n),e.getHSL(Cs);let n=kr($n.h,Cs.h,t),i=kr($n.s,Cs.s,t),s=kr($n.l,Cs.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Bt=new He;He.NAMES=jh;var Pu=0,ri=class extends ii{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pu++}),this.uuid=Pn(),this.name="",this.type="Material",this.blending=1,this.side=xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Uo,this.blendDst=Do,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new He(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Di,this.stencilZFail=Di,this.stencilZPass=Di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];i!==void 0?i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n:console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};function i(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Uo&&(n.blendSrc=this.blendSrc),this.blendDst!==Do&&(n.blendDst=this.blendDst),this.blendEquation!==Mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Di&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Di&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Di&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData),t){let s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},wt=class extends ri{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qt,this.combine=Uh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Xp=Iu();function Iu(){let r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[256|l]=32768,i[l]=24,i[256|l]=24):c<-14?(n[l]=1024>>-c-14,n[256|l]=1024>>-c-14|32768,i[l]=-c-1,i[256|l]=-c-1):c<=15?(n[l]=c+15<<10,n[256|l]=c+15<<10|32768,i[l]=13,i[256|l]=13):c<128?(n[l]=31744,n[256|l]=64512,i[l]=24,i[256|l]=24):(n[l]=31744,n[256|l]=64512,i[l]=13,i[256|l]=13)}let s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(8388608&c);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}var Tt=new E,Ps=new pe,kt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ul,this.updateRanges=[],this.gpuType=Cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ps.fromBufferAttribute(this,t),Ps.applyMatrix3(e),this.setXY(t,Ps.x,Ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix3(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=gn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=gn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=gn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=gn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),s=ft(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ul&&(e.usage=this.usage),e}};var fa=class extends kt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ma=class extends kt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var qe=class extends kt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Lu=0,sn=new Xe,mo=new bt,Wi=new E,Kt=new yn,Lr=new yn,Lt=new E,yt=class r extends ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Lu++}),this.uuid=Pn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Xh(e)?ma:fa)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Qe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return sn.makeRotationFromQuaternion(e),this.applyMatrix4(sn),this}rotateX(e){return sn.makeRotationX(e),this.applyMatrix4(sn),this}rotateY(e){return sn.makeRotationY(e),this.applyMatrix4(sn),this}rotateZ(e){return sn.makeRotationZ(e),this.applyMatrix4(sn),this}translate(e,t,n){return sn.makeTranslation(e,t,n),this.applyMatrix4(sn),this}scale(e,t,n){return sn.makeScale(e,t,n),this.applyMatrix4(sn),this}lookAt(e){return mo.lookAt(e),mo.updateMatrix(),this.applyMatrix4(mo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Wi).negate(),this.translate(Wi.x,Wi.y,Wi.z),this}setFromPoints(e){let t=[];for(let n=0,i=e.length;n<i;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new qe(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new yn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new E(-1/0,-1/0,-1/0),new E(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];Kt.setFromBufferAttribute(s),this.morphTargetsRelative?(Lt.addVectors(this.boundingBox.min,Kt.min),this.boundingBox.expandByPoint(Lt),Lt.addVectors(this.boundingBox.max,Kt.max),this.boundingBox.expandByPoint(Lt)):(this.boundingBox.expandByPoint(Kt.min),this.boundingBox.expandByPoint(Kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new E,1/0);if(e){let n=this.boundingSphere.center;if(Kt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Lr.setFromBufferAttribute(o),this.morphTargetsRelative?(Lt.addVectors(Kt.min,Lr.min),Kt.expandByPoint(Lt),Lt.addVectors(Kt.max,Lr.max),Kt.expandByPoint(Lt)):(Kt.expandByPoint(Lr.min),Kt.expandByPoint(Lr.max))}Kt.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Lt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Lt));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Lt.fromBufferAttribute(o,c),l&&(Wi.fromBufferAttribute(e,c),Lt.add(Wi)),i=Math.max(i,n.distanceToSquared(Lt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new kt(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let G=0;G<n.count;G++)o[G]=new E,l[G]=new E;let c=new E,h=new E,d=new E,u=new pe,p=new pe,m=new pe,y=new E,v=new E;function f(G,F,q){c.fromBufferAttribute(n,G),h.fromBufferAttribute(n,F),d.fromBufferAttribute(n,q),u.fromBufferAttribute(s,G),p.fromBufferAttribute(s,F),m.fromBufferAttribute(s,q),h.sub(c),d.sub(c),p.sub(u),m.sub(u);let H=1/(p.x*m.y-m.x*p.y);isFinite(H)&&(y.copy(h).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(H),v.copy(d).multiplyScalar(p.x).addScaledVector(h,-m.x).multiplyScalar(H),o[G].add(y),o[F].add(y),o[q].add(y),l[G].add(v),l[F].add(v),l[q].add(v))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let G=0,F=_.length;G<F;++G){let q=_[G],H=q.start;for(let k=H,Y=H+q.count;k<Y;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let x=new E,M=new E,T=new E,w=new E;function C(G){T.fromBufferAttribute(i,G),w.copy(T);let F=o[G];x.copy(F),x.sub(T.multiplyScalar(T.dot(F))).normalize(),M.crossVectors(w,F);let q=M.dot(l[G])<0?-1:1;a.setXYZW(G,x.x,x.y,x.z,q)}for(let G=0,F=_.length;G<F;++G){let q=_[G],H=q.start;for(let k=H,Y=H+q.count;k<Y;k+=3)C(e.getX(k+0)),C(e.getX(k+1)),C(e.getX(k+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new kt(new Float32Array(3*t.count),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let i=new E,s=new E,a=new E,o=new E,l=new E,c=new E,h=new E,d=new E;if(e)for(let u=0,p=e.count;u<p;u+=3){let m=e.getX(u+0),y=e.getX(u+1),v=e.getX(u+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,y),a.fromBufferAttribute(t,v),h.subVectors(a,s),d.subVectors(i,s),h.cross(d),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,v),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(v,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,s),d.subVectors(i,s),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Lt.fromBufferAttribute(e,t),Lt.normalize(),e.setXYZ(t,Lt.x,Lt.y,Lt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),p=0,m=0;for(let y=0,v=l.length;y<v;y++){p=o.isInterleavedBufferAttribute?l[y]*o.data.stride+o.offset:l[y]*h;for(let f=0;f<h;f++)u[m++]=c[p++]}return new kt(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,n=this.index.array,i=this.attributes;for(let o in i){let l=e(i[o],n);t.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let l=[],c=s[o];for(let h=0,d=c.length;h<d;h++){let u=e(c[h],n);l.push(u)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],d=s[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xc=new Xe,gi=new cr,Is=new Mn,jc=new E,Ls=new E,Us=new E,Ds=new E,go=new E,Ns=new E,qc=new E,Os=new E,ke=class extends bt{constructor(e=new yt,t=new wt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(s&&o){Ns.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=o[l],d=s[l];h!==0&&(go.fromBufferAttribute(d,e),a?Ns.addScaledVector(go,h):Ns.addScaledVector(go.sub(t),h))}t.add(Ns)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i!==void 0){if(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(s),gi.copy(e.ray).recast(e.near),Is.containsPoint(gi.origin)===!1&&(gi.intersectSphere(Is,jc)===null||gi.origin.distanceToSquared(jc)>(e.far-e.near)**2))return;Xc.copy(s).invert(),gi.copy(e.ray).applyMatrix4(Xc),n.boundingBox!==null&&gi.intersectsBox(n.boundingBox)===!1||this._computeIntersections(e,t,gi)}}_computeIntersections(e,t,n){let i,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,y=u.length;m<y;m++){let v=u[m],f=a[v.materialIndex];for(let _=Math.max(v.start,p.start),x=Math.min(o.count,Math.min(v.start+v.count,p.start+p.count));_<x;_+=3)i=Fs(this,f,e,n,c,h,d,o.getX(_),o.getX(_+1),o.getX(_+2)),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=v.materialIndex,t.push(i))}else for(let m=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);m<y;m+=3)i=Fs(this,a,e,n,c,h,d,o.getX(m),o.getX(m+1),o.getX(m+2)),i&&(i.faceIndex=Math.floor(m/3),t.push(i));else if(l!==void 0)if(Array.isArray(a))for(let m=0,y=u.length;m<y;m++){let v=u[m],f=a[v.materialIndex];for(let _=Math.max(v.start,p.start),x=Math.min(l.count,Math.min(v.start+v.count,p.start+p.count));_<x;_+=3)i=Fs(this,f,e,n,c,h,d,_,_+1,_+2),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=v.materialIndex,t.push(i))}else for(let m=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);m<y;m+=3)i=Fs(this,a,e,n,c,h,d,m,m+1,m+2),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}};function Fs(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,Ls),r.getVertexPosition(l,Us),r.getVertexPosition(c,Ds);let h=function(d,u,p,m,y,v,f,_){let x;if(x=u.side===Ht?m.intersectTriangle(f,v,y,!0,_):m.intersectTriangle(y,v,f,u.side===xn,_),x===null)return null;Os.copy(_),Os.applyMatrix4(d.matrixWorld);let M=p.ray.origin.distanceTo(Os);return M<p.near||M>p.far?null:{distance:M,point:Os.clone(),object:d}}(r,e,t,n,Ls,Us,Ds,qc);if(h){let d=new E;Gn.getBarycoord(qc,Ls,Us,Ds,d),i&&(h.uv=Gn.getInterpolatedAttribute(i,o,l,c,d,new pe)),s&&(h.uv1=Gn.getInterpolatedAttribute(s,o,l,c,d,new pe)),a&&(h.normal=Gn.getInterpolatedAttribute(a,o,l,c,d,new E),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new E,materialIndex:0};Gn.getNormal(Ls,Us,Ds,u.normal),h.face=u,h.barycoord=d}return h}var en=class r extends yt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};let o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,p=0;function m(y,v,f,_,x,M,T,w,C,G,F){let q=M/C,H=T/G,k=M/2,Y=T/2,X=w/2,ee=C+1,te=G+1,ne=0,fe=0,be=new E;for(let Ne=0;Ne<te;Ne++){let le=Ne*H-Y;for(let he=0;he<ee;he++){let Ae=he*q-k;be[y]=Ae*_,be[v]=le*x,be[f]=X,c.push(be.x,be.y,be.z),be[y]=0,be[v]=0,be[f]=w>0?1:-1,h.push(be.x,be.y,be.z),d.push(he/C),d.push(1-Ne/G),ne+=1}}for(let Ne=0;Ne<G;Ne++)for(let le=0;le<C;le++){let he=u+le+ee*Ne,Ae=u+le+ee*(Ne+1),Re=u+(le+1)+ee*(Ne+1),R=u+(le+1)+ee*Ne;l.push(he,Ae,R),l.push(Ae,Re,R),fe+=6}o.addGroup(p,fe,F),p+=fe,u+=ne}m("z","y","x",-1,-1,n,t,e,a,s,0),m("z","y","x",1,-1,n,t,-e,a,s,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new qe(c,3)),this.setAttribute("normal",new qe(h,3)),this.setAttribute("uv",new qe(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function hr(r){let e={};for(let t in r){e[t]={};for(let n in r[t]){let i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function jt(r){let e={};for(let t=0;t<r.length;t++){let n=hr(r[t]);for(let i in n)e[i]=n[i]}return e}function qh(r){let e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ut.workingColorSpace}var Uu={clone:hr,merge:jt},In=class extends ri{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=hr(e.uniforms),this.uniformsGroups=function(t){let n=[];for(let i=0;i<t.length;i++)n.push(t[i].clone());return n}(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let s=this.uniforms[i].value;s&&s.isTexture?t.uniforms[i]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[i]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[i]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[i]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[i]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[i]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[i]={type:"m4",value:s.toArray()}:t.uniforms[i]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Zr=class extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xe,this.projectionMatrix=new Xe,this.projectionMatrixInverse=new Xe,this.coordinateSystem=lr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Qn=new E,Yc=new pe,Zc=new pe,zt=class extends Zr{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=2*Yr*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(.5*tr*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return 2*Yr*Math.atan(Math.tan(.5*tr*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Qn.x,Qn.y).multiplyScalar(-e/Qn.z),Qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qn.x,Qn.y).multiplyScalar(-e/Qn.z)}getViewSize(e,t){return this.getViewBounds(e,Yc,Zc),t.subVectors(Zc,Yc)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(.5*tr*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Xi=-90,gl=class extends bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new zt(Xi,1,e,t);i.layers=this.layers,this.add(i);let s=new zt(Xi,1,e,t);s.layers=this.layers,this.add(s);let a=new zt(Xi,1,e,t);a.layers=this.layers,this.add(a);let o=new zt(Xi,1,e,t);o.layers=this.layers,this.add(o);let l=new zt(Xi,1,e,t);l.layers=this.layers,this.add(l);let c=new zt(Xi,1,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(let c of t)this.remove(c);if(e===lr)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else{if(e!==ca)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1)}for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(d,u,p),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},ga=class extends Yt{constructor(e,t,n,i,s,a,o,l,c,h){super(e=e!==void 0?e:[],t=t!==void 0?t:rr,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},vl=class extends Wn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new ga(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Rn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new en(5,5,5),s=new In({name:"CubemapFromEquirect",uniforms:hr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ht,blending:0});s.uniforms.tEquirect.value=t;let a=new ke(i,s),o=t.minFilter;return t.minFilter===Qi&&(t.minFilter=Rn),new gl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}},vo=new E,Du=new E,Nu=new Qe,kn=class{constructor(e=new E(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=vo.subVectors(n,t).cross(Du.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(vo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Nu.getNormalMatrix(e),i=this.coplanarPoint(vo).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},vi=new Mn,Bs=new E,ur=class{constructor(e=new kn,t=new kn,n=new kn,i=new kn,s=new kn,a=new kn){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2e3){let n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],d=i[6],u=i[7],p=i[8],m=i[9],y=i[10],v=i[11],f=i[12],_=i[13],x=i[14],M=i[15];if(n[0].setComponents(l-s,u-c,v-p,M-f).normalize(),n[1].setComponents(l+s,u+c,v+p,M+f).normalize(),n[2].setComponents(l+a,u+h,v+m,M+_).normalize(),n[3].setComponents(l-a,u-h,v-m,M-_).normalize(),n[4].setComponents(l-o,u-d,v-y,M-x).normalize(),t===lr)n[5].setComponents(l+o,u+d,v+y,M+x).normalize();else{if(t!==ca)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);n[5].setComponents(o,d,y,x).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vi)}intersectsSprite(e){return vi.center.set(0,0,0),vi.radius=.7071067811865476,vi.applyMatrix4(e.matrixWorld),this.intersectsSphere(vi)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Bs.x=i.normal.x>0?e.max.x:e.min.x,Bs.y=i.normal.y>0?e.max.y:e.min.y,Bs.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Bs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Yh(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Ou(r){let e=new WeakMap;return{get:function(t){return t.isInterleavedBufferAttribute&&(t=t.data),e.get(t)},remove:function(t){t.isInterleavedBufferAttribute&&(t=t.data);let n=e.get(t);n&&(r.deleteBuffer(n.buffer),e.delete(t))},update:function(t,n){if(t.isInterleavedBufferAttribute&&(t=t.data),t.isGLBufferAttribute){let s=e.get(t);return void((!s||s.version<t.version)&&e.set(t,{buffer:t.buffer,type:t.type,bytesPerElement:t.elementSize,version:t.version}))}let i=e.get(t);if(i===void 0)e.set(t,function(s,a){let o=s.array,l=s.usage,c=o.byteLength,h=r.createBuffer(),d;if(r.bindBuffer(a,h),r.bufferData(a,o,l),s.onUploadCallback(),o instanceof Float32Array)d=r.FLOAT;else if(o instanceof Uint16Array)d=s.isFloat16BufferAttribute?r.HALF_FLOAT:r.UNSIGNED_SHORT;else if(o instanceof Int16Array)d=r.SHORT;else if(o instanceof Uint32Array)d=r.UNSIGNED_INT;else if(o instanceof Int32Array)d=r.INT;else if(o instanceof Int8Array)d=r.BYTE;else if(o instanceof Uint8Array)d=r.UNSIGNED_BYTE;else{if(!(o instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);d=r.UNSIGNED_BYTE}return{buffer:h,type:d,bytesPerElement:o.BYTES_PER_ELEMENT,version:s.version,size:c}}(t,n));else if(i.version<t.version){if(i.size!==t.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(s,a,o){let l=a.array,c=a.updateRanges;if(r.bindBuffer(o,s),c.length===0)r.bufferSubData(o,0,l);else{c.sort((d,u)=>d.start-u.start);let h=0;for(let d=1;d<c.length;d++){let u=c[h],p=c[d];p.start<=u.start+u.count+1?u.count=Math.max(u.count,p.start+p.count-u.start):(++h,c[h]=p)}c.length=h+1;for(let d=0,u=c.length;d<u;d++){let p=c[d];r.bufferSubData(o,p.start*l.BYTES_PER_ELEMENT,l,p.start,p.count)}a.clearUpdateRanges()}a.onUploadCallback()})(i.buffer,t,n),i.version=t.version}}}}var qt=class r extends yt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,d=e/o,u=t/l,p=[],m=[],y=[],v=[];for(let f=0;f<h;f++){let _=f*u-a;for(let x=0;x<c;x++){let M=x*d-s;m.push(M,-_,0),y.push(0,0,1),v.push(x/o),v.push(1-f/l)}}for(let f=0;f<l;f++)for(let _=0;_<o;_++){let x=_+c*f,M=_+c*(f+1),T=_+1+c*(f+1),w=_+1+c*f;p.push(x,M,w),p.push(M,T,w)}this.setIndex(p),this.setAttribute("position",new qe(m,3)),this.setAttribute("normal",new qe(y,3)),this.setAttribute("uv",new qe(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},$e={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Me={common:{diffuse:{value:new He(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new He(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new He(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new He(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},An={basic:{uniforms:jt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:jt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new He(0)}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:jt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new He(0)},specular:{value:new He(1118481)},shininess:{value:30}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:jt([Me.common,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.roughnessmap,Me.metalnessmap,Me.fog,Me.lights,{emissive:{value:new He(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:jt([Me.common,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.gradientmap,Me.fog,Me.lights,{emissive:{value:new He(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:jt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:jt([Me.points,Me.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:jt([Me.common,Me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:jt([Me.common,Me.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:jt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:jt([Me.sprite,Me.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distanceRGBA:{uniforms:jt([Me.common,Me.displacementmap,{referencePosition:{value:new E},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distanceRGBA_vert,fragmentShader:$e.distanceRGBA_frag},shadow:{uniforms:jt([Me.lights,Me.fog,{color:{value:new He(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};An.physical={uniforms:jt([An.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new He(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new He(0)},specularColor:{value:new He(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var zs={r:0,b:0,g:0},_i=new Qt,Fu=new Xe;function Bu(r,e,t,n,i,s,a){let o=new He(0),l,c,h=s===!0?0:1,d=null,u=0,p=null;function m(v){let f=v.isScene===!0?v.background:null;return f&&f.isTexture&&(f=(v.backgroundBlurriness>0?t:e).get(f)),f}function y(v,f){v.getRGB(zs,qh(r)),n.buffers.color.setClear(zs.r,zs.g,zs.b,f,a)}return{getClearColor:function(){return o},setClearColor:function(v,f=1){o.set(v),h=f,y(o,h)},getClearAlpha:function(){return h},setClearAlpha:function(v){h=v,y(o,h)},render:function(v){let f=!1,_=m(v);_===null?y(o,h):_&&_.isColor&&(y(_,1),f=!0);let x=r.xr.getEnvironmentBlendMode();x==="additive"?n.buffers.color.setClear(0,0,0,1,a):x==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||f)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))},addToRenderList:function(v,f){let _=m(f);_&&(_.isCubeTexture||_.mapping===Oa)?(c===void 0&&(c=new ke(new en(1,1,1),new In({name:"BackgroundCubeMaterial",uniforms:hr(An.backgroundCube.uniforms),vertexShader:An.backgroundCube.vertexShader,fragmentShader:An.backgroundCube.fragmentShader,side:Ht,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(x,M,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),_i.copy(f.backgroundRotation),_i.x*=-1,_i.y*=-1,_i.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(_i.y*=-1,_i.z*=-1),c.material.uniforms.envMap.value=_,c.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Fu.makeRotationFromEuler(_i)),c.material.toneMapped=ut.getTransfer(_.colorSpace)!==vt,d===_&&u===_.version&&p===r.toneMapping||(c.material.needsUpdate=!0,d=_,u=_.version,p=r.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new ke(new qt(2,2),new In({name:"BackgroundMaterial",uniforms:hr(An.background.uniforms),vertexShader:An.background.vertexShader,fragmentShader:An.background.fragmentShader,side:xn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,l.material.toneMapped=ut.getTransfer(_.colorSpace)!==vt,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),d===_&&u===_.version&&p===r.toneMapping||(l.material.needsUpdate=!0,d=_,u=_.version,p=r.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}}}function zu(r,e){let t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=c(null),s=i,a=!1;function o(f){return r.bindVertexArray(f)}function l(f){return r.deleteVertexArray(f)}function c(f){let _=[],x=[],M=[];for(let T=0;T<t;T++)_[T]=0,x[T]=0,M[T]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:_,enabledAttributes:x,attributeDivisors:M,object:f,attributes:{},index:null}}function h(){let f=s.newAttributes;for(let _=0,x=f.length;_<x;_++)f[_]=0}function d(f){u(f,0)}function u(f,_){let x=s.newAttributes,M=s.enabledAttributes,T=s.attributeDivisors;x[f]=1,M[f]===0&&(r.enableVertexAttribArray(f),M[f]=1),T[f]!==_&&(r.vertexAttribDivisor(f,_),T[f]=_)}function p(){let f=s.newAttributes,_=s.enabledAttributes;for(let x=0,M=_.length;x<M;x++)_[x]!==f[x]&&(r.disableVertexAttribArray(x),_[x]=0)}function m(f,_,x,M,T,w,C){C===!0?r.vertexAttribIPointer(f,_,x,T,w):r.vertexAttribPointer(f,_,x,M,T,w)}function y(){v(),a=!0,s!==i&&(s=i,o(s.object))}function v(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:function(f,_,x,M,T){let w=!1,C=function(G,F,q){let H=q.wireframe===!0,k=n[G.id];k===void 0&&(k={},n[G.id]=k);let Y=k[F.id];Y===void 0&&(Y={},k[F.id]=Y);let X=Y[H];return X===void 0&&(X=c(r.createVertexArray()),Y[H]=X),X}(M,x,_);s!==C&&(s=C,o(s.object)),w=function(G,F,q,H){let k=s.attributes,Y=F.attributes,X=0,ee=q.getAttributes();for(let te in ee)if(ee[te].location>=0){let ne=k[te],fe=Y[te];if(fe===void 0&&(te==="instanceMatrix"&&G.instanceMatrix&&(fe=G.instanceMatrix),te==="instanceColor"&&G.instanceColor&&(fe=G.instanceColor)),ne===void 0||ne.attribute!==fe||fe&&ne.data!==fe.data)return!0;X++}return s.attributesNum!==X||s.index!==H}(f,M,x,T),w&&function(G,F,q,H){let k={},Y=F.attributes,X=0,ee=q.getAttributes();for(let te in ee)if(ee[te].location>=0){let ne=Y[te];ne===void 0&&(te==="instanceMatrix"&&G.instanceMatrix&&(ne=G.instanceMatrix),te==="instanceColor"&&G.instanceColor&&(ne=G.instanceColor));let fe={};fe.attribute=ne,ne&&ne.data&&(fe.data=ne.data),k[te]=fe,X++}s.attributes=k,s.attributesNum=X,s.index=H}(f,M,x,T),T!==null&&e.update(T,r.ELEMENT_ARRAY_BUFFER),(w||a)&&(a=!1,function(G,F,q,H){h();let k=H.attributes,Y=q.getAttributes(),X=F.defaultAttributeValues;for(let ee in Y){let te=Y[ee];if(te.location>=0){let ne=k[ee];if(ne===void 0&&(ee==="instanceMatrix"&&G.instanceMatrix&&(ne=G.instanceMatrix),ee==="instanceColor"&&G.instanceColor&&(ne=G.instanceColor)),ne!==void 0){let fe=ne.normalized,be=ne.itemSize,Ne=e.get(ne);if(Ne===void 0)continue;let le=Ne.buffer,he=Ne.type,Ae=Ne.bytesPerElement,Re=he===r.INT||he===r.UNSIGNED_INT||ne.gpuType===ac;if(ne.isInterleavedBufferAttribute){let R=ne.data,S=R.stride,B=ne.offset;if(R.isInstancedInterleavedBuffer){for(let $=0;$<te.locationSize;$++)u(te.location+$,R.meshPerAttribute);G.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=R.meshPerAttribute*R.count)}else for(let $=0;$<te.locationSize;$++)d(te.location+$);r.bindBuffer(r.ARRAY_BUFFER,le);for(let $=0;$<te.locationSize;$++)m(te.location+$,be/te.locationSize,he,fe,S*Ae,(B+be/te.locationSize*$)*Ae,Re)}else{if(ne.isInstancedBufferAttribute){for(let R=0;R<te.locationSize;R++)u(te.location+R,ne.meshPerAttribute);G.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let R=0;R<te.locationSize;R++)d(te.location+R);r.bindBuffer(r.ARRAY_BUFFER,le);for(let R=0;R<te.locationSize;R++)m(te.location+R,be/te.locationSize,he,fe,be*Ae,be/te.locationSize*R*Ae,Re)}}else if(X!==void 0){let fe=X[ee];if(fe!==void 0)switch(fe.length){case 2:r.vertexAttrib2fv(te.location,fe);break;case 3:r.vertexAttrib3fv(te.location,fe);break;case 4:r.vertexAttrib4fv(te.location,fe);break;default:r.vertexAttrib1fv(te.location,fe)}}}}p()}(f,_,x,M),T!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(T).buffer))},reset:y,resetDefaultState:v,dispose:function(){y();for(let f in n){let _=n[f];for(let x in _){let M=_[x];for(let T in M)l(M[T].object),delete M[T];delete _[x]}delete n[f]}},releaseStatesOfGeometry:function(f){if(n[f.id]===void 0)return;let _=n[f.id];for(let x in _){let M=_[x];for(let T in M)l(M[T].object),delete M[T];delete _[x]}delete n[f.id]},releaseStatesOfProgram:function(f){for(let _ in n){let x=n[_];if(x[f.id]===void 0)continue;let M=x[f.id];for(let T in M)l(M[T].object),delete M[T];delete x[f.id]}},initAttributes:h,enableAttribute:d,disableUnusedAttributes:p}}function Hu(r,e,t){let n;function i(s,a,o){o!==0&&(r.drawArraysInstanced(n,s,a,o),t.update(a,n,o))}this.setMode=function(s){n=s},this.render=function(s,a){r.drawArrays(n,s,a),t.update(a,n,1)},this.renderInstances=i,this.renderMultiDraw=function(s,a,o){if(o===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,s,0,a,0,o);let l=0;for(let c=0;c<o;c++)l+=a[c];t.update(l,n,1)},this.renderMultiDrawInstances=function(s,a,o,l){if(o===0)return;let c=e.get("WEBGL_multi_draw");if(c===null)for(let h=0;h<s.length;h++)i(s[h],a[h],l[h]);else{c.multiDrawArraysInstancedWEBGL(n,s,0,a,0,l,0,o);let h=0;for(let d=0;d<o;d++)h+=a[d];for(let d=0;d<l.length;d++)t.update(h,n,l[d])}}}function ku(r,e,t,n){let i;function s(u){if(u==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";u="mediump"}return u==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=t.precision!==void 0?t.precision:"highp",o=s(a);o!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);let l=t.logarithmicDepthBuffer===!0,c=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(c===!0){let u=e.get("EXT_clip_control");u.clipControlEXT(u.LOWER_LEFT_EXT,u.ZERO_TO_ONE_EXT)}let h=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),d=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS);return{isWebGL2:!0,getMaxAnisotropy:function(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let u=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(u.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i},getMaxPrecision:s,textureFormatReadable:function(u){return u===vn||n.convert(u)===r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT)},textureTypeReadable:function(u){let p=u===us&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(u!==Vn&&n.convert(u)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&u!==Cn&&!p)},precision:a,logarithmicDepthBuffer:l,reverseDepthBuffer:c,maxTextures:h,maxVertexTextures:d,maxTextureSize:r.getParameter(r.MAX_TEXTURE_SIZE),maxCubemapSize:r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),maxAttributes:r.getParameter(r.MAX_VERTEX_ATTRIBS),maxVertexUniforms:r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),maxVaryings:r.getParameter(r.MAX_VARYING_VECTORS),maxFragmentUniforms:r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),vertexTextures:d>0,maxSamples:r.getParameter(r.MAX_SAMPLES)}}function Gu(r){let e=this,t=null,n=0,i=!1,s=!1,a=new kn,o=new Qe,l={value:null,needsUpdate:!1};function c(h,d,u,p){let m=h!==null?h.length:0,y=null;if(m!==0){if(y=l.value,p!==!0||y===null){let v=u+4*m,f=d.matrixWorldInverse;o.getNormalMatrix(f),(y===null||y.length<v)&&(y=new Float32Array(v));for(let _=0,x=u;_!==m;++_,x+=4)a.copy(h[_]).applyMatrix4(f,o),a.normal.toArray(y,x),y[x+3]=a.constant}l.value=y,l.needsUpdate=!0}return e.numPlanes=m,e.numIntersection=0,y}this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let u=h.length!==0||d||n!==0||i;return i=d,n=h.length,u},this.beginShadows=function(){s=!0,c(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=c(h,d,0)},this.setState=function(h,d,u){let p=h.clippingPlanes,m=h.clipIntersection,y=h.clipShadows,v=r.get(h);if(!i||p===null||p.length===0||s&&!y)s?c(null):function(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}();else{let f=s?0:n,_=4*f,x=v.clippingState||null;l.value=x,x=c(p,d,_,u);for(let M=0;M!==_;++M)x[M]=t[M];v.clippingState=x,this.numIntersection=m?this.numPlanes:0,this.numPlanes+=f}}}function Vu(r){let e=new WeakMap;function t(i,s){return s===No?i.mapping=rr:s===Oo&&(i.mapping=sr),i}function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping;if(s===No||s===Oo){if(e.has(i))return t(e.get(i).texture,i.mapping);{let a=i.image;if(a&&a.height>0){let o=new vl(a.height);return o.fromEquirectangularTexture(r,i),e.set(i,o),i.addEventListener("dispose",n),t(o.texture,i.mapping)}return null}}}return i},dispose:function(){e=new WeakMap}}}var va=class extends Zr{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Jc=[.125,.215,.35,.446,.526,.582],Ur=20,_o=new va,Kc=new He,xo=null,yo=0,Mo=0,So=!1,yi=(1+Math.sqrt(5))/2,ji=1/yi,$c=[new E(-yi,ji,0),new E(yi,ji,0),new E(-ji,0,yi),new E(ji,0,yi),new E(0,yi,-ji),new E(0,yi,ji),new E(-1,1,-1),new E(1,1,-1),new E(-1,1,1),new E(1,1,1)],dr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){xo=this._renderer.getRenderTarget(),yo=this._renderer.getActiveCubeFace(),Mo=this._renderer.getActiveMipmapLevel(),So=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=th(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=eh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(xo,yo,Mo),this._renderer.xr.enabled=So,e.scissorTest=!1,Hs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===rr||e.mapping===sr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),xo=this._renderer.getRenderTarget(),yo=this._renderer.getActiveCubeFace(),Mo=this._renderer.getActiveMipmapLevel(),So=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Rn,minFilter:Rn,generateMipmaps:!1,type:us,format:vn,colorSpace:ai,depthBuffer:!1},i=Qc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=function(a){let o=[],l=[],c=[],h=a,d=a-4+1+Jc.length;for(let u=0;u<d;u++){let p=Math.pow(2,h);l.push(p);let m=1/p;u>a-4?m=Jc[u-a+4-1]:u===0&&(m=0),c.push(m);let y=1/(p-2),v=-y,f=1+y,_=[v,v,f,v,f,f,v,v,f,f,v,f],x=6,M=6,T=3,w=2,C=1,G=new Float32Array(T*M*x),F=new Float32Array(w*M*x),q=new Float32Array(C*M*x);for(let k=0;k<x;k++){let Y=k%3*2/3-1,X=k>2?0:-1,ee=[Y,X,0,Y+2/3,X,0,Y+2/3,X+1,0,Y,X,0,Y+2/3,X+1,0,Y,X+1,0];G.set(ee,T*M*k),F.set(_,w*M*k);let te=[k,k,k,k,k,k];q.set(te,C*M*k)}let H=new yt;H.setAttribute("position",new kt(G,T)),H.setAttribute("uv",new kt(F,w)),H.setAttribute("faceIndex",new kt(q,C)),o.push(H),h>4&&h--}return{lodPlanes:o,sizeLods:l,sigmas:c}}(s)),this._blurMaterial=function(a,o,l){let c=new Float32Array(Ur),h=new E(0,1,0);return new In({name:"SphericalGaussianBlur",defines:{n:Ur,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/l,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:c},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:h}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}(s,e,t)}return i}_compileMaterial(e){let t=new ke(this._lodPlanes[0],e);this._renderer.compile(t,_o)}_sceneToCubeUV(e,t,n,i){let s=new zt(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(Kc),l.toneMapping=ei,l.autoClear=!1;let d=new wt({name:"PMREM.Background",side:Ht,depthWrite:!1,depthTest:!1}),u=new ke(new en,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(Kc),p=!0);for(let y=0;y<6;y++){let v=y%3;v===0?(s.up.set(0,a[y],0),s.lookAt(o[y],0,0)):v===1?(s.up.set(0,0,a[y]),s.lookAt(0,o[y],0)):(s.up.set(0,a[y],0),s.lookAt(0,0,o[y]));let f=this._cubeSize;Hs(i,v*f,y>2?f:0,f,f),l.setRenderTarget(i),p&&l.render(u,s),l.render(e,s)}u.geometry.dispose(),u.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===rr||e.mapping===sr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=th()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=eh());let s=i?this._cubemapMaterial:this._equirectMaterial,a=new ke(this._lodPlanes[0],s);s.uniforms.envMap.value=e;let o=this._cubeSize;Hs(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(a,_o)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let s=1;s<i;s++){let a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=$c[(i-s-1)%$c.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=new ke(this._lodPlanes[i],c),d=c.uniforms,u=this._sizeLods[n]-1,p=isFinite(s)?Math.PI/(2*u):2*Math.PI/39,m=s/p,y=isFinite(s)?1+Math.floor(3*m):Ur;y>Ur&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${y} samples when the maximum is set to 20`);let v=[],f=0;for(let M=0;M<Ur;++M){let T=M/m,w=Math.exp(-T*T/2);v.push(w),M===0?f+=w:M<y&&(f+=2*w)}for(let M=0;M<v.length;M++)v[M]=v[M]/f;d.envMap.value=e.texture,d.samples.value=y,d.weights.value=v,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:_}=this;d.dTheta.value=p,d.mipInt.value=_-n;let x=this._sizeLods[i];Hs(t,3*x*(i>_-4?i-_+4:0),4*(this._cubeSize-x),3*x,2*x),l.setRenderTarget(t),l.render(h,_o)}};function Qc(r,e,t){let n=new Wn(r,e,t);return n.texture.mapping=Oa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Hs(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function eh(){return new In({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function th(){return new In({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function mc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Wu(r){let e=new WeakMap,t=null;function n(i){let s=i.target;s.removeEventListener("dispose",n);let a=e.get(s);a!==void 0&&(e.delete(s),a.dispose())}return{get:function(i){if(i&&i.isTexture){let s=i.mapping,a=s===No||s===Oo,o=s===rr||s===sr;if(a||o){let l=e.get(i),c=l!==void 0?l.texture.pmremVersion:0;if(i.isRenderTargetTexture&&i.pmremVersion!==c)return t===null&&(t=new dr(r)),l=a?t.fromEquirectangular(i,l):t.fromCubemap(i,l),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),l.texture;if(l!==void 0)return l.texture;{let h=i.image;return a&&h&&h.height>0||o&&h&&function(d){let u=0,p=6;for(let m=0;m<p;m++)d[m]!==void 0&&u++;return u===p}(h)?(t===null&&(t=new dr(r)),l=a?t.fromEquirectangular(i):t.fromCubemap(i),l.texture.pmremVersion=i.pmremVersion,e.set(i,l),i.addEventListener("dispose",n),l.texture):null}}}return i},dispose:function(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}}}function Xu(r){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&ra("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function ju(r,e,t,n){let i={},s=new WeakMap;function a(l){let c=l.target;c.index!==null&&e.remove(c.index);for(let d in c.attributes)e.remove(c.attributes[d]);for(let d in c.morphAttributes){let u=c.morphAttributes[d];for(let p=0,m=u.length;p<m;p++)e.remove(u[p])}c.removeEventListener("dispose",a),delete i[c.id];let h=s.get(c);h&&(e.remove(h),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function o(l){let c=[],h=l.index,d=l.attributes.position,u=0;if(h!==null){let y=h.array;u=h.version;for(let v=0,f=y.length;v<f;v+=3){let _=y[v+0],x=y[v+1],M=y[v+2];c.push(_,x,x,M,M,_)}}else{if(d===void 0)return;{let y=d.array;u=d.version;for(let v=0,f=y.length/3-1;v<f;v+=3){let _=v+0,x=v+1,M=v+2;c.push(_,x,x,M,M,_)}}}let p=new(Xh(c)?ma:fa)(c,1);p.version=u;let m=s.get(l);m&&e.remove(m),s.set(l,p)}return{get:function(l,c){return i[c.id]===!0||(c.addEventListener("dispose",a),i[c.id]=!0,t.memory.geometries++),c},update:function(l){let c=l.attributes;for(let d in c)e.update(c[d],r.ARRAY_BUFFER);let h=l.morphAttributes;for(let d in h){let u=h[d];for(let p=0,m=u.length;p<m;p++)e.update(u[p],r.ARRAY_BUFFER)}},getWireframeAttribute:function(l){let c=s.get(l);if(c){let h=l.index;h!==null&&c.version<h.version&&o(l)}else o(l);return s.get(l)}}}function qu(r,e,t){let n,i,s;function a(o,l,c){c!==0&&(r.drawElementsInstanced(n,l,i,o*s,c),t.update(l,n,c))}this.setMode=function(o){n=o},this.setIndex=function(o){i=o.type,s=o.bytesPerElement},this.render=function(o,l){r.drawElements(n,l,i,o*s),t.update(l,n,1)},this.renderInstances=a,this.renderMultiDraw=function(o,l,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,l,0,i,o,0,c);let h=0;for(let d=0;d<c;d++)h+=l[d];t.update(h,n,1)},this.renderMultiDrawInstances=function(o,l,c,h){if(c===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let u=0;u<o.length;u++)a(o[u]/s,l[u],h[u]);else{d.multiDrawElementsInstancedWEBGL(n,l,0,i,o,0,h,0,c);let u=0;for(let p=0;p<c;p++)u+=l[p];for(let p=0;p<h.length;p++)t.update(u,n,h[p])}}}function Yu(r){let e={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:e,programs:null,autoReset:!0,reset:function(){e.calls=0,e.triangles=0,e.points=0,e.lines=0},update:function(t,n,i){switch(e.calls++,n){case r.TRIANGLES:e.triangles+=i*(t/3);break;case r.LINES:e.lines+=i*(t/2);break;case r.LINE_STRIP:e.lines+=i*(t-1);break;case r.LINE_LOOP:e.lines+=i*t;break;case r.POINTS:e.points+=i*t;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",n)}}}}function Zu(r,e,t){let n=new WeakMap,i=new dt;return{update:function(s,a,o){let l=s.morphTargetInfluences,c=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=c!==void 0?c.length:0,d=n.get(a);if(d===void 0||d.count!==h){let G=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",G)};d!==void 0&&d.texture.dispose();let u=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,y=a.morphAttributes.position||[],v=a.morphAttributes.normal||[],f=a.morphAttributes.color||[],_=0;u===!0&&(_=1),p===!0&&(_=2),m===!0&&(_=3);let x=a.attributes.position.count*_,M=1;x>e.maxTextureSize&&(M=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let T=new Float32Array(x*M*4*h),w=new da(T,x,M,h);w.type=Cn,w.needsUpdate=!0;let C=4*_;for(let F=0;F<h;F++){let q=y[F],H=v[F],k=f[F],Y=x*M*4*F;for(let X=0;X<q.count;X++){let ee=X*C;u===!0&&(i.fromBufferAttribute(q,X),T[Y+ee+0]=i.x,T[Y+ee+1]=i.y,T[Y+ee+2]=i.z,T[Y+ee+3]=0),p===!0&&(i.fromBufferAttribute(H,X),T[Y+ee+4]=i.x,T[Y+ee+5]=i.y,T[Y+ee+6]=i.z,T[Y+ee+7]=0),m===!0&&(i.fromBufferAttribute(k,X),T[Y+ee+8]=i.x,T[Y+ee+9]=i.y,T[Y+ee+10]=i.z,T[Y+ee+11]=k.itemSize===4?i.w:1)}}d={count:h,texture:w,size:new pe(x,M)},n.set(a,d),a.addEventListener("dispose",G)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)o.getUniforms().setValue(r,"morphTexture",s.morphTexture,t);else{let u=0;for(let m=0;m<l.length;m++)u+=l[m];let p=a.morphTargetsRelative?1:1-u;o.getUniforms().setValue(r,"morphTargetBaseInfluence",p),o.getUniforms().setValue(r,"morphTargetInfluences",l)}o.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),o.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}}}function Ju(r,e,t,n){let i=new WeakMap;function s(a){let o=a.target;o.removeEventListener("dispose",s),t.remove(o.instanceMatrix),o.instanceColor!==null&&t.remove(o.instanceColor)}return{update:function(a){let o=n.render.frame,l=a.geometry,c=e.get(a,l);if(i.get(c)!==o&&(e.update(c),i.set(c,o)),a.isInstancedMesh&&(a.hasEventListener("dispose",s)===!1&&a.addEventListener("dispose",s),i.get(a)!==o&&(t.update(a.instanceMatrix,r.ARRAY_BUFFER),a.instanceColor!==null&&t.update(a.instanceColor,r.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let h=a.skeleton;i.get(h)!==o&&(h.update(),i.set(h,o))}return c},dispose:function(){i=new WeakMap}}}var _a=class extends Yt{constructor(e,t,n,i,s,a,o,l,c,h=1026){if(h!==qr&&h!==or)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===qr&&(n=Ei),n===void 0&&h===or&&(n=ar),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:an,this.minFilter=l!==void 0?l:an,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Zh=new Yt,nh=new _a(1,1),Jh=new da,Kh=new ml,$h=new ga,ih=[],rh=[],sh=new Float32Array(16),ah=new Float32Array(9),oh=new Float32Array(4);function xr(r,e,t){let n=r[0];if(n<=0||n>0)return r;let i=e*t,s=ih[i];if(s===void 0&&(s=new Float32Array(i),ih[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function Pt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function It(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function Ba(r,e){let t=rh[e];t===void 0&&(t=new Int32Array(e),rh[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Ku(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function $u(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;r.uniform2fv(this.addr,e),It(t,e)}}function Qu(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)t[0]===e.r&&t[1]===e.g&&t[2]===e.b||(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Pt(t,e))return;r.uniform3fv(this.addr,e),It(t,e)}}function ed(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;r.uniform4fv(this.addr,e),It(t,e)}}function td(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),It(t,e)}else{if(Pt(t,n))return;oh.set(n),r.uniformMatrix2fv(this.addr,!1,oh),It(t,n)}}function nd(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),It(t,e)}else{if(Pt(t,n))return;ah.set(n),r.uniformMatrix3fv(this.addr,!1,ah),It(t,n)}}function id(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),It(t,e)}else{if(Pt(t,n))return;sh.set(n),r.uniformMatrix4fv(this.addr,!1,sh),It(t,n)}}function rd(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function sd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;r.uniform2iv(this.addr,e),It(t,e)}}function ad(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;r.uniform3iv(this.addr,e),It(t,e)}}function od(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;r.uniform4iv(this.addr,e),It(t,e)}}function ld(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function cd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y||(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;r.uniform2uiv(this.addr,e),It(t,e)}}function hd(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z||(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;r.uniform3uiv(this.addr,e),It(t,e)}}function ud(r,e){let t=this.cache;if(e.x!==void 0)t[0]===e.x&&t[1]===e.y&&t[2]===e.z&&t[3]===e.w||(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;r.uniform4uiv(this.addr,e),It(t,e)}}function dd(r,e,t){let n=this.cache,i=t.allocateTextureUnit(),s;n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),this.type===r.SAMPLER_2D_SHADOW?(nh.compareFunction=Wh,s=nh):s=Zh,t.setTexture2D(e||s,i)}function pd(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Kh,i)}function fd(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||$h,i)}function md(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Jh,i)}function gd(r,e){r.uniform1fv(this.addr,e)}function vd(r,e){let t=xr(e,this.size,2);r.uniform2fv(this.addr,t)}function _d(r,e){let t=xr(e,this.size,3);r.uniform3fv(this.addr,t)}function xd(r,e){let t=xr(e,this.size,4);r.uniform4fv(this.addr,t)}function yd(r,e){let t=xr(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function Md(r,e){let t=xr(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Sd(r,e){let t=xr(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function bd(r,e){r.uniform1iv(this.addr,e)}function Ed(r,e){r.uniform2iv(this.addr,e)}function wd(r,e){r.uniform3iv(this.addr,e)}function Td(r,e){r.uniform4iv(this.addr,e)}function Ad(r,e){r.uniform1uiv(this.addr,e)}function Rd(r,e){r.uniform2uiv(this.addr,e)}function Cd(r,e){r.uniform3uiv(this.addr,e)}function Pd(r,e){r.uniform4uiv(this.addr,e)}function Id(r,e,t){let n=this.cache,i=e.length,s=Ba(t,i);Pt(n,s)||(r.uniform1iv(this.addr,s),It(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Zh,s[a])}function Ld(r,e,t){let n=this.cache,i=e.length,s=Ba(t,i);Pt(n,s)||(r.uniform1iv(this.addr,s),It(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Kh,s[a])}function Ud(r,e,t){let n=this.cache,i=e.length,s=Ba(t,i);Pt(n,s)||(r.uniform1iv(this.addr,s),It(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||$h,s[a])}function Dd(r,e,t){let n=this.cache,i=e.length,s=Ba(t,i);Pt(n,s)||(r.uniform1iv(this.addr,s),It(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Jh,s[a])}var _l=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=function(i){switch(i){case 5126:return Ku;case 35664:return $u;case 35665:return Qu;case 35666:return ed;case 35674:return td;case 35675:return nd;case 35676:return id;case 5124:case 35670:return rd;case 35667:case 35671:return sd;case 35668:case 35672:return ad;case 35669:case 35673:return od;case 5125:return ld;case 36294:return cd;case 36295:return hd;case 36296:return ud;case 35678:case 36198:case 36298:case 36306:case 35682:return dd;case 35679:case 36299:case 36307:return pd;case 35680:case 36300:case 36308:case 36293:return fd;case 36289:case 36303:case 36311:case 36292:return md}}(t.type)}},xl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=function(i){switch(i){case 5126:return gd;case 35664:return vd;case 35665:return _d;case 35666:return xd;case 35674:return yd;case 35675:return Md;case 35676:return Sd;case 5124:case 35670:return bd;case 35667:case 35671:return Ed;case 35668:case 35672:return wd;case 35669:case 35673:return Td;case 5125:return Ad;case 36294:return Rd;case 36295:return Cd;case 36296:return Pd;case 35678:case 36198:case 36298:case 36306:case 35682:return Id;case 35679:case 36299:case 36307:return Ld;case 35680:case 36300:case 36308:case 36293:return Ud;case 36289:case 36303:case 36311:case 36292:return Dd}}(t.type)}},yl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,a=i.length;s!==a;++s){let o=i[s];o.setValue(e,t[o.id],n)}}},bo=/(\w+)(\])?(\[|\.)?/g;function lh(r,e){r.seq.push(e),r.map[e.id]=e}function Nd(r,e,t){let n=r.name,i=n.length;for(bo.lastIndex=0;;){let s=bo.exec(n),a=bo.lastIndex,o=s[1],l=s[2]==="]",c=s[3];if(l&&(o|=0),c===void 0||c==="["&&a+2===i){lh(t,c===void 0?new _l(o,r,e):new xl(o,r,e));break}{let h=t.map[o];h===void 0&&(h=new yl(o),lh(t,h)),t=h}}}var ir=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i);Nd(s,e.getUniformLocation(t,s.name),this)}}setValue(e,t,n,i){let s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function ch(r,e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var Od=37297,Fd=0;function hh(r,e,t){let n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+function(o,l){let c=o.split(`
`),h=[],d=Math.max(l-6,0),u=Math.min(l+6,c.length);for(let p=d;p<u;p++){let m=p+1;h.push(`${m===l?">":" "} ${m}: ${c[p]}`)}return h.join(`
`)}(r.getShaderSource(e),a)}return i}function Bd(r,e){let t=function(n){let i=ut.getPrimaries(ut.workingColorSpace),s=ut.getPrimaries(n),a;switch(i===s?a="":i===la&&s===oa?a="LinearDisplayP3ToLinearSRGB":i===oa&&s===la&&(a="LinearSRGBToLinearDisplayP3"),n){case ai:case Fa:return[a,"LinearTransferOETF"];case $t:case pc:return[a,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[a,"LinearTransferOETF"]}}(e);return`vec4 ${r}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function zd(r,e){let t;switch(e){case du:t="Linear";break;case pu:t="Reinhard";break;case fu:t="Cineon";break;case mu:t="ACESFilmic";break;case vu:t="AgX";break;case sc:t="Neutral";break;case gu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ks=new E;function Hd(){return ut.getLuminanceCoefficients(ks),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${ks.x.toFixed(4)}, ${ks.y.toFixed(4)}, ${ks.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Dr(r){return r!==""}function uh(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function dh(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var kd=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ml(r){return r.replace(kd,Vd)}var Gd=new Map;function Vd(r,e){let t=$e[e];if(t===void 0){let n=Gd.get(e);if(n===void 0)throw new Error("Can not resolve #include <"+e+">");t=$e[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n)}return Ml(t)}var Wd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ph(r){return r.replace(Wd,Xd)}function Xd(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function fh(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function jd(r,e,t,n){let i=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=function(H){let k="SHADOWMAP_TYPE_BASIC";return H.shadowMapType===Lh?k="SHADOWMAP_TYPE_PCF":H.shadowMapType===ic?k="SHADOWMAP_TYPE_PCF_SOFT":H.shadowMapType===Hn&&(k="SHADOWMAP_TYPE_VSM"),k}(t),c=function(H){let k="ENVMAP_TYPE_CUBE";if(H.envMap)switch(H.envMapMode){case rr:case sr:k="ENVMAP_TYPE_CUBE";break;case Oa:k="ENVMAP_TYPE_CUBE_UV"}return k}(t),h=function(H){let k="ENVMAP_MODE_REFLECTION";return H.envMap&&H.envMapMode===sr&&(k="ENVMAP_MODE_REFRACTION"),k}(t),d=function(H){let k="ENVMAP_BLENDING_NONE";if(H.envMap)switch(H.combine){case Uh:k="ENVMAP_BLENDING_MULTIPLY";break;case hu:k="ENVMAP_BLENDING_MIX";break;case uu:k="ENVMAP_BLENDING_ADD"}return k}(t),u=function(H){let k=H.envMapCubeUVHeight;if(k===null)return null;let Y=Math.log2(k)-2,X=1/k;return{texelWidth:1/(3*Math.max(Math.pow(2,Y),112)),texelHeight:X,maxMip:Y}}(t),p=function(H){return[H.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",H.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Dr).join(`
`)}(t),m=function(H){let k=[];for(let Y in H){let X=H[Y];X!==!1&&k.push("#define "+Y+" "+X)}return k.join(`
`)}(s),y=i.createProgram(),v,f,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Dr).join(`
`),v.length>0&&(v+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Dr).join(`
`),f.length>0&&(f+=`
`)):(v=[fh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Dr).join(`
`),f=[fh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ei?"#define TONE_MAPPING":"",t.toneMapping!==ei?$e.tonemapping_pars_fragment:"",t.toneMapping!==ei?zd("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,Bd("linearToOutputTexel",t.outputColorSpace),Hd(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Dr).join(`
`)),a=Ml(a),a=uh(a,t),a=dh(a,t),o=Ml(o),o=uh(o,t),o=dh(o,t),a=ph(a),o=ph(o),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,v=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,f=["#define varying in",t.glslVersion===Ic?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ic?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let x=_+v+a,M=_+f+o,T=ch(i,i.VERTEX_SHADER,x),w=ch(i,i.FRAGMENT_SHADER,M);function C(H){if(r.debug.checkShaderErrors){let k=i.getProgramInfoLog(y).trim(),Y=i.getShaderInfoLog(T).trim(),X=i.getShaderInfoLog(w).trim(),ee=!0,te=!0;if(i.getProgramParameter(y,i.LINK_STATUS)===!1)if(ee=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,y,T,w);else{let ne=hh(i,T,"vertex"),fe=hh(i,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(y,i.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+k+`
`+ne+`
`+fe)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):Y!==""&&X!==""||(te=!1);te&&(H.diagnostics={runnable:ee,programLog:k,vertexShader:{log:Y,prefix:v},fragmentShader:{log:X,prefix:f}})}i.deleteShader(T),i.deleteShader(w),G=new ir(i,y),F=function(k,Y){let X={},ee=k.getProgramParameter(Y,k.ACTIVE_ATTRIBUTES);for(let te=0;te<ee;te++){let ne=k.getActiveAttrib(Y,te),fe=ne.name,be=1;ne.type===k.FLOAT_MAT2&&(be=2),ne.type===k.FLOAT_MAT3&&(be=3),ne.type===k.FLOAT_MAT4&&(be=4),X[fe]={type:ne.type,location:k.getAttribLocation(Y,fe),locationSize:be}}return X}(i,y)}let G,F;i.attachShader(y,T),i.attachShader(y,w),t.index0AttributeName!==void 0?i.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(y,0,"position"),i.linkProgram(y),this.getUniforms=function(){return G===void 0&&C(this),G},this.getAttributes=function(){return F===void 0&&C(this),F};let q=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return q===!1&&(q=i.getProgramParameter(y,Od)),q},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Fd++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=w,this}var qd=0,Sl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new bl(e),t.set(e,n)),n}},bl=class{constructor(e){this.id=qd++,this.code=e,this.usedTimes=0}};function Yd(r,e,t,n,i,s,a){let o=new pa,l=new Sl,c=new Set,h=[],d=i.logarithmicDepthBuffer,u=i.reverseDepthBuffer,p=i.vertexTextures,m=i.precision,y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(f){return c.add(f),f===0?"uv":`uv${f}`}return{getParameters:function(f,_,x,M,T){let w=M.fog,C=T.geometry,G=f.isMeshStandardMaterial?M.environment:null,F=(f.isMeshStandardMaterial?t:e).get(f.envMap||G),q=F&&F.mapping===Oa?F.image.height:null,H=y[f.type];f.precision!==null&&(m=i.getMaxPrecision(f.precision),m!==f.precision&&console.warn("THREE.WebGLProgram.getParameters:",f.precision,"not supported, using",m,"instead."));let k=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,Y=k!==void 0?k.length:0,X,ee,te,ne,fe=0;if(C.morphAttributes.position!==void 0&&(fe=1),C.morphAttributes.normal!==void 0&&(fe=2),C.morphAttributes.color!==void 0&&(fe=3),H){let rn=An[H];X=rn.vertexShader,ee=rn.fragmentShader}else X=f.vertexShader,ee=f.fragmentShader,l.update(f),te=l.getVertexShaderID(f),ne=l.getFragmentShaderID(f);let be=r.getRenderTarget(),Ne=T.isInstancedMesh===!0,le=T.isBatchedMesh===!0,he=!!f.map,Ae=!!f.matcap,Re=!!F,R=!!f.aoMap,S=!!f.lightMap,B=!!f.bumpMap,$=!!f.normalMap,P=!!f.displacementMap,U=!!f.emissiveMap,b=!!f.metalnessMap,O=!!f.roughnessMap,N=f.anisotropy>0,se=f.clearcoat>0,j=f.dispersion>0,ae=f.iridescence>0,ue=f.sheen>0,oe=f.transmission>0,ye=N&&!!f.anisotropyMap,Ue=se&&!!f.clearcoatMap,Pe=se&&!!f.clearcoatNormalMap,je=se&&!!f.clearcoatRoughnessMap,Ke=ae&&!!f.iridescenceMap,et=ae&&!!f.iridescenceThicknessMap,Be=ue&&!!f.sheenColorMap,it=ue&&!!f.sheenRoughnessMap,at=!!f.specularMap,mt=!!f.specularColorMap,Oe=!!f.specularIntensityMap,rt=oe&&!!f.transmissionMap,ct=oe&&!!f.thicknessMap,Ci=!!f.gradientMap,En=!!f.alphaMap,Ot=f.alphaTest>0,nn=!!f.alphaHash,hn=!!f.extensions,z=ei;f.toneMapped&&(be!==null&&be.isXRRenderTarget!==!0||(z=r.toneMapping));let Ln={shaderID:H,shaderType:f.type,shaderName:f.name,vertexShader:X,fragmentShader:ee,defines:f.defines,customVertexShaderID:te,customFragmentShaderID:ne,isRawShaderMaterial:f.isRawShaderMaterial===!0,glslVersion:f.glslVersion,precision:m,batching:le,batchingColor:le&&T._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&T.instanceColor!==null,instancingMorph:Ne&&T.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:be===null?r.outputColorSpace:be.isXRRenderTarget===!0?be.texture.colorSpace:ai,alphaToCoverage:!!f.alphaToCoverage,map:he,matcap:Ae,envMap:Re,envMapMode:Re&&F.mapping,envMapCubeUVHeight:q,aoMap:R,lightMap:S,bumpMap:B,normalMap:$,displacementMap:p&&P,emissiveMap:U,normalMapObjectSpace:$&&f.normalMapType===1,normalMapTangentSpace:$&&f.normalMapType===0,metalnessMap:b,roughnessMap:O,anisotropy:N,anisotropyMap:ye,clearcoat:se,clearcoatMap:Ue,clearcoatNormalMap:Pe,clearcoatRoughnessMap:je,dispersion:j,iridescence:ae,iridescenceMap:Ke,iridescenceThicknessMap:et,sheen:ue,sheenColorMap:Be,sheenRoughnessMap:it,specularMap:at,specularColorMap:mt,specularIntensityMap:Oe,transmission:oe,transmissionMap:rt,thicknessMap:ct,gradientMap:Ci,opaque:f.transparent===!1&&f.blending===1&&f.alphaToCoverage===!1,alphaMap:En,alphaTest:Ot,alphaHash:nn,combine:f.combine,mapUv:he&&v(f.map.channel),aoMapUv:R&&v(f.aoMap.channel),lightMapUv:S&&v(f.lightMap.channel),bumpMapUv:B&&v(f.bumpMap.channel),normalMapUv:$&&v(f.normalMap.channel),displacementMapUv:P&&v(f.displacementMap.channel),emissiveMapUv:U&&v(f.emissiveMap.channel),metalnessMapUv:b&&v(f.metalnessMap.channel),roughnessMapUv:O&&v(f.roughnessMap.channel),anisotropyMapUv:ye&&v(f.anisotropyMap.channel),clearcoatMapUv:Ue&&v(f.clearcoatMap.channel),clearcoatNormalMapUv:Pe&&v(f.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:je&&v(f.clearcoatRoughnessMap.channel),iridescenceMapUv:Ke&&v(f.iridescenceMap.channel),iridescenceThicknessMapUv:et&&v(f.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&v(f.sheenColorMap.channel),sheenRoughnessMapUv:it&&v(f.sheenRoughnessMap.channel),specularMapUv:at&&v(f.specularMap.channel),specularColorMapUv:mt&&v(f.specularColorMap.channel),specularIntensityMapUv:Oe&&v(f.specularIntensityMap.channel),transmissionMapUv:rt&&v(f.transmissionMap.channel),thicknessMapUv:ct&&v(f.thicknessMap.channel),alphaMapUv:En&&v(f.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&($||N),vertexColors:f.vertexColors,vertexAlphas:f.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:T.isPoints===!0&&!!C.attributes.uv&&(he||En),fog:!!w,useFog:f.fog===!0,fogExp2:!!w&&w.isFogExp2,flatShading:f.flatShading===!0,sizeAttenuation:f.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:u,skinning:T.isSkinnedMesh===!0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:Y,morphTextureStride:fe,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:f.dithering,shadowMapEnabled:r.shadowMap.enabled&&x.length>0,shadowMapType:r.shadowMap.type,toneMapping:z,decodeVideoTexture:he&&f.map.isVideoTexture===!0&&ut.getTransfer(f.map.colorSpace)===vt,premultipliedAlpha:f.premultipliedAlpha,doubleSided:f.side===2,flipSided:f.side===Ht,useDepthPacking:f.depthPacking>=0,depthPacking:f.depthPacking||0,index0AttributeName:f.index0AttributeName,extensionClipCullDistance:hn&&f.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(hn&&f.extensions.multiDraw===!0||le)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:f.customProgramCacheKey()};return Ln.vertexUv1s=c.has(1),Ln.vertexUv2s=c.has(2),Ln.vertexUv3s=c.has(3),c.clear(),Ln},getProgramCacheKey:function(f){let _=[];if(f.shaderID?_.push(f.shaderID):(_.push(f.customVertexShaderID),_.push(f.customFragmentShaderID)),f.defines!==void 0)for(let x in f.defines)_.push(x),_.push(f.defines[x]);return f.isRawShaderMaterial===!1&&(function(x,M){x.push(M.precision),x.push(M.outputColorSpace),x.push(M.envMapMode),x.push(M.envMapCubeUVHeight),x.push(M.mapUv),x.push(M.alphaMapUv),x.push(M.lightMapUv),x.push(M.aoMapUv),x.push(M.bumpMapUv),x.push(M.normalMapUv),x.push(M.displacementMapUv),x.push(M.emissiveMapUv),x.push(M.metalnessMapUv),x.push(M.roughnessMapUv),x.push(M.anisotropyMapUv),x.push(M.clearcoatMapUv),x.push(M.clearcoatNormalMapUv),x.push(M.clearcoatRoughnessMapUv),x.push(M.iridescenceMapUv),x.push(M.iridescenceThicknessMapUv),x.push(M.sheenColorMapUv),x.push(M.sheenRoughnessMapUv),x.push(M.specularMapUv),x.push(M.specularColorMapUv),x.push(M.specularIntensityMapUv),x.push(M.transmissionMapUv),x.push(M.thicknessMapUv),x.push(M.combine),x.push(M.fogExp2),x.push(M.sizeAttenuation),x.push(M.morphTargetsCount),x.push(M.morphAttributeCount),x.push(M.numDirLights),x.push(M.numPointLights),x.push(M.numSpotLights),x.push(M.numSpotLightMaps),x.push(M.numHemiLights),x.push(M.numRectAreaLights),x.push(M.numDirLightShadows),x.push(M.numPointLightShadows),x.push(M.numSpotLightShadows),x.push(M.numSpotLightShadowsWithMaps),x.push(M.numLightProbes),x.push(M.shadowMapType),x.push(M.toneMapping),x.push(M.numClippingPlanes),x.push(M.numClipIntersection),x.push(M.depthPacking)}(_,f),function(x,M){o.disableAll(),M.supportsVertexTextures&&o.enable(0),M.instancing&&o.enable(1),M.instancingColor&&o.enable(2),M.instancingMorph&&o.enable(3),M.matcap&&o.enable(4),M.envMap&&o.enable(5),M.normalMapObjectSpace&&o.enable(6),M.normalMapTangentSpace&&o.enable(7),M.clearcoat&&o.enable(8),M.iridescence&&o.enable(9),M.alphaTest&&o.enable(10),M.vertexColors&&o.enable(11),M.vertexAlphas&&o.enable(12),M.vertexUv1s&&o.enable(13),M.vertexUv2s&&o.enable(14),M.vertexUv3s&&o.enable(15),M.vertexTangents&&o.enable(16),M.anisotropy&&o.enable(17),M.alphaHash&&o.enable(18),M.batching&&o.enable(19),M.dispersion&&o.enable(20),M.batchingColor&&o.enable(21),x.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reverseDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.alphaToCoverage&&o.enable(20),x.push(o.mask)}(_,f),_.push(r.outputColorSpace)),_.push(f.customProgramCacheKey),_.join()},getUniforms:function(f){let _=y[f.type],x;if(_){let M=An[_];x=Uu.clone(M.uniforms)}else x=f.uniforms;return x},acquireProgram:function(f,_){let x;for(let M=0,T=h.length;M<T;M++){let w=h[M];if(w.cacheKey===_){x=w,++x.usedTimes;break}}return x===void 0&&(x=new jd(r,_,f,s),h.push(x)),x},releaseProgram:function(f){if(--f.usedTimes==0){let _=h.indexOf(f);h[_]=h[h.length-1],h.pop(),f.destroy()}},releaseShaderCache:function(f){l.remove(f)},programs:h,dispose:function(){l.dispose()}}}function Zd(){let r=new WeakMap;return{has:function(e){return r.has(e)},get:function(e){let t=r.get(e);return t===void 0&&(t={},r.set(e,t)),t},remove:function(e){r.delete(e)},update:function(e,t,n){r.get(e)[t]=n},dispose:function(){r=new WeakMap}}}function Jd(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function mh(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function gh(){let r=[],e=0,t=[],n=[],i=[];function s(a,o,l,c,h,d){let u=r[e];return u===void 0?(u={id:a.id,object:a,geometry:o,material:l,groupOrder:c,renderOrder:a.renderOrder,z:h,group:d},r[e]=u):(u.id=a.id,u.object=a,u.geometry=o,u.material=l,u.groupOrder=c,u.renderOrder=a.renderOrder,u.z=h,u.group=d),e++,u}return{opaque:t,transmissive:n,transparent:i,init:function(){e=0,t.length=0,n.length=0,i.length=0},push:function(a,o,l,c,h,d){let u=s(a,o,l,c,h,d);l.transmission>0?n.push(u):l.transparent===!0?i.push(u):t.push(u)},unshift:function(a,o,l,c,h,d){let u=s(a,o,l,c,h,d);l.transmission>0?n.unshift(u):l.transparent===!0?i.unshift(u):t.unshift(u)},finish:function(){for(let a=e,o=r.length;a<o;a++){let l=r[a];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}},sort:function(a,o){t.length>1&&t.sort(a||Jd),n.length>1&&n.sort(o||mh),i.length>1&&i.sort(o||mh)}}}function Kd(){let r=new WeakMap;return{get:function(e,t){let n=r.get(e),i;return n===void 0?(i=new gh,r.set(e,[i])):t>=n.length?(i=new gh,n.push(i)):i=n[t],i},dispose:function(){r=new WeakMap}}}function $d(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new E,color:new He};break;case"SpotLight":t={position:new E,direction:new E,color:new He,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new E,color:new He,distance:0,decay:0};break;case"HemisphereLight":t={direction:new E,skyColor:new He,groundColor:new He};break;case"RectAreaLight":t={color:new He,position:new E,halfWidth:new E,halfHeight:new E}}return r[e.id]=t,t}}}var Qd=0;function ep(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function tp(r){let e=new $d,t=function(){let o={};return{get:function(l){if(o[l.id]!==void 0)return o[l.id];let c;switch(l.type){case"DirectionalLight":case"SpotLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3}}return o[l.id]=c,c}}}(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)n.probe.push(new E);let i=new E,s=new Xe,a=new Xe;return{setup:function(o){let l=0,c=0,h=0;for(let C=0;C<9;C++)n.probe[C].set(0,0,0);let d=0,u=0,p=0,m=0,y=0,v=0,f=0,_=0,x=0,M=0,T=0;o.sort(ep);for(let C=0,G=o.length;C<G;C++){let F=o[C],q=F.color,H=F.intensity,k=F.distance,Y=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)l+=q.r*H,c+=q.g*H,h+=q.b*H;else if(F.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(F.sh.coefficients[X],H);T++}else if(F.isDirectionalLight){let X=e.get(F);if(X.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){let ee=F.shadow,te=t.get(F);te.shadowIntensity=ee.intensity,te.shadowBias=ee.bias,te.shadowNormalBias=ee.normalBias,te.shadowRadius=ee.radius,te.shadowMapSize=ee.mapSize,n.directionalShadow[d]=te,n.directionalShadowMap[d]=Y,n.directionalShadowMatrix[d]=F.shadow.matrix,v++}n.directional[d]=X,d++}else if(F.isSpotLight){let X=e.get(F);X.position.setFromMatrixPosition(F.matrixWorld),X.color.copy(q).multiplyScalar(H),X.distance=k,X.coneCos=Math.cos(F.angle),X.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),X.decay=F.decay,n.spot[p]=X;let ee=F.shadow;if(F.map&&(n.spotLightMap[x]=F.map,x++,ee.updateMatrices(F),F.castShadow&&M++),n.spotLightMatrix[p]=ee.matrix,F.castShadow){let te=t.get(F);te.shadowIntensity=ee.intensity,te.shadowBias=ee.bias,te.shadowNormalBias=ee.normalBias,te.shadowRadius=ee.radius,te.shadowMapSize=ee.mapSize,n.spotShadow[p]=te,n.spotShadowMap[p]=Y,_++}p++}else if(F.isRectAreaLight){let X=e.get(F);X.color.copy(q).multiplyScalar(H),X.halfWidth.set(.5*F.width,0,0),X.halfHeight.set(0,.5*F.height,0),n.rectArea[m]=X,m++}else if(F.isPointLight){let X=e.get(F);if(X.color.copy(F.color).multiplyScalar(F.intensity),X.distance=F.distance,X.decay=F.decay,F.castShadow){let ee=F.shadow,te=t.get(F);te.shadowIntensity=ee.intensity,te.shadowBias=ee.bias,te.shadowNormalBias=ee.normalBias,te.shadowRadius=ee.radius,te.shadowMapSize=ee.mapSize,te.shadowCameraNear=ee.camera.near,te.shadowCameraFar=ee.camera.far,n.pointShadow[u]=te,n.pointShadowMap[u]=Y,n.pointShadowMatrix[u]=F.shadow.matrix,f++}n.point[u]=X,u++}else if(F.isHemisphereLight){let X=e.get(F);X.skyColor.copy(F.color).multiplyScalar(H),X.groundColor.copy(F.groundColor).multiplyScalar(H),n.hemi[y]=X,y++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Me.LTC_FLOAT_1,n.rectAreaLTC2=Me.LTC_FLOAT_2):(n.rectAreaLTC1=Me.LTC_HALF_1,n.rectAreaLTC2=Me.LTC_HALF_2)),n.ambient[0]=l,n.ambient[1]=c,n.ambient[2]=h;let w=n.hash;w.directionalLength===d&&w.pointLength===u&&w.spotLength===p&&w.rectAreaLength===m&&w.hemiLength===y&&w.numDirectionalShadows===v&&w.numPointShadows===f&&w.numSpotShadows===_&&w.numSpotMaps===x&&w.numLightProbes===T||(n.directional.length=d,n.spot.length=p,n.rectArea.length=m,n.point.length=u,n.hemi.length=y,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.pointShadow.length=f,n.pointShadowMap.length=f,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=v,n.pointShadowMatrix.length=f,n.spotLightMatrix.length=_+x-M,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=M,n.numLightProbes=T,w.directionalLength=d,w.pointLength=u,w.spotLength=p,w.rectAreaLength=m,w.hemiLength=y,w.numDirectionalShadows=v,w.numPointShadows=f,w.numSpotShadows=_,w.numSpotMaps=x,w.numLightProbes=T,n.version=Qd++)},setupView:function(o,l){let c=0,h=0,d=0,u=0,p=0,m=l.matrixWorldInverse;for(let y=0,v=o.length;y<v;y++){let f=o[y];if(f.isDirectionalLight){let _=n.directional[c];_.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(m),c++}else if(f.isSpotLight){let _=n.spot[d];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(m),_.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(m),d++}else if(f.isRectAreaLight){let _=n.rectArea[u];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(m),a.identity(),s.copy(f.matrixWorld),s.premultiply(m),a.extractRotation(s),_.halfWidth.set(.5*f.width,0,0),_.halfHeight.set(0,.5*f.height,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),u++}else if(f.isPointLight){let _=n.point[h];_.position.setFromMatrixPosition(f.matrixWorld),_.position.applyMatrix4(m),h++}else if(f.isHemisphereLight){let _=n.hemi[p];_.direction.setFromMatrixPosition(f.matrixWorld),_.direction.transformDirection(m),p++}}},state:n}}function vh(r){let e=new tp(r),t=[],n=[],i={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:function(s){i.camera=s,t.length=0,n.length=0},state:i,setupLights:function(){e.setup(t)},setupLightsView:function(s){e.setupView(t,s)},pushLight:function(s){t.push(s)},pushShadow:function(s){n.push(s)}}}function np(r){let e=new WeakMap;return{get:function(t,n=0){let i=e.get(t),s;return i===void 0?(s=new vh(r),e.set(t,[s])):n>=i.length?(s=new vh(r),i.push(s)):s=i[n],s},dispose:function(){e=new WeakMap}}}var El=class extends ri{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},wl=class extends ri{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ip(r,e,t){let n=new ur,i=new pe,s=new pe,a=new dt,o=new El({depthPacking:3201}),l=new wl,c={},h=t.maxTextureSize,d={[xn]:Ht,[Ht]:xn,2:2},u=new In({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let m=new yt;m.setAttribute("position",new kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new ke(m,u),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Lh;let f=this.type;function _(w,C){let G=e.update(y);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Wn(i.x,i.y)),u.uniforms.shadow_pass.value=w.map.texture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,r.setRenderTarget(w.mapPass),r.clear(),r.renderBufferDirect(C,null,G,u,y,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,r.setRenderTarget(w.map),r.clear(),r.renderBufferDirect(C,null,G,p,y,null)}function x(w,C,G,F){let q=null,H=G.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(H!==void 0)q=H;else if(q=G.isPointLight===!0?l:o,r.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){let k=q.uuid,Y=C.uuid,X=c[k];X===void 0&&(X={},c[k]=X);let ee=X[Y];ee===void 0&&(ee=q.clone(),X[Y]=ee,C.addEventListener("dispose",T)),q=ee}return q.visible=C.visible,q.wireframe=C.wireframe,q.side=F===Hn?C.shadowSide!==null?C.shadowSide:C.side:C.shadowSide!==null?C.shadowSide:d[C.side],q.alphaMap=C.alphaMap,q.alphaTest=C.alphaTest,q.map=C.map,q.clipShadows=C.clipShadows,q.clippingPlanes=C.clippingPlanes,q.clipIntersection=C.clipIntersection,q.displacementMap=C.displacementMap,q.displacementScale=C.displacementScale,q.displacementBias=C.displacementBias,q.wireframeLinewidth=C.wireframeLinewidth,q.linewidth=C.linewidth,G.isPointLight===!0&&q.isMeshDistanceMaterial===!0&&(r.properties.get(q).light=G),q}function M(w,C,G,F,q){if(w.visible===!1)return;if(w.layers.test(C.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&q===Hn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,w.matrixWorld);let k=e.update(w),Y=w.material;if(Array.isArray(Y)){let X=k.groups;for(let ee=0,te=X.length;ee<te;ee++){let ne=X[ee],fe=Y[ne.materialIndex];if(fe&&fe.visible){let be=x(w,fe,F,q);w.onBeforeShadow(r,w,C,G,k,be,ne),r.renderBufferDirect(G,null,k,be,w,ne),w.onAfterShadow(r,w,C,G,k,be,ne)}}}else if(Y.visible){let X=x(w,Y,F,q);w.onBeforeShadow(r,w,C,G,k,X,null),r.renderBufferDirect(G,null,k,X,w,null),w.onAfterShadow(r,w,C,G,k,X,null)}}let H=w.children;for(let k=0,Y=H.length;k<Y;k++)M(H[k],C,G,F,q)}function T(w){w.target.removeEventListener("dispose",T);for(let C in c){let G=c[C],F=w.target.uuid;F in G&&(G[F].dispose(),delete G[F])}}this.render=function(w,C,G){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||w.length===0)return;let F=r.getRenderTarget(),q=r.getActiveCubeFace(),H=r.getActiveMipmapLevel(),k=r.state;k.setBlending(0),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let Y=f!==Hn&&this.type===Hn,X=f===Hn&&this.type!==Hn;for(let ee=0,te=w.length;ee<te;ee++){let ne=w[ee],fe=ne.shadow;if(fe===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(fe.autoUpdate===!1&&fe.needsUpdate===!1)continue;i.copy(fe.mapSize);let be=fe.getFrameExtents();if(i.multiply(be),s.copy(fe.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/be.x),i.x=s.x*be.x,fe.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/be.y),i.y=s.y*be.y,fe.mapSize.y=s.y)),fe.map===null||Y===!0||X===!0){let le=this.type!==Hn?{minFilter:an,magFilter:an}:{};fe.map!==null&&fe.map.dispose(),fe.map=new Wn(i.x,i.y,le),fe.map.texture.name=ne.name+".shadowMap",fe.camera.updateProjectionMatrix()}r.setRenderTarget(fe.map),r.clear();let Ne=fe.getViewportCount();for(let le=0;le<Ne;le++){let he=fe.getViewport(le);a.set(s.x*he.x,s.y*he.y,s.x*he.z,s.y*he.w),k.viewport(a),fe.updateMatrices(ne,le),n=fe.getFrustum(),M(C,G,fe.camera,ne,this.type)}fe.isPointLightShadow!==!0&&this.type===Hn&&_(fe,G),fe.needsUpdate=!1}f=this.type,v.needsUpdate=!1,r.setRenderTarget(F,q,H)}}var rp={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function sp(r){let e=new function(){let b=!1,O=new dt,N=null,se=new dt(0,0,0,0);return{setMask:function(j){N===j||b||(r.colorMask(j,j,j,j),N=j)},setLocked:function(j){b=j},setClear:function(j,ae,ue,oe,ye){ye===!0&&(j*=oe,ae*=oe,ue*=oe),O.set(j,ae,ue,oe),se.equals(O)===!1&&(r.clearColor(j,ae,ue,oe),se.copy(O))},reset:function(){b=!1,N=null,se.set(-1,0,0,0)}}},t=new function(){let b=!1,O=!1,N=null,se=null,j=null;return{setReversed:function(ae){O=ae},setTest:function(ae){ae?Ae(r.DEPTH_TEST):Re(r.DEPTH_TEST)},setMask:function(ae){N===ae||b||(r.depthMask(ae),N=ae)},setFunc:function(ae){if(O&&(ae=rp[ae]),se!==ae){switch(ae){case 0:r.depthFunc(r.NEVER);break;case 1:r.depthFunc(r.ALWAYS);break;case 2:r.depthFunc(r.LESS);break;case 3:default:r.depthFunc(r.LEQUAL);break;case 4:r.depthFunc(r.EQUAL);break;case 5:r.depthFunc(r.GEQUAL);break;case 6:r.depthFunc(r.GREATER);break;case 7:r.depthFunc(r.NOTEQUAL)}se=ae}},setLocked:function(ae){b=ae},setClear:function(ae){j!==ae&&(r.clearDepth(ae),j=ae)},reset:function(){b=!1,N=null,se=null,j=null}}},n=new function(){let b=!1,O=null,N=null,se=null,j=null,ae=null,ue=null,oe=null,ye=null;return{setTest:function(Ue){b||(Ue?Ae(r.STENCIL_TEST):Re(r.STENCIL_TEST))},setMask:function(Ue){O===Ue||b||(r.stencilMask(Ue),O=Ue)},setFunc:function(Ue,Pe,je){N===Ue&&se===Pe&&j===je||(r.stencilFunc(Ue,Pe,je),N=Ue,se=Pe,j=je)},setOp:function(Ue,Pe,je){ae===Ue&&ue===Pe&&oe===je||(r.stencilOp(Ue,Pe,je),ae=Ue,ue=Pe,oe=je)},setLocked:function(Ue){b=Ue},setClear:function(Ue){ye!==Ue&&(r.clearStencil(Ue),ye=Ue)},reset:function(){b=!1,O=null,N=null,se=null,j=null,ae=null,ue=null,oe=null,ye=null}}},i=new WeakMap,s=new WeakMap,a={},o={},l=new WeakMap,c=[],h=null,d=!1,u=null,p=null,m=null,y=null,v=null,f=null,_=null,x=new He(0,0,0),M=0,T=!1,w=null,C=null,G=null,F=null,q=null,H=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,Y=0,X=r.getParameter(r.VERSION);X.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(X)[1]),k=Y>=1):X.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),k=Y>=2);let ee=null,te={},ne=r.getParameter(r.SCISSOR_BOX),fe=r.getParameter(r.VIEWPORT),be=new dt().fromArray(ne),Ne=new dt().fromArray(fe);function le(b,O,N,se){let j=new Uint8Array(4),ae=r.createTexture();r.bindTexture(b,ae),r.texParameteri(b,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(b,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ue=0;ue<N;ue++)b===r.TEXTURE_3D||b===r.TEXTURE_2D_ARRAY?r.texImage3D(O,0,r.RGBA,1,1,se,0,r.RGBA,r.UNSIGNED_BYTE,j):r.texImage2D(O+ue,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,j);return ae}let he={};function Ae(b){a[b]!==!0&&(r.enable(b),a[b]=!0)}function Re(b){a[b]!==!1&&(r.disable(b),a[b]=!1)}he[r.TEXTURE_2D]=le(r.TEXTURE_2D,r.TEXTURE_2D,1),he[r.TEXTURE_CUBE_MAP]=le(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),he[r.TEXTURE_2D_ARRAY]=le(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),he[r.TEXTURE_3D]=le(r.TEXTURE_3D,r.TEXTURE_3D,1,1),e.setClear(0,0,0,1),t.setClear(1),n.setClear(0),Ae(r.DEPTH_TEST),t.setFunc(3),$(!1),P(1),Ae(r.CULL_FACE),B(0);let R={[Mi]:r.FUNC_ADD,101:r.FUNC_SUBTRACT,102:r.FUNC_REVERSE_SUBTRACT};R[103]=r.MIN,R[104]=r.MAX;let S={200:r.ZERO,201:r.ONE,202:r.SRC_COLOR,[Uo]:r.SRC_ALPHA,210:r.SRC_ALPHA_SATURATE,208:r.DST_COLOR,206:r.DST_ALPHA,203:r.ONE_MINUS_SRC_COLOR,[Do]:r.ONE_MINUS_SRC_ALPHA,209:r.ONE_MINUS_DST_COLOR,207:r.ONE_MINUS_DST_ALPHA,211:r.CONSTANT_COLOR,212:r.ONE_MINUS_CONSTANT_COLOR,213:r.CONSTANT_ALPHA,214:r.ONE_MINUS_CONSTANT_ALPHA};function B(b,O,N,se,j,ae,ue,oe,ye,Ue){if(b!==0){if(d===!1&&(Ae(r.BLEND),d=!0),b===5)j=j||O,ae=ae||N,ue=ue||se,O===p&&j===v||(r.blendEquationSeparate(R[O],R[j]),p=O,v=j),N===m&&se===y&&ae===f&&ue===_||(r.blendFuncSeparate(S[N],S[se],S[ae],S[ue]),m=N,y=se,f=ae,_=ue),oe.equals(x)!==!1&&ye===M||(r.blendColor(oe.r,oe.g,oe.b,ye),x.copy(oe),M=ye),u=b,T=!1;else if(b!==u||Ue!==T){if(p===Mi&&v===Mi||(r.blendEquation(r.FUNC_ADD),p=Mi,v=Mi),Ue)switch(b){case 1:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.ONE,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",b)}else switch(b){case 1:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",b)}m=null,y=null,f=null,_=null,x.set(0,0,0),M=0,u=b,T=Ue}}else d===!0&&(Re(r.BLEND),d=!1)}function $(b){w!==b&&(b?r.frontFace(r.CW):r.frontFace(r.CCW),w=b)}function P(b){b!==0?(Ae(r.CULL_FACE),b!==C&&(b===1?r.cullFace(r.BACK):b===2?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Re(r.CULL_FACE),C=b}function U(b,O,N){b?(Ae(r.POLYGON_OFFSET_FILL),F===O&&q===N||(r.polygonOffset(O,N),F=O,q=N)):Re(r.POLYGON_OFFSET_FILL)}return{buffers:{color:e,depth:t,stencil:n},enable:Ae,disable:Re,bindFramebuffer:function(b,O){return o[b]!==O&&(r.bindFramebuffer(b,O),o[b]=O,b===r.DRAW_FRAMEBUFFER&&(o[r.FRAMEBUFFER]=O),b===r.FRAMEBUFFER&&(o[r.DRAW_FRAMEBUFFER]=O),!0)},drawBuffers:function(b,O){let N=c,se=!1;if(b){N=l.get(O),N===void 0&&(N=[],l.set(O,N));let j=b.textures;if(N.length!==j.length||N[0]!==r.COLOR_ATTACHMENT0){for(let ae=0,ue=j.length;ae<ue;ae++)N[ae]=r.COLOR_ATTACHMENT0+ae;N.length=j.length,se=!0}}else N[0]!==r.BACK&&(N[0]=r.BACK,se=!0);se&&r.drawBuffers(N)},useProgram:function(b){return h!==b&&(r.useProgram(b),h=b,!0)},setBlending:B,setMaterial:function(b,O){b.side===2?Re(r.CULL_FACE):Ae(r.CULL_FACE);let N=b.side===Ht;O&&(N=!N),$(N),b.blending===1&&b.transparent===!1?B(0):B(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.blendColor,b.blendAlpha,b.premultipliedAlpha),t.setFunc(b.depthFunc),t.setTest(b.depthTest),t.setMask(b.depthWrite),e.setMask(b.colorWrite);let se=b.stencilWrite;n.setTest(se),se&&(n.setMask(b.stencilWriteMask),n.setFunc(b.stencilFunc,b.stencilRef,b.stencilFuncMask),n.setOp(b.stencilFail,b.stencilZFail,b.stencilZPass)),U(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits),b.alphaToCoverage===!0?Ae(r.SAMPLE_ALPHA_TO_COVERAGE):Re(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:$,setCullFace:P,setLineWidth:function(b){b!==G&&(k&&r.lineWidth(b),G=b)},setPolygonOffset:U,setScissorTest:function(b){b?Ae(r.SCISSOR_TEST):Re(r.SCISSOR_TEST)},activeTexture:function(b){b===void 0&&(b=r.TEXTURE0+H-1),ee!==b&&(r.activeTexture(b),ee=b)},bindTexture:function(b,O,N){N===void 0&&(N=ee===null?r.TEXTURE0+H-1:ee);let se=te[N];se===void 0&&(se={type:void 0,texture:void 0},te[N]=se),se.type===b&&se.texture===O||(ee!==N&&(r.activeTexture(N),ee=N),r.bindTexture(b,O||he[b]),se.type=b,se.texture=O)},unbindTexture:function(){let b=te[ee];b!==void 0&&b.type!==void 0&&(r.bindTexture(b.type,null),b.type=void 0,b.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},compressedTexImage3D:function(){try{r.compressedTexImage3D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},texImage2D:function(){try{r.texImage2D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},texImage3D:function(){try{r.texImage3D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},updateUBOMapping:function(b,O){let N=s.get(O);N===void 0&&(N=new WeakMap,s.set(O,N));let se=N.get(b);se===void 0&&(se=r.getUniformBlockIndex(O,b.name),N.set(b,se))},uniformBlockBinding:function(b,O){let N=s.get(O).get(b);i.get(O)!==N&&(r.uniformBlockBinding(O,N,b.__bindingPointIndex),i.set(O,N))},texStorage2D:function(){try{r.texStorage2D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},texStorage3D:function(){try{r.texStorage3D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},texSubImage2D:function(){try{r.texSubImage2D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},texSubImage3D:function(){try{r.texSubImage3D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(b){console.error("THREE.WebGLState:",b)}},scissor:function(b){be.equals(b)===!1&&(r.scissor(b.x,b.y,b.z,b.w),be.copy(b))},viewport:function(b){Ne.equals(b)===!1&&(r.viewport(b.x,b.y,b.z,b.w),Ne.copy(b))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),a={},ee=null,te={},o={},l=new WeakMap,c=[],h=null,d=!1,u=null,p=null,m=null,y=null,v=null,f=null,_=null,x=new He(0,0,0),M=0,T=!1,w=null,C=null,G=null,F=null,q=null,be.set(0,0,r.canvas.width,r.canvas.height),Ne.set(0,0,r.canvas.width,r.canvas.height),e.reset(),t.reset(),n.reset()}}}function _h(r,e,t,n){let i=function(s){switch(s){case Vn:case Nh:return{byteLength:1,components:1};case jr:case Oh:case us:return{byteLength:2,components:1};case oc:case lc:return{byteLength:2,components:4};case Ei:case ac:case Cn:return{byteLength:4,components:1};case Fh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}(n);switch(t){case Bh:case Hh:return r*e;case kh:return r*e*2;case cc:case hc:return r*e/i.components*i.byteLength;case Gh:case uc:return r*e*2/i.components*i.byteLength;case zh:return r*e*3/i.components*i.byteLength;case vn:case dc:return r*e*4/i.components*i.byteLength;case Qs:case ea:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case ta:case na:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case zo:case ko:return Math.max(r,16)*Math.max(e,8)/4;case Bo:case Ho:return Math.max(r,8)*Math.max(e,8)/2;case Go:case Vo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Wo:case Xo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case jo:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case qo:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Yo:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Zo:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Jo:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Ko:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case $o:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Qo:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case el:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case tl:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case nl:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case il:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case rl:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case ia:case sl:case al:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Vh:case ol:return Math.ceil(r/4)*Math.ceil(e/4)*8;case ll:case cl:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ap(r,e,t,n,i,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),c=new pe,h=new WeakMap,d,u=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(R,S){return p?new OffscreenCanvas(R,S):ha("canvas")}function y(R,S,B){let $=1,P=Re(R);if((P.width>B||P.height>B)&&($=B/Math.max(P.width,P.height)),$<1){if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let U=Math.floor($*P.width),b=Math.floor($*P.height);d===void 0&&(d=m(U,b));let O=S?m(U,b):d;return O.width=U,O.height=b,O.getContext("2d").drawImage(R,0,0,U,b),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+P.width+"x"+P.height+") to ("+U+"x"+b+")."),O}return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+P.width+"x"+P.height+")."),R}return R}function v(R){return R.generateMipmaps&&R.minFilter!==an&&R.minFilter!==Rn}function f(R){r.generateMipmap(R)}function _(R,S,B,$,P=!1){if(R!==null){if(r[R]!==void 0)return r[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let U=S;if(S===r.RED&&(B===r.FLOAT&&(U=r.R32F),B===r.HALF_FLOAT&&(U=r.R16F),B===r.UNSIGNED_BYTE&&(U=r.R8)),S===r.RED_INTEGER&&(B===r.UNSIGNED_BYTE&&(U=r.R8UI),B===r.UNSIGNED_SHORT&&(U=r.R16UI),B===r.UNSIGNED_INT&&(U=r.R32UI),B===r.BYTE&&(U=r.R8I),B===r.SHORT&&(U=r.R16I),B===r.INT&&(U=r.R32I)),S===r.RG&&(B===r.FLOAT&&(U=r.RG32F),B===r.HALF_FLOAT&&(U=r.RG16F),B===r.UNSIGNED_BYTE&&(U=r.RG8)),S===r.RG_INTEGER&&(B===r.UNSIGNED_BYTE&&(U=r.RG8UI),B===r.UNSIGNED_SHORT&&(U=r.RG16UI),B===r.UNSIGNED_INT&&(U=r.RG32UI),B===r.BYTE&&(U=r.RG8I),B===r.SHORT&&(U=r.RG16I),B===r.INT&&(U=r.RG32I)),S===r.RGB_INTEGER&&(B===r.UNSIGNED_BYTE&&(U=r.RGB8UI),B===r.UNSIGNED_SHORT&&(U=r.RGB16UI),B===r.UNSIGNED_INT&&(U=r.RGB32UI),B===r.BYTE&&(U=r.RGB8I),B===r.SHORT&&(U=r.RGB16I),B===r.INT&&(U=r.RGB32I)),S===r.RGBA_INTEGER&&(B===r.UNSIGNED_BYTE&&(U=r.RGBA8UI),B===r.UNSIGNED_SHORT&&(U=r.RGBA16UI),B===r.UNSIGNED_INT&&(U=r.RGBA32UI),B===r.BYTE&&(U=r.RGBA8I),B===r.SHORT&&(U=r.RGBA16I),B===r.INT&&(U=r.RGBA32I)),S===r.RGB&&B===r.UNSIGNED_INT_5_9_9_9_REV&&(U=r.RGB9_E5),S===r.RGBA){let b=P?aa:ut.getTransfer($);B===r.FLOAT&&(U=r.RGBA32F),B===r.HALF_FLOAT&&(U=r.RGBA16F),B===r.UNSIGNED_BYTE&&(U=b===vt?r.SRGB8_ALPHA8:r.RGBA8),B===r.UNSIGNED_SHORT_4_4_4_4&&(U=r.RGBA4),B===r.UNSIGNED_SHORT_5_5_5_1&&(U=r.RGB5_A1)}return U!==r.R16F&&U!==r.R32F&&U!==r.RG16F&&U!==r.RG32F&&U!==r.RGBA16F&&U!==r.RGBA32F||e.get("EXT_color_buffer_float"),U}function x(R,S){let B;return R?S===null||S===Ei||S===ar?B=r.DEPTH24_STENCIL8:S===Cn?B=r.DEPTH32F_STENCIL8:S===jr&&(B=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Ei||S===ar?B=r.DEPTH_COMPONENT24:S===Cn?B=r.DEPTH_COMPONENT32F:S===jr&&(B=r.DEPTH_COMPONENT16),B}function M(R,S){return v(R)===!0||R.isFramebufferTexture&&R.minFilter!==an&&R.minFilter!==Rn?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function T(R){let S=R.target;S.removeEventListener("dispose",T),function(B){let $=n.get(B);if($.__webglInit===void 0)return;let P=B.source,U=u.get(P);if(U){let b=U[$.__cacheKey];b.usedTimes--,b.usedTimes===0&&C(B),Object.keys(U).length===0&&u.delete(P)}n.remove(B)}(S),S.isVideoTexture&&h.delete(S)}function w(R){let S=R.target;S.removeEventListener("dispose",w),function(B){let $=n.get(B);if(B.depthTexture&&B.depthTexture.dispose(),B.isWebGLCubeRenderTarget)for(let U=0;U<6;U++){if(Array.isArray($.__webglFramebuffer[U]))for(let b=0;b<$.__webglFramebuffer[U].length;b++)r.deleteFramebuffer($.__webglFramebuffer[U][b]);else r.deleteFramebuffer($.__webglFramebuffer[U]);$.__webglDepthbuffer&&r.deleteRenderbuffer($.__webglDepthbuffer[U])}else{if(Array.isArray($.__webglFramebuffer))for(let U=0;U<$.__webglFramebuffer.length;U++)r.deleteFramebuffer($.__webglFramebuffer[U]);else r.deleteFramebuffer($.__webglFramebuffer);if($.__webglDepthbuffer&&r.deleteRenderbuffer($.__webglDepthbuffer),$.__webglMultisampledFramebuffer&&r.deleteFramebuffer($.__webglMultisampledFramebuffer),$.__webglColorRenderbuffer)for(let U=0;U<$.__webglColorRenderbuffer.length;U++)$.__webglColorRenderbuffer[U]&&r.deleteRenderbuffer($.__webglColorRenderbuffer[U]);$.__webglDepthRenderbuffer&&r.deleteRenderbuffer($.__webglDepthRenderbuffer)}let P=B.textures;for(let U=0,b=P.length;U<b;U++){let O=n.get(P[U]);O.__webglTexture&&(r.deleteTexture(O.__webglTexture),a.memory.textures--),n.remove(P[U])}n.remove(B)}(S)}function C(R){let S=n.get(R);r.deleteTexture(S.__webglTexture);let B=R.source;delete u.get(B)[S.__cacheKey],a.memory.textures--}let G=0;function F(R,S){let B=n.get(R);if(R.isVideoTexture&&function($){let P=a.render.frame;h.get($)!==P&&(h.set($,P),$.update())}(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){let $=R.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else{if($.complete!==!1)return void ee(B,R,S);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete")}}t.bindTexture(r.TEXTURE_2D,B.__webglTexture,r.TEXTURE0+S)}let q={[ni]:r.REPEAT,[Xr]:r.CLAMP_TO_EDGE,[Fo]:r.MIRRORED_REPEAT},H={[an]:r.NEAREST,[_u]:r.NEAREST_MIPMAP_NEAREST,[Ms]:r.NEAREST_MIPMAP_LINEAR,[Rn]:r.LINEAR,[Ya]:r.LINEAR_MIPMAP_NEAREST,[Qi]:r.LINEAR_MIPMAP_LINEAR},k={512:r.NEVER,519:r.ALWAYS,513:r.LESS,[Wh]:r.LEQUAL,514:r.EQUAL,518:r.GEQUAL,516:r.GREATER,517:r.NOTEQUAL};function Y(R,S){if(S.type!==Cn||e.has("OES_texture_float_linear")!==!1||S.magFilter!==Rn&&S.magFilter!==Ya&&S.magFilter!==Ms&&S.magFilter!==Qi&&S.minFilter!==Rn&&S.minFilter!==Ya&&S.minFilter!==Ms&&S.minFilter!==Qi||console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(R,r.TEXTURE_WRAP_S,q[S.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,q[S.wrapT]),R!==r.TEXTURE_3D&&R!==r.TEXTURE_2D_ARRAY||r.texParameteri(R,r.TEXTURE_WRAP_R,q[S.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,H[S.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,H[S.minFilter]),S.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,k[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===an||S.minFilter!==Ms&&S.minFilter!==Qi||S.type===Cn&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");r.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function X(R,S){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",T));let $=S.source,P=u.get($);P===void 0&&(P={},u.set($,P));let U=function(b){let O=[];return O.push(b.wrapS),O.push(b.wrapT),O.push(b.wrapR||0),O.push(b.magFilter),O.push(b.minFilter),O.push(b.anisotropy),O.push(b.internalFormat),O.push(b.format),O.push(b.type),O.push(b.generateMipmaps),O.push(b.premultiplyAlpha),O.push(b.flipY),O.push(b.unpackAlignment),O.push(b.colorSpace),O.join()}(S);if(U!==R.__cacheKey){P[U]===void 0&&(P[U]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,B=!0),P[U].usedTimes++;let b=P[R.__cacheKey];b!==void 0&&(P[R.__cacheKey].usedTimes--,b.usedTimes===0&&C(S)),R.__cacheKey=U,R.__webglTexture=P[U].texture}return B}function ee(R,S,B){let $=r.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&($=r.TEXTURE_2D_ARRAY),S.isData3DTexture&&($=r.TEXTURE_3D);let P=X(R,S),U=S.source;t.bindTexture($,R.__webglTexture,r.TEXTURE0+B);let b=n.get(U);if(U.version!==b.__version||P===!0){t.activeTexture(r.TEXTURE0+B);let O=ut.getPrimaries(ut.workingColorSpace),N=S.colorSpace===$i?null:ut.getPrimaries(S.colorSpace),se=S.colorSpace===$i||O===N?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,se);let j=y(S.image,!1,i.maxTextureSize);j=Ae(S,j);let ae=s.convert(S.format,S.colorSpace),ue=s.convert(S.type),oe,ye=_(S.internalFormat,ae,ue,S.colorSpace,S.isVideoTexture);Y($,S);let Ue=S.mipmaps,Pe=S.isVideoTexture!==!0,je=b.__version===void 0||P===!0,Ke=U.dataReady,et=M(S,j);if(S.isDepthTexture)ye=x(S.format===or,S.type),je&&(Pe?t.texStorage2D(r.TEXTURE_2D,1,ye,j.width,j.height):t.texImage2D(r.TEXTURE_2D,0,ye,j.width,j.height,0,ae,ue,null));else if(S.isDataTexture)if(Ue.length>0){Pe&&je&&t.texStorage2D(r.TEXTURE_2D,et,ye,Ue[0].width,Ue[0].height);for(let Be=0,it=Ue.length;Be<it;Be++)oe=Ue[Be],Pe?Ke&&t.texSubImage2D(r.TEXTURE_2D,Be,0,0,oe.width,oe.height,ae,ue,oe.data):t.texImage2D(r.TEXTURE_2D,Be,ye,oe.width,oe.height,0,ae,ue,oe.data);S.generateMipmaps=!1}else Pe?(je&&t.texStorage2D(r.TEXTURE_2D,et,ye,j.width,j.height),Ke&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,j.width,j.height,ae,ue,j.data)):t.texImage2D(r.TEXTURE_2D,0,ye,j.width,j.height,0,ae,ue,j.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Pe&&je&&t.texStorage3D(r.TEXTURE_2D_ARRAY,et,ye,Ue[0].width,Ue[0].height,j.depth);for(let Be=0,it=Ue.length;Be<it;Be++)if(oe=Ue[Be],S.format!==vn)if(ae!==null)if(Pe){if(Ke)if(S.layerUpdates.size>0){let at=_h(oe.width,oe.height,S.format,S.type);for(let mt of S.layerUpdates){let Oe=oe.data.subarray(mt*at/oe.data.BYTES_PER_ELEMENT,(mt+1)*at/oe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Be,0,0,mt,oe.width,oe.height,1,ae,Oe,0,0)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Be,0,0,0,oe.width,oe.height,j.depth,ae,oe.data,0,0)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Be,ye,oe.width,oe.height,j.depth,0,oe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Pe?Ke&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,Be,0,0,0,oe.width,oe.height,j.depth,ae,ue,oe.data):t.texImage3D(r.TEXTURE_2D_ARRAY,Be,ye,oe.width,oe.height,j.depth,0,ae,ue,oe.data)}else{Pe&&je&&t.texStorage2D(r.TEXTURE_2D,et,ye,Ue[0].width,Ue[0].height);for(let Be=0,it=Ue.length;Be<it;Be++)oe=Ue[Be],S.format!==vn?ae!==null?Pe?Ke&&t.compressedTexSubImage2D(r.TEXTURE_2D,Be,0,0,oe.width,oe.height,ae,oe.data):t.compressedTexImage2D(r.TEXTURE_2D,Be,ye,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pe?Ke&&t.texSubImage2D(r.TEXTURE_2D,Be,0,0,oe.width,oe.height,ae,ue,oe.data):t.texImage2D(r.TEXTURE_2D,Be,ye,oe.width,oe.height,0,ae,ue,oe.data)}else if(S.isDataArrayTexture)if(Pe){if(je&&t.texStorage3D(r.TEXTURE_2D_ARRAY,et,ye,j.width,j.height,j.depth),Ke)if(S.layerUpdates.size>0){let Be=_h(j.width,j.height,S.format,S.type);for(let it of S.layerUpdates){let at=j.data.subarray(it*Be/j.data.BYTES_PER_ELEMENT,(it+1)*Be/j.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,it,j.width,j.height,1,ae,ue,at)}S.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ae,ue,j.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,ye,j.width,j.height,j.depth,0,ae,ue,j.data);else if(S.isData3DTexture)Pe?(je&&t.texStorage3D(r.TEXTURE_3D,et,ye,j.width,j.height,j.depth),Ke&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ae,ue,j.data)):t.texImage3D(r.TEXTURE_3D,0,ye,j.width,j.height,j.depth,0,ae,ue,j.data);else if(S.isFramebufferTexture){if(je)if(Pe)t.texStorage2D(r.TEXTURE_2D,et,ye,j.width,j.height);else{let Be=j.width,it=j.height;for(let at=0;at<et;at++)t.texImage2D(r.TEXTURE_2D,at,ye,Be,it,0,ae,ue,null),Be>>=1,it>>=1}}else if(Ue.length>0){if(Pe&&je){let Be=Re(Ue[0]);t.texStorage2D(r.TEXTURE_2D,et,ye,Be.width,Be.height)}for(let Be=0,it=Ue.length;Be<it;Be++)oe=Ue[Be],Pe?Ke&&t.texSubImage2D(r.TEXTURE_2D,Be,0,0,ae,ue,oe):t.texImage2D(r.TEXTURE_2D,Be,ye,ae,ue,oe);S.generateMipmaps=!1}else if(Pe){if(je){let Be=Re(j);t.texStorage2D(r.TEXTURE_2D,et,ye,Be.width,Be.height)}Ke&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ae,ue,j)}else t.texImage2D(r.TEXTURE_2D,0,ye,ae,ue,j);v(S)&&f($),b.__version=U.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function te(R,S,B,$,P,U){let b=s.convert(B.format,B.colorSpace),O=s.convert(B.type),N=_(B.internalFormat,b,O,B.colorSpace);if(!n.get(S).__hasExternalTextures){let se=Math.max(1,S.width>>U),j=Math.max(1,S.height>>U);P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY?t.texImage3D(P,U,N,se,j,S.depth,0,b,O,null):t.texImage2D(P,U,N,se,j,0,b,O,null)}t.bindFramebuffer(r.FRAMEBUFFER,R),he(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,$,P,n.get(B).__webglTexture,0,le(S)):(P===r.TEXTURE_2D||P>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&P<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,$,P,n.get(B).__webglTexture,U),t.bindFramebuffer(r.FRAMEBUFFER,null)}function ne(R,S,B){if(r.bindRenderbuffer(r.RENDERBUFFER,R),S.depthBuffer){let $=S.depthTexture,P=$&&$.isDepthTexture?$.type:null,U=x(S.stencilBuffer,P),b=S.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,O=le(S);he(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,O,U,S.width,S.height):B?r.renderbufferStorageMultisample(r.RENDERBUFFER,O,U,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,U,S.width,S.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,b,r.RENDERBUFFER,R)}else{let $=S.textures;for(let P=0;P<$.length;P++){let U=$[P],b=s.convert(U.format,U.colorSpace),O=s.convert(U.type),N=_(U.internalFormat,b,O,U.colorSpace),se=le(S);B&&he(S)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,se,N,S.width,S.height):he(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,se,N,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,N,S.width,S.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function fe(R){let S=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){let $=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),$){let P=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,$.removeEventListener("dispose",P)};$.addEventListener("dispose",P),S.__depthDisposeCallback=P}S.__boundDepthTexture=$}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");(function($,P){if(P&&P.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,$),!P.depthTexture||!P.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");n.get(P.depthTexture).__webglTexture&&P.depthTexture.image.width===P.width&&P.depthTexture.image.height===P.height||(P.depthTexture.image.width=P.width,P.depthTexture.image.height=P.height,P.depthTexture.needsUpdate=!0),F(P.depthTexture,0);let U=n.get(P.depthTexture).__webglTexture,b=le(P);if(P.depthTexture.format===qr)he(P)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,U,0,b):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,U,0);else{if(P.depthTexture.format!==or)throw new Error("Unknown depthTexture format");he(P)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,U,0,b):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,U,0)}})(S.__webglFramebuffer,R)}else if(B){S.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[$]),S.__webglDepthbuffer[$]===void 0)S.__webglDepthbuffer[$]=r.createRenderbuffer(),ne(S.__webglDepthbuffer[$],R,!1);else{let P=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,U=S.__webglDepthbuffer[$];r.bindRenderbuffer(r.RENDERBUFFER,U),r.framebufferRenderbuffer(r.FRAMEBUFFER,P,r.RENDERBUFFER,U)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=r.createRenderbuffer(),ne(S.__webglDepthbuffer,R,!1);else{let $=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,P=S.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,P),r.framebufferRenderbuffer(r.FRAMEBUFFER,$,r.RENDERBUFFER,P)}t.bindFramebuffer(r.FRAMEBUFFER,null)}let be=[],Ne=[];function le(R){return Math.min(i.maxSamples,R.samples)}function he(R){let S=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ae(R,S){let B=R.colorSpace,$=R.format,P=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==ai&&B!==$i&&(ut.getTransfer(B)===vt?$===vn&&P===Vn||console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),S}function Re(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=function(){let R=G;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),G+=1,R},this.resetTextureUnits=function(){G=0},this.setTexture2D=F,this.setTexture2DArray=function(R,S){let B=n.get(R);R.version>0&&B.__version!==R.version?ee(B,R,S):t.bindTexture(r.TEXTURE_2D_ARRAY,B.__webglTexture,r.TEXTURE0+S)},this.setTexture3D=function(R,S){let B=n.get(R);R.version>0&&B.__version!==R.version?ee(B,R,S):t.bindTexture(r.TEXTURE_3D,B.__webglTexture,r.TEXTURE0+S)},this.setTextureCube=function(R,S){let B=n.get(R);R.version>0&&B.__version!==R.version?function($,P,U){if(P.image.length!==6)return;let b=X($,P),O=P.source;t.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture,r.TEXTURE0+U);let N=n.get(O);if(O.version!==N.__version||b===!0){t.activeTexture(r.TEXTURE0+U);let se=ut.getPrimaries(ut.workingColorSpace),j=P.colorSpace===$i?null:ut.getPrimaries(P.colorSpace),ae=P.colorSpace===$i||se===j?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,P.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,P.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);let ue=P.isCompressedTexture||P.image[0].isCompressedTexture,oe=P.image[0]&&P.image[0].isDataTexture,ye=[];for(let Oe=0;Oe<6;Oe++)ye[Oe]=ue||oe?oe?P.image[Oe].image:P.image[Oe]:y(P.image[Oe],!0,i.maxCubemapSize),ye[Oe]=Ae(P,ye[Oe]);let Ue=ye[0],Pe=s.convert(P.format,P.colorSpace),je=s.convert(P.type),Ke=_(P.internalFormat,Pe,je,P.colorSpace),et=P.isVideoTexture!==!0,Be=N.__version===void 0||b===!0,it=O.dataReady,at,mt=M(P,Ue);if(Y(r.TEXTURE_CUBE_MAP,P),ue){et&&Be&&t.texStorage2D(r.TEXTURE_CUBE_MAP,mt,Ke,Ue.width,Ue.height);for(let Oe=0;Oe<6;Oe++){at=ye[Oe].mipmaps;for(let rt=0;rt<at.length;rt++){let ct=at[rt];P.format!==vn?Pe!==null?et?it&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt,0,0,ct.width,ct.height,Pe,ct.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt,Ke,ct.width,ct.height,0,ct.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):et?it&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt,0,0,ct.width,ct.height,Pe,je,ct.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt,Ke,ct.width,ct.height,0,Pe,je,ct.data)}}}else{if(at=P.mipmaps,et&&Be){at.length>0&&mt++;let Oe=Re(ye[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,mt,Ke,Oe.width,Oe.height)}for(let Oe=0;Oe<6;Oe++)if(oe){et?it&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,0,0,ye[Oe].width,ye[Oe].height,Pe,je,ye[Oe].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,Ke,ye[Oe].width,ye[Oe].height,0,Pe,je,ye[Oe].data);for(let rt=0;rt<at.length;rt++){let ct=at[rt].image[Oe].image;et?it&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt+1,0,0,ct.width,ct.height,Pe,je,ct.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt+1,Ke,ct.width,ct.height,0,Pe,je,ct.data)}}else{et?it&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,0,0,Pe,je,ye[Oe]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,Ke,Pe,je,ye[Oe]);for(let rt=0;rt<at.length;rt++){let ct=at[rt];et?it&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt+1,0,0,Pe,je,ct.image[Oe]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,rt+1,Ke,Pe,je,ct.image[Oe])}}}v(P)&&f(r.TEXTURE_CUBE_MAP),N.__version=O.version,P.onUpdate&&P.onUpdate(P)}$.__version=P.version}(B,R,S):t.bindTexture(r.TEXTURE_CUBE_MAP,B.__webglTexture,r.TEXTURE0+S)},this.rebindTextures=function(R,S,B){let $=n.get(R);S!==void 0&&te($.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),B!==void 0&&fe(R)},this.setupRenderTarget=function(R){let S=R.texture,B=n.get(R),$=n.get(S);R.addEventListener("dispose",w);let P=R.textures,U=R.isWebGLCubeRenderTarget===!0,b=P.length>1;if(b||($.__webglTexture===void 0&&($.__webglTexture=r.createTexture()),$.__version=S.version,a.memory.textures++),U){B.__webglFramebuffer=[];for(let O=0;O<6;O++)if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer[O]=[];for(let N=0;N<S.mipmaps.length;N++)B.__webglFramebuffer[O][N]=r.createFramebuffer()}else B.__webglFramebuffer[O]=r.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer=[];for(let O=0;O<S.mipmaps.length;O++)B.__webglFramebuffer[O]=r.createFramebuffer()}else B.__webglFramebuffer=r.createFramebuffer();if(b)for(let O=0,N=P.length;O<N;O++){let se=n.get(P[O]);se.__webglTexture===void 0&&(se.__webglTexture=r.createTexture(),a.memory.textures++)}if(R.samples>0&&he(R)===!1){B.__webglMultisampledFramebuffer=r.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let O=0;O<P.length;O++){let N=P[O];B.__webglColorRenderbuffer[O]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,B.__webglColorRenderbuffer[O]);let se=s.convert(N.format,N.colorSpace),j=s.convert(N.type),ae=_(N.internalFormat,se,j,N.colorSpace,R.isXRRenderTarget===!0),ue=le(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,ue,ae,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+O,r.RENDERBUFFER,B.__webglColorRenderbuffer[O])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=r.createRenderbuffer(),ne(B.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(U){t.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture),Y(r.TEXTURE_CUBE_MAP,S);for(let O=0;O<6;O++)if(S.mipmaps&&S.mipmaps.length>0)for(let N=0;N<S.mipmaps.length;N++)te(B.__webglFramebuffer[O][N],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+O,N);else te(B.__webglFramebuffer[O],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+O,0);v(S)&&f(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(b){for(let O=0,N=P.length;O<N;O++){let se=P[O],j=n.get(se);t.bindTexture(r.TEXTURE_2D,j.__webglTexture),Y(r.TEXTURE_2D,se),te(B.__webglFramebuffer,R,se,r.COLOR_ATTACHMENT0+O,r.TEXTURE_2D,0),v(se)&&f(r.TEXTURE_2D)}t.unbindTexture()}else{let O=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(O=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(O,$.__webglTexture),Y(O,S),S.mipmaps&&S.mipmaps.length>0)for(let N=0;N<S.mipmaps.length;N++)te(B.__webglFramebuffer[N],R,S,r.COLOR_ATTACHMENT0,O,N);else te(B.__webglFramebuffer,R,S,r.COLOR_ATTACHMENT0,O,0);v(S)&&f(O),t.unbindTexture()}R.depthBuffer&&fe(R)},this.updateRenderTargetMipmap=function(R){let S=R.textures;for(let B=0,$=S.length;B<$;B++){let P=S[B];if(v(P)){let U=R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,b=n.get(P).__webglTexture;t.bindTexture(U,b),f(U),t.unbindTexture()}}},this.updateMultisampleRenderTarget=function(R){if(R.samples>0){if(he(R)===!1){let S=R.textures,B=R.width,$=R.height,P=r.COLOR_BUFFER_BIT,U=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,b=n.get(R),O=S.length>1;if(O)for(let N=0;N<S.length;N++)t.bindFramebuffer(r.FRAMEBUFFER,b.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+N,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+N,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,b.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,b.__webglFramebuffer);for(let N=0;N<S.length;N++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(P|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(P|=r.STENCIL_BUFFER_BIT)),O){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,b.__webglColorRenderbuffer[N]);let se=n.get(S[N]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,se,0)}r.blitFramebuffer(0,0,B,$,0,0,B,$,P,r.NEAREST),l===!0&&(be.length=0,Ne.length=0,be.push(r.COLOR_ATTACHMENT0+N),R.depthBuffer&&R.resolveDepthBuffer===!1&&(be.push(U),Ne.push(U),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Ne)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,be))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),O)for(let N=0;N<S.length;N++){t.bindFramebuffer(r.FRAMEBUFFER,b.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+N,r.RENDERBUFFER,b.__webglColorRenderbuffer[N]);let se=n.get(S[N]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+N,r.TEXTURE_2D,se,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,b.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let S=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[S])}}},this.setupDepthRenderbuffer=fe,this.setupFrameBufferTexture=te,this.useMultisampledRTT=he}function op(r,e){return{convert:function(t,n=""){let i,s=ut.getTransfer(n);if(t===Vn)return r.UNSIGNED_BYTE;if(t===oc)return r.UNSIGNED_SHORT_4_4_4_4;if(t===lc)return r.UNSIGNED_SHORT_5_5_5_1;if(t===Fh)return r.UNSIGNED_INT_5_9_9_9_REV;if(t===Nh)return r.BYTE;if(t===Oh)return r.SHORT;if(t===jr)return r.UNSIGNED_SHORT;if(t===ac)return r.INT;if(t===Ei)return r.UNSIGNED_INT;if(t===Cn)return r.FLOAT;if(t===us)return r.HALF_FLOAT;if(t===Bh)return r.ALPHA;if(t===zh)return r.RGB;if(t===vn)return r.RGBA;if(t===Hh)return r.LUMINANCE;if(t===kh)return r.LUMINANCE_ALPHA;if(t===qr)return r.DEPTH_COMPONENT;if(t===or)return r.DEPTH_STENCIL;if(t===cc)return r.RED;if(t===hc)return r.RED_INTEGER;if(t===Gh)return r.RG;if(t===uc)return r.RG_INTEGER;if(t===dc)return r.RGBA_INTEGER;if(t===Qs||t===ea||t===ta||t===na)if(s===vt){if(i=e.get("WEBGL_compressed_texture_s3tc_srgb"),i===null)return null;if(t===Qs)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(t===ea)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(t===ta)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(t===na)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(i=e.get("WEBGL_compressed_texture_s3tc"),i===null)return null;if(t===Qs)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(t===ea)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(t===ta)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(t===na)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(t===Bo||t===zo||t===Ho||t===ko){if(i=e.get("WEBGL_compressed_texture_pvrtc"),i===null)return null;if(t===Bo)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(t===zo)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(t===Ho)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(t===ko)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(t===Go||t===Vo||t===Wo){if(i=e.get("WEBGL_compressed_texture_etc"),i===null)return null;if(t===Go||t===Vo)return s===vt?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(t===Wo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}if(t===Xo||t===jo||t===qo||t===Yo||t===Zo||t===Jo||t===Ko||t===$o||t===Qo||t===el||t===tl||t===nl||t===il||t===rl){if(i=e.get("WEBGL_compressed_texture_astc"),i===null)return null;if(t===Xo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(t===jo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(t===qo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(t===Yo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(t===Zo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(t===Jo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(t===Ko)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(t===$o)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(t===Qo)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(t===el)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(t===tl)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(t===nl)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(t===il)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(t===rl)return s===vt?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}if(t===ia||t===sl||t===al){if(i=e.get("EXT_texture_compression_bptc"),i===null)return null;if(t===ia)return s===vt?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(t===sl)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(t===al)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(t===Vh||t===ol||t===ll||t===cl){if(i=e.get("EXT_texture_compression_rgtc"),i===null)return null;if(t===ia)return i.COMPRESSED_RED_RGTC1_EXT;if(t===ol)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(t===ll)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(t===cl)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return t===ar?r.UNSIGNED_INT_24_8:r[t]!==void 0?r[t]:null}}}var Tl=class extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},St=class extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},lp={type:"move"},Gr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new St,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new St,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new E,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new E),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new St,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new E,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new E),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let v=t.getJointPose(y,n),f=this._getHandJoint(c,y);v!==null&&(f.matrix.fromArray(v.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=v.radius),f.visible=v!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,m=.005;c.inputState.pinching&&u>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(lp)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new St;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Al=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let i=new Yt;e.properties.get(i).__webglTexture=t.texture,t.depthNear==n.depthNear&&t.depthFar==n.depthFar||(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new In({vertexShader:`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fragmentShader:`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ke(new qt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Rl=class extends ii{constructor(e,t){super();let n=this,i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,m=null,y=new Al,v=t.getContextAttributes(),f=null,_=null,x=[],M=[],T=new pe,w=null,C=new zt;C.layers.enable(1),C.viewport=new dt;let G=new zt;G.layers.enable(2),G.viewport=new dt;let F=[C,G],q=new Tl;q.layers.enable(1),q.layers.enable(2);let H=null,k=null;function Y(le){let he=M.indexOf(le.inputSource);if(he===-1)return;let Ae=x[he];Ae!==void 0&&(Ae.update(le.inputSource,le.frame,c||a),Ae.dispatchEvent({type:le.type,data:le.inputSource}))}function X(){i.removeEventListener("select",Y),i.removeEventListener("selectstart",Y),i.removeEventListener("selectend",Y),i.removeEventListener("squeeze",Y),i.removeEventListener("squeezestart",Y),i.removeEventListener("squeezeend",Y),i.removeEventListener("end",X),i.removeEventListener("inputsourceschange",ee);for(let le=0;le<x.length;le++){let he=M[le];he!==null&&(M[le]=null,x[le].disconnect(he))}H=null,k=null,y.reset(),e.setRenderTarget(f),p=null,u=null,d=null,i=null,_=null,Ne.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}function ee(le){for(let he=0;he<le.removed.length;he++){let Ae=le.removed[he],Re=M.indexOf(Ae);Re>=0&&(M[Re]=null,x[Re].disconnect(Ae))}for(let he=0;he<le.added.length;he++){let Ae=le.added[he],Re=M.indexOf(Ae);if(Re===-1){for(let S=0;S<x.length;S++){if(S>=M.length){M.push(Ae),Re=S;break}if(M[S]===null){M[S]=Ae,Re=S;break}}if(Re===-1)break}let R=x[Re];R&&R.connect(Ae)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(le){let he=x[le];return he===void 0&&(he=new Gr,x[le]=he),he.getTargetRaySpace()},this.getControllerGrip=function(le){let he=x[le];return he===void 0&&(he=new Gr,x[le]=he),he.getGripSpace()},this.getHand=function(le){let he=x[le];return he===void 0&&(he=new Gr,x[le]=he),he.getHandSpace()},this.setFramebufferScaleFactor=function(le){s=le,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(le){o=le,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(le){c=le},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(le){if(i=le,i!==null){if(f=e.getRenderTarget(),i.addEventListener("select",Y),i.addEventListener("selectstart",Y),i.addEventListener("selectend",Y),i.addEventListener("squeeze",Y),i.addEventListener("squeezestart",Y),i.addEventListener("squeezeend",Y),i.addEventListener("end",X),i.addEventListener("inputsourceschange",ee),v.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(T),i.renderState.layers===void 0){let he={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(i,t,he),i.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),_=new Wn(p.framebufferWidth,p.framebufferHeight,{format:vn,type:Vn,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil})}else{let he=null,Ae=null,Re=null;v.depth&&(Re=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=v.stencil?or:qr,Ae=v.stencil?ar:Ei);let R={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:s};d=new XRWebGLBinding(i,t),u=d.createProjectionLayer(R),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),_=new Wn(u.textureWidth,u.textureHeight,{format:vn,type:Vn,depthTexture:new _a(u.textureWidth,u.textureHeight,Ae,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Ne.setContext(i),Ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};let te=new E,ne=new E;function fe(le,he){he===null?le.matrixWorld.copy(le.matrix):le.matrixWorld.multiplyMatrices(he.matrixWorld,le.matrix),le.matrixWorldInverse.copy(le.matrixWorld).invert()}this.updateCamera=function(le){if(i===null)return;let he=le.near,Ae=le.far;y.texture!==null&&(y.depthNear>0&&(he=y.depthNear),y.depthFar>0&&(Ae=y.depthFar)),q.near=G.near=C.near=he,q.far=G.far=C.far=Ae,H===q.near&&k===q.far||(i.updateRenderState({depthNear:q.near,depthFar:q.far}),H=q.near,k=q.far);let Re=le.parent,R=q.cameras;fe(q,Re);for(let S=0;S<R.length;S++)fe(R[S],Re);R.length===2?function(S,B,$){te.setFromMatrixPosition(B.matrixWorld),ne.setFromMatrixPosition($.matrixWorld);let P=te.distanceTo(ne),U=B.projectionMatrix.elements,b=$.projectionMatrix.elements,O=U[14]/(U[10]-1),N=U[14]/(U[10]+1),se=(U[9]+1)/U[5],j=(U[9]-1)/U[5],ae=(U[8]-1)/U[0],ue=(b[8]+1)/b[0],oe=O*ae,ye=O*ue,Ue=P/(-ae+ue),Pe=Ue*-ae;if(B.matrixWorld.decompose(S.position,S.quaternion,S.scale),S.translateX(Pe),S.translateZ(Ue),S.matrixWorld.compose(S.position,S.quaternion,S.scale),S.matrixWorldInverse.copy(S.matrixWorld).invert(),U[10]===-1)S.projectionMatrix.copy(B.projectionMatrix),S.projectionMatrixInverse.copy(B.projectionMatrixInverse);else{let je=O+Ue,Ke=N+Ue,et=oe-Pe,Be=ye+(P-Pe),it=se*N/Ke*je,at=j*N/Ke*je;S.projectionMatrix.makePerspective(et,Be,it,at,je,Ke),S.projectionMatrixInverse.copy(S.projectionMatrix).invert()}}(q,C,G):q.projectionMatrix.copy(C.projectionMatrix),function(S,B,$){$===null?S.matrix.copy(B.matrixWorld):(S.matrix.copy($.matrixWorld),S.matrix.invert(),S.matrix.multiply(B.matrixWorld)),S.matrix.decompose(S.position,S.quaternion,S.scale),S.updateMatrixWorld(!0),S.projectionMatrix.copy(B.projectionMatrix),S.projectionMatrixInverse.copy(B.projectionMatrixInverse),S.isPerspectiveCamera&&(S.fov=2*Yr*Math.atan(1/S.projectionMatrix.elements[5]),S.zoom=1)}(le,q,Re)},this.getCamera=function(){return q},this.getFoveation=function(){if(u!==null||p!==null)return l},this.setFoveation=function(le){l=le,u!==null&&(u.fixedFoveation=le),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=le)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(q)};let be=null,Ne=new Yh;Ne.setAnimationLoop(function(le,he){if(h=he.getViewerPose(c||a),m=he,h!==null){let Ae=h.views;p!==null&&(e.setRenderTargetFramebuffer(_,p.framebuffer),e.setRenderTarget(_));let Re=!1;Ae.length!==q.cameras.length&&(q.cameras.length=0,Re=!0);for(let S=0;S<Ae.length;S++){let B=Ae[S],$=null;if(p!==null)$=p.getViewport(B);else{let U=d.getViewSubImage(u,B);$=U.viewport,S===0&&(e.setRenderTargetTextures(_,U.colorTexture,u.ignoreDepthValues?void 0:U.depthStencilTexture),e.setRenderTarget(_))}let P=F[S];P===void 0&&(P=new zt,P.layers.enable(S),P.viewport=new dt,F[S]=P),P.matrix.fromArray(B.transform.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale),P.projectionMatrix.fromArray(B.projectionMatrix),P.projectionMatrixInverse.copy(P.projectionMatrix).invert(),P.viewport.set($.x,$.y,$.width,$.height),S===0&&(q.matrix.copy(P.matrix),q.matrix.decompose(q.position,q.quaternion,q.scale)),Re===!0&&q.cameras.push(P)}let R=i.enabledFeatures;if(R&&R.includes("depth-sensing")){let S=d.getDepthInformation(Ae[0]);S&&S.isValid&&S.texture&&y.init(e,S,i.renderState)}}for(let Ae=0;Ae<x.length;Ae++){let Re=M[Ae],R=x[Ae];Re!==null&&R!==void 0&&R.update(Re,he,c||a)}be&&be(le,he),he.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:he}),m=null}),this.setAnimationLoop=function(le){be=le},this.dispose=function(){}}},xi=new Qt,cp=new Xe;function hp(r,e){function t(i,s){i.matrixAutoUpdate===!0&&i.updateMatrix(),s.value.copy(i.matrix)}function n(i,s){i.opacity.value=s.opacity,s.color&&i.diffuse.value.copy(s.color),s.emissive&&i.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(i.map.value=s.map,t(s.map,i.mapTransform)),s.alphaMap&&(i.alphaMap.value=s.alphaMap,t(s.alphaMap,i.alphaMapTransform)),s.bumpMap&&(i.bumpMap.value=s.bumpMap,t(s.bumpMap,i.bumpMapTransform),i.bumpScale.value=s.bumpScale,s.side===Ht&&(i.bumpScale.value*=-1)),s.normalMap&&(i.normalMap.value=s.normalMap,t(s.normalMap,i.normalMapTransform),i.normalScale.value.copy(s.normalScale),s.side===Ht&&i.normalScale.value.negate()),s.displacementMap&&(i.displacementMap.value=s.displacementMap,t(s.displacementMap,i.displacementMapTransform),i.displacementScale.value=s.displacementScale,i.displacementBias.value=s.displacementBias),s.emissiveMap&&(i.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,i.emissiveMapTransform)),s.specularMap&&(i.specularMap.value=s.specularMap,t(s.specularMap,i.specularMapTransform)),s.alphaTest>0&&(i.alphaTest.value=s.alphaTest);let a=e.get(s),o=a.envMap,l=a.envMapRotation;o&&(i.envMap.value=o,xi.copy(l),xi.x*=-1,xi.y*=-1,xi.z*=-1,o.isCubeTexture&&o.isRenderTargetTexture===!1&&(xi.y*=-1,xi.z*=-1),i.envMapRotation.value.setFromMatrix4(cp.makeRotationFromEuler(xi)),i.flipEnvMap.value=o.isCubeTexture&&o.isRenderTargetTexture===!1?-1:1,i.reflectivity.value=s.reflectivity,i.ior.value=s.ior,i.refractionRatio.value=s.refractionRatio),s.lightMap&&(i.lightMap.value=s.lightMap,i.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,i.lightMapTransform)),s.aoMap&&(i.aoMap.value=s.aoMap,i.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,i.aoMapTransform))}return{refreshFogUniforms:function(i,s){s.color.getRGB(i.fogColor.value,qh(r)),s.isFog?(i.fogNear.value=s.near,i.fogFar.value=s.far):s.isFogExp2&&(i.fogDensity.value=s.density)},refreshMaterialUniforms:function(i,s,a,o,l){s.isMeshBasicMaterial||s.isMeshLambertMaterial?n(i,s):s.isMeshToonMaterial?(n(i,s),function(c,h){h.gradientMap&&(c.gradientMap.value=h.gradientMap)}(i,s)):s.isMeshPhongMaterial?(n(i,s),function(c,h){c.specular.value.copy(h.specular),c.shininess.value=Math.max(h.shininess,1e-4)}(i,s)):s.isMeshStandardMaterial?(n(i,s),function(c,h){c.metalness.value=h.metalness,h.metalnessMap&&(c.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,c.metalnessMapTransform)),c.roughness.value=h.roughness,h.roughnessMap&&(c.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,c.roughnessMapTransform)),h.envMap&&(c.envMapIntensity.value=h.envMapIntensity)}(i,s),s.isMeshPhysicalMaterial&&function(c,h,d){c.ior.value=h.ior,h.sheen>0&&(c.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),c.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(c.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,c.sheenColorMapTransform)),h.sheenRoughnessMap&&(c.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,c.sheenRoughnessMapTransform))),h.clearcoat>0&&(c.clearcoat.value=h.clearcoat,c.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(c.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,c.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(c.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Ht&&c.clearcoatNormalScale.value.negate())),h.dispersion>0&&(c.dispersion.value=h.dispersion),h.iridescence>0&&(c.iridescence.value=h.iridescence,c.iridescenceIOR.value=h.iridescenceIOR,c.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(c.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,c.iridescenceMapTransform)),h.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),h.transmission>0&&(c.transmission.value=h.transmission,c.transmissionSamplerMap.value=d.texture,c.transmissionSamplerSize.value.set(d.width,d.height),h.transmissionMap&&(c.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,c.transmissionMapTransform)),c.thickness.value=h.thickness,h.thicknessMap&&(c.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=h.attenuationDistance,c.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(c.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(c.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=h.specularIntensity,c.specularColor.value.copy(h.specularColor),h.specularColorMap&&(c.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,c.specularColorMapTransform)),h.specularIntensityMap&&(c.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,c.specularIntensityMapTransform))}(i,s,l)):s.isMeshMatcapMaterial?(n(i,s),function(c,h){h.matcap&&(c.matcap.value=h.matcap)}(i,s)):s.isMeshDepthMaterial?n(i,s):s.isMeshDistanceMaterial?(n(i,s),function(c,h){let d=e.get(h).light;c.referencePosition.value.setFromMatrixPosition(d.matrixWorld),c.nearDistance.value=d.shadow.camera.near,c.farDistance.value=d.shadow.camera.far}(i,s)):s.isMeshNormalMaterial?n(i,s):s.isLineBasicMaterial?(function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform))}(i,s),s.isLineDashedMaterial&&function(c,h){c.dashSize.value=h.dashSize,c.totalSize.value=h.dashSize+h.gapSize,c.scale.value=h.scale}(i,s)):s.isPointsMaterial?function(c,h,d,u){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.size.value=h.size*d,c.scale.value=.5*u,h.map&&(c.map.value=h.map,t(h.map,c.uvTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)}(i,s,a,o):s.isSpriteMaterial?function(c,h){c.diffuse.value.copy(h.color),c.opacity.value=h.opacity,c.rotation.value=h.rotation,h.map&&(c.map.value=h.map,t(h.map,c.mapTransform)),h.alphaMap&&(c.alphaMap.value=h.alphaMap,t(h.alphaMap,c.alphaMapTransform)),h.alphaTest>0&&(c.alphaTest.value=h.alphaTest)}(i,s):s.isShadowMaterial?(i.color.value.copy(s.color),i.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}}}function up(r,e,t,n){let i={},s={},a=[],o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(d,u,p,m){let y=d.value,v=u+"_"+p;if(m[v]===void 0)return m[v]=typeof y=="number"||typeof y=="boolean"?y:y.clone(),!0;{let f=m[v];if(typeof y=="number"||typeof y=="boolean"){if(f!==y)return m[v]=y,!0}else if(f.equals(y)===!1)return f.copy(y),!0}return!1}function c(d){let u={boundary:0,storage:0};return typeof d=="number"||typeof d=="boolean"?(u.boundary=4,u.storage=4):d.isVector2?(u.boundary=8,u.storage=8):d.isVector3||d.isColor?(u.boundary=16,u.storage=12):d.isVector4?(u.boundary=16,u.storage=16):d.isMatrix3?(u.boundary=48,u.storage=48):d.isMatrix4?(u.boundary=64,u.storage=64):d.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",d),u}function h(d){let u=d.target;u.removeEventListener("dispose",h);let p=a.indexOf(u.__bindingPointIndex);a.splice(p,1),r.deleteBuffer(i[u.id]),delete i[u.id],delete s[u.id]}return{bind:function(d,u){let p=u.program;n.uniformBlockBinding(d,p)},update:function(d,u){let p=i[d.id];p===void 0&&(function(v){let f=v.uniforms,_=0,x=16;for(let T=0,w=f.length;T<w;T++){let C=Array.isArray(f[T])?f[T]:[f[T]];for(let G=0,F=C.length;G<F;G++){let q=C[G],H=Array.isArray(q.value)?q.value:[q.value];for(let k=0,Y=H.length;k<Y;k++){let X=c(H[k]),ee=_%x,te=ee%X.boundary,ne=ee+te;_+=te,ne!==0&&x-ne<X.storage&&(_+=x-ne),q.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=_,_+=X.storage}}}let M=_%x;M>0&&(_+=x-M),v.__size=_,v.__cache={}}(d),p=function(v){let f=function(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}();v.__bindingPointIndex=f;let _=r.createBuffer(),x=v.__size,M=v.usage;return r.bindBuffer(r.UNIFORM_BUFFER,_),r.bufferData(r.UNIFORM_BUFFER,x,M),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,f,_),_}(d),i[d.id]=p,d.addEventListener("dispose",h));let m=u.program;n.updateUBOMapping(d,m);let y=e.render.frame;s[d.id]!==y&&(function(v){let f=i[v.id],_=v.uniforms,x=v.__cache;r.bindBuffer(r.UNIFORM_BUFFER,f);for(let M=0,T=_.length;M<T;M++){let w=Array.isArray(_[M])?_[M]:[_[M]];for(let C=0,G=w.length;C<G;C++){let F=w[C];if(l(F,M,C,x)===!0){let q=F.__offset,H=Array.isArray(F.value)?F.value:[F.value],k=0;for(let Y=0;Y<H.length;Y++){let X=H[Y],ee=c(X);typeof X=="number"||typeof X=="boolean"?(F.__data[0]=X,r.bufferSubData(r.UNIFORM_BUFFER,q+k,F.__data)):X.isMatrix3?(F.__data[0]=X.elements[0],F.__data[1]=X.elements[1],F.__data[2]=X.elements[2],F.__data[3]=0,F.__data[4]=X.elements[3],F.__data[5]=X.elements[4],F.__data[6]=X.elements[5],F.__data[7]=0,F.__data[8]=X.elements[6],F.__data[9]=X.elements[7],F.__data[10]=X.elements[8],F.__data[11]=0):(X.toArray(F.__data,k),k+=ee.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,q,F.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}(d),s[d.id]=y)},dispose:function(){for(let d in i)r.deleteBuffer(i[d]);a=[],i={},s={}}}}var xa=class{constructor(e={}){let{canvas:t=xu(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1}=e,u;if(this.isWebGLRenderer=!0,n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=n.getContextAttributes().alpha}else u=a;let p=new Uint32Array(4),m=new Int32Array(4),y=null,v=null,f=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=$t,this.toneMapping=ei,this.toneMappingExposure=1;let x=this,M=!1,T=0,w=0,C=null,G=-1,F=null,q=new dt,H=new dt,k=null,Y=new He(0),X=0,ee=t.width,te=t.height,ne=1,fe=null,be=null,Ne=new dt(0,0,ee,te),le=new dt(0,0,ee,te),he=!1,Ae=new ur,Re=!1,R=!1,S=new Xe,B=new Xe,$=new E,P=new dt,U={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},b=!1;function O(){return C===null?ne:1}let N,se,j,ae,ue,oe,ye,Ue,Pe,je,Ke,et,Be,it,at,mt,Oe,rt,ct,Ci,En,Ot,nn,hn,z=n;function Ln(g,A){return t.getContext(g,A)}try{let g={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Lo}`),t.addEventListener("webglcontextlost",Pi,!1),t.addEventListener("webglcontextrestored",li,!1),t.addEventListener("webglcontextcreationerror",un,!1),z===null){let A="webgl2";if(z=Ln(A,g),z===null)throw Ln(A)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(g){throw console.error("THREE.WebGLRenderer: "+g.message),g}function rn(){N=new Xu(z),N.init(),Ot=new op(z,N),se=new ku(z,N,e,Ot),j=new sp(z),se.reverseDepthBuffer&&j.buffers.depth.setReversed(!0),ae=new Yu(z),ue=new Zd,oe=new ap(z,N,j,ue,se,Ot,ae),ye=new Vu(x),Ue=new Wu(x),Pe=new Ou(z),nn=new zu(z,Pe),je=new ju(z,Pe,ae,nn),Ke=new Ju(z,je,Pe,ae),ct=new Zu(z,se,oe),mt=new Gu(ue),et=new Yd(x,ye,Ue,N,se,nn,mt),Be=new hp(x,ue),it=new Kd,at=new np(N),rt=new Bu(x,ye,Ue,j,Ke,u,l),Oe=new ip(x,Ke,se),hn=new up(z,ae,se,j),Ci=new Hu(z,N,ae),En=new qu(z,N,ae),ae.programs=et.programs,x.capabilities=se,x.extensions=N,x.properties=ue,x.renderLists=it,x.shadowMap=Oe,x.state=j,x.info=ae}rn();let tt=new Rl(x,z);function Pi(g){g.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function li(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let g=ae.autoReset,A=Oe.enabled,L=Oe.autoUpdate,D=Oe.needsUpdate,I=Oe.type;rn(),ae.autoReset=g,Oe.enabled=A,Oe.autoUpdate=L,Oe.needsUpdate=D,Oe.type=I}function un(g){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",g.statusMessage)}function Ii(g){let A=g.target;A.removeEventListener("dispose",Ii),function(L){(function(D){let I=ue.get(D).programs;I!==void 0&&(I.forEach(function(V){et.releaseProgram(V)}),D.isShaderMaterial&&et.releaseShaderCache(D))})(L),ue.remove(L)}(A)}function Er(g,A,L){g.transparent===!0&&g.side===2&&g.forceSinglePass===!1?(g.side=Ht,g.needsUpdate=!0,Ui(g,A,L),g.side=xn,g.needsUpdate=!0,Ui(g,A,L),g.side=2):Ui(g,A,L)}this.xr=tt,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let g=N.get("WEBGL_lose_context");g&&g.loseContext()},this.forceContextRestore=function(){let g=N.get("WEBGL_lose_context");g&&g.restoreContext()},this.getPixelRatio=function(){return ne},this.setPixelRatio=function(g){g!==void 0&&(ne=g,this.setSize(ee,te,!1))},this.getSize=function(g){return g.set(ee,te)},this.setSize=function(g,A,L=!0){tt.isPresenting?console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting."):(ee=g,te=A,t.width=Math.floor(g*ne),t.height=Math.floor(A*ne),L===!0&&(t.style.width=g+"px",t.style.height=A+"px"),this.setViewport(0,0,g,A))},this.getDrawingBufferSize=function(g){return g.set(ee*ne,te*ne).floor()},this.setDrawingBufferSize=function(g,A,L){ee=g,te=A,ne=L,t.width=Math.floor(g*L),t.height=Math.floor(A*L),this.setViewport(0,0,g,A)},this.getCurrentViewport=function(g){return g.copy(q)},this.getViewport=function(g){return g.copy(Ne)},this.setViewport=function(g,A,L,D){g.isVector4?Ne.set(g.x,g.y,g.z,g.w):Ne.set(g,A,L,D),j.viewport(q.copy(Ne).multiplyScalar(ne).round())},this.getScissor=function(g){return g.copy(le)},this.setScissor=function(g,A,L,D){g.isVector4?le.set(g.x,g.y,g.z,g.w):le.set(g,A,L,D),j.scissor(H.copy(le).multiplyScalar(ne).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(g){j.setScissorTest(he=g)},this.setOpaqueSort=function(g){fe=g},this.setTransparentSort=function(g){be=g},this.getClearColor=function(g){return g.copy(rt.getClearColor())},this.setClearColor=function(){rt.setClearColor.apply(rt,arguments)},this.getClearAlpha=function(){return rt.getClearAlpha()},this.setClearAlpha=function(){rt.setClearAlpha.apply(rt,arguments)},this.clear=function(g=!0,A=!0,L=!0){let D=0;if(g){let I=!1;if(C!==null){let V=C.texture.format;I=V===dc||V===uc||V===hc}if(I){let V=C.texture.type,K=V===Vn||V===Ei||V===jr||V===ar||V===oc||V===lc,Z=rt.getClearColor(),Q=rt.getClearAlpha(),de=Z.r,re=Z.g,xe=Z.b;K?(p[0]=de,p[1]=re,p[2]=xe,p[3]=Q,z.clearBufferuiv(z.COLOR,0,p)):(m[0]=de,m[1]=re,m[2]=xe,m[3]=Q,z.clearBufferiv(z.COLOR,0,m))}else D|=z.COLOR_BUFFER_BIT}A&&(D|=z.DEPTH_BUFFER_BIT,z.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),L&&(D|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(D)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Pi,!1),t.removeEventListener("webglcontextrestored",li,!1),t.removeEventListener("webglcontextcreationerror",un,!1),it.dispose(),at.dispose(),ue.dispose(),ye.dispose(),Ue.dispose(),Ke.dispose(),nn.dispose(),hn.dispose(),et.dispose(),tt.dispose(),tt.removeEventListener("sessionstart",wr),tt.removeEventListener("sessionend",Nt),wn.stop()},this.renderBufferDirect=function(g,A,L,D,I,V){A===null&&(A=U);let K=I.isMesh&&I.matrixWorld.determinant()<0,Z=function(Ve,Ee,ot,Ge,Fe){Ee.isScene!==!0&&(Ee=U),oe.resetTextureUnits();let Et=Ee.fog,Wt=Ge.isMeshStandardMaterial?Ee.environment:null,Un=C===null?x.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:ai,Zt=(Ge.isMeshStandardMaterial?Ue:ye).get(Ge.envMap||Wt),ys=Ge.vertexColors===!0&&!!ot.attributes.color&&ot.attributes.color.itemSize===4,Xn=!!ot.attributes.tangent&&(!!Ge.normalMap||Ge.anisotropy>0),Ar=!!ot.morphAttributes.position,dn=!!ot.morphAttributes.normal,ui=!!ot.morphAttributes.color,jn=ei;Ge.toneMapped&&(C!==null&&C.isXRRenderTarget!==!0||(jn=x.toneMapping));let di=ot.morphAttributes.position||ot.morphAttributes.normal||ot.morphAttributes.color,qn=di!==void 0?di.length:0,Ze=ue.get(Ge),Dn=v.state.lights;if(Re===!0&&(R===!0||Ve!==F)){let we=Ve===F&&Ge.id===G;mt.setState(Ge,Ve,we)}let Ie=!1;Ge.version===Ze.__version?Ze.needsLights&&Ze.lightsStateVersion!==Dn.state.version||Ze.outputColorSpace!==Un||Fe.isBatchedMesh&&Ze.batching===!1?Ie=!0:Fe.isBatchedMesh||Ze.batching!==!0?Fe.isBatchedMesh&&Ze.batchingColor===!0&&Fe.colorTexture===null||Fe.isBatchedMesh&&Ze.batchingColor===!1&&Fe.colorTexture!==null||Fe.isInstancedMesh&&Ze.instancing===!1?Ie=!0:Fe.isInstancedMesh||Ze.instancing!==!0?Fe.isSkinnedMesh&&Ze.skinning===!1?Ie=!0:Fe.isSkinnedMesh||Ze.skinning!==!0?Fe.isInstancedMesh&&Ze.instancingColor===!0&&Fe.instanceColor===null||Fe.isInstancedMesh&&Ze.instancingColor===!1&&Fe.instanceColor!==null||Fe.isInstancedMesh&&Ze.instancingMorph===!0&&Fe.morphTexture===null||Fe.isInstancedMesh&&Ze.instancingMorph===!1&&Fe.morphTexture!==null||Ze.envMap!==Zt||Ge.fog===!0&&Ze.fog!==Et?Ie=!0:Ze.numClippingPlanes===void 0||Ze.numClippingPlanes===mt.numPlanes&&Ze.numIntersection===mt.numIntersection?(Ze.vertexAlphas!==ys||Ze.vertexTangents!==Xn||Ze.morphTargets!==Ar||Ze.morphNormals!==dn||Ze.morphColors!==ui||Ze.toneMapping!==jn||Ze.morphTargetsCount!==qn)&&(Ie=!0):Ie=!0:Ie=!0:Ie=!0:Ie=!0:(Ie=!0,Ze.__version=Ge.version);let Je=Ze.currentProgram;Ie===!0&&(Je=Ui(Ge,Ee,Fe));let st=!1,ht=!1,At=!1,J=Je.getUniforms(),me=Ze.uniforms;if(j.useProgram(Je.program)&&(st=!0,ht=!0,At=!0),Ge.id!==G&&(G=Ge.id,ht=!0),st||F!==Ve){se.reverseDepthBuffer?(S.copy(Ve.projectionMatrix),function(Le){let ze=Le.elements;ze[2]=.5*ze[2]+.5*ze[3],ze[6]=.5*ze[6]+.5*ze[7],ze[10]=.5*ze[10]+.5*ze[11],ze[14]=.5*ze[14]+.5*ze[15]}(S),function(Le){let ze=Le.elements;ze[11]===-1?(ze[10]=-ze[10]-1,ze[14]=-ze[14]):(ze[10]=-ze[10],ze[14]=1-ze[14])}(S),J.setValue(z,"projectionMatrix",S)):J.setValue(z,"projectionMatrix",Ve.projectionMatrix),J.setValue(z,"viewMatrix",Ve.matrixWorldInverse);let we=J.map.cameraPosition;we!==void 0&&we.setValue(z,$.setFromMatrixPosition(Ve.matrixWorld)),se.logarithmicDepthBuffer&&J.setValue(z,"logDepthBufFC",2/(Math.log(Ve.far+1)/Math.LN2)),(Ge.isMeshPhongMaterial||Ge.isMeshToonMaterial||Ge.isMeshLambertMaterial||Ge.isMeshBasicMaterial||Ge.isMeshStandardMaterial||Ge.isShaderMaterial)&&J.setValue(z,"isOrthographic",Ve.isOrthographicCamera===!0),F!==Ve&&(F=Ve,ht=!0,At=!0)}if(Fe.isSkinnedMesh){J.setOptional(z,Fe,"bindMatrix"),J.setOptional(z,Fe,"bindMatrixInverse");let we=Fe.skeleton;we&&(we.boneTexture===null&&we.computeBoneTexture(),J.setValue(z,"boneTexture",we.boneTexture,oe))}Fe.isBatchedMesh&&(J.setOptional(z,Fe,"batchingTexture"),J.setValue(z,"batchingTexture",Fe._matricesTexture,oe),J.setOptional(z,Fe,"batchingIdTexture"),J.setValue(z,"batchingIdTexture",Fe._indirectTexture,oe),J.setOptional(z,Fe,"batchingColorTexture"),Fe._colorsTexture!==null&&J.setValue(z,"batchingColorTexture",Fe._colorsTexture,oe));let ve=ot.morphAttributes;ve.position===void 0&&ve.normal===void 0&&ve.color===void 0||ct.update(Fe,ot,Je),(ht||Ze.receiveShadow!==Fe.receiveShadow)&&(Ze.receiveShadow=Fe.receiveShadow,J.setValue(z,"receiveShadow",Fe.receiveShadow)),Ge.isMeshGouraudMaterial&&Ge.envMap!==null&&(me.envMap.value=Zt,me.flipEnvMap.value=Zt.isCubeTexture&&Zt.isRenderTargetTexture===!1?-1:1),Ge.isMeshStandardMaterial&&Ge.envMap===null&&Ee.environment!==null&&(me.envMapIntensity.value=Ee.environmentIntensity),ht&&(J.setValue(z,"toneMappingExposure",x.toneMappingExposure),Ze.needsLights&&(ie=At,(ge=me).ambientLightColor.needsUpdate=ie,ge.lightProbe.needsUpdate=ie,ge.directionalLights.needsUpdate=ie,ge.directionalLightShadows.needsUpdate=ie,ge.pointLights.needsUpdate=ie,ge.pointLightShadows.needsUpdate=ie,ge.spotLights.needsUpdate=ie,ge.spotLightShadows.needsUpdate=ie,ge.rectAreaLights.needsUpdate=ie,ge.hemisphereLights.needsUpdate=ie),Et&&Ge.fog===!0&&Be.refreshFogUniforms(me,Et),Be.refreshMaterialUniforms(me,Ge,ne,te,v.state.transmissionRenderTarget[Ve.id]),ir.upload(z,qa(Ze),me,oe));var ge,ie;if(Ge.isShaderMaterial&&Ge.uniformsNeedUpdate===!0&&(ir.upload(z,qa(Ze),me,oe),Ge.uniformsNeedUpdate=!1),Ge.isSpriteMaterial&&J.setValue(z,"center",Fe.center),J.setValue(z,"modelViewMatrix",Fe.modelViewMatrix),J.setValue(z,"normalMatrix",Fe.normalMatrix),J.setValue(z,"modelMatrix",Fe.matrixWorld),Ge.isShaderMaterial||Ge.isRawShaderMaterial){let we=Ge.uniformsGroups;for(let Le=0,ze=we.length;Le<ze;Le++){let lt=we[Le];hn.update(lt,Je),hn.bind(lt,Je)}}return Je}(g,A,L,D,I);j.setMaterial(D,K);let Q=L.index,de=1;if(D.wireframe===!0){if(Q=je.getWireframeAttribute(L),Q===void 0)return;de=2}let re=L.drawRange,xe=L.attributes.position,Ce=re.start*de,Te=(re.start+re.count)*de;V!==null&&(Ce=Math.max(Ce,V.start*de),Te=Math.min(Te,(V.start+V.count)*de)),Q!==null?(Ce=Math.max(Ce,0),Te=Math.min(Te,Q.count)):xe!=null&&(Ce=Math.max(Ce,0),Te=Math.min(Te,xe.count));let ce=Te-Ce;if(ce<0||ce===1/0)return;let We;nn.setup(I,D,Z,L,Q);let De=Ci;if(Q!==null&&(We=Pe.get(Q),De=En,De.setIndex(We)),I.isMesh)D.wireframe===!0?(j.setLineWidth(D.wireframeLinewidth*O()),De.setMode(z.LINES)):De.setMode(z.TRIANGLES);else if(I.isLine){let Ve=D.linewidth;Ve===void 0&&(Ve=1),j.setLineWidth(Ve*O()),I.isLineSegments?De.setMode(z.LINES):I.isLineLoop?De.setMode(z.LINE_LOOP):De.setMode(z.LINE_STRIP)}else I.isPoints?De.setMode(z.POINTS):I.isSprite&&De.setMode(z.TRIANGLES);if(I.isBatchedMesh)if(I._multiDrawInstances!==null)De.renderMultiDrawInstances(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount,I._multiDrawInstances);else if(N.get("WEBGL_multi_draw"))De.renderMultiDraw(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount);else{let Ve=I._multiDrawStarts,Ee=I._multiDrawCounts,ot=I._multiDrawCount,Ge=Q?Pe.get(Q).bytesPerElement:1,Fe=ue.get(D).currentProgram.getUniforms();for(let Et=0;Et<ot;Et++)Fe.setValue(z,"_gl_DrawID",Et),De.render(Ve[Et]/Ge,Ee[Et])}else if(I.isInstancedMesh)De.renderInstances(Ce,ce,I.count);else if(L.isInstancedBufferGeometry){let Ve=L._maxInstanceCount!==void 0?L._maxInstanceCount:1/0,Ee=Math.min(L.instanceCount,Ve);De.renderInstances(Ce,ce,Ee)}else De.render(Ce,ce)},this.compile=function(g,A,L=null){L===null&&(L=g),v=at.get(L),v.init(A),_.push(v),L.traverseVisible(function(I){I.isLight&&I.layers.test(A.layers)&&(v.pushLight(I),I.castShadow&&v.pushShadow(I))}),g!==L&&g.traverseVisible(function(I){I.isLight&&I.layers.test(A.layers)&&(v.pushLight(I),I.castShadow&&v.pushShadow(I))}),v.setupLights();let D=new Set;return g.traverse(function(I){if(!(I.isMesh||I.isPoints||I.isLine||I.isSprite))return;let V=I.material;if(V)if(Array.isArray(V))for(let K=0;K<V.length;K++){let Z=V[K];Er(Z,L,I),D.add(Z)}else Er(V,L,I),D.add(V)}),_.pop(),v=null,D},this.compileAsync=function(g,A,L=null){let D=this.compile(g,A,L);return new Promise(I=>{function V(){D.forEach(function(K){ue.get(K).currentProgram.isReady()&&D.delete(K)}),D.size!==0?setTimeout(V,10):I(g)}N.get("KHR_parallel_shader_compile")!==null?V():setTimeout(V,10)})};let ci=null;function wr(){wn.stop()}function Nt(){wn.start()}let wn=new Yh;function Tr(g,A,L,D){if(g.visible===!1)return;if(g.layers.test(A.layers)){if(g.isGroup)L=g.renderOrder;else if(g.isLOD)g.autoUpdate===!0&&g.update(A);else if(g.isLight)v.pushLight(g),g.castShadow&&v.pushShadow(g);else if(g.isSprite){if(!g.frustumCulled||Ae.intersectsSprite(g)){D&&P.setFromMatrixPosition(g.matrixWorld).applyMatrix4(B);let V=Ke.update(g),K=g.material;K.visible&&y.push(g,V,K,L,P.z,null)}}else if((g.isMesh||g.isLine||g.isPoints)&&(!g.frustumCulled||Ae.intersectsObject(g))){let V=Ke.update(g),K=g.material;if(D&&(g.boundingSphere!==void 0?(g.boundingSphere===null&&g.computeBoundingSphere(),P.copy(g.boundingSphere.center)):(V.boundingSphere===null&&V.computeBoundingSphere(),P.copy(V.boundingSphere.center)),P.applyMatrix4(g.matrixWorld).applyMatrix4(B)),Array.isArray(K)){let Z=V.groups;for(let Q=0,de=Z.length;Q<de;Q++){let re=Z[Q],xe=K[re.materialIndex];xe&&xe.visible&&y.push(g,V,xe,L,P.z,re)}}else K.visible&&y.push(g,V,K,L,P.z,null)}}let I=g.children;for(let V=0,K=I.length;V<K;V++)Tr(I[V],A,L,D)}function _s(g,A,L,D){let I=g.opaque,V=g.transmissive,K=g.transparent;v.setupLightsView(L),Re===!0&&mt.setGlobalState(x.clippingPlanes,L),D&&j.viewport(q.copy(D)),I.length>0&&Li(I,A,L),V.length>0&&Li(V,A,L),K.length>0&&Li(K,A,L),j.buffers.depth.setTest(!0),j.buffers.depth.setMask(!0),j.buffers.color.setMask(!0),j.setPolygonOffset(!1)}function xs(g,A,L,D){if((L.isScene===!0?L.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[D.id]===void 0&&(v.state.transmissionRenderTarget[D.id]=new Wn(1,1,{generateMipmaps:!0,type:N.has("EXT_color_buffer_half_float")||N.has("EXT_color_buffer_float")?us:Vn,minFilter:Qi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ut.workingColorSpace}));let I=v.state.transmissionRenderTarget[D.id],V=D.viewport||q;I.setSize(V.z,V.w);let K=x.getRenderTarget();x.setRenderTarget(I),x.getClearColor(Y),X=x.getClearAlpha(),X<1&&x.setClearColor(16777215,.5),x.clear(),b&&rt.render(L);let Z=x.toneMapping;x.toneMapping=ei;let Q=D.viewport;if(D.viewport!==void 0&&(D.viewport=void 0),v.setupLightsView(D),Re===!0&&mt.setGlobalState(x.clippingPlanes,D),Li(g,L,D),oe.updateMultisampleRenderTarget(I),oe.updateRenderTargetMipmap(I),N.has("WEBGL_multisampled_render_to_texture")===!1){let de=!1;for(let re=0,xe=A.length;re<xe;re++){let Ce=A[re],Te=Ce.object,ce=Ce.geometry,We=Ce.material,De=Ce.group;if(We.side===2&&Te.layers.test(D.layers)){let Ve=We.side;We.side=Ht,We.needsUpdate=!0,hi(Te,L,D,ce,We,De),We.side=Ve,We.needsUpdate=!0,de=!0}}de===!0&&(oe.updateMultisampleRenderTarget(I),oe.updateRenderTargetMipmap(I))}x.setRenderTarget(K),x.setClearColor(Y,X),Q!==void 0&&(D.viewport=Q),x.toneMapping=Z}function Li(g,A,L){let D=A.isScene===!0?A.overrideMaterial:null;for(let I=0,V=g.length;I<V;I++){let K=g[I],Z=K.object,Q=K.geometry,de=D===null?K.material:D,re=K.group;Z.layers.test(L.layers)&&hi(Z,A,L,Q,de,re)}}function hi(g,A,L,D,I,V){g.onBeforeRender(x,A,L,D,I,V),g.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,g.matrixWorld),g.normalMatrix.getNormalMatrix(g.modelViewMatrix),I.onBeforeRender(x,A,L,D,g,V),I.transparent===!0&&I.side===2&&I.forceSinglePass===!1?(I.side=Ht,I.needsUpdate=!0,x.renderBufferDirect(L,A,D,I,g,V),I.side=xn,I.needsUpdate=!0,x.renderBufferDirect(L,A,D,I,g,V),I.side=2):x.renderBufferDirect(L,A,D,I,g,V),g.onAfterRender(x,A,L,D,I,V)}function Ui(g,A,L){A.isScene!==!0&&(A=U);let D=ue.get(g),I=v.state.lights,V=v.state.shadowsArray,K=I.state.version,Z=et.getParameters(g,I.state,V,A,L),Q=et.getProgramCacheKey(Z),de=D.programs;D.environment=g.isMeshStandardMaterial?A.environment:null,D.fog=A.fog,D.envMap=(g.isMeshStandardMaterial?Ue:ye).get(g.envMap||D.environment),D.envMapRotation=D.environment!==null&&g.envMap===null?A.environmentRotation:g.envMapRotation,de===void 0&&(g.addEventListener("dispose",Ii),de=new Map,D.programs=de);let re=de.get(Q);if(re!==void 0){if(D.currentProgram===re&&D.lightsStateVersion===K)return W(g,Z),re}else Z.uniforms=et.getUniforms(g),g.onBeforeCompile(Z,x),re=et.acquireProgram(Z,Q),de.set(Q,re),D.uniforms=Z.uniforms;let xe=D.uniforms;return(g.isShaderMaterial||g.isRawShaderMaterial)&&g.clipping!==!0||(xe.clippingPlanes=mt.uniform),W(g,Z),D.needsLights=function(Ce){return Ce.isMeshLambertMaterial||Ce.isMeshToonMaterial||Ce.isMeshPhongMaterial||Ce.isMeshStandardMaterial||Ce.isShadowMaterial||Ce.isShaderMaterial&&Ce.lights===!0}(g),D.lightsStateVersion=K,D.needsLights&&(xe.ambientLightColor.value=I.state.ambient,xe.lightProbe.value=I.state.probe,xe.directionalLights.value=I.state.directional,xe.directionalLightShadows.value=I.state.directionalShadow,xe.spotLights.value=I.state.spot,xe.spotLightShadows.value=I.state.spotShadow,xe.rectAreaLights.value=I.state.rectArea,xe.ltc_1.value=I.state.rectAreaLTC1,xe.ltc_2.value=I.state.rectAreaLTC2,xe.pointLights.value=I.state.point,xe.pointLightShadows.value=I.state.pointShadow,xe.hemisphereLights.value=I.state.hemi,xe.directionalShadowMap.value=I.state.directionalShadowMap,xe.directionalShadowMatrix.value=I.state.directionalShadowMatrix,xe.spotShadowMap.value=I.state.spotShadowMap,xe.spotLightMatrix.value=I.state.spotLightMatrix,xe.spotLightMap.value=I.state.spotLightMap,xe.pointShadowMap.value=I.state.pointShadowMap,xe.pointShadowMatrix.value=I.state.pointShadowMatrix),D.currentProgram=re,D.uniformsList=null,re}function qa(g){if(g.uniformsList===null){let A=g.currentProgram.getUniforms();g.uniformsList=ir.seqWithValue(A.seq,g.uniforms)}return g.uniformsList}function W(g,A){let L=ue.get(g);L.outputColorSpace=A.outputColorSpace,L.batching=A.batching,L.batchingColor=A.batchingColor,L.instancing=A.instancing,L.instancingColor=A.instancingColor,L.instancingMorph=A.instancingMorph,L.skinning=A.skinning,L.morphTargets=A.morphTargets,L.morphNormals=A.morphNormals,L.morphColors=A.morphColors,L.morphTargetsCount=A.morphTargetsCount,L.numClippingPlanes=A.numClippingPlanes,L.numIntersection=A.numClipIntersection,L.vertexAlphas=A.vertexAlphas,L.vertexTangents=A.vertexTangents,L.toneMapping=A.toneMapping}wn.setAnimationLoop(function(g){ci&&ci(g)}),typeof self<"u"&&wn.setContext(self),this.setAnimationLoop=function(g){ci=g,tt.setAnimationLoop(g),g===null?wn.stop():wn.start()},tt.addEventListener("sessionstart",wr),tt.addEventListener("sessionend",Nt),this.render=function(g,A){if(A!==void 0&&A.isCamera!==!0)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(M===!0)return;if(g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),A.parent===null&&A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),tt.enabled===!0&&tt.isPresenting===!0&&(tt.cameraAutoUpdate===!0&&tt.updateCamera(A),A=tt.getCamera()),g.isScene===!0&&g.onBeforeRender(x,g,A,C),v=at.get(g,_.length),v.init(A),_.push(v),B.multiplyMatrices(A.projectionMatrix,A.matrixWorldInverse),Ae.setFromProjectionMatrix(B),R=this.localClippingEnabled,Re=mt.init(this.clippingPlanes,R),y=it.get(g,f.length),y.init(),f.push(y),tt.enabled===!0&&tt.isPresenting===!0){let V=x.xr.getDepthSensingMesh();V!==null&&Tr(V,A,-1/0,x.sortObjects)}Tr(g,A,0,x.sortObjects),y.finish(),x.sortObjects===!0&&y.sort(fe,be),b=tt.enabled===!1||tt.isPresenting===!1||tt.hasDepthSensing()===!1,b&&rt.addToRenderList(y,g),this.info.render.frame++,Re===!0&&mt.beginShadows();let L=v.state.shadowsArray;Oe.render(L,g,A),Re===!0&&mt.endShadows(),this.info.autoReset===!0&&this.info.reset();let D=y.opaque,I=y.transmissive;if(v.setupLights(),A.isArrayCamera){let V=A.cameras;if(I.length>0)for(let K=0,Z=V.length;K<Z;K++)xs(D,I,g,V[K]);b&&rt.render(g);for(let K=0,Z=V.length;K<Z;K++){let Q=V[K];_s(y,g,Q,Q.viewport)}}else I.length>0&&xs(D,I,g,A),b&&rt.render(g),_s(y,g,A);C!==null&&(oe.updateMultisampleRenderTarget(C),oe.updateRenderTargetMipmap(C)),g.isScene===!0&&g.onAfterRender(x,g,A),nn.resetDefaultState(),G=-1,F=null,_.pop(),_.length>0?(v=_[_.length-1],Re===!0&&mt.setGlobalState(x.clippingPlanes,v.state.camera)):v=null,f.pop(),y=f.length>0?f[f.length-1]:null},this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(g,A,L){ue.get(g.texture).__webglTexture=A,ue.get(g.depthTexture).__webglTexture=L;let D=ue.get(g);D.__hasExternalTextures=!0,D.__autoAllocateDepthBuffer=L===void 0,D.__autoAllocateDepthBuffer||N.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),D.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(g,A){let L=ue.get(g);L.__webglFramebuffer=A,L.__useDefaultFramebuffer=A===void 0},this.setRenderTarget=function(g,A=0,L=0){C=g,T=A,w=L;let D=!0,I=null,V=!1,K=!1;if(g){let Z=ue.get(g);if(Z.__useDefaultFramebuffer!==void 0)j.bindFramebuffer(z.FRAMEBUFFER,null),D=!1;else if(Z.__webglFramebuffer===void 0)oe.setupRenderTarget(g);else if(Z.__hasExternalTextures)oe.rebindTextures(g,ue.get(g.texture).__webglTexture,ue.get(g.depthTexture).__webglTexture);else if(g.depthBuffer){let re=g.depthTexture;if(Z.__boundDepthTexture!==re){if(re!==null&&ue.has(re)&&(g.width!==re.image.width||g.height!==re.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");oe.setupDepthRenderbuffer(g)}}let Q=g.texture;(Q.isData3DTexture||Q.isDataArrayTexture||Q.isCompressedArrayTexture)&&(K=!0);let de=ue.get(g).__webglFramebuffer;g.isWebGLCubeRenderTarget?(I=Array.isArray(de[A])?de[A][L]:de[A],V=!0):I=g.samples>0&&oe.useMultisampledRTT(g)===!1?ue.get(g).__webglMultisampledFramebuffer:Array.isArray(de)?de[L]:de,q.copy(g.viewport),H.copy(g.scissor),k=g.scissorTest}else q.copy(Ne).multiplyScalar(ne).floor(),H.copy(le).multiplyScalar(ne).floor(),k=he;if(j.bindFramebuffer(z.FRAMEBUFFER,I)&&D&&j.drawBuffers(g,I),j.viewport(q),j.scissor(H),j.setScissorTest(k),V){let Z=ue.get(g.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+A,Z.__webglTexture,L)}else if(K){let Z=ue.get(g.texture),Q=A||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Z.__webglTexture,L||0,Q)}G=-1},this.readRenderTargetPixels=function(g,A,L,D,I,V,K){if(!g||!g.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Z=ue.get(g).__webglFramebuffer;if(g.isWebGLCubeRenderTarget&&K!==void 0&&(Z=Z[K]),Z){j.bindFramebuffer(z.FRAMEBUFFER,Z);try{let Q=g.texture,de=Q.format,re=Q.type;if(!se.textureFormatReadable(de))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!se.textureTypeReadable(re))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");A>=0&&A<=g.width-D&&L>=0&&L<=g.height-I&&z.readPixels(A,L,D,I,Ot.convert(de),Ot.convert(re),V)}finally{let Q=C!==null?ue.get(C).__webglFramebuffer:null;j.bindFramebuffer(z.FRAMEBUFFER,Q)}}},this.readRenderTargetPixelsAsync=async function(g,A,L,D,I,V,K){if(!g||!g.isWebGLRenderTarget)throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Z=ue.get(g).__webglFramebuffer;if(g.isWebGLCubeRenderTarget&&K!==void 0&&(Z=Z[K]),Z){let Q=g.texture,de=Q.format,re=Q.type;if(!se.textureFormatReadable(de))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!se.textureTypeReadable(re))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(A>=0&&A<=g.width-D&&L>=0&&L<=g.height-I){j.bindFramebuffer(z.FRAMEBUFFER,Z);let xe=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,xe),z.bufferData(z.PIXEL_PACK_BUFFER,V.byteLength,z.STREAM_READ),z.readPixels(A,L,D,I,Ot.convert(de),Ot.convert(re),0);let Ce=C!==null?ue.get(C).__webglFramebuffer:null;j.bindFramebuffer(z.FRAMEBUFFER,Ce);let Te=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await function(ce,We,De){return new Promise(function(Ve,Ee){setTimeout(function ot(){switch(ce.clientWaitSync(We,ce.SYNC_FLUSH_COMMANDS_BIT,0)){case ce.WAIT_FAILED:Ee();break;case ce.TIMEOUT_EXPIRED:setTimeout(ot,De);break;default:Ve()}},De)})}(z,Te,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,xe),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,V),z.deleteBuffer(xe),z.deleteSync(Te),V}throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(g,A=null,L=0){g.isTexture!==!0&&(ra("WebGLRenderer: copyFramebufferToTexture function signature has changed."),A=arguments[0]||null,g=arguments[1]);let D=Math.pow(2,-L),I=Math.floor(g.image.width*D),V=Math.floor(g.image.height*D),K=A!==null?A.x:0,Z=A!==null?A.y:0;oe.setTexture2D(g,0),z.copyTexSubImage2D(z.TEXTURE_2D,L,0,0,K,Z,I,V),j.unbindTexture()},this.copyTextureToTexture=function(g,A,L=null,D=null,I=0){let V,K,Z,Q,de,re;g.isTexture!==!0&&(ra("WebGLRenderer: copyTextureToTexture function signature has changed."),D=arguments[0]||null,g=arguments[1],A=arguments[2],I=arguments[3]||0,L=null),L!==null?(V=L.max.x-L.min.x,K=L.max.y-L.min.y,Z=L.min.x,Q=L.min.y):(V=g.image.width,K=g.image.height,Z=0,Q=0),D!==null?(de=D.x,re=D.y):(de=0,re=0);let xe=Ot.convert(A.format),Ce=Ot.convert(A.type);oe.setTexture2D(A,0),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,A.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,A.unpackAlignment);let Te=z.getParameter(z.UNPACK_ROW_LENGTH),ce=z.getParameter(z.UNPACK_IMAGE_HEIGHT),We=z.getParameter(z.UNPACK_SKIP_PIXELS),De=z.getParameter(z.UNPACK_SKIP_ROWS),Ve=z.getParameter(z.UNPACK_SKIP_IMAGES),Ee=g.isCompressedTexture?g.mipmaps[I]:g.image;z.pixelStorei(z.UNPACK_ROW_LENGTH,Ee.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Ee.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Z),z.pixelStorei(z.UNPACK_SKIP_ROWS,Q),g.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,I,de,re,V,K,xe,Ce,Ee.data):g.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,I,de,re,Ee.width,Ee.height,xe,Ee.data):z.texSubImage2D(z.TEXTURE_2D,I,de,re,V,K,xe,Ce,Ee),z.pixelStorei(z.UNPACK_ROW_LENGTH,Te),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ce),z.pixelStorei(z.UNPACK_SKIP_PIXELS,We),z.pixelStorei(z.UNPACK_SKIP_ROWS,De),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Ve),I===0&&A.generateMipmaps&&z.generateMipmap(z.TEXTURE_2D),j.unbindTexture()},this.copyTextureToTexture3D=function(g,A,L=null,D=null,I=0){let V,K,Z,Q,de,re,xe,Ce,Te;g.isTexture!==!0&&(ra("WebGLRenderer: copyTextureToTexture3D function signature has changed."),L=arguments[0]||null,D=arguments[1]||null,g=arguments[2],A=arguments[3],I=arguments[4]||0);let ce=g.isCompressedTexture?g.mipmaps[I]:g.image;L!==null?(V=L.max.x-L.min.x,K=L.max.y-L.min.y,Z=L.max.z-L.min.z,Q=L.min.x,de=L.min.y,re=L.min.z):(V=ce.width,K=ce.height,Z=ce.depth,Q=0,de=0,re=0),D!==null?(xe=D.x,Ce=D.y,Te=D.z):(xe=0,Ce=0,Te=0);let We=Ot.convert(A.format),De=Ot.convert(A.type),Ve;if(A.isData3DTexture)oe.setTexture3D(A,0),Ve=z.TEXTURE_3D;else{if(!A.isDataArrayTexture&&!A.isCompressedArrayTexture)return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");oe.setTexture2DArray(A,0),Ve=z.TEXTURE_2D_ARRAY}z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,A.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,A.unpackAlignment);let Ee=z.getParameter(z.UNPACK_ROW_LENGTH),ot=z.getParameter(z.UNPACK_IMAGE_HEIGHT),Ge=z.getParameter(z.UNPACK_SKIP_PIXELS),Fe=z.getParameter(z.UNPACK_SKIP_ROWS),Et=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,ce.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ce.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Q),z.pixelStorei(z.UNPACK_SKIP_ROWS,de),z.pixelStorei(z.UNPACK_SKIP_IMAGES,re),g.isDataTexture||g.isData3DTexture?z.texSubImage3D(Ve,I,xe,Ce,Te,V,K,Z,We,De,ce.data):A.isCompressedArrayTexture?z.compressedTexSubImage3D(Ve,I,xe,Ce,Te,V,K,Z,We,ce.data):z.texSubImage3D(Ve,I,xe,Ce,Te,V,K,Z,We,De,ce),z.pixelStorei(z.UNPACK_ROW_LENGTH,Ee),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ot),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Ge),z.pixelStorei(z.UNPACK_SKIP_ROWS,Fe),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Et),I===0&&A.generateMipmaps&&z.generateMipmap(Ve),j.unbindTexture()},this.initRenderTarget=function(g){ue.get(g).__webglFramebuffer===void 0&&oe.setupRenderTarget(g)},this.initTexture=function(g){g.isCubeTexture?oe.setTextureCube(g,0):g.isData3DTexture?oe.setTexture3D(g,0):g.isDataArrayTexture||g.isCompressedArrayTexture?oe.setTexture2DArray(g,0):oe.setTexture2D(g,0),j.unbindTexture()},this.resetState=function(){T=0,w=0,C=null,j.reset(),nn.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return lr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===pc?"display-p3":"srgb",t.unpackColorSpace=ut.workingColorSpace===Fa?"display-p3":"srgb"}};var ya=class r{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new He(e),this.near=t,this.far=n}clone(){return new r(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},pr=class extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Qt,this.environmentIntensity=1,this.environmentRotation=new Qt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Cl=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ul,this.updateRanges=[],this.version=0,this.uuid=Pn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Pn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Pn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Xt=new E,Ma=class r{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=gn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=gn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=gn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=gn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),s=ft(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new kt(new this.array.constructor(t),this.itemSize,this.normalized)}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new r(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},fr=class extends ri{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new He(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},qi,Nr=new E,Yi=new E,Zi=new E,Ji=new pe,Or=new pe,Qh=new Xe,Gs=new E,Fr=new E,Vs=new E,xh=new pe,Eo=new pe,yh=new pe,Jr=class extends bt{constructor(e=new fr){if(super(),this.isSprite=!0,this.type="Sprite",qi===void 0){qi=new yt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Cl(t,5);qi.setIndex([0,1,2,0,2,3]),qi.setAttribute("position",new Ma(n,3,0,!1)),qi.setAttribute("uv",new Ma(n,2,3,!1))}this.geometry=qi,this.material=e,this.center=new pe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Yi.setFromMatrixScale(this.matrixWorld),Qh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Zi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Yi.multiplyScalar(-Zi.z);let n=this.material.rotation,i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));let a=this.center;Ws(Gs.set(-.5,-.5,0),Zi,a,Yi,i,s),Ws(Fr.set(.5,-.5,0),Zi,a,Yi,i,s),Ws(Vs.set(.5,.5,0),Zi,a,Yi,i,s),xh.set(0,0),Eo.set(1,0),yh.set(1,1);let o=e.ray.intersectTriangle(Gs,Fr,Vs,!1,Nr);if(o===null&&(Ws(Fr.set(-.5,.5,0),Zi,a,Yi,i,s),Eo.set(0,1),o=e.ray.intersectTriangle(Gs,Vs,Fr,!1,Nr),o===null))return;let l=e.ray.origin.distanceTo(Nr);l<e.near||l>e.far||t.push({distance:l,point:Nr.clone(),uv:Gn.getInterpolation(Nr,Gs,Fr,Vs,xh,Eo,yh,new pe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ws(r,e,t,n,i,s){Ji.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(Or.x=s*Ji.x-i*Ji.y,Or.y=i*Ji.x+s*Ji.y):Or.copy(Ji),r.copy(e),r.x+=Or.x,r.y+=Or.y,r.applyMatrix4(Qh)}var jp=new E,qp=new E;var Yp=new E,Zp=new dt,Jp=new dt,Kp=new E,$p=new Xe,Qp=new E,ef=new Mn,tf=new Xe,nf=new cr;var Pl=class extends Yt{constructor(e=null,t=1,n=1,i,s,a,o,l,c=1003,h=1003,d,u){super(null,a,o,l,c,h,i,s,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},rf=new Xe,sf=new Xe;var Sa=class extends kt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ki=new Xe,Mh=new Xe,Xs=[],Sh=new yn,dp=new Xe,Br=new ke,zr=new Mn,tn=class extends ke{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Sa(new Float32Array(16*n),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,dp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new yn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ki),Sh.copy(e.boundingBox).applyMatrix4(Ki),this.boundingBox.union(Sh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ki),zr.copy(e.boundingSphere).applyMatrix4(Ki),this.boundingSphere.union(zr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,3*e)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,16*e)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=e*(n.length+1)+1;for(let a=0;a<n.length;a++)n[a]=i[s+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Br.geometry=this.geometry,Br.material=this.material,Br.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),zr.copy(this.boundingSphere),zr.applyMatrix4(n),e.ray.intersectsSphere(zr)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Ki),Mh.multiplyMatrices(n,Ki),Br.matrixWorld=Mh,Br.raycast(e,Xs);for(let a=0,o=Xs.length;a<o;a++){let l=Xs[a];l.instanceId=s,l.object=this,t.push(l)}Xs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Sa(new Float32Array(3*this.instanceMatrix.count).fill(1),3)),t.toArray(this.instanceColor.array,3*e)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,16*e)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Pl(new Float32Array(i*this.count),i,this.count,cc,Cn));let s=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Il=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n){let i=this.pool,s=this.list;this.index>=i.length&&i.push({start:-1,count:-1,z:-1,index:-1});let a=i[this.index];s.push(a),this.index++,a.start=e.start,a.count=e.count,a.z=t,a.index=n}reset(){this.list.length=0,this.index=0}},af=new Xe,of=new Xe,lf=new Xe,cf=new He(1,1,1),hf=new Xe,uf=new ur,df=new yn,pf=new Mn,ff=new E,mf=new E,gf=new E,vf=new Il,_f=new ke;var xf=new E,yf=new E,Mf=new Xe,Sf=new cr,bf=new Mn,Ef=new E,wf=new E;var Tf=new E,Af=new E;var Rf=new Xe,Cf=new cr,Pf=new Mn,If=new E;var ba=class extends Yt{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},on=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),i=0,s=n.length,a;a=t||e*n[s-1];let o,l=0,c=s-1;for(;l<=c;)if(i=Math.floor(l+(c-l)/2),o=n[i]-a,o<0)l=i+1;else{if(!(o>0)){c=i;break}c=i-1}if(i=c,n[i]===a)return i/(s-1);let h=n[i];return(i+(a-h)/(n[i+1]-h))/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);let a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new pe:new E);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new E,i=[],s=[],a=[],o=new E,l=new Xe;for(let p=0;p<=e;p++){let m=p/e;i[p]=this.getTangentAt(m,new E)}s[0]=new E,a[0]=new E;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),d=Math.abs(i[0].y),u=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(i[p-1],i[p]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(Ct(i[p-1].dot(i[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(o,m))}a[p].crossVectors(i[p],s[p])}if(t===!0){let p=Math.acos(Ct(s[0].dot(s[e]),-1,1));p/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(p=-p);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(i[m],p*m)),a[m].crossVectors(i[m],s[m])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Kr=class extends on{constructor(e=0,t=0,n=1,i=1,s=0,a=2*Math.PI,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new pe){let n=t,i=2*Math.PI,s=this.aEndAngle-this.aStartAngle,a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(s=a?0:i),this.aClockwise!==!0||a||(s===i?s=-i:s-=i);let o=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,p=c-this.aY;l=u*h-p*d+this.aX,c=u*d+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ll=class extends Kr{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}};function gc(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,d){let u=(a-s)/c-(o-s)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,p*=h,i(a,o,u,p)},calc:function(s){let a=s*s;return r+e*s+t*a+n*(a*s)}}}var js=new E,wo=new gc,To=new gc,Ao=new gc,$r=class extends on{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new E){let n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e,o,l,c=Math.floor(a),h=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/s)+1)*s:h===0&&c===s-1&&(c=s-2,h=1),this.closed||c>0?o=i[(c-1)%s]:(js.subVectors(i[0],i[1]).add(i[0]),o=js);let d=i[c%s],u=i[(c+1)%s];if(this.closed||c+2<s?l=i[(c+2)%s]:(js.subVectors(i[s-1],i[s-2]).add(i[s-1]),l=js),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,m=Math.pow(o.distanceToSquared(d),p),y=Math.pow(d.distanceToSquared(u),p),v=Math.pow(u.distanceToSquared(l),p);y<1e-4&&(y=1),m<1e-4&&(m=y),v<1e-4&&(v=y),wo.initNonuniformCatmullRom(o.x,d.x,u.x,l.x,m,y,v),To.initNonuniformCatmullRom(o.y,d.y,u.y,l.y,m,y,v),Ao.initNonuniformCatmullRom(o.z,d.z,u.z,l.z,m,y,v)}else this.curveType==="catmullrom"&&(wo.initCatmullRom(o.x,d.x,u.x,l.x,this.tension),To.initCatmullRom(o.y,d.y,u.y,l.y,this.tension),Ao.initCatmullRom(o.z,d.z,u.z,l.z,this.tension));return n.set(wo.calc(h),To.calc(h),Ao.calc(h)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new E().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function bh(r,e,t,n,i){let s=.5*(n-e),a=.5*(i-t),o=r*r;return(2*t-2*n+s+a)*(r*o)+(-3*t+3*n-2*s-a)*o+s*r+t}function Vr(r,e,t,n){return function(i,s){let a=1-i;return a*a*s}(r,e)+function(i,s){return 2*(1-i)*i*s}(r,t)+function(i,s){return i*i*s}(r,n)}function Wr(r,e,t,n,i){return function(s,a){let o=1-s;return o*o*o*a}(r,e)+function(s,a){let o=1-s;return 3*o*o*s*a}(r,t)+function(s,a){return 3*(1-s)*s*s*a}(r,n)+function(s,a){return s*s*s*a}(r,i)}var Ea=class extends on{constructor(e=new pe,t=new pe,n=new pe,i=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new pe){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Wr(e,i.x,s.x,a.x,o.x),Wr(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ul=class extends on{constructor(e=new E,t=new E,n=new E,i=new E){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new E){let n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(Wr(e,i.x,s.x,a.x,o.x),Wr(e,i.y,s.y,a.y,o.y),Wr(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},wa=class extends on{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Dl=class extends on{constructor(e=new E,t=new E){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new E){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new E){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ta=class extends on{constructor(e=new pe,t=new pe,n=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new pe){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(Vr(e,i.x,s.x,a.x),Vr(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Aa=class extends on{constructor(e=new E,t=new E,n=new E){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new E){let n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(Vr(e,i.x,s.x,a.x),Vr(e,i.y,s.y,a.y),Vr(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ra=class extends on{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],d=i[a>i.length-3?i.length-1:a+2];return n.set(bh(o,l.x,c.x,h.x,d.x),bh(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new pe().fromArray(i))}return this}},Ca=Object.freeze({__proto__:null,ArcCurve:Ll,CatmullRomCurve3:$r,CubicBezierCurve:Ea,CubicBezierCurve3:Ul,EllipseCurve:Kr,LineCurve:wa,LineCurve3:Dl,QuadraticBezierCurve:Ta,QuadraticBezierCurve3:Aa,SplineCurve:Ra}),Nl=class extends on{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ca[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),s=0;for(;s<i.length;){if(i[s]>=n){let a=i[s]-n,o=this.curves[s],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,s=this.curves;i<s.length;i++){let a=s[i],o=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Ca[i.type]().fromJSON(i))}return this}},Qr=class extends Nl{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new wa(this.currentPoint.clone(),new pe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let s=new Ta(this.currentPoint.clone(),new pe(e,t),new pe(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,a){let o=new Ea(this.currentPoint.clone(),new pe(e,t),new pe(n,i),new pe(s,a));return this.curves.push(o),this.currentPoint.set(s,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Ra(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,i,s,a),this}absarc(e,t,n,i,s,a){return this.absellipse(e,t,n,n,i,s,a),this}ellipse(e,t,n,i,s,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,i,s,a,o,l),this}absellipse(e,t,n,i,s,a,o,l){let c=new Kr(e,t,n,i,s,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Pa=class r extends yt{constructor(e=[new pe(0,-.5),new pe(.5,0),new pe(0,.5)],t=12,n=0,i=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=Ct(i,0,2*Math.PI);let s=[],a=[],o=[],l=[],c=[],h=1/t,d=new E,u=new pe,p=new E,m=new E,y=new E,v=0,f=0;for(let _=0;_<=e.length-1;_++)switch(_){case 0:v=e[_+1].x-e[_].x,f=e[_+1].y-e[_].y,p.x=1*f,p.y=-v,p.z=0*f,y.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:v=e[_+1].x-e[_].x,f=e[_+1].y-e[_].y,p.x=1*f,p.y=-v,p.z=0*f,m.copy(p),p.x+=y.x,p.y+=y.y,p.z+=y.z,p.normalize(),l.push(p.x,p.y,p.z),y.copy(m)}for(let _=0;_<=t;_++){let x=n+_*h*i,M=Math.sin(x),T=Math.cos(x);for(let w=0;w<=e.length-1;w++){d.x=e[w].x*M,d.y=e[w].y,d.z=e[w].x*T,a.push(d.x,d.y,d.z),u.x=_/t,u.y=w/(e.length-1),o.push(u.x,u.y);let C=l[3*w+0]*M,G=l[3*w+1],F=l[3*w+0]*T;c.push(C,G,F)}}for(let _=0;_<t;_++)for(let x=0;x<e.length-1;x++){let M=x+_*e.length,T=M,w=M+e.length,C=M+e.length+1,G=M+1;s.push(T,w,G),s.push(C,G,w)}this.setIndex(s),this.setAttribute("position",new qe(a,3)),this.setAttribute("uv",new qe(o,2)),this.setAttribute("normal",new qe(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.points,e.segments,e.phiStart,e.phiLength)}},es=class r extends Pa{constructor(e=1,t=1,n=4,i=8){let s=new Qr;s.absarc(0,-t/2,e,1.5*Math.PI,0),s.absarc(0,t/2,e,0,.5*Math.PI),super(s.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:i}}static fromJSON(e){return new r(e.radius,e.length,e.capSegments,e.radialSegments)}},mr=class r extends yt{constructor(e=1,t=32,n=0,i=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let s=[],a=[],o=[],l=[],c=new E,h=new pe;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=t;d++,u+=3){let p=n+d/t*i;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/e+1)/2,h.y=(a[u+1]/e+1)/2,l.push(h.x,h.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new qe(a,3)),this.setAttribute("normal",new qe(o,3)),this.setAttribute("uv",new qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Vt=class r extends yt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),s=Math.floor(s);let h=[],d=[],u=[],p=[],m=0,y=[],v=n/2,f=0;function _(x){let M=m,T=new pe,w=new E,C=0,G=x===!0?e:t,F=x===!0?1:-1;for(let H=1;H<=i;H++)d.push(0,v*F,0),u.push(0,F,0),p.push(.5,.5),m++;let q=m;for(let H=0;H<=i;H++){let k=H/i*l+o,Y=Math.cos(k),X=Math.sin(k);w.x=G*X,w.y=v*F,w.z=G*Y,d.push(w.x,w.y,w.z),u.push(0,F,0),T.x=.5*Y+.5,T.y=.5*X*F+.5,p.push(T.x,T.y),m++}for(let H=0;H<i;H++){let k=M+H,Y=q+H;x===!0?h.push(Y,Y+1,k):h.push(Y+1,Y,k),C+=3}c.addGroup(f,C,x===!0?1:2),f+=C}(function(){let x=new E,M=new E,T=0,w=(t-e)/n;for(let C=0;C<=s;C++){let G=[],F=C/s,q=F*(t-e)+e;for(let H=0;H<=i;H++){let k=H/i,Y=k*l+o,X=Math.sin(Y),ee=Math.cos(Y);M.x=q*X,M.y=-F*n+v,M.z=q*ee,d.push(M.x,M.y,M.z),x.set(X,w,ee).normalize(),u.push(x.x,x.y,x.z),p.push(k,1-F),G.push(m++)}y.push(G)}for(let C=0;C<i;C++)for(let G=0;G<s;G++){let F=y[G][C],q=y[G+1][C],H=y[G+1][C+1],k=y[G][C+1];e>0&&(h.push(F,q,k),T+=3),t>0&&(h.push(q,H,k),T+=3)}c.addGroup(f,T,0),f+=T})(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new qe(d,3)),this.setAttribute("normal",new qe(u,3)),this.setAttribute("uv",new qe(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ts=class r extends Vt{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,o=2*Math.PI){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},wi=class r extends yt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let s=[],a=[];function o(u,p,m,y){let v=y+1,f=[];for(let _=0;_<=v;_++){f[_]=[];let x=u.clone().lerp(m,_/v),M=p.clone().lerp(m,_/v),T=v-_;for(let w=0;w<=T;w++)f[_][w]=w===0&&_===v?x:x.clone().lerp(M,w/T)}for(let _=0;_<v;_++)for(let x=0;x<2*(v-_)-1;x++){let M=Math.floor(x/2);x%2==0?(l(f[_][M+1]),l(f[_+1][M]),l(f[_][M])):(l(f[_][M+1]),l(f[_+1][M+1]),l(f[_+1][M]))}}function l(u){s.push(u.x,u.y,u.z)}function c(u,p){let m=3*u;p.x=e[m+0],p.y=e[m+1],p.z=e[m+2]}function h(u,p,m,y){y<0&&u.x===1&&(a[p]=u.x-1),m.x===0&&m.z===0&&(a[p]=y/2/Math.PI+.5)}function d(u){return Math.atan2(u.z,-u.x)}(function(u){let p=new E,m=new E,y=new E;for(let v=0;v<t.length;v+=3)c(t[v+0],p),c(t[v+1],m),c(t[v+2],y),o(p,m,y,u)})(i),function(u){let p=new E;for(let m=0;m<s.length;m+=3)p.x=s[m+0],p.y=s[m+1],p.z=s[m+2],p.normalize().multiplyScalar(u),s[m+0]=p.x,s[m+1]=p.y,s[m+2]=p.z}(n),function(){let u=new E;for(let m=0;m<s.length;m+=3){u.x=s[m+0],u.y=s[m+1],u.z=s[m+2];let y=d(u)/2/Math.PI+.5,v=(p=u,Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))/Math.PI+.5);a.push(y,1-v)}var p;(function(){let m=new E,y=new E,v=new E,f=new E,_=new pe,x=new pe,M=new pe;for(let T=0,w=0;T<s.length;T+=9,w+=6){m.set(s[T+0],s[T+1],s[T+2]),y.set(s[T+3],s[T+4],s[T+5]),v.set(s[T+6],s[T+7],s[T+8]),_.set(a[w+0],a[w+1]),x.set(a[w+2],a[w+3]),M.set(a[w+4],a[w+5]),f.copy(m).add(y).add(v).divideScalar(3);let C=d(f);h(_,w+0,m,C),h(x,w+2,y,C),h(M,w+4,v,C)}})(),function(){for(let m=0;m<a.length;m+=6){let y=a[m+0],v=a[m+2],f=a[m+4],_=Math.max(y,v,f),x=Math.min(y,v,f);_>.9&&x<.1&&(y<.2&&(a[m+0]+=1),v<.2&&(a[m+2]+=1),f<.2&&(a[m+4]+=1))}}()}(),this.setAttribute("position",new qe(s,3)),this.setAttribute("normal",new qe(s.slice(),3)),this.setAttribute("uv",new qe(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.details)}},Ol=class r extends wi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},qs=new E,Ys=new E,Ro=new E,Zs=new Gn,Fl=class extends yt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let i=Math.pow(10,4),s=Math.cos(tr*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},p=[];for(let m=0;m<l;m+=3){a?(c[0]=a.getX(m),c[1]=a.getX(m+1),c[2]=a.getX(m+2)):(c[0]=m,c[1]=m+1,c[2]=m+2);let{a:y,b:v,c:f}=Zs;if(y.fromBufferAttribute(o,c[0]),v.fromBufferAttribute(o,c[1]),f.fromBufferAttribute(o,c[2]),Zs.getNormal(Ro),d[0]=`${Math.round(y.x*i)},${Math.round(y.y*i)},${Math.round(y.z*i)}`,d[1]=`${Math.round(v.x*i)},${Math.round(v.y*i)},${Math.round(v.z*i)}`,d[2]=`${Math.round(f.x*i)},${Math.round(f.y*i)},${Math.round(f.z*i)}`,d[0]!==d[1]&&d[1]!==d[2]&&d[2]!==d[0])for(let _=0;_<3;_++){let x=(_+1)%3,M=d[_],T=d[x],w=Zs[h[_]],C=Zs[h[x]],G=`${M}_${T}`,F=`${T}_${M}`;F in u&&u[F]?(Ro.dot(u[F].normal)<=s&&(p.push(w.x,w.y,w.z),p.push(C.x,C.y,C.z)),u[F]=null):G in u||(u[G]={index0:c[_],index1:c[x],normal:Ro.clone()})}}for(let m in u)if(u[m]){let{index0:y,index1:v}=u[m];qs.fromBufferAttribute(o,y),Ys.fromBufferAttribute(o,v),p.push(qs.x,qs.y,qs.z),p.push(Ys.x,Ys.y,Ys.z)}this.setAttribute("position",new qe(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},gr=class extends Qr{constructor(e){super(e),this.uuid=Pn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Qr().fromJSON(i))}return this}},pp=function(r,e,t=2){let n=e&&e.length,i=n?e[0]*t:r.length,s=Eh(r,0,i,t,!0),a=[];if(!s||s.next===s.prev)return a;let o,l,c,h,d,u,p;if(n&&(s=function(m,y,v,f){let _=[],x,M,T,w,C;for(x=0,M=y.length;x<M;x++)T=y[x]*f,w=x<M-1?y[x+1]*f:m.length,C=Eh(m,T,w,f,!1),C===C.next&&(C.steiner=!0),_.push(Mp(C));for(_.sort(_p),x=0;x<_.length;x++)v=xp(_[x],v);return v}(r,e,s,t)),r.length>80*t){o=c=r[0],l=h=r[1];for(let m=t;m<i;m+=t)d=r[m],u=r[m+1],d<o&&(o=d),u<l&&(l=u),d>c&&(c=d),u>h&&(h=u);p=Math.max(c-o,h-l),p=p!==0?32767/p:0}return ns(s,a,t,o,l,p,0),a};function Eh(r,e,t,n,i){let s,a;if(i===function(o,l,c,h){let d=0;for(let u=l,p=c-h;u<c;u+=h)d+=(o[p]-o[u])*(o[u+1]+o[p+1]),p=u;return d}(r,e,t,n)>0)for(s=e;s<t;s+=n)a=wh(s,r[s],r[s+1],a);else for(s=t-n;s>=e;s-=n)a=wh(s,r[s],r[s+1],a);return a&&za(a,a.next)&&(rs(a),a=a.next),a}function Ti(r,e){if(!r)return r;e||(e=r);let t,n=r;do if(t=!1,n.steiner||!za(n,n.next)&&Mt(n.prev,n,n.next)!==0)n=n.next;else{if(rs(n),n=e=n.prev,n===n.next)break;t=!0}while(t||n!==e);return e}function ns(r,e,t,n,i,s,a){if(!r)return;!a&&s&&function(h,d,u,p){let m=h;do m.z===0&&(m.z=Bl(m.x,m.y,d,u,p)),m.prevZ=m.prev,m.nextZ=m.next,m=m.next;while(m!==h);m.prevZ.nextZ=null,m.prevZ=null,function(y){let v,f,_,x,M,T,w,C,G=1;do{for(f=y,y=null,M=null,T=0;f;){for(T++,_=f,w=0,v=0;v<G&&(w++,_=_.nextZ,_);v++);for(C=G;w>0||C>0&&_;)w!==0&&(C===0||!_||f.z<=_.z)?(x=f,f=f.nextZ,w--):(x=_,_=_.nextZ,C--),M?M.nextZ=x:y=x,x.prevZ=M,M=x;f=_}M.nextZ=null,G*=2}while(T>1)}(m)}(r,n,i,s);let o,l,c=r;for(;r.prev!==r.next;)if(o=r.prev,l=r.next,s?mp(r,n,i,s):fp(r))e.push(o.i/t|0),e.push(r.i/t|0),e.push(l.i/t|0),rs(r),r=l.next,c=l.next;else if((r=l)===c){a?a===1?ns(r=gp(Ti(r),e,t),e,t,n,i,s,2):a===2&&vp(r,e,t,n,i,s):ns(Ti(r),e,t,n,i,s,1);break}}function fp(r){let e=r.prev,t=r,n=r.next;if(Mt(e,t,n)>=0)return!1;let i=e.x,s=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=i<s?i<a?i:a:s<a?s:a,d=o<l?o<c?o:c:l<c?l:c,u=i>s?i>a?i:a:s>a?s:a,p=o>l?o>c?o:c:l>c?l:c,m=n.next;for(;m!==e;){if(m.x>=h&&m.x<=u&&m.y>=d&&m.y<=p&&er(i,o,s,l,a,c,m.x,m.y)&&Mt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function mp(r,e,t,n){let i=r.prev,s=r,a=r.next;if(Mt(i,s,a)>=0)return!1;let o=i.x,l=s.x,c=a.x,h=i.y,d=s.y,u=a.y,p=o<l?o<c?o:c:l<c?l:c,m=h<d?h<u?h:u:d<u?d:u,y=o>l?o>c?o:c:l>c?l:c,v=h>d?h>u?h:u:d>u?d:u,f=Bl(p,m,e,t,n),_=Bl(y,v,e,t,n),x=r.prevZ,M=r.nextZ;for(;x&&x.z>=f&&M&&M.z<=_;){if(x.x>=p&&x.x<=y&&x.y>=m&&x.y<=v&&x!==i&&x!==a&&er(o,h,l,d,c,u,x.x,x.y)&&Mt(x.prev,x,x.next)>=0||(x=x.prevZ,M.x>=p&&M.x<=y&&M.y>=m&&M.y<=v&&M!==i&&M!==a&&er(o,h,l,d,c,u,M.x,M.y)&&Mt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;x&&x.z>=f;){if(x.x>=p&&x.x<=y&&x.y>=m&&x.y<=v&&x!==i&&x!==a&&er(o,h,l,d,c,u,x.x,x.y)&&Mt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;M&&M.z<=_;){if(M.x>=p&&M.x<=y&&M.y>=m&&M.y<=v&&M!==i&&M!==a&&er(o,h,l,d,c,u,M.x,M.y)&&Mt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function gp(r,e,t){let n=r;do{let i=n.prev,s=n.next.next;!za(i,s)&&eu(i,n,n.next,s)&&is(i,s)&&is(s,i)&&(e.push(i.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),rs(n),rs(n.next),n=r=s),n=n.next}while(n!==r);return Ti(n)}function vp(r,e,t,n,i,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Sp(a,o)){let l=tu(a,o);return a=Ti(a,a.next),l=Ti(l,l.next),ns(a,e,t,n,i,s,0),void ns(l,e,t,n,i,s,0)}o=o.next}a=a.next}while(a!==r)}function _p(r,e){return r.x-e.x}function xp(r,e){let t=function(i,s){let a,o=s,l=-1/0,c=i.x,h=i.y;do{if(h<=o.y&&h>=o.next.y&&o.next.y!==o.y){let v=o.x+(h-o.y)*(o.next.x-o.x)/(o.next.y-o.y);if(v<=c&&v>l&&(l=v,a=o.x<o.next.x?o:o.next,v===c))return a}o=o.next}while(o!==s);if(!a)return null;let d=a,u=a.x,p=a.y,m,y=1/0;o=a;do c>=o.x&&o.x>=u&&c!==o.x&&er(h<p?c:l,h,u,p,h<p?l:c,h,o.x,o.y)&&(m=Math.abs(h-o.y)/(c-o.x),is(o,i)&&(m<y||m===y&&(o.x>a.x||o.x===a.x&&yp(a,o)))&&(a=o,y=m)),o=o.next;while(o!==d);return a}(r,e);if(!t)return e;let n=tu(t,r);return Ti(n,n.next),Ti(t,t.next)}function yp(r,e){return Mt(r.prev,r,e.prev)<0&&Mt(e.next,r,r.next)<0}function Bl(r,e,t,n,i){return(r=1431655765&((r=858993459&((r=252645135&((r=16711935&((r=(r-t)*i|0)|r<<8))|r<<4))|r<<2))|r<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-n)*i|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function Mp(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function er(r,e,t,n,i,s,a,o){return(i-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(i-a)*(n-o)}function Sp(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!function(t,n){let i=t;do{if(i.i!==t.i&&i.next.i!==t.i&&i.i!==n.i&&i.next.i!==n.i&&eu(i,i.next,t,n))return!0;i=i.next}while(i!==t);return!1}(r,e)&&(is(r,e)&&is(e,r)&&function(t,n){let i=t,s=!1,a=(t.x+n.x)/2,o=(t.y+n.y)/2;do i.y>o!=i.next.y>o&&i.next.y!==i.y&&a<(i.next.x-i.x)*(o-i.y)/(i.next.y-i.y)+i.x&&(s=!s),i=i.next;while(i!==t);return s}(r,e)&&(Mt(r.prev,r,e.prev)||Mt(r,e.prev,e))||za(r,e)&&Mt(r.prev,r,r.next)>0&&Mt(e.prev,e,e.next)>0)}function Mt(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function za(r,e){return r.x===e.x&&r.y===e.y}function eu(r,e,t,n){let i=Ks(Mt(r,e,t)),s=Ks(Mt(r,e,n)),a=Ks(Mt(t,n,r)),o=Ks(Mt(t,n,e));return i!==s&&a!==o||!(i!==0||!Js(r,t,e))||!(s!==0||!Js(r,n,e))||!(a!==0||!Js(t,r,n))||!(o!==0||!Js(t,e,n))}function Js(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function Ks(r){return r>0?1:r<0?-1:0}function is(r,e){return Mt(r.prev,r,r.next)<0?Mt(r,e,r.next)>=0&&Mt(r,r.prev,e)>=0:Mt(r,e,r.prev)<0||Mt(r,r.next,e)<0}function tu(r,e){let t=new zl(r.i,r.x,r.y),n=new zl(e.i,e.x,e.y),i=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=i,i.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function wh(r,e,t,n){let i=new zl(r,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function rs(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function zl(r,e,t){this.i=r,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}var ti=class r{static area(e){let t=e.length,n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return .5*n}static isClockWise(e){return r.area(e)<0}static triangulateShape(e,t){let n=[],i=[],s=[];Th(e),Ah(n,e);let a=e.length;t.forEach(Th);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,Ah(n,t[l]);let o=pp(n,i);for(let l=0;l<o.length;l+=3)s.push(o.slice(l,l+3));return s}};function Th(r){let e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function Ah(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}var ss=class r extends yt{constructor(e=new gr([new pe(.5,.5),new pe(-.5,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],s=[];for(let o=0,l=e.length;o<l;o++)a(e[o]);function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled===void 0||t.bevelEnabled,p=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:p-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,v=t.bevelSegments!==void 0?t.bevelSegments:3,f=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:bp,x,M,T,w,C,G=!1;f&&(x=f.getSpacedPoints(h),G=!0,u=!1,M=f.computeFrenetFrames(h,!1),T=new E,w=new E,C=new E),u||(v=0,p=0,m=0,y=0);let F=o.extractPoints(c),q=F.shape,H=F.holes;if(!ti.isClockWise(q)){q=q.reverse();for(let P=0,U=H.length;P<U;P++){let b=H[P];ti.isClockWise(b)&&(H[P]=b.reverse())}}let k=ti.triangulateShape(q,H),Y=q;for(let P=0,U=H.length;P<U;P++){let b=H[P];q=q.concat(b)}function X(P,U,b){return U||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(U,b)}let ee=q.length,te=k.length;function ne(P,U,b){let O,N,se,j=P.x-U.x,ae=P.y-U.y,ue=b.x-P.x,oe=b.y-P.y,ye=j*j+ae*ae,Ue=j*oe-ae*ue;if(Math.abs(Ue)>Number.EPSILON){let Pe=Math.sqrt(ye),je=Math.sqrt(ue*ue+oe*oe),Ke=U.x-ae/Pe,et=U.y+j/Pe,Be=((b.x-oe/je-Ke)*oe-(b.y+ue/je-et)*ue)/(j*oe-ae*ue);O=Ke+j*Be-P.x,N=et+ae*Be-P.y;let it=O*O+N*N;if(it<=2)return new pe(O,N);se=Math.sqrt(it/2)}else{let Pe=!1;j>Number.EPSILON?ue>Number.EPSILON&&(Pe=!0):j<-Number.EPSILON?ue<-Number.EPSILON&&(Pe=!0):Math.sign(ae)===Math.sign(oe)&&(Pe=!0),Pe?(O=-ae,N=j,se=Math.sqrt(ye)):(O=j,N=ae,se=Math.sqrt(ye/2))}return new pe(O/se,N/se)}let fe=[];for(let P=0,U=Y.length,b=U-1,O=P+1;P<U;P++,b++,O++)b===U&&(b=0),O===U&&(O=0),fe[P]=ne(Y[P],Y[b],Y[O]);let be=[],Ne,le=fe.concat();for(let P=0,U=H.length;P<U;P++){let b=H[P];Ne=[];for(let O=0,N=b.length,se=N-1,j=O+1;O<N;O++,se++,j++)se===N&&(se=0),j===N&&(j=0),Ne[O]=ne(b[O],b[se],b[j]);be.push(Ne),le=le.concat(Ne)}for(let P=0;P<v;P++){let U=P/v,b=p*Math.cos(U*Math.PI/2),O=m*Math.sin(U*Math.PI/2)+y;for(let N=0,se=Y.length;N<se;N++){let j=X(Y[N],fe[N],O);Re(j.x,j.y,-b)}for(let N=0,se=H.length;N<se;N++){let j=H[N];Ne=be[N];for(let ae=0,ue=j.length;ae<ue;ae++){let oe=X(j[ae],Ne[ae],O);Re(oe.x,oe.y,-b)}}}let he=m+y;for(let P=0;P<ee;P++){let U=u?X(q[P],le[P],he):q[P];G?(w.copy(M.normals[0]).multiplyScalar(U.x),T.copy(M.binormals[0]).multiplyScalar(U.y),C.copy(x[0]).add(w).add(T),Re(C.x,C.y,C.z)):Re(U.x,U.y,0)}for(let P=1;P<=h;P++)for(let U=0;U<ee;U++){let b=u?X(q[U],le[U],he):q[U];G?(w.copy(M.normals[P]).multiplyScalar(b.x),T.copy(M.binormals[P]).multiplyScalar(b.y),C.copy(x[P]).add(w).add(T),Re(C.x,C.y,C.z)):Re(b.x,b.y,d/h*P)}for(let P=v-1;P>=0;P--){let U=P/v,b=p*Math.cos(U*Math.PI/2),O=m*Math.sin(U*Math.PI/2)+y;for(let N=0,se=Y.length;N<se;N++){let j=X(Y[N],fe[N],O);Re(j.x,j.y,d+b)}for(let N=0,se=H.length;N<se;N++){let j=H[N];Ne=be[N];for(let ae=0,ue=j.length;ae<ue;ae++){let oe=X(j[ae],Ne[ae],O);G?Re(oe.x,oe.y+x[h-1].y,x[h-1].x+b):Re(oe.x,oe.y,d+b)}}}function Ae(P,U){let b=P.length;for(;--b>=0;){let O=b,N=b-1;N<0&&(N=P.length-1);for(let se=0,j=h+2*v;se<j;se++){let ae=ee*se,ue=ee*(se+1);S(U+O+ae,U+N+ae,U+N+ue,U+O+ue)}}}function Re(P,U,b){l.push(P),l.push(U),l.push(b)}function R(P,U,b){B(P),B(U),B(b);let O=i.length/3,N=_.generateTopUV(n,i,O-3,O-2,O-1);$(N[0]),$(N[1]),$(N[2])}function S(P,U,b,O){B(P),B(U),B(O),B(U),B(b),B(O);let N=i.length/3,se=_.generateSideWallUV(n,i,N-6,N-3,N-2,N-1);$(se[0]),$(se[1]),$(se[3]),$(se[1]),$(se[2]),$(se[3])}function B(P){i.push(l[3*P+0]),i.push(l[3*P+1]),i.push(l[3*P+2])}function $(P){s.push(P.x),s.push(P.y)}(function(){let P=i.length/3;if(u){let U=0,b=ee*U;for(let O=0;O<te;O++){let N=k[O];R(N[2]+b,N[1]+b,N[0]+b)}U=h+2*v,b=ee*U;for(let O=0;O<te;O++){let N=k[O];R(N[0]+b,N[1]+b,N[2]+b)}}else{for(let U=0;U<te;U++){let b=k[U];R(b[2],b[1],b[0])}for(let U=0;U<te;U++){let b=k[U];R(b[0]+ee*h,b[1]+ee*h,b[2]+ee*h)}}n.addGroup(P,i.length/3-P,0)})(),function(){let P=i.length/3,U=0;Ae(Y,U),U+=Y.length;for(let b=0,O=H.length;b<O;b++){let N=H[b];Ae(N,U),U+=N.length}n.addGroup(P,i.length/3-P,1)}()}this.setAttribute("position",new qe(i,3)),this.setAttribute("uv",new qe(s,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,n,i){if(i.shapes=[],Array.isArray(t))for(let s=0,a=t.length;s<a;s++){let o=t[s];i.shapes.push(o.uuid)}else i.shapes.push(t.uuid);return i.options=Object.assign({},n),n.extrudePath!==void 0&&(i.options.extrudePath=n.extrudePath.toJSON()),i}(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let n=[];for(let s=0,a=e.shapes.length;s<a;s++){let o=t[e.shapes[s]];n.push(o)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Ca[i.type]().fromJSON(i)),new r(n,e.options)}},bp={generateTopUV:function(r,e,t,n,i){let s=e[3*t],a=e[3*t+1],o=e[3*n],l=e[3*n+1],c=e[3*i],h=e[3*i+1];return[new pe(s,a),new pe(o,l),new pe(c,h)]},generateSideWallUV:function(r,e,t,n,i,s){let a=e[3*t],o=e[3*t+1],l=e[3*t+2],c=e[3*n],h=e[3*n+1],d=e[3*n+2],u=e[3*i],p=e[3*i+1],m=e[3*i+2],y=e[3*s],v=e[3*s+1],f=e[3*s+2];return Math.abs(o-h)<Math.abs(a-c)?[new pe(a,1-l),new pe(c,1-d),new pe(u,1-m),new pe(y,1-f)]:[new pe(o,1-l),new pe(h,1-d),new pe(p,1-m),new pe(v,1-f)]}},as=class r extends wi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2;super([-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},Hl=class r extends wi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},os=class r extends yt{constructor(e=.5,t=1,n=32,i=1,s=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n);let o=[],l=[],c=[],h=[],d=e,u=(t-e)/(i=Math.max(1,i)),p=new E,m=new pe;for(let y=0;y<=i;y++){for(let v=0;v<=n;v++){let f=s+v/n*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),m.x=(p.x/t+1)/2,m.y=(p.y/t+1)/2,h.push(m.x,m.y)}d+=u}for(let y=0;y<i;y++){let v=y*(n+1);for(let f=0;f<n;f++){let _=f+v,x=_,M=_+n+1,T=_+n+2,w=_+1;o.push(x,M,w),o.push(M,T,w)}}this.setIndex(o),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},kl=class r extends yt{constructor(e=new gr([new pe(0,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],s=[],a=[],o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(o,l,h),o+=l,l=0;function c(h){let d=i.length/3,u=h.extractPoints(t),p=u.shape,m=u.holes;ti.isClockWise(p)===!1&&(p=p.reverse());for(let v=0,f=m.length;v<f;v++){let _=m[v];ti.isClockWise(_)===!0&&(m[v]=_.reverse())}let y=ti.triangulateShape(p,m);for(let v=0,f=m.length;v<f;v++){let _=m[v];p=p.concat(_)}for(let v=0,f=p.length;v<f;v++){let _=p[v];i.push(_.x,_.y,0),s.push(0,0,1),a.push(_.x,_.y)}for(let v=0,f=y.length;v<f;v++){let _=y[v],x=_[0]+d,M=_[1]+d,T=_[2]+d;n.push(x,M,T),l+=3}}this.setIndex(n),this.setAttribute("position",new qe(i,3)),this.setAttribute("normal",new qe(s,3)),this.setAttribute("uv",new qe(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return function(t,n){if(n.shapes=[],Array.isArray(t))for(let i=0,s=t.length;i<s;i++){let a=t[i];n.shapes.push(a.uuid)}else n.shapes.push(t.uuid);return n}(this.parameters.shapes,e)}static fromJSON(e,t){let n=[];for(let i=0,s=e.shapes.length;i<s;i++){let a=t[e.shapes[i]];n.push(a)}return new r(n,e.curveSegments)}},ls=class r extends yt{constructor(e=1,t=32,n=16,i=0,s=2*Math.PI,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new E,u=new E,p=[],m=[],y=[],v=[];for(let f=0;f<=n;f++){let _=[],x=f/n,M=0;f===0&&a===0?M=.5/t:f===n&&l===Math.PI&&(M=-.5/t);for(let T=0;T<=t;T++){let w=T/t;d.x=-e*Math.cos(i+w*s)*Math.sin(a+x*o),d.y=e*Math.cos(a+x*o),d.z=e*Math.sin(i+w*s)*Math.sin(a+x*o),m.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),v.push(w+M,1-x),_.push(c++)}h.push(_)}for(let f=0;f<n;f++)for(let _=0;_<t;_++){let x=h[f][_+1],M=h[f][_],T=h[f+1][_],w=h[f+1][_+1];(f!==0||a>0)&&p.push(x,M,w),(f!==n-1||l<Math.PI)&&p.push(M,T,w)}this.setIndex(p),this.setAttribute("position",new qe(m,3)),this.setAttribute("normal",new qe(y,3)),this.setAttribute("uv",new qe(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},Gl=class r extends wi{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}},si=class r extends yt{constructor(e=1,t=.4,n=12,i=48,s=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);let a=[],o=[],l=[],c=[],h=new E,d=new E,u=new E;for(let p=0;p<=n;p++)for(let m=0;m<=i;m++){let y=m/i*s,v=p/n*Math.PI*2;d.x=(e+t*Math.cos(v))*Math.cos(y),d.y=(e+t*Math.cos(v))*Math.sin(y),d.z=t*Math.sin(v),o.push(d.x,d.y,d.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),u.subVectors(d,h).normalize(),l.push(u.x,u.y,u.z),c.push(m/i),c.push(p/n)}for(let p=1;p<=n;p++)for(let m=1;m<=i;m++){let y=(i+1)*p+m-1,v=(i+1)*(p-1)+m-1,f=(i+1)*(p-1)+m,_=(i+1)*p+m;a.push(y,v,_),a.push(v,f,_)}this.setIndex(a),this.setAttribute("position",new qe(o,3)),this.setAttribute("normal",new qe(l,3)),this.setAttribute("uv",new qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},Vl=class r extends yt{constructor(e=1,t=.4,n=64,i=8,s=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:s,q:a},n=Math.floor(n),i=Math.floor(i);let o=[],l=[],c=[],h=[],d=new E,u=new E,p=new E,m=new E,y=new E,v=new E,f=new E;for(let x=0;x<=n;++x){let M=x/n*s*Math.PI*2;_(M,s,a,e,p),_(M+.01,s,a,e,m),v.subVectors(m,p),f.addVectors(m,p),y.crossVectors(v,f),f.crossVectors(y,v),y.normalize(),f.normalize();for(let T=0;T<=i;++T){let w=T/i*Math.PI*2,C=-t*Math.cos(w),G=t*Math.sin(w);d.x=p.x+(C*f.x+G*y.x),d.y=p.y+(C*f.y+G*y.y),d.z=p.z+(C*f.z+G*y.z),l.push(d.x,d.y,d.z),u.subVectors(d,p).normalize(),c.push(u.x,u.y,u.z),h.push(x/n),h.push(T/i)}}for(let x=1;x<=n;x++)for(let M=1;M<=i;M++){let T=(i+1)*(x-1)+(M-1),w=(i+1)*x+(M-1),C=(i+1)*x+M,G=(i+1)*(x-1)+M;o.push(T,w,G),o.push(w,C,G)}function _(x,M,T,w,C){let G=Math.cos(x),F=Math.sin(x),q=T/M*x,H=Math.cos(q);C.x=w*(2+H)*.5*G,C.y=w*(2+H)*F*.5,C.z=w*Math.sin(q)*.5}this.setIndex(o),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new r(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},Wl=class r extends yt{constructor(e=new Aa(new E(-1,-1,0),new E(-1,1,0),new E(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};let a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new E,l=new E,c=new pe,h=new E,d=[],u=[],p=[],m=[];function y(v){h=e.getPointAt(v/t,h);let f=a.normals[v],_=a.binormals[v];for(let x=0;x<=i;x++){let M=x/i*Math.PI*2,T=Math.sin(M),w=-Math.cos(M);l.x=w*f.x+T*_.x,l.y=w*f.y+T*_.y,l.z=w*f.z+T*_.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,d.push(o.x,o.y,o.z)}}(function(){for(let v=0;v<t;v++)y(v);y(s===!1?t:0),function(){for(let v=0;v<=t;v++)for(let f=0;f<=i;f++)c.x=v/t,c.y=f/i,p.push(c.x,c.y)}(),function(){for(let v=1;v<=t;v++)for(let f=1;f<=i;f++){let _=(i+1)*(v-1)+(f-1),x=(i+1)*v+(f-1),M=(i+1)*v+f,T=(i+1)*(v-1)+f;m.push(_,x,T),m.push(x,M,T)}}()})(),this.setIndex(m),this.setAttribute("position",new qe(d,3)),this.setAttribute("normal",new qe(u,3)),this.setAttribute("uv",new qe(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new r(new Ca[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},Xl=class extends yt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,i=new E,s=new E;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let d=l[c],u=d.start;for(let p=u,m=u+d.count;p<m;p+=3)for(let y=0;y<3;y++){let v=o.getX(p+y),f=o.getX(p+(y+1)%3);i.fromBufferAttribute(a,v),s.fromBufferAttribute(a,f),Rh(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,d=3*o+(c+1)%3;i.fromBufferAttribute(a,h),s.fromBufferAttribute(a,d),Rh(i,s,n)===!0&&(t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new qe(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Rh(r,e,t){let n=`${r.x},${r.y},${r.z}-${e.x},${e.y},${e.z}`,i=`${e.x},${e.y},${e.z}-${r.x},${r.y},${r.z}`;return t.has(n)!==!0&&t.has(i)!==!0&&(t.add(n),t.add(i),!0)}var Lf=Object.freeze({__proto__:null,BoxGeometry:en,CapsuleGeometry:es,CircleGeometry:mr,ConeGeometry:ts,CylinderGeometry:Vt,DodecahedronGeometry:Ol,EdgesGeometry:Fl,ExtrudeGeometry:ss,IcosahedronGeometry:as,LatheGeometry:Pa,OctahedronGeometry:Hl,PlaneGeometry:qt,PolyhedronGeometry:wi,RingGeometry:os,ShapeGeometry:kl,SphereGeometry:ls,TetrahedronGeometry:Gl,TorusGeometry:si,TorusKnotGeometry:Vl,TubeGeometry:Wl,WireframeGeometry:Xl});var Sn=class extends ri{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new He(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},cs=class extends Sn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new pe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ct(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new He(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new He(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new He(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function $s(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function Ep(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}var vr=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];t:{e:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break e}a=t.length;break n}if(e>=s)break t;{let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break e}a=n,n=0}}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},jl=class extends vr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Rc,endingEnd:Rc}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Cc:s=e,o=2*t-n;break;case Pc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Cc:a=e,l=2*n-t;break;case Pc:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}let c=.5*(n-t),h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,m=(n-t)/(i-t),y=m*m,v=y*m,f=-u*v+2*u*y-u*m,_=(1+u)*v+(-1.5-2*u)*y+(-.5+u)*m+1,x=(-1-p)*v+(1.5+p)*y+.5*m,M=p*v-p*y;for(let T=0;T!==o;++T)s[T]=f*a[h+T]+_*a[c+T]+x*a[l+T]+M*a[d+T];return s}},ql=class extends vr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),d=1-h;for(let u=0;u!==o;++u)s[u]=a[c+u]*d+a[l+u]*h;return s}},Yl=class extends vr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},_n=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=$s(t,this.TimeBufferType),this.values=$s(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:$s(e.times,Array),values:$s(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Yl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ql(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new jl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case sa:t=this.InterpolantFactoryMethodDiscrete;break;case hl:t=this.InterpolantFactoryMethodLinear;break;case Za:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(n);this.setInterpolation(this.DefaultInterpolation)}return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return sa;case this.InterpolantFactoryMethodLinear:return hl;case this.InterpolantFactoryMethodSmooth:return Za}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!=0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&Ep(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Za,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,c=e[o];if(c!==e[o+1]&&(o!==1||c!==e[0]))if(i)l=!0;else{let h=o*n,d=h-n,u=h+n;for(let p=0;p!==n;++p){let m=t[h+p];if(m!==t[d+p]||m!==t[u+p]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,d=a*n;for(let u=0;u!==n;++u)t[d+u]=t[h+u]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=new this.constructor(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}};_n.prototype.TimeBufferType=Float32Array,_n.prototype.ValueBufferType=Float32Array,_n.prototype.DefaultInterpolation=hl;var Si=class extends _n{constructor(e,t,n){super(e,t,n)}};Si.prototype.ValueTypeName="bool",Si.prototype.ValueBufferType=Array,Si.prototype.DefaultInterpolation=sa,Si.prototype.InterpolantFactoryMethodLinear=void 0,Si.prototype.InterpolantFactoryMethodSmooth=void 0;var Zl=class extends _n{};Zl.prototype.ValueTypeName="color";var Jl=class extends _n{};Jl.prototype.ValueTypeName="number";var Kl=class extends vr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t),c=e*o;for(let h=c+o;c!==h;c+=4)Gt.slerpFlat(s,0,a,c-o,a,c,l);return s}},Ia=class extends _n{InterpolantFactoryMethodLinear(e){return new Kl(this.times,this.values,this.getValueSize(),e)}};Ia.prototype.ValueTypeName="quaternion",Ia.prototype.InterpolantFactoryMethodSmooth=void 0;var bi=class extends _n{constructor(e,t,n){super(e,t,n)}};bi.prototype.ValueTypeName="string",bi.prototype.ValueBufferType=Array,bi.prototype.DefaultInterpolation=sa,bi.prototype.InterpolantFactoryMethodLinear=void 0,bi.prototype.InterpolantFactoryMethodSmooth=void 0;var $l=class extends _n{};$l.prototype.ValueTypeName="vector";var Ql=class{constructor(e,t,n){let i=this,s,a=!1,o=0,l=0,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){l++,a===!1&&i.onStart!==void 0&&i.onStart(h,o,l),a=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,l),o===l&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return s?s(h):h},this.setURLModifier=function(h){return s=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],m=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return m}return null}}},wp=new Ql,ec=class{constructor(e){this.manager=e!==void 0?e:wp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};ec.DEFAULT_MATERIAL_NAME="__DEFAULT";var hs=class extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new He(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},La=class extends hs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new He(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Co=new Xe,Ch=new E,Ph=new E,Ua=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.map=null,this.mapPass=null,this.matrix=new Xe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ur,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Ch.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ch),Ph.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ph),t.updateMatrixWorld(),Co.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Co),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Co)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Ih=new Xe,Hr=new E,Po=new E,tc=class extends Ua{constructor(){super(new zt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new pe(4,2),this._viewportCount=6,this._viewports=[new dt(2,1,1,1),new dt(0,1,1,1),new dt(3,1,1,1),new dt(1,1,1,1),new dt(3,0,1,1),new dt(1,0,1,1)],this._cubeDirections=[new E(1,0,0),new E(-1,0,0),new E(0,0,1),new E(0,0,-1),new E(0,1,0),new E(0,-1,0)],this._cubeUps=[new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,0,1),new E(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Hr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Hr),Po.copy(n.position),Po.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Po),n.updateMatrixWorld(),i.makeTranslation(-Hr.x,-Hr.y,-Hr.z),Ih.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ih)}},Da=class extends hs{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new tc}get power(){return 4*this.intensity*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},nc=class extends Ua{constructor(){super(new va(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Na=class extends hs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new nc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Uf=new Xe,Df=new Xe,Nf=new Xe;var Of=new E,Ff=new Gt,Bf=new E,zf=new E;var Hf=new E,kf=new Gt,Gf=new E,Vf=new E;var vc="\\[\\]\\.:\\/",Tp=new RegExp("["+vc+"]","g"),Io="[^"+vc+"]",Ap="[^"+vc.replace("\\.","")+"]",Rp=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",Io)+/(WCOD+)?/.source.replace("WCOD",Ap)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Io)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Io)+"$"),Cp=["material","materials","bones","map"],xt=class r{constructor(e,t,n){this.path=t,this.parsedPath=n||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,n):new r(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Tp,"")}static parseTrackName(e){let t=Rp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);Cp.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[n]===void 0)return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[n]}if(c!==void 0){if(e[c]===void 0)return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[c]}}let a=e[i];if(a===void 0){let c=t.nodeName;return void console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e)}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=class{constructor(r,e,t){let n=t||xt.parseTrackName(e);this._targetGroup=r,this._bindings=r.subscribe_(e,n)}getValue(r,e){this.bind();let t=this._targetGroup.nCachedObjects_,n=this._bindings[t];n!==void 0&&n.getValue(r,e)}setValue(r,e){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].setValue(r,e)}bind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].bind()}unbind(){let r=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=r.length;e!==t;++e)r[e].unbind()}},xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray],xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wf=new Float32Array(1);var Xf=new Xe;var jf=new pe;var qf=new E,Yf=new E;var Zf=new E;var Jf=new E,Kf=new Xe,$f=new Xe;var Qf=new E,em=new He,tm=new He;var nm=new E,im=new E,rm=new E;var sm=new E,am=new Zr;var om=new yn;var lm=new E;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lo}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lo);var ds=new E;function ln(r,e,t,n,i,s){let a=2*Math.PI*i/4,o=Math.max(s-2*i,0),l=Math.PI/4;ds.copy(e),ds[n]=0,ds.normalize();let c=.5*a/(a+o),h=1-ds.angleTo(r)/l;return Math.sign(ds[t])===1?h*c:o/(a+o)+c+c*(1-h)}var ps=class extends en{constructor(e=1,t=1,n=1,i=2,s=.1){if(i=i*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,i,i,i),i===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let o=new E,l=new E,c=new E(e,t,n).divideScalar(2).subScalar(s),h=this.attributes.position.array,d=this.attributes.normal.array,u=this.attributes.uv.array,p=h.length/6,m=new E,y=.5/i;for(let v=0,f=0;v<h.length;v+=3,f+=2)switch(o.fromArray(h,v),l.copy(o),l.x-=Math.sign(l.x)*y,l.y-=Math.sign(l.y)*y,l.z-=Math.sign(l.z)*y,l.normalize(),h[v+0]=c.x*Math.sign(o.x)+l.x*s,h[v+1]=c.y*Math.sign(o.y)+l.y*s,h[v+2]=c.z*Math.sign(o.z)+l.z*s,d[v+0]=l.x,d[v+1]=l.y,d[v+2]=l.z,Math.floor(v/p)){case 0:m.set(1,0,0),u[f+0]=ln(m,l,"z","y",s,n),u[f+1]=1-ln(m,l,"y","z",s,t);break;case 1:m.set(-1,0,0),u[f+0]=1-ln(m,l,"z","y",s,n),u[f+1]=1-ln(m,l,"y","z",s,t);break;case 2:m.set(0,1,0),u[f+0]=1-ln(m,l,"x","z",s,e),u[f+1]=ln(m,l,"z","x",s,n);break;case 3:m.set(0,-1,0),u[f+0]=1-ln(m,l,"x","z",s,e),u[f+1]=1-ln(m,l,"z","x",s,n);break;case 4:m.set(0,0,1),u[f+0]=1-ln(m,l,"x","y",s,e),u[f+1]=1-ln(m,l,"y","x",s,t);break;case 5:m.set(0,0,-1),u[f+0]=ln(m,l,"x","y",s,e),u[f+1]=1-ln(m,l,"y","x",s,t);break}}};var Ha=class extends pr{constructor(){super();let e=new en;e.deleteAttribute("uv");let t=new Sn({side:Ht}),n=new Sn,i=new Da(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let s=new ke(e,t);s.position.set(-.757,13.219,.717),s.scale.set(31.713,28.305,28.591),this.add(s);let a=new ke(e,n);a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),this.add(a);let o=new ke(e,n);o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),this.add(o);let l=new ke(e,n);l.position.set(6.167,.857,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);let c=new ke(e,n);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);let h=new ke(e,n);h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),this.add(h);let d=new ke(e,n);d.position.set(-2.193,-.369,-5.547),d.rotation.set(0,.516,0),d.scale.set(3.875,3.487,2.986),this.add(d);let u=new ke(e,yr(50));u.position.set(-16.116,14.37,8.208),u.scale.set(.1,2.428,2.739),this.add(u);let p=new ke(e,yr(50));p.position.set(-16.109,18.021,-8.207),p.scale.set(.1,2.425,2.751),this.add(p);let m=new ke(e,yr(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);let y=new ke(e,yr(43));y.position.set(-.462,8.89,14.52),y.scale.set(4.38,5.441,.088),this.add(y);let v=new ke(e,yr(20));v.position.set(3.235,11.486,-12.541),v.scale.set(2.5,2,.1),this.add(v);let f=new ke(e,yr(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function yr(r){let e=new wt;return e.color.setScalar(r),e}var _e={ground:"#f2f1ec",pad:"#e5e3db",road:"#d9d6cc",white:"#fbfaf6",offwhite:"#f3f1ea",sand:"#dbb77e",tan:"#d6ba8e",ink:"#1a1a16",inkSoft:"#2c2d27",glass:"#39403f",sage:"#b9c6a2",water:"#a9cdd6",trees:["#5e8a73","#4d7a65","#739c84","#68927b"]};function Ai(r){return()=>{r|=0,r=r+1831565813|0;let e=Math.imul(r^r>>>15,1|r);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var ka=r=>r*r*(3-2*r),Ga=r=>Math.min(1,Math.max(0,r)),_c=(r,e,t)=>r+(e-r)*t,xc=new Map;function Ye(r,e={}){r===_e.glass&&e.rough===void 0&&(e={...e,rough:.08,metal:.55});let t=r+JSON.stringify(e,(i,s)=>s&&s.isTexture?s.uuid:s);if(xc.has(t))return xc.get(t);let n;return e.basic?n=new wt({color:r,map:e.map||null,transparent:!!e.transparent,side:e.side||xn,toneMapped:!1}):n=new(e.clearcoat?cs:Sn)({color:r,map:e.map||null,flatShading:!!e.flat,side:e.side||xn,roughness:e.rough??.82,metalness:e.metal??0,...e.clearcoat?{clearcoat:e.clearcoat,clearcoatRoughness:.18}:{},emissive:e.emissive||"#000000",emissiveMap:e.emissiveMap||null,emissiveIntensity:e.ei??1,vertexColors:!!e.vc,transparent:!!e.transparent,opacity:e.opacity??1,polygonOffset:!!e.offset,polygonOffsetFactor:e.offset?-2:0,polygonOffsetUnits:e.offset?-4:0}),xc.set(t,n),n}var ms=new en(1,1,1);function Se(r,e,t,n,i,s,a,o,l={}){let c=new ke(ms,l.material||Ye(i,l));return c.scale.set(e,t,n),c.position.set(s,a+t/2,o),l.ry&&(c.rotation.y=l.ry),c.castShadow=l.cast!==!1,c.receiveShadow=l.receive!==!1,r.add(c),c}function oi(r,e,t,n,i,s,a,o=0,l=0){let c=new ke(new qt(e,t),n);return c.position.set(i,s,a),c.rotation.set(l,o,0,"YXZ"),r.add(c),c}function bn(r,e,t,n,i,s,a,o,l={}){let c=new ke(new Vt(e,t,n,l.seg||16),l.material||Ye(i,l));return c.position.set(s,a+n/2,o),c.castShadow=l.cast!==!1,c.receiveShadow=!0,r.add(c),c}var gs=2,iu=8;function Ut(r,e,t){let n=document.createElement("canvas");n.width=Math.round(r*gs),n.height=Math.round(e*gs);let i=n.getContext("2d");i.scale(gs,gs),t(i,r,e);let s=new ba(n);return s.colorSpace=$t,s.anisotropy=iu,s}function cn(r,e,t,n,i,s){r.beginPath(),r.roundRect(e,t,n,i,s)}var pt={sans:(r,e)=>`${r} ${e}px Inter, system-ui, sans-serif`,serif:r=>`italic 400 ${r}px "Instrument Serif", Georgia, serif`,display:r=>`300 ${r}px Fraunces, Georgia, serif`};function Ip(r,e,t,n="#e9e7e0"){let i=Math.round(t*.075);return r.fillStyle=n,r.fillRect(0,0,e,i),["#e7a28f","#e8cf8a","#a8c79a"].forEach((s,a)=>{r.fillStyle=s,r.beginPath(),r.arc(i*.6+a*i*.55,i/2,i*.16,0,7),r.fill()}),r.fillStyle="rgba(0,0,0,0.07)",cn(r,e*.3,i*.22,e*.4,i*.56,i*.28),r.fill(),i}function fs(r,e,t,n,i,s,a){r.font=pt.sans(600,a);let o=r.measureText(n).width;r.fillStyle=i,cn(r,e,t,o+a*2.2,a*2.2,a*1.1),r.fill(),r.fillStyle=s,r.textBaseline="middle",r.fillText(n,e+a*1.1,t+a*1.12),r.textBaseline="alphabetic"}function yc(r,e){return Ut(1024,640,(t,n,i)=>{let s=Ip(t,n,i),a=i-s;if(r==="pc"){t.fillStyle="#141412",t.fillRect(0,s,n,a);let o=t.createRadialGradient(n*.78,s+a*.5,10,n*.78,s+a*.5,a*.55);o.addColorStop(0,"rgba(219,183,126,0.55)"),o.addColorStop(1,"rgba(219,183,126,0)"),t.fillStyle=o,t.fillRect(0,s,n,a),e&&t.drawImage(e,n*.66,s+a*.18,a*.62,a*.62),t.fillStyle="#ecebe4",t.font=pt.sans(600,22),t.fillText("patient creations.",48,s+50),t.font=pt.sans(300,64),t.fillText("Built to stand out.",48,s+a*.42),t.fillStyle="#dbb77e",t.font=pt.serif(70),t.fillText("Made to move you",48,s+a*.58),t.fillText("forward.",48,s+a*.72),fs(t,48,s+a*.8,"Start a project  \u2192","#dbb77e","#1a1a16",18)}else if(r==="barber"){t.fillStyle="#16130f",t.fillRect(0,s,n,a),t.fillStyle="#2a241c",t.fillRect(n*.55,s,n*.45,a),t.strokeStyle="#dbb77e",t.lineWidth=6;for(let o=0;o<9;o++)t.beginPath(),t.moveTo(n*.6+o*40,s),t.lineTo(n*.6+o*40-120,s+a),t.stroke();t.fillStyle="#a3a39a",t.font=pt.sans(500,18),t.fillText("DESIGN CONCEPT / 01 \xB7 BARBERSHOP",48,s+56),t.fillStyle="#ecebe4",t.font=pt.serif(96),t.fillText("The cut.",48,s+a*.42),t.font=pt.sans(300,34),t.fillText("Sharp style.",48,s+a*.56),t.fillText("Lasting impressions.",48,s+a*.66),fs(t,48,s+a*.78,"Book a chair","#dbb77e","#16130f",18)}else if(r==="restaurant"){t.fillStyle="#f2ead9",t.fillRect(0,s,n,a);let o=n*.76,l=s+a*.52;t.fillStyle="#fff",t.beginPath(),t.arc(o,l,a*.34,0,7),t.fill(),t.fillStyle="#d9a35f",t.beginPath(),t.arc(o,l,a*.24,0,7),t.fill(),t.fillStyle="#8fa37a",t.beginPath(),t.arc(o-30,l-20,34,0,7),t.fill(),t.fillStyle="#c4553f",t.beginPath(),t.arc(o+40,l+18,28,0,7),t.fill(),t.fillStyle="#8b7350",t.font=pt.sans(500,18),t.fillText("DESIGN CONCEPT / 02 \xB7 RESTAURANT",48,s+56),t.fillStyle="#1a1a16",t.font=pt.display(86),t.fillText("At the table",48,s+a*.42),t.font=pt.sans(300,34),t.fillText("Good food.",48,s+a*.56),t.fillText("Great company.",48,s+a*.66),fs(t,48,s+a*.78,"See the menu","#1a1a16","#f2ead9",18)}else r==="retail"?(t.fillStyle="#e1e7d4",t.fillRect(0,s,n,a),[[.62,.3,"#b9c6a2"],[.8,.3,"#dbb77e"],[.62,.62,"#1d2826"],[.8,.62,"#f8f6ef"]].forEach(([o,l,c])=>{t.fillStyle=c,cn(t,n*o,s+a*l-70,n*.16,a*.28,14),t.fill()}),t.fillStyle="#5d6b4c",t.font=pt.sans(500,18),t.fillText("DESIGN CONCEPT / 03 \xB7 LOCAL RETAIL",48,s+56),t.fillStyle="#1d2826",t.font=pt.sans(300,60),t.fillText("Something",48,s+a*.38),t.font=pt.serif(78),t.fillText("worth",48,s+a*.52),t.font=pt.sans(300,60),t.fillText("discovering.",48,s+a*.66),fs(t,48,s+a*.78,"Shop local","#1d2826","#e1e7d4",18)):r==="form"&&(t.fillStyle="#f7f6f1",t.fillRect(0,s,n,a),t.fillStyle="#1a1a16",t.font=pt.sans(300,54),t.fillText("Get a quote",64,s+100),["Your name","Phone or email","What do you need?"].forEach((o,l)=>{let c=s+150+l*92;t.fillStyle="#fff",cn(t,64,c,n-128,64,12),t.fill(),t.strokeStyle="rgba(26,26,22,0.18)",t.lineWidth=2,t.stroke(),t.fillStyle="#8a8a80",t.font=pt.sans(400,24),t.fillText(o,88,c+41)}),fs(t,64,s+440,"Send  \u2192","#dbb77e","#1a1a16",22))})}function Mc(r){return r==="ugc"?Ut(540,960,(e,t,n)=>{let i=e.createLinearGradient(0,0,0,n);i.addColorStop(0,"#e8d8bf"),i.addColorStop(1,"#b99a6e"),e.fillStyle=i,e.fillRect(0,0,t,n),e.fillStyle="#f3e8d8",e.beginPath(),e.arc(t/2,n*.42,90,0,7),e.fill(),e.fillStyle="#2c2d27",e.beginPath(),e.arc(t/2,n*.37,96,Math.PI,0),e.fill(),e.fillStyle="#1d2826",cn(e,t/2-170,n*.55,340,420,140),e.fill(),e.fillStyle="rgba(0,0,0,0.78)",cn(e,40,n*.12,t-80,120,22),e.fill(),e.fillStyle="#fff",e.font=pt.sans(600,34),e.textAlign="center",e.fillText("POV: you finally got",t/2,n*.12+50),e.fillText("a real website",t/2,n*.12+92),e.textAlign="left",e.fillStyle="#fff",e.font=pt.sans(600,22),e.fillText("UGC AD \xB7 HOOK 1 of 3",40,n-60),["\u2665","\u2726","\u2197"].forEach((s,a)=>{e.font=pt.sans(600,44),e.fillText(s,t-80,n*.55+a*90)})}):Ut(1024,576,(e,t,n)=>{if(r==="cinematic"){let i=e.createLinearGradient(0,0,0,n);i.addColorStop(0,"#2b2a38"),i.addColorStop(.55,"#d79b62"),i.addColorStop(1,"#f1d29a"),e.fillStyle=i,e.fillRect(0,0,t,n),e.fillStyle="#f8e6bd",e.beginPath(),e.arc(t*.68,n*.62,70,0,7),e.fill(),e.fillStyle="#1d2826",e.beginPath(),e.moveTo(0,n),e.lineTo(0,n*.7),e.bezierCurveTo(t*.25,n*.55,t*.45,n*.78,t*.7,n*.68),e.bezierCurveTo(t*.85,n*.62,t,n*.72,t,n*.72),e.lineTo(t,n),e.fill(),e.fillStyle="#000",e.fillRect(0,0,t,n*.11),e.fillRect(0,n*.89,t,n*.11),e.fillStyle="#ecebe4",e.font=pt.serif(86),e.fillText("Stop the scroll.",70,n*.42),e.font=pt.sans(500,22),e.fillStyle="#dbb77e",e.fillText("CINEMATIC AD SPECIAL \xB7 16:9 + 9:16",72,n*.52)}else if(r==="lake"){let i=e.createLinearGradient(0,0,0,n);i.addColorStop(0,"#cfe0e6"),i.addColorStop(.6,"#eef1ea"),i.addColorStop(.6,"#8fbccb"),i.addColorStop(1,"#5d8ea3"),e.fillStyle=i,e.fillRect(0,0,t,n),e.fillStyle="#6f9a86",e.beginPath(),e.moveTo(0,n*.6),e.lineTo(t*.2,n*.42),e.lineTo(t*.45,n*.6),e.fill(),e.fillStyle="#fbfaf6",e.fillRect(t*.5,n*.38,t*.28,n*.22),e.fillStyle="#dbb77e",e.fillRect(t*.48,n*.35,t*.32,n*.04),e.fillStyle="#39403f",e.fillRect(t*.53,n*.44,t*.22,n*.08),e.fillStyle="rgba(0,0,0,0.55)",cn(e,50,n-120,470,70,35),e.fill(),e.fillStyle="#fff",e.font=pt.sans(600,28),e.fillText("Lakehouse \xB7 2 nights left",80,n-74),e.fillStyle="#1a1a16",e.font=pt.sans(600,22),e.fillText("RENTAL LISTING FILM",54,60)}})}function Lp(r,e,t){return Ut(700,420,(n,i,s)=>{n.fillStyle="#141412",cn(n,0,0,i,s,34),n.fill();let a=n.createRadialGradient(i*.82,s*.2,5,i*.82,s*.2,i*.6);a.addColorStop(0,"rgba(219,183,126,0.35)"),a.addColorStop(1,"rgba(219,183,126,0)"),n.fillStyle=a,n.fillRect(0,0,i,s),t&&n.drawImage(t,40,40,120,120),n.fillStyle="#dbb77e",n.font=pt.serif(70),n.fillText(r,44,s*.68),n.fillStyle="#a3a39a",n.font=pt.sans(500,26),n.fillText(e,46,s*.84),n.strokeStyle="#dbb77e",n.lineWidth=5;for(let o=0;o<3;o++)n.beginPath(),n.arc(i-110,110,20+o*22,-.9,.9),n.stroke()})}function Up(r,e=!0){return Ut(1024,256,(t,n,i)=>{t.fillStyle=e?"#1a1a16":"#fbfaf6",cn(t,0,0,n,i,34),t.fill(),r&&t.drawImage(r,26,18,220,220),t.fillStyle=e?"#ecebe4":"#1a1a16",t.font=pt.sans(600,92),t.fillText("patient",270,118),t.fillText("creations.",270,210)})}function Va(r,{bg:e="#1a1a16",fg:t="#ecebe4",font:n=pt.sans(600,80),w:i=1024,h:s=192}={}){return Ut(i,s,a=>{let o=a.createLinearGradient(0,0,0,s);o.addColorStop(0,nu(e,18)),o.addColorStop(1,nu(e,-10)),a.fillStyle=o,cn(a,0,0,i,s,24),a.fill(),a.save(),a.shadowColor=t,a.shadowBlur=s*.12,a.strokeStyle=t,a.globalAlpha=.85,a.lineWidth=Math.max(3,s*.025),cn(a,s*.07,s*.07,i-s*.14,s-s*.14,16),a.stroke(),a.globalAlpha=1,a.fillStyle=t,a.font=n,a.textAlign="center",a.textBaseline="middle",a.shadowBlur=s*.18,a.fillText(r,i/2,s/2+4),a.shadowBlur=s*.05,a.fillText(r,i/2,s/2+4),a.restore();let l=a.createLinearGradient(0,0,i,s);l.addColorStop(0,"rgba(255,255,255,0.10)"),l.addColorStop(.45,"rgba(255,255,255,0)"),l.addColorStop(1,"rgba(255,255,255,0.04)"),a.fillStyle=l,cn(a,0,0,i,s,24),a.fill()})}function nu(r,e){let t=parseInt(r.slice(1),16),n=i=>Math.max(0,Math.min(255,Math.round(i+e/100*255)));return`rgb(${n(t>>16)},${n(t>>8&255)},${n(t&255)})`}function Dp(r=!0){let e=Ut(512,256,(t,n,i)=>{t.fillStyle="#5b5a55",t.fillRect(0,0,n,i);let s=Ai(21);for(let a=0;a<5e3;a++)t.fillStyle=s()>.5?`rgba(255,255,255,${s()*.07})`:`rgba(0,0,0,${s()*.12})`,t.fillRect(s()*n,s()*i,1.4,1.4);t.fillStyle="rgba(0,0,0,0.08)",t.fillRect(0,i*.18,n,i*.12),t.fillRect(0,i*.7,n,i*.12),t.fillStyle="#ecebe4",t.fillRect(0,i*.045,n,i*.03),t.fillRect(0,i*.925,n,i*.03),r&&(t.fillStyle="#e6c77d",t.fillRect(0,i*.485,n*.55,i*.03))});return e.wrapS=ni,e}function Np(){let r=Ut(256,256,(e,t,n)=>{e.fillStyle="#e8e4da",e.fillRect(0,0,t,n);let i=Ai(8);for(let s=0;s<8;s++)for(let a=0;a<4;a++){let o=i()*26;e.fillStyle=`rgba(${206+o},${200+o},${188+o},0.55)`,e.fillRect(a*64+s%2*32+2,s*32+2,60,28)}});return r.wrapS=r.wrapT=ni,r}function Op(r){let e=Ut(256,256,n=>{n.fillStyle="rgba(219,183,126,0.25)",n.beginPath(),n.arc(128,128,124,0,7),n.fill(),n.fillStyle="#dbb77e",n.beginPath(),n.arc(128,128,96,0,7),n.fill(),n.fillStyle="#1a1a16",n.font=pt.sans(600,84),n.textAlign="center",n.textBaseline="middle",n.fillText(r,128,134)}),t=new Jr(new fr({map:e,toneMapped:!1}));return t.scale.set(3.2,3.2,1),t}function Fp(r,e){return Ut(512,512,(n,i,s)=>{n.fillStyle="#23241f",n.fillRect(0,0,i,s);let a=Ai(7),o=i/r,l=s/e;for(let c=0;c<e;c++)for(let h=0;h<r;h++){let d=a()>.28;n.fillStyle=d?a()>.5?"#f1cf8f":"#dbb77e":"#3a3b34",n.fillRect(h*o+o*.14,c*l+l*.2,o*.72,l*.6)}})}function Bp(){return Ut(1024,256,(r,e,t)=>{r.fillStyle="#1d2826",r.fillRect(0,0,e,t);let n=Ai(3);for(let i=0;i<24;i++){r.fillStyle="#25332f",r.fillRect(12+i*42,16,34,t-32);for(let s=0;s<10;s++)r.fillStyle=n()>.4?"#dbb77e":"#5f7a6f",r.fillRect(20+i*42,28+s*21,6,6)}})}function zp(){let r=Ut(128,256,(e,t,n)=>{let i=["#fbfaf6","#dbb77e","#fbfaf6","#1a1a16"];for(let s=-8;s<16;s++)e.fillStyle=i[(s%4+4)%4],e.beginPath(),e.moveTo(0,s*32),e.lineTo(t,s*32-64),e.lineTo(t,s*32-32),e.lineTo(0,s*32+32),e.fill()});return r.wrapS=r.wrapT=ni,r}function ru(r,{logo:e,lowPower:t=!1,capture:n=!1}={}){let i=new xa({canvas:r,antialias:!0,powerPreference:"high-performance",preserveDrawingBuffer:n});i.setPixelRatio(1),i.outputColorSpace=$t,i.toneMapping=sc,i.toneMappingExposure=1,i.shadowMap.enabled=!0,i.shadowMap.type=ic;let s=i.capabilities;iu=s.getMaxAnisotropy(),gs=2;let a=!t&&s.maxTextureSize>=8192?4096:2048,o=new pr;o.background=new He(_e.ground),o.fog=new ya(_e.ground,200,600);let l=new dr(i);o.environment=l.fromScene(new Ha,.04).texture,o.environmentIntensity=.38,l.dispose();let c=new zt(22,1,1,3e3),h=new La("#ffffff","#cfc7b4",1.25);o.add(h);let d=new Na("#fff6e8",4.2);d.castShadow=!0,d.shadow.mapSize.set(a,a);let u=d.shadow.camera;u.left=-75,u.right=75,u.top=75,u.bottom=-75,u.near=1,u.far=400,d.shadow.bias=-3e-4,d.shadow.normalBias=.03,d.shadow.radius=2.5,o.add(d,d.target);let p=new E(85,115,25),m=new ke(new qt(2400,1400),Ye(_e.ground));m.rotation.x=-Math.PI/2,m.position.set(220,0,-90),m.receiveShadow=!0,o.add(m);let y=[],v=[],f=[],_=Ai(42),x=new E,M=(W,g,A,L,D,I)=>v.push({scene:W,pos:new E(g,A,L).add(x),title:D,text:I}),T=[0,1,2,3,4,5].map(W=>new E(W*85,0,-W*32)),w=[],C=[],G=Up(e,!0),F=Ye(_e.white,{rough:.32,clearcoat:.7}),q=Ye(_e.sand,{rough:.35,clearcoat:.6}),H=Ye("#2b3436",{rough:.08,metal:.4}),k=Ye("#1f1f1c",{rough:.9}),Y=Ye("#c9ccca",{rough:.3,metal:.8}),X=new wt({color:new He(1.6,1.5,1.3),toneMapped:!1}),ee=new wt({color:"#c8402e"}),te=(W,g,A,L)=>new ps(W,g,A,3,L);function ne(W,g,A,L,D,I,V=!0){let K=new ke(g,A);return K.position.set(L,D,I),K.castShadow=V,K.receiveShadow=!0,W.add(K),K}let fe=new Vt(.46,.46,.34,20);fe.rotateZ(Math.PI/2);let be=new Vt(.26,.26,.36,16);be.rotateZ(Math.PI/2);function Ne(W,g){for(let[A,L]of g)ne(W,fe,k,A,.46,L),ne(W,be,Y,A,.46,L,!1)}let le=Ye("#ffffff",{map:G,rough:.4}),he=te(2.3,2.45,4.05,.22),Ae=te(2.3,1.7,1.6,.32),Re=te(2.33,.3,4.07,.08),R=te(1.98,.78,.12,.08),S=te(.06,.62,.9,.05),B=te(.42,.18,.08,.04),$=te(.1,.3,.22,.04);function P(W,g,A,L){let D=new St;D.position.set(g,0,A),D.rotation.y=L,ne(D,he,F,0,.45+1.225,-.7),ne(D,Ae,F,0,.45+.85,2.05),ne(D,Re,q,0,1.4,-.7),ne(D,R,H,0,1.62,2.82,!1).rotation.x=-.18,ne(D,S,H,1.15,1.7,2.1,!1),ne(D,S,H,-1.15,1.7,2.1,!1),ne(D,B,X,.78,.95,2.85,!1),ne(D,B,X,-.78,.95,2.85,!1),ne(D,B,ee,.85,1,-2.74,!1),ne(D,B,ee,-.85,1,-2.74,!1),ne(D,$,F,1.25,1.85,2.55),ne(D,$,F,-1.25,1.85,2.55),oi(D,2.6,.65,le,1.17,2.3,-.7,Math.PI/2),oi(D,2.6,.65,le,-1.17,2.3,-.7,-Math.PI/2),Ne(D,[[1.02,1.95],[-1.02,1.95],[1.02,-1.75],[-1.02,-1.75]]);for(let I of[1.17,-1.17])ne(D,te(.03,.05,3.6,.02),j,I,.78,-.7,!1);return mt(D,0,0,3.1,5.6,.45),W.add(D),D}function U(W,g,A){let L=new gr;W.forEach(([I,V],K)=>K?L.lineTo(I,V):L.moveTo(I,V));let D=new ss(L,{depth:g,bevelEnabled:!0,bevelThickness:A,bevelSize:A,bevelSegments:4,curveSegments:12});return D.translate(0,0,-g/2),D.rotateY(-Math.PI/2),D.computeVertexNormals(),D}let b=U([[-2.2,.42],[2.15,.42],[2.3,.62],[2.05,.86],[1.15,.98],[.2,1.36],[-1.35,1.34],[-2.15,1.02]],1.72,.09),O=U([[1.1,.99],[.22,1.33],[-1.3,1.31],[-1.98,1.04]],1.9,.03),N=te(1.6,.06,.06,.025),se=new si(.3,.025,8,28);se.rotateY(Math.PI/2);let j=new wt({color:new He(.75,1.9,2.3),toneMapped:!1}),ae=[F,q,Ye("#2c3038",{rough:.25,metal:.6,clearcoat:.8}),Ye("#9fb3ad",{rough:.3,metal:.4,clearcoat:.7})],ue=0;function oe(W){let g=new St;ne(g,b,ae[ue++%ae.length],0,0,0),ne(g,O,H,0,0,0,!1),ne(g,N,X,0,.78,2.32,!1),ne(g,N,ee,0,.92,-2.24,!1);for(let[A,L]of[[.8,1.35],[-.8,1.35],[.8,-1.35],[-.8,-1.35]])ne(g,fe,k,A,.44,L),ne(g,be,Y,A,.44,L,!1),ne(g,se,j,A*1.02,.44,L,!1);return mt(g,0,0,2.3,4.9,.5),W.add(g),g}let ye={period:14,walkFrom:8.6,walkTo:13.4},Ue=W=>{let g=(W%ye.period+ye.period)%ye.period;return g>ye.walkFrom-1.5&&g<ye.walkTo},Pe=[0,0,0];function je(W,g,A,L,D,I){let V=[];for(let Z=0;Z<L;Z++){let Q=Z%2?1:-1,de=oe(W);de.rotation.y=Q>0?Math.PI/2:-Math.PI/2,V.push({mesh:de,dir:Q,lane:g+(Q>0?1.75:-1.75),x:-A/2+(Z+.5)/L*A,v:D})}let K=null;y.push(Z=>{let Q=K===null?.016666666666666666:Z-K;K=Z,(Q<=0||Q>.25)&&(Q=1/30);let de=Ue(Z);for(let re of V){let xe=D,Ce=(I-re.dir*3.4-re.x)*re.dir;de&&Ce>-.3&&Ce<22&&(xe=Math.min(xe,Math.sqrt(Math.max(0,Ce)*2*3.2)));for(let Te of V){if(Te===re||Te.dir!==re.dir)continue;let ce=(Te.x-re.x)*re.dir;ce<0&&(ce+=A),ce<11&&(xe=Math.min(xe,Math.max(0,(ce-6.5)*1.3)))}re.v+=Math.max(-7*Q,Math.min(2.6*Q,xe-re.v)),re.x+=re.dir*re.v*Q,re.x>A/2?re.x-=A:re.x<-A/2&&(re.x+=A),re.mesh.position.set(re.x,.06,re.lane),re.mesh.visible=Math.abs(re.x)<A/2-3}})}let Ke=Ut(128,128,W=>{let g=W.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(0,0,0,1)"),g.addColorStop(.45,"rgba(0,0,0,0.55)"),g.addColorStop(1,"rgba(0,0,0,0)"),W.fillStyle=g,W.fillRect(0,0,128,128)}),et=Ut(128,128,W=>{W.filter="blur(10px)",W.fillStyle="#000",W.fillRect(26,26,76,76)}),Be=new Map;function it(W,g){let A=W.uuid+g;return Be.has(A)||Be.set(A,new wt({map:W,color:"#2a2618",transparent:!0,opacity:g,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2})),Be.get(A)}let at=new qt(1,1);at.rotateX(-Math.PI/2);function mt(W,g,A,L,D,I=.35,V=.035,K=Ke){let Z=new ke(at,it(K,I));return Z.scale.set(L,1,D),Z.position.set(g,V,A),Z.renderOrder=1,W.add(Z),Z}let Oe=Dp(),rt=Np(),ct=Ye("#d6d2c8",{rough:.7}),Ci=new wt({color:new He(1.4,1.25,1),toneMapped:!1}),En=Ye("#b9bcbb",{rough:.35,metal:.8});function Ot(W,g,A,L,D,I=0,{sidewalk:V=2.6,lamps:K=!0,crossings:Z=[]}={}){let Q=new St;Q.position.set(g,0,A),Q.rotation.y=I;let de=D/2+.3+V+1.2;C.push([W.position.x+g-L/2,W.position.x+g+L/2,W.position.z+A-de,W.position.z+A+de]);let re=Oe.clone();re.repeat.set(L/14,1),re.needsUpdate=!0;let xe=new ke(new qt(L,D).rotateX(-Math.PI/2),Ye("#ffffff",{map:re,rough:.92}));xe.position.y=.06,xe.receiveShadow=!0,Q.add(xe);for(let Ce of[-1,1]){if(Se(Q,L,.2,.3,"",0,0,Ce*(D/2+.15),{material:ct}),V){let Te=rt.clone();Te.repeat.set(L/3,V/3),Te.needsUpdate=!0,Se(Q,L,.17,V,"",0,0,Ce*(D/2+.3+V/2),{material:Ye("#ffffff",{map:Te,rough:.85}),cast:!1})}if(K)for(let Te=-L/2+7;Te<L/2-4;Te+=16){if(Z.some(Ve=>Math.abs(Ve-Te)<3))continue;let ce=Ce*(D/2+.6);bn(Q,.07,.1,4.6,"",Te,.17,ce,{material:En,seg:10});let We=Se(Q,.12,.1,1.3,"",Te,4.65,ce-Ce*.6,{material:En}),De=Se(Q,.3,.08,.7,"",Te,4.58,ce-Ce*1.15,{material:Ci,cast:!1});z(Q,Te,4.4,ce-Ce*1.15,1.4,"#ffe2a8",.16)}}for(let Ce of Z)for(let Te=-D/2+.6;Te<D/2-.4;Te+=.9){let ce=new ke(new qt(2.6,.5).rotateX(-Math.PI/2),Ye("#eeece5",{rough:.8,offset:!0}));ce.position.set(Ce,.065,Te),ce.receiveShadow=!0,Q.add(ce)}return W.add(Q),Q}let nn=Ut(128,128,W=>{let g=W.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,255,255,1)"),g.addColorStop(.25,"rgba(255,255,255,0.45)"),g.addColorStop(1,"rgba(255,255,255,0)"),W.fillStyle=g,W.fillRect(0,0,128,128)}),hn=new Map;function z(W,g,A,L,D,I,V=.5){let K=I+V;hn.has(K)||hn.set(K,new fr({map:nn,color:I,transparent:!0,opacity:V,blending:rc,depthWrite:!1,toneMapped:!1}));let Z=new Jr(hn.get(K));return Z.position.set(g,A,L),Z.scale.set(D,D,1),W.add(Z),Z}let Ln=W=>new wt({map:W,toneMapped:!1});function rn(W,g,A,L,D,I,V,K=0,Z=0,Q="#ffd994"){let de=oi(W,g,A,Ln(L),D,I,V,K,Z),re=new ke(new qt(g*1.7,A*2.4),new wt({map:nn,color:Q,transparent:!0,opacity:.32,blending:rc,depthWrite:!1,toneMapped:!1}));return re.position.set(D,I,V),re.rotation.set(Z,K,0,"YXZ"),re.translateZ(-.04),W.add(re),de}function tt(W,g,A,L,D,I={}){for(let V=0;V<D;V++){let K=x.x+W+(_()*2-1)*A,Z=x.z+g+(_()*2-1)*L;_()<.4||f.push({x:K,z:Z,y:I.h?I.h(K,Z):0,s:.6+_()*.7})}}{let W=new St;W.position.copy(T[0]),o.add(W),x=T[0],Ot(W,0,15.8,150,7,0,{sidewalk:2.2}),Se(W,44,.04,10,_e.pad,2,0,6.5,{cast:!1}),Se(W,30,8,14,_e.white,2,0,-6),Se(W,5,8.6,14.4,_e.sand,19.5,0,-6),Se(W,30.1,.5,14.1,_e.offwhite,2,8,-6);for(let I=0;I<6;I++)Se(W,3,4,.2,"#3b3c36",-10+I*4.6,0,1.05),Se(W,3.4,.25,.6,_e.sand,-10+I*4.6,4.1,1.2,{cast:!1});let g=Ut(256,128,(I,V,K)=>{I.fillStyle="#1b2738",I.fillRect(0,0,V,K),I.strokeStyle="rgba(160,190,220,0.35)",I.lineWidth=2;for(let Z=0;Z<=V;Z+=V/8)I.beginPath(),I.moveTo(Z,0),I.lineTo(Z,K),I.stroke();for(let Z=0;Z<=K;Z+=K/4)I.beginPath(),I.moveTo(0,Z),I.lineTo(V,Z),I.stroke()}),A=Ye("#ffffff",{map:g,rough:.12,metal:.6});for(let I=0;I<3;I++)for(let V=0;V<6;V++){let K=Se(W,3.6,.08,2.2,"",-10+V*4,8.85,-11+I*4,{material:A});K.rotation.x=-.32,Se(W,.12,.5,.12,"",-10+V*4,8.5,-11+I*4+.7,{material:En})}rn(W,12,3,G,2,10.6,-.2),Se(W,.3,2.2,.3,_e.ink,-3,8.5,-.4),Se(W,.3,2.2,.3,_e.ink,7,8.5,-.4),Se(W,11,6.5,11,_e.white,-21,0,-4),Se(W,11.1,1.8,11.1,_e.glass,-21,2.4,-4,{cast:!1}),Se(W,11.1,1,11.1,_e.glass,-21,5,-4,{cast:!1});for(let I=0;I<7;I++)Se(W,1.15,.8+I%3*.4,1.15,"#d8c39e",-15.8+I%3*1.25,.04,2.3+Math.floor(I/3)*1.3);[-10,-5.4,-.8,8.4].forEach(I=>P(W,I,6.4,0));let L=P(W,0,14.05,-Math.PI/2),D=P(W,0,17.55,Math.PI/2);L.position.y=D.position.y=.06,y.push(I=>{L.position.x=70-I*7%140,D.position.x=-70+(I*5+60)%140});for(let I=0;I<6;I++)Se(W,.15,.04,4.5,"#ffffff",26+I*3,0,5,{cast:!1});tt(-38,-10,9,16,26),tt(36,-14,10,10,18),tt(0,-26,30,5,20),tt(-30,28,30,6,22),tt(30,28,30,6,22),w.push([T[0].x,T[0].z,28]),M(0,2,12,-4,"Patient Creations Studio","One creative partner. Every next step."),M(0,-5.4,3.5,6.4,"Ships on a private preview","See it before it goes live, then approve.")}{let W=new St;W.position.copy(T[1]),o.add(W),x=T[1],Se(W,38,.3,28,"#f6f5f0",0,0,0),Se(W,38,7.5,.6,_e.white,0,0,-13.7),Se(W,.6,7.5,28,_e.white,18.7,0,0),Se(W,.7,7.6,12,_e.sand,19.1,0,4),Se(W,38,1.1,.4,_e.white,0,0,13.8),Se(W,.4,1.1,28,_e.white,-18.8,0,0);for(let L=-15;L<=15;L+=6)Se(W,.3,.45,21,"#d8d5cc",L,7.4,3.5);let g=["barber","restaurant","retail"].map(L=>yc(L,e));g.forEach((L,D)=>{let I=-12+D*12;Se(W,10,6.2,.3,_e.ink,I,.9,-13.2),oi(W,9.5,5.94,Ye("#ffffff",{basic:!0,map:L}),I,3.97,-13.03)});let A=[yc("pc",e),...g];for(let L=0;L<4;L++)for(let D=0;D<5;D++){let I=-13+D*6.5,V=-6+L*5;Se(W,3.8,.9,1.7,"#e7e2d6",I,.3,V),Se(W,2.5,1.6,.14,_e.ink,I,1.5,V-.5),Se(W,.2,.35,.2,_e.ink,I,1.2,V-.5),oi(W,2.36,1.48,Ye("#ffffff",{basic:!0,map:A[(L+D)%4]}),I,2.3,V-.42),Se(W,.9,.9,.9,L%2?_e.sand:_e.inkSoft,I,.3,V+1.3)}tt(-34,0,8,22,26),tt(0,-24,26,5,18),tt(32,-20,8,10,12),tt(0,24,30,5,22),w.push([T[1].x,T[1].z,26]),M(1,-12,9,-13,"Design concept / 01 \xB7 Barbershop","The cut. Sharp style. Lasting impressions."),M(1,12,9,-13,"Design concept / 03 \xB7 Local retail","Something worth discovering."),M(1,-6.5,4,4,"Website Special \xB7 $1,250","A one-page website, live in about 72 hours, with 3 months of care.")}{let W=T[2];x=W;let g=new St;g.position.copy(W),o.add(g);let A=110,L=84,D=(Ie,Je)=>3.2+3.6*Math.sin(Ie*.075)*Math.cos(Je*.07)+2.2*Math.sin(Ie*.16+1.3)+1.8*Math.cos(Je*.13+.5),I=(Ie,Je)=>ka(Ga((A/2-Math.abs(Ie))/16))*ka(Ga((L/2-Math.abs(Je))/14)),V=(Ie,Je)=>Math.max(0,D(Ie,Je))*I(Ie,Je)+.08,K=new qt(A,L,88,68);K.rotateX(-Math.PI/2);let Z=K.attributes.position;for(let Ie=0;Ie<Z.count;Ie++)Z.setY(Ie,V(Z.getX(Ie),Z.getZ(Ie)));let Q=K.toNonIndexed();Q.computeVertexNormals();let de=new Float32Array(Q.attributes.position.count*3),re=new He("#a9bb94"),xe=new He("#d2dcc0"),Ce=new He(_e.ground),Te=new He;for(let Ie=0;Ie<Q.attributes.position.count;Ie++){let Je=Q.attributes.position.getX(Ie),st=Q.attributes.position.getY(Ie),ht=Q.attributes.position.getZ(Ie);Te.copy(re).lerp(xe,Ga(st/8)).lerp(Ce,1-I(Je,ht)),de.set([Te.r,Te.g,Te.b],Ie*3)}Q.setAttribute("color",new kt(de,3));let ce=new ke(Q,Ye("#ffffff",{vc:!0,flat:!0}));ce.receiveShadow=!0,g.add(ce);let We=[[-58,30],[-40,27],[-26,18],[-34,4],[-22,-8],[-4,-4],[4,10],[18,12],[26,-2],[16,-16],[30,-26],[58,-30]].map(([Ie,Je])=>new E(Ie,0,Je)),De=new $r(We,!1,"catmullrom",.5),Ve=500,Ee=1.5,ot=[],Ge=[],Fe=De.getSpacedPoints(Ve);for(let Ie=0;Ie<=Ve;Ie++){let Je=Fe[Ie],st=Fe[Math.min(Ve,Ie+1)],ht=Fe[Math.max(0,Ie-1)],At=st.x-ht.x,J=st.z-ht.z,me=Math.hypot(At,J)||1,ve=-J/me,ge=At/me;for(let ie of[-1,1]){let we=Je.x+ve*Ee*ie,Le=Je.z+ge*Ee*ie;ot.push(we,V(we,Le)+.3,Le)}if(Ie<Ve){let ie=Ie*2;Ge.push(ie,ie+1,ie+2,ie+1,ie+3,ie+2)}}let Et=new yt;Et.setAttribute("position",new qe(ot,3)),Et.setIndex(Ge),Et.computeVertexNormals();let Wt=new ke(Et,Ye("#f6f4ee",{side:_r,offset:!0}));Wt.receiveShadow=!0,g.add(Wt);let Un=oe(g);Un.rotation.order="YXZ";let Zt=De.getLength(),ys=7,Xn=1.4,Ar=[.14,.38,.62,.86],dn=[],ui=0;for(let Ie of Ar)dn.push({from:ui,to:Ie*Zt}),dn.push({stop:Ie*Zt}),ui=Ie*Zt;dn.push({from:ui,to:Zt*.995}),dn.forEach(Ie=>{Ie.dur=Ie.stop!==void 0?Xn:(Ie.to-Ie.from)/ys});let jn=dn.reduce((Ie,Je)=>Ie+Je.dur,0),di=Ie=>{let Je=(Ie%jn+jn)%jn;for(let st of dn){if(Je<=st.dur)return st.stop!==void 0?st.stop:st.from+(st.to-st.from)*ka(Je/st.dur)*.15+(st.to-st.from)*(Je/st.dur)*.85;Je-=st.dur}return 0},qn=new E,Ze=new E;y.push(Ie=>{let Je=di(Ie),st=Math.min(.999,Math.max(0,Je/Zt)),ht=De.getPointAt(st),At=De.getTangentAt(st);qn.copy(ht).addScaledVector(At,1.6),Ze.copy(ht).addScaledVector(At,-1.6);let J=Math.atan2(V(qn.x,qn.z)-V(Ze.x,Ze.z),3.2);Un.position.set(ht.x,V(ht.x,ht.z)+.3,ht.z),Un.rotation.set(-J,Math.atan2(At.x,At.z),0)});let Dn=[["01 \xB7 Choose your move.","Pick your service and order online, or start with a Growth Audit."],["02 \xB7 Make it yours.","A short intake with your business info, brand, and goals."],["03 \xB7 Preview and refine.","A private preview before anything goes live."],["04 \xB7 Launch and keep going.","We put it live. 3 months of care on the Website Special."]];[.14,.38,.62,.86].forEach((Ie,Je)=>{let st=De.getPointAt(Ie),ht=V(st.x,st.z);bn(g,.12,.12,3.2,_e.ink,st.x+2.2,ht,st.z);let At=Op("0"+(Je+1));At.position.set(st.x+2.2,ht+4.4,st.z),g.add(At),M(2,st.x+2.2,ht+8.6,st.z,Dn[Je][0],Dn[Je][1])});for(let Ie=0;Ie<180;Ie++){let Je=(_()*2-1)*(A/2-6),st=(_()*2-1)*(L/2-6);Fe.some(ht=>(ht.x-Je)**2+(ht.z-st)**2<14)||f.push({x:W.x+Je,z:W.z+st,y:V(Je,st),s:.6+_()*.6})}w.push([W.x,W.z,50])}{let L=function(Z,Q,de){Se(g,15,5,10,_e.white,Z,0,Q);let re=new ke(new Vt(5,5,14.8,24),Ye(_e.offwhite));re.rotation.z=Math.PI/2,re.position.set(Z,5,Q),re.castShadow=re.receiveShadow=!0,g.add(re),Se(g,5,4.2,.2,_e.sand,Z,0,Q+5.05),rn(g,2.4,1.2,Va("STAGE "+de,{w:512,h:256,fg:"#dbb77e",font:pt.sans(600,90)}),Z,7.2,Q+4.4,0,-.35)},I=function(Z,Q,de,re,xe,Ce=4){bn(g,.2,.2,Ce,_e.ink,Z,0,Q);let Te=new St;Te.position.set(Z,Ce,Q),Te.rotation.y=D,g.add(Te),Se(Te,de+.5,re+.5,.4,_e.ink,0,0,0),oi(Te,de,re,Ye("#ffffff",{basic:!0,map:xe}),0,(re+.5)/2,.21)},W=T[3];x=W;let g=new St;g.position.copy(W),o.add(g),Se(g,70,.08,26,_e.water,-6,0,-24,{cast:!1,material:Ye(_e.water)}),Se(g,70,.1,1.2,"#e3dccd",-6,0,-10.6,{cast:!1}),Se(g,2,.5,12,"#e3dccd",2,0,-16),Se(g,11,4,7,_e.white,15,0,-6.5),Se(g,11.1,1.6,7.1,_e.glass,15,1.3,-6.5,{cast:!1}),Se(g,7.5,3.4,6,_e.white,16,4,-7),Se(g,8.2,.35,6.7,_e.sand,16,7.4,-7);let A=new St;A.position.set(-4,0,-20),g.add(A),Se(A,1.8,.7,4.6,_e.white,0,0,0),Se(A,1.82,.2,4.62,_e.sand,0,.5,0),Se(A,1.2,.8,1.4,_e.white,0,.7,-.4),y.push(Z=>{A.position.y=Math.sin(Z*1.6)*.08,A.rotation.z=Math.sin(Z*1.3)*.03,A.position.x=-7+Math.sin(Z*.25)*3.5}),L(-22,6,1),L(-5,9,2);let D=-.6;I(14,10,10,5.6,Mc("cinematic")),I(30,2,9,5.06,Mc("lake")),I(24,18,3.8,6.76,Mc("ugc"),1.2),bn(g,1.2,1.4,.6,_e.ink,4,0,16),bn(g,.25,.25,5,_e.inkSoft,4,.6,16);let V=new St;V.position.set(4,5.6,16),g.add(V),Se(V,9,.35,.35,_e.sand,2.5,0,0),Se(V,1.4,.9,.9,_e.ink,7.2,-.9,0),y.push(Z=>{V.rotation.y=.6+Math.sin(Z*.4)*.7,V.rotation.z=Math.sin(Z*.55)*.12});for(let Z=0;Z<4;Z++)Se(g,1,.7+Z%2*.3,.8,"",8.4+Z%2*1.1,0,21+Math.floor(Z/2)*.9,{material:Ye("#2c2d27",{rough:.6})});let K=new Vt(.42,.42,.05,12);for(let Z=0;Z<4;Z++){let Q=new St;g.add(Q),Se(Q,.9,.3,.9,_e.ink,0,0,0);for(let[ce,We]of[[.6,.6],[-.6,.6],[.6,-.6],[-.6,-.6]]){let De=new ke(K,Ye(_e.sand));De.position.set(ce,.32,We),De.castShadow=!0,Q.add(De)}let de=[15,-12,26,0][Z],re=[-6,4,6,-16][Z],xe=6+Z*1.5,Ce=9+Z*1.6,Te=.35+Z*.07;y.push(ce=>{let We=ce*Te+Z*1.7;Q.position.set(de+Math.cos(We)*xe,Ce+Math.sin(ce*1.4+Z)*.4,re+Math.sin(We)*xe),Q.rotation.y=-We})}tt(40,-2,6,14,14),tt(-40,12,8,6,14),tt(10,28,26,4,18),w.push([W.x,W.z,34]),M(3,14,13,10,"Cinematic Ad Special \xB7 $299","Film-style ads in wide & vertical formats."),M(3,24,10,18,"UGC Ad Special \xB7 $129","Creator-style AI ads with opening hooks to test."),M(3,16,9,-7,"Rental listing films","Made from your photos. No shoot on your calendar."),M(3,-13,11,8,"Monthly Ads \xB7 from $300/mo","10 short ads a month, up to 40 plus cinematic videos.")}{let W=T[4];x=W;let g=new St;g.position.copy(W),o.add(g);let A=170;Se(g,A,.15,3.4,"#e1ddd2",0,0,8,{cast:!1}),Se(g,A,.2,.15,"#8e8b82",0,.15,7.3,{cast:!1}),Se(g,A,.2,.15,"#8e8b82",0,.15,8.7,{cast:!1});let L=new tn(ms,Ye("#b9b3a5"),Math.floor(A/1.3)),D=new Xe;for(let Q=0;Q<L.count;Q++)D.compose(new E(-A/2+Q*1.3,.12,8),new Gt,new E(.35,.08,2.6)),L.setMatrixAt(Q,D);L.receiveShadow=!0,g.add(L);let I=[];for(let Q=0;Q<7;Q++){let de=new St;if(g.add(de),Q===0)ne(de,te(5.4,2.4,2.4,.45),q,0,1.6,0),ne(de,te(1.4,.9,2.44,.12),H,1.9,2.15,0,!1),ne(de,B,X,2.72,1.2,.6,!1).rotation.y=Math.PI/2,ne(de,B,X,2.72,1.2,-.6,!1).rotation.y=Math.PI/2;else{ne(de,te(5,1,2.3,.2),F,0,.9,0);for(let re=0;re<3;re++)ne(de,te(1.2,.8,1.6,.12),re===1?q:F,-1.6+re*1.6,1.8,0)}for(let re of[-1.7,1.7])for(let xe of[-.95,.95])ne(de,fe,k,re,.46,xe);I.push(de)}y.push(Q=>{I.forEach((de,re)=>{let xe=((Q*7-re*5.8)%A+A)%A-A/2;de.position.set(xe,0,8),de.visible=Math.abs(xe)<A/2-6})}),Se(g,11,5,8,_e.white,-22,0,-4),Se(g,12,.3,3,_e.sand,-22,3.6,1.2),oi(g,7.2,4.5,Ye("#ffffff",{basic:!0,map:yc("form",e)}),-22,6.5,.05),Se(g,7.6,4.9,.1,_e.ink,-22,4.05,-.02,{cast:!1}),Se(g,17,7.5,12,_e.white,16,0,-6),Se(g,17.1,4.2,.15,_e.ink,16,1.6,.05,{cast:!1,material:Ye("#ffffff",{map:Bp()})}),Se(g,4,7.9,12.2,_e.sand,26.5,0,-6);let V=new ke(new si(3,.32,12,48),Ye(_e.sand));V.position.set(14,11.5,-6),V.castShadow=!0,g.add(V);let K=new ke(new si(2.1,.22,12,40),Ye(_e.ink));K.position.copy(V.position),g.add(K),bn(g,.3,.5,1.3,_e.ink,14,7.5,-6),y.push(Q=>{V.rotation.y=Q*.6,K.rotation.x=Q*.8}),rn(g,8,1.5,Va("LEAD ENGINE",{fg:"#8fe9ff"}),12,8.6,.1,0,0,"#8fe9ff"),Se(g,30,.35,.35,"#cfcabd",-3,6.5,-2);let Z=[];for(let Q=0;Q<8;Q++)Z.push(Se(g,.7,.5,.5,_e.sand,0,6.8,-2));y.push(Q=>Z.forEach((de,re)=>{de.position.x=-18+(Q*5+re*3.75)%30})),bn(g,.25,.25,6.5,"#cfcabd",-17.6,0,-2),bn(g,.25,.25,6.5,"#cfcabd",11.6,0,-2),Se(g,1.8,2.8,1.2,_e.ink,-3,0,2),rn(g,1.3,.9,Va("PAID \u2713",{bg:"#141412",fg:"#dbb77e",w:512,h:352,font:pt.sans(600,96)}),-3,2.2,2.61),tt(-44,-6,8,12,16),tt(0,-22,30,4,16),tt(44,-10,8,10,14),tt(0,22,40,5,20),w.push([W.x,W.z,34]),M(4,-22,9.5,0,"Lead capture","Forms that catch every inquiry, day or night."),M(4,-30,4,8,"Automatic follow-up","Follow-up emails go out while you work."),M(4,14,15.5,-6,"Multi-agent AI systems","Custom apps and agents scoped to your business."),M(4,-3,4,2,"Stripe payment setup","Accept payments without the busywork.")}{let W=T[5];x=W;let g=new St;g.position.copy(W),o.add(g),Ot(g,0,12,100,7,0,{sidewalk:3,crossings:[6]}),je(g,12,100,4,7,6),[{x:-26,label:"THE CUT",bg:"#1a1a16",fg:"#dbb77e",body:_e.white,card:["Tap to review","Google reviews, one tap"]},{x:-13,label:"AT THE TABLE",bg:"#dbb77e",fg:"#1a1a16",body:"#f3ebdc",card:["Tap for our menu","Menu, hours & location"]},{x:0,label:"LOCAL / ORIGINAL",bg:"#1d2826",fg:"#ecebe4",body:"#dfe5d2",card:["Tap to follow","Instagram \xB7 TikTok \xB7 YouTube"]}].forEach((ce,We)=>{Se(g,11,5.5,8,ce.body,ce.x,0,1),Se(g,11.1,.5,8.1,_e.offwhite,ce.x,5.5,1),Se(g,6,2.6,.12,_e.glass,ce.x-1.5,.3,5.02,{cast:!1}),Se(g,1.6,3,.12,_e.ink,ce.x+3.2,0,5.02,{cast:!1}),rn(g,7,1.3,Va(ce.label,{bg:ce.bg==="#dbb77e"?"#2a2216":ce.bg,fg:ce.fg==="#1a1a16"?"#ffd994":ce.fg}),ce.x,4.4,5.14,0,0,ce.fg==="#1a1a16"?"#ffd994":ce.fg);let De=new St;g.add(De),Se(De,3.6,2.16,.08,_e.ink,0,-1.08,0),oi(De,3.6,2.16,Ye("#ffffff",{basic:!0,map:Lp(ce.card[0],ce.card[1],e)}),0,0,.05);let Ve=new ke(new os(1.2,1.35,40),Ye(_e.sand,{basic:!0,side:_r}));Ve.rotation.x=-Math.PI/2,Ve.position.set(ce.x,5.85,1),g.add(Ve);let Ee=z(g,ce.x,9.4,1.4,6,"#ffd994",0);Ee.material=Ee.material.clone(),y.push(ot=>{let Ge=Pe[We];Pe[We]*=.9,De.position.set(ce.x,9.4+Math.sin(ot*1.3+We)*.35+Ge*.4,1.5),De.rotation.y=-.45+Math.sin(ot*.7+We)*.25*(1-Ge),De.scale.setScalar(1+Ge*.18),Ee.position.copy(De.position),Ee.material.opacity=.08+Ge*.55;let Fe=1+(ot*.8+We*.33)%1*.8+Ge*.6;Ve.scale.set(Fe,Fe,Fe)})});let L=zp(),D=new ke(new Vt(.3,.3,2.4,20),Ye("#ffffff",{map:L}));D.position.set(-31,2.6,5.4),g.add(D),y.push(ce=>{L.offset.y=-ce*.5});let I=Se(g,8,.25,2.4,_e.sand,-13,3.3,6);I.rotation.x=.25;for(let ce of[-16,-13]){bn(g,.6,.6,.9,_e.white,ce,.17,7.55),bn(g,.06,.06,2.2,_e.ink,ce,1.07,7.55);let We=new ke(new ts(1.3,.7,16),Ye(_e.offwhite));We.position.set(ce,3.47,7.55),We.castShadow=!0,g.add(We)}let V=Fp(6,12),K=Ye("#ffffff",{map:V,emissiveMap:V,emissive:"#ffffff",ei:.45,rough:.12,metal:.5});Se(g,14,4,12,_e.white,22,0,-4),Se(g,12,22,10,_e.ink,22,4,-4,{material:K}),Se(g,12.4,.6,10.4,_e.offwhite,22,26,-4),Se(g,4.2,26.6,4.2,_e.sand,29,0,1),Se(g,9,12,9,_e.ink,10,0,-10,{material:K});let Z=Ye(_e.sand,{rough:.3,metal:.85}),Q=new tn(ms,Z,24),de=new tn(ms,Ye(_e.offwhite,{rough:.6}),10),re=new Xe,xe=new Gt;for(let ce=0;ce<12;ce++)Q.setMatrixAt(ce,re.compose(new E(16.5+ce,15,1.15),xe,new E(.14,22,.5)));for(let ce=0;ce<12;ce++)Q.setMatrixAt(12+ce,re.compose(new E(28.15,15,-8.5+ce*.85),xe,new E(.5,22,.12)));for(let ce=0;ce<10;ce++)de.setMatrixAt(ce,re.compose(new E(22,6.2+ce*2.2,-4),xe,new E(12.25,.14,10.25)));Q.castShadow=de.castShadow=!0,Q.receiveShadow=de.receiveShadow=!0,g.add(Q,de),Se(g,11,.5,9,_e.sage,22,26.6,-4,{material:Ye("#8fae84",{rough:.95})});for(let ce=0;ce<6;ce++)f.push({x:W.x+18.5+ce%3*3.4,z:W.z-6.8+Math.floor(ce/3)*4.6,y:27.1,s:.45+ce%2*.15});let Ce=new ke(new si(7.4,.14,10,96),new wt({color:new He(2,1.6,.9),toneMapped:!1}));Ce.rotation.x=Math.PI/2,Ce.position.set(22,28.2,-4),g.add(Ce),y.push(ce=>{Ce.position.y=28.2+Math.sin(ce*.8)*.25,Ce.rotation.z=ce*.2}),z(g,22,28.2,-4,22,"#ffd58f",.18),Se(g,.3,2.6,.3,_e.ink,18,26.6,-1.5),Se(g,.3,2.6,.3,_e.ink,26,26.6,-1.5),rn(g,11,2.75,G,22,30.4,-1.2);let Te=new ke(new mr(6,40),Ye("#e6e2d6"));Te.rotation.x=-Math.PI/2,Te.position.set(40,.03,-1),Te.receiveShadow=!0,g.add(Te),bn(g,1.2,1.4,1,_e.sand,40,0,-1),C.push([W.x+33,W.x+47,W.z-8,W.z+6]),tt(44,-6,6,12,18),tt(-40,-6,6,12,16),tt(-6,-16,26,4,22),tt(0,22,46,5,24),w.push([W.x,W.z,36]),M(5,-26,12.5,1.5,"Smart Business Cards","Tap-to-share cards: reviews, menus, socials, WiFi."),M(5,22,28,-4,"All-in-One Launch Bundle \xB7 $2,499","Website Special, 4 Cinematic Ads, 4 UGC Ads, 5 Business Cards. Save $563."),M(5,-6,7,5,"Built for local businesses","Barbers, restaurants, shops, salons, contractors & more.")}x=new E;for(let W=0;W<260;W++){let g=_()*6-.5,A=g*85+(_()*2-1)*70,L=-g*32+(_()*2-1)*90;w.some(([D,I,V])=>(D-A)**2+(I-L)**2<V*V)||f.push({x:A,z:L,y:0,s:.6+_()*.8})}for(let W=0;W<28;W++){let g=_()*6,A=g*85+(_()*2-1)*80,L=-g*32+(_()*2-1)*90;if(w.some(([I,V,K])=>(I-A)**2+(V-L)**2<(K+8)**2))continue;let D=new ke(new mr(6+_()*10,7),Ye("#dfe3cf"));D.rotation.x=-Math.PI/2,D.rotation.z=_()*6,D.position.set(A,.02,L),D.receiveShadow=!0,o.add(D)}{let We=function(J,me=0){let ve=new bt;ve.position.y=me,o.add(ve);let ge=new bt;ge.position.y=1,ve.add(ge);let ie={root:ve,body:ge};for(let Le of["L","R"]){let ze=Le==="L"?1:-1,lt=new bt;lt.position.set(.28*ze,.62,0),ge.add(lt);let Rt=new bt;Rt.position.set(0,-.33,0),lt.add(Rt);let nt=new bt;nt.position.set(.105*ze,-.04,0),ge.add(nt);let _t=new bt;_t.position.set(0,-.45,0),nt.add(_t),Object.assign(ie,{["arm"+Le]:lt,["elbow"+Le]:Rt,["leg"+Le]:nt,["knee"+Le]:_t})}let we={g:ve,body:ge,armL:ie.armL,armR:ie.armR,legL:ie.legL,legR:ie.legR,joints:ie,accent:J%3===0?"cyan":"gold",colors:{suit:A[J*3%A.length],armor:L[J*5%L.length],skin:D[J%D.length],hair:I[J*7%I.length]}};return g.push(we),we},De=function(J,me,ve){let ge=Math.sin(me),ie=Math.cos(me),we=J.joints;we.legL.rotation.x=-ge*.5*ve,we.legR.rotation.x=ge*.5*ve,we.kneeL.rotation.x=Math.max(0,ie)*.85*ve,we.kneeR.rotation.x=Math.max(0,-ie)*.85*ve,we.armL.rotation.x=ge*.45*ve,we.armR.rotation.x=-ge*.45*ve,we.elbowL.rotation.x=-.2-Math.max(0,-ge)*.35*ve,we.elbowR.rotation.x=-.2-Math.max(0,ge)*.35*ve,we.armL.rotation.z=.06,we.armR.rotation.z=-.06,we.body.position.y=1+Math.abs(ie)*.04*ve,we.body.rotation.y=ge*.07*ve},ot=function(J,me,ve,ge){let ie=J.joints,we=Math.sin(ve*6+ge);if(me==="carry")ie.armL.rotation.x=ie.armR.rotation.x=-.95,ie.elbowL.rotation.x=ie.elbowR.rotation.x=-.55,ie.armL.rotation.z=.12,ie.armR.rotation.z=-.12;else if(me==="lift")ie.body.rotation.x=.38,ie.armL.rotation.x=ie.armR.rotation.x=-.75,ie.elbowL.rotation.x=ie.elbowR.rotation.x=-.3;else if(me==="tap")ie.armR.rotation.x=-1.15,ie.elbowR.rotation.x=-.55+we*.04,ie.armR.rotation.z=-.1;else if(me==="point")ie.armR.rotation.x=-1.4+we*.05,ie.armR.rotation.z=-.25,ie.elbowR.rotation.x=-.1,ie.body.rotation.y=Math.sin(ve*.6+ge)*.35;else if(me==="film")ie.armL.rotation.x=ie.armR.rotation.x=-1.05,ie.elbowL.rotation.x=ie.elbowR.rotation.x=-1.15,ie.armL.rotation.z=.28,ie.armR.rotation.z=-.28,ie.body.rotation.y=Math.sin(ve*.4+ge)*.2;else if(me==="inspect")ie.armR.rotation.x=-.95,ie.elbowR.rotation.x=-.9,ie.body.rotation.x=.06,ie.body.rotation.y=Math.sin(ve*.5+ge)*.25;else if(me==="talk"){let Le=Math.max(0,Math.sin(ve*1.3+ge*2));ie.armR.rotation.x=-.45-Le*.5,ie.elbowR.rotation.x=-.9-Le*.4,ie.body.rotation.y=Math.sin(ve*.7+ge)*.12}else if(me==="present"){let Le=Math.sin(ve*1.1+ge);ie.armR.rotation.x=-.7-Math.max(0,Le)*.6,ie.armL.rotation.x=-.7-Math.max(0,-Le)*.6,ie.elbowL.rotation.x=ie.elbowR.rotation.x=-.6}J.carrying=me==="carry",J.phone=me==="tap"},Ge=function(J){De(J,0,0),J.joints.body.rotation.x=0,J.carrying=J.phone=!1},Fe=function(J,me,ve=1.4){let ge=We(J,me[0].y??0),ie=[];me.forEach((ze,lt)=>{let Rt=me[(lt+1)%me.length];ze.wait&&ie.push({wait:ze.wait,w:ze});let nt=Rt.at[0]-ze.at[0],_t=Rt.at[1]-ze.at[1],Tn=Math.hypot(nt,_t);Tn>.01&&ie.push({from:ze,to:Rt,d:Tn,dur:Tn/ve,yaw:Math.atan2(nt,_t)})}),ie.forEach(ze=>{ze.wait&&(ze.dur=ze.wait)});let we=ie.reduce((ze,lt)=>ze+lt.dur,0),Le=ie.find(ze=>ze.yaw!==void 0)?.yaw??0;return y.push(ze=>{let lt=(ze%we+we)%we,Rt=0;for(let nt of ie){if(lt<=nt.dur){if(nt.wait){let _t=nt.w;ge.g.position.set(_t.at[0],_t.y??0,_t.at[1]),ge.g.rotation.y=_t.face??Le,Ge(ge),_t.act&&ot(ge,_t.act,ze,J),_t.onAct?.(ze,Math.sin(Math.min(1,lt/nt.dur)*Math.PI))}else{let _t=lt/nt.dur,Tn=nt.from.y??0,pi=nt.to.y??0;ge.g.position.set(nt.from.at[0]+(nt.to.at[0]-nt.from.at[0])*_t,Tn+(pi-Tn)*_t,nt.from.at[1]+(nt.to.at[1]-nt.from.at[1])*_t),ge.g.rotation.y=Le=nt.yaw,De(ge,(Rt+_t*nt.d)/Ve*Math.PI*2,1),ge.joints.body.rotation.x=0,ge.carrying=ge.phone=!1,nt.from.carry&&ot(ge,"carry",ze,J)}return}lt-=nt.dur,nt.wait||(Rt+=nt.d,Le=nt.yaw)}}),ge},Et=function(J,me,ve,ge,ie=0){let we=We(J,ie);return we.g.position.set(me[0],ie,me[1]),we.g.rotation.y=ve,y.push(Le=>{Ge(we),ot(we,ge,Le,J)}),we},W=(J,me,ve)=>new E(T[J].x+me,0,T[J].z+ve),g=[],A=["#2b2f36","#e8e6e1","#cdb184","#4a5568","#f2efe8","#1f3a34","#3b2f2a"],L=["#d9bd86","#f4f3ef","#3a3d42","#c9cdd2"],D=["#8d5a3b","#c68e6a","#e0b48f","#a86f4c","#f1c9a5","#6b4430"],I=["#1f1a16","#3b2a1f","#d8d4cc","#c9a46a","#2a2a2a"],V={suit:new Sn({color:"#ffffff",roughness:.55,metalness:.15}),armor:new cs({color:"#ffffff",roughness:.25,metalness:.6,clearcoat:.8,clearcoatRoughness:.15}),skin:new Sn({color:"#ffffff",roughness:.5}),hair:new Sn({color:"#ffffff",roughness:.6}),gold:new wt({color:new He(2.1,1.65,.9),toneMapped:!1,side:_r}),cyan:new wt({color:new He(.75,1.9,2.3),toneMapped:!1,side:_r})},K=(J,me,ve,ge=0,ie=0,we=0,Le=1,ze=1,lt=1)=>new Xe().compose(new E(J,me,ve),new Gt().setFromEuler(new Qt(ge,ie,we)),new E(Le,ze,lt)),Z=(J,me)=>new es(J,me,2,8),Q=(J,me=Math.PI)=>new ls(J,10,7,0,Math.PI*2,0,me),de=(J,me,ve,ge)=>new ps(J,me,ve,1,ge),re=new Vt(.25,.165,.42,10),xe=new Vt(.121,.121,.042,10,1,!0,-1.15,2.3),Ce=new Vt(.06,.06,.05,8,1,!0),Te=new en(1,1,1),ce=[["body",de(.34,.2,.22,.07),"suit",K(0,.02,0)],["body",Z(.14,.14),"suit",K(0,.24,0)],["body",re,"suit",K(0,.5,0,0,0,0,1,1,.62)],["body",de(.36,.26,.08,.035),"armor",K(0,.53,.11)],["body",Te,"accent",K(0,.47,.152,0,0,0,.3,.018,.012)],["body",Te,"accent",K(0,.3,.13,0,0,0,.018,.2,.012)],["body",new Vt(.055,.06,.1,6),"skin",K(0,.76,0)],["body",Q(.115),"skin",K(0,.88,.01,0,0,0,.92,1.08,1)],["body",Q(.124,Math.PI*.55),"hair",K(0,.9,-.012,-.3,0,0,.94,1.05,1.02)],["body",xe,"accent",K(0,.893,.012)],["body",de(.3,.36,.13,.04),"armor",K(0,.5,-.17)],["body",Te,"accent",K(.08,.5,-.237,0,0,0,.02,.26,.012)],["body",Te,"accent",K(-.08,.5,-.237,0,0,0,.02,.26,.012)],["body",Q(.118,Math.PI/2),"armor",K(.28,.68,0,0,0,-.35)],["body",Q(.118,Math.PI/2),"armor",K(-.28,.68,0,0,0,.35)],...["L","R"].flatMap(J=>[["arm"+J,Z(.055,.22),"suit",K(0,-.17,0)],["elbow"+J,Z(.05,.2),"suit",K(0,-.15,0)],["elbow"+J,Ce,"accent",K(0,-.2,0)],["elbow"+J,Q(.05),"skin",K(0,-.31,0,0,0,0,.8,1.25,.6)],["leg"+J,Z(.085,.3),"suit",K(0,-.22,0)],["knee"+J,Q(.07),"armor",K(0,0,.045,0,0,0,1,1.2,.8)],["knee"+J,Z(.07,.3),"suit",K(0,-.21,0)],["knee"+J,de(.12,.11,.27,.04),"armor",K(0,-.47,.04)],["knee"+J,Te,"accent",K(0,-.52,.04,0,0,0,.125,.018,.275)]]),["root",at,"shadow",K(0,.03,0,0,0,0,.95,1,.95)]],Ve=1.6,Ee=(J,me,ve)=>[T[J].x+me,T[J].z+ve],Wt=(J,me)=>Math.atan2(me[0]-J[0],me[1]-J[1]),Un=(J,me,ve,ge=0)=>{for(let ie=0;ie<me;ie++){let we=ie/me*Math.PI*2+.4,Le=[J[0]+Math.cos(we)*.8,J[1]+Math.sin(we)*.8];Et(ve+ie,Le,Wt(Le,J),"talk",ge)}},Zt=Ee(0,-12.6,2.6);[[-10,2],[-5.4,2.5],[-.8,2]].forEach(([J,me],ve)=>{let ge=Ee(0,J,me);Fe(60+ve,[{at:Zt,wait:1.1,act:"lift",face:Wt(Zt,Ee(0,-14.5,3.4)),carry:!0,y:.04},{at:ge,wait:1,act:"lift",face:0,y:.04}],1.5)}),Et(64,Ee(0,4.2,2.6),Wt(Ee(0,4.2,2.6),Ee(0,-4,3)),"point",.04),Un(Ee(0,-21,3.6),3,65),[[0,0],[2,0],[4,0],[1,1],[3,1],[0,2],[2,2],[4,2],[1,3],[3,3]].forEach(([J,me],ve)=>{let ge=Ee(1,-13+J*6.5,-6+me*5+1.3),ie=We(70+ve,1.2);ie.g.position.set(ge[0],1.2,ge[1]),ie.g.rotation.y=Math.PI,y.push(we=>{Ge(ie);let Le=ie.joints;Le.body.position.y=.12,Le.legL.rotation.x=Le.legR.rotation.x=-1.5,Le.kneeL.rotation.x=Le.kneeR.rotation.x=1.4,Le.armL.rotation.x=Le.armR.rotation.x=-.55,Le.elbowL.rotation.x=-.95+Math.sin(we*13+ve)*.06,Le.elbowR.rotation.x=-.95+Math.sin(we*11+ve*2)*.06,Le.body.rotation.x=.08+Math.sin(we*.5+ve)*.02})}),Fe(80,[{at:Ee(1,-11,-11.2),wait:3,act:"point",face:Math.PI,y:.3},{at:Ee(1,0,-11.2),wait:3,act:"point",face:Math.PI,y:.3},{at:Ee(1,11,-11.2),wait:3,act:"point",face:Math.PI,y:.3},{at:Ee(1,0,-11.2),wait:2.5,act:"present",face:0,y:.3}],1.1),Un(Ee(1,16.6,11.5),2,81,.3);let Xn=[Ee(3,2,-12.5),Ee(3,2,-19)];Fe(84,[{at:Xn[0],wait:2.2,act:"present",face:Wt(Xn[0],Ee(3,4,16)),y:.5},{at:Xn[1],wait:2.2,act:"present",face:Wt(Xn[1],Ee(3,4,16)),y:.5}],.9),Et(85,Ee(3,5.6,17.6),Wt(Ee(3,5.6,17.6),Ee(3,2,-15)),"film"),Et(86,Ee(3,.6,19.2),Wt(Ee(3,.6,19.2),Ee(3,2,-15)),"point");let Ar=Ee(3,-5,15),dn=Ee(3,7.4,20.4);[0,1].forEach(J=>Fe(87+J,[{at:Ar,wait:1,act:"lift",face:Math.PI,carry:!0},{at:dn,wait:1,act:"lift",face:Wt(dn,Ee(3,8.5,21.2))}],1.4)),Fe(90,[{at:Ee(4,-34,2.4),wait:0},{at:Ee(4,-22,1.4),wait:2.6,act:"tap",face:Math.PI},{at:Ee(4,-3,3.4),wait:2.2,act:"tap",face:Math.PI},{at:Ee(4,6,4.2),wait:0}],1.4),Fe(91,[{at:Ee(4,10,1.6),wait:3,act:"inspect",face:Math.PI},{at:Ee(4,21,1.6),wait:3,act:"inspect",face:Math.PI}],1.2);let ui=[-26,-13,0];[0,1,2,3].forEach(J=>{let me=J%2?[2,1,0]:[0,1,2],ve=[{at:Ee(5,J%2?34:-44,6.6),wait:0,y:.17}];me.forEach(ge=>ve.push({at:Ee(5,ui[ge]+.5,5.9),wait:2.4,act:"tap",face:Math.PI,y:.17,onAct:(ie,we)=>{Pe[ge]=Math.max(Pe[ge],we)}})),ve.push({at:Ee(5,J%2?-44:34,6.6),wait:0,y:.17}),Fe(100+J,ve,1.3+J*.08)}),[0,1].forEach(J=>{let me=We(110+J,.17),ve=Ee(5,6+(J?.6:-.6),7.4),ge=Ee(5,6+(J?.6:-.6),16.6);y.push(ie=>{let we=Math.floor(ie/ye.period),Le=ie-we*ye.period,ze=(we+J)%2===0,lt=ze?ve:ge,Rt=ze?ge:ve,nt=Math.min(1,Math.max(0,(Le-ye.walkFrom)/(ye.walkTo-ye.walkFrom-.4))),_t=lt[1]+(Rt[1]-lt[1])*nt,Tn=Math.abs(_t-(T[5].z+12))<3.5;me.g.position.set(lt[0],Tn?.06:.17,_t),me.g.rotation.y=(nt>0&&nt<1,Wt(lt,Rt)),nt>0&&nt<1?(De(me,nt*Math.abs(Rt[1]-lt[1])/Ve*Math.PI*2,1),me.carrying=me.phone=!1):(Ge(me),nt===0&&ot(me,"tap",ie,110+J))})}),Un(Ee(5,40,3),3,112,.04);let jn=ce.flatMap(([J,me,ve,ge])=>(ve==="accent"?["gold","cyan"]:[ve]).map(ie=>{let we=ie==="shadow"?it(Ke,.42):V[ie],Le=new tn(me,we,g.length);return Le.frustumCulled=!1,Le.castShadow=ie!=="shadow",Le.receiveShadow=ie!=="shadow"&&ie!=="gold"&&ie!=="cyan",ie==="shadow"&&(Le.renderOrder=1),V[ie]&&!(ie==="gold"||ie==="cyan")&&g.forEach((ze,lt)=>Le.setColorAt(lt,new He(ze.colors[ie]))),o.add(Le),{joint:J,im:Le,local:ge,accent:ve==="accent"?ie:null}})),di=new Xe,qn=new Xe().makeScale(0,0,0),Ze=[{im:new tn(te(.46,.34,.4,.03),Ye("#d8c39e",{rough:.8}),g.length),joint:"body",local:K(0,.45,.36),on:J=>J.carrying},{im:new tn(te(.075,.14,.014,.008),new wt({color:new He(.8,1.7,2),toneMapped:!1}),g.length),joint:"elbowR",local:K(0,-.36,.06,.9),on:J=>J.phone}];Ze.forEach(J=>{J.im.frustumCulled=!1,J.im.castShadow=!0,o.add(J.im)}),y.push(()=>{g.forEach(J=>J.g.updateMatrixWorld(!0));for(let J of Ze)g.forEach((me,ve)=>J.im.setMatrixAt(ve,J.on(me)?di.multiplyMatrices(me.joints[J.joint].matrixWorld,J.local):qn)),J.im.instanceMatrix.needsUpdate=!0;for(let J of jn)g.forEach((me,ve)=>{J.accent&&J.accent!==me.accent?J.im.setMatrixAt(ve,qn):J.im.setMatrixAt(ve,di.multiplyMatrices(me.joints[J.joint].matrixWorld,J.local))}),J.im.instanceMatrix.needsUpdate=!0});let Dn=new yt;Dn.setAttribute("position",new qe([0,0,-.22,0,0,.22,.8,0,0],3)),Dn.computeVertexNormals();let Ie=Ye("#7d7b72",{side:_r});for(let J=0;J<4;J++){let me=T[[0,2,3,5][J]];for(let ve=0;ve<6;ve++){let ge=new St,ie=new ke(Dn,Ie),we=new ke(Dn,Ie);we.scale.x=-1,ge.add(ie,we),o.add(ge);let Le=ve%3*1.6-1.6,ze=Math.floor(ve/3)*1.8+Math.abs(Le)*.6;y.push(lt=>{let Rt=lt*.12+J*1.9,nt=34+J*4,_t=me.x+Math.cos(Rt)*nt,Tn=me.z+Math.sin(Rt)*nt,pi=Rt+Math.PI/2;ge.position.set(_t+Math.cos(pi)*-ze+Math.sin(pi)*Le,30+J*2+Math.sin(lt*.8+ve)*.6,Tn+Math.sin(pi)*-ze-Math.cos(pi)*Le),ge.rotation.y=-pi+Math.PI/2;let Ac=Math.sin(lt*9+ve*.9)*.55;ie.rotation.z=Ac,we.rotation.z=-Ac})}}let Je=Ut(256,256,J=>{let me=Ai(11);for(let ve=0;ve<7;ve++){let ge=128+(me()-.5)*110,ie=128+(me()-.5)*70,we=40+me()*50,Le=J.createRadialGradient(ge,ie,0,ge,ie,we);Le.addColorStop(0,"rgba(0,0,0,0.55)"),Le.addColorStop(1,"rgba(0,0,0,0)"),J.fillStyle=Le,J.fillRect(0,0,256,256)}}),st=new wt({map:Je,transparent:!0,opacity:.16,depthWrite:!1,color:"#3a3626"});for(let J=0;J<12;J++){let me=new ke(new qt(90+_()*60,70+_()*40),st);me.rotation.x=-Math.PI/2,me.renderOrder=1,o.add(me);let ve=_()*620-80,ge=-_()*260+60,ie=2.2+_()*1.5;y.push(we=>{let Le=((ve+we*ie)%640+640)%640-100;me.position.set(Le,.25,ge-(Le-ve)*.1)})}let ht=Ut(256,256,J=>{let me=Ai(5);J.strokeStyle="rgba(255,255,255,0.75)",J.lineWidth=2,J.lineCap="round";for(let ve=0;ve<70;ve++){let ge=me()*256,ie=me()*256,we=6+me()*18;J.beginPath(),J.moveTo(ge,ie),J.quadraticCurveTo(ge+we/2,ie-3,ge+we,ie),J.stroke()}});ht.wrapS=ht.wrapT=ni,ht.repeat.set(8,3);let At=new ke(new qt(70,26),new wt({map:ht,transparent:!0,opacity:.55,depthWrite:!1}));At.rotation.x=-Math.PI/2,At.position.set(T[3].x-6,.1,T[3].z-24+13),o.add(At),y.push(J=>{ht.offset.set(J*.02,Math.sin(J*.5)*.02),At.material.opacity=.4+Math.sin(J*1.7)*.15})}{let W=[];o.traverse(g=>{if(!g.isMesh||g.geometry!==ms)return;let A=g.position.y-g.scale.y/2;g.scale.y>.8&&g.scale.x*g.scale.z>1.2&&A>-.1&&A<.5&&W.push(g)});for(let g of W){if(g.scale.x*g.scale.z>3){let D=g.parent.position.x+g.position.x,I=g.parent.position.z+g.position.z;C.push([D-g.scale.x/2-1,D+g.scale.x/2+1,I-g.scale.z/2-1,I+g.scale.z/2+1])}let A=Math.min(1,g.scale.y/8),L=mt(g.parent,g.position.x,g.position.z,g.scale.x*1.18+1.4+A*1.5,g.scale.z*1.18+1.4+A*1.5,.22+.2*A,g.position.y-g.scale.y/2+.045,et);L.rotation.y=g.rotation.y}}for(let W=f.length-1;W>=0;W--){let g=f[W];g.y<1&&C.some(([A,L,D,I])=>g.x>A&&g.x<L&&g.z>D&&g.z<I)&&f.splice(W,1)}{let W=new as(1,1),g=new Vt(.11,.17,1,8),A=Ye("#ffffff",{flat:!0,rough:1});A.envMapIntensity=.2;let L=new tn(W,A,f.length),D=new tn(W,A,f.length),I=new tn(g,Ye("#7d6a52",{rough:.95}),f.length),V=new tn(at,it(Ke,.32),f.length);V.renderOrder=1;let K=new Gt,Z=new Qt,Q=new He,de={},re=new Xe,xe=new Gt,Ce=new E,Te=new E;f.forEach((ce,We)=>{let De=ce.s;Z.set((_()-.5)*.3,_()*6,(_()-.5)*.3),K.setFromEuler(Z),re.compose(Ce.set(ce.x,ce.y+2.15*De,ce.z),K,Te.set(1.15*De,1.35*De,1.15*De)),L.setMatrixAt(We,re);let Ve=(_()-.5)*.5*De,Ee=(_()-.5)*.5*De;re.compose(Ce.set(ce.x+Ve,ce.y+3.25*De,ce.z+Ee),K,Te.set(.72*De,.85*De,.72*De)),D.setMatrixAt(We,re),Q.set(_e.trees[We%_e.trees.length]).getHSL(de),Q.setHSL(de.h+(_()-.5)*.04,de.s*(.85+_()*.3),de.l*(.9+_()*.2)),L.setColorAt(We,Q),D.setColorAt(We,Q.offsetHSL(0,0,.05)),re.compose(Ce.set(ce.x,ce.y+.65*De,ce.z),xe,Te.set(De,1.3*De,De)),I.setMatrixAt(We,re);let ot=ce.y>.15?1e-4:2.6*De;re.compose(Ce.set(ce.x,ce.y+.04,ce.z),xe,Te.set(ot,1,ot)),V.setMatrixAt(We,re)}),L.castShadow=D.castShadow=I.castShadow=!0,L.receiveShadow=D.receiveShadow=!0,o.add(V,L,D,I)}let Pi=[{c:0,off:[3,0,-2],dist:132,az:-38,el:30},{c:1,off:[2,0,0],dist:112,az:-28,el:44},{c:2,off:[0,0,0],dist:170,az:-26,el:38},{c:3,off:[9,0,-1],dist:150,az:-34,el:32},{c:4,off:[0,0,-2],dist:138,az:-36,el:30},{c:5,off:[6,6,-3],dist:150,az:-30,el:26},{c:5,off:[6,4,-3],dist:270,az:-22,el:40}].map(W=>({...W,target:T[W.c].clone().add(new E(...W.off))})),li=Pi.length-1,un=new E,Ii=new E,Er=p.clone().negate().normalize(),ci=new E().crossVectors(Er,new E(0,1,0)).normalize(),wr=new E().crossVectors(ci,Er).normalize(),Nt={f:0,time:0,distScale:1,dist:120,w:1,h:1,shiftX:0,shiftY:0};function wn(W){W=Math.min(li,Math.max(0,W)),Nt.f=W;let g=Math.min(li-1,Math.floor(W)),A=ka(Ga((W-g-.18)/.64)),L=Pi[g],D=Pi[g+1];un.lerpVectors(L.target,D.target,A);let I=Math.sin(A*Math.PI)*(g+1===li?0:.22),V=_c(L.dist,D.dist,A)*(1+I)*Nt.distScale,K=fc.degToRad(_c(L.az,D.az,A)+Math.sin(Nt.time*.23)*1.8),Z=fc.degToRad(_c(L.el,D.el,A)+I*10+Math.sin(Nt.time*.31)*.9);c.position.set(un.x+V*Math.cos(Z)*Math.sin(K),un.y+V*Math.sin(Z),un.z+V*Math.cos(Z)*Math.cos(K)),c.lookAt(un),Nt.dist=V,o.fog.near=V*.75,o.fog.far=V*2.6,c.near=Math.max(1,V*.3),c.far=V*3.2,c.updateProjectionMatrix();let Q=Math.min(260,Math.max(60,Math.ceil(V*.5/15)*15)),de=2*Q/a,re=un.dot(ci),xe=un.dot(wr);Ii.copy(un).addScaledVector(ci,Math.round(re/de)*de-re).addScaledVector(wr,Math.round(xe/de)*de-xe),d.position.copy(Ii).add(p),d.target.position.copy(Ii),u.right!==Q&&(u.left=-Q,u.right=Q,u.top=Q,u.bottom=-Q,u.updateProjectionMatrix())}function Tr(W,g,{shiftX:A=0,shiftY:L=0}={}){Nt.w=W,Nt.h=g,i.setSize(W,g,!1),c.aspect=W/g,Nt.distScale=W/g<1?Math.min(2.1,1.05/(W/g)**.85):W/g<1.3?1.12:1,A||L?c.setViewOffset(W,g,-A,L,W,g):c.clearViewOffset(),c.updateProjectionMatrix(),wn(Nt.f)}function _s(W){Nt.time=W;for(let g of y)g(W)}function xs(W){Math.abs(i.getPixelRatio()-W)<.01||(i.setPixelRatio(W),i.setSize(Nt.w,Nt.h,!1))}function Li(){i.render(o,c)}let hi=new E;function Ui(W){return hi.copy(W).project(c),{x:(hi.x*.5+.5)*Nt.w,y:(-hi.y*.5+.5)*Nt.h,behind:hi.z>1}}return{setProgress:wn,resize:Tr,update:_s,render:Li,project:Ui,stats:()=>{let W=i.getDrawingBufferSize(new pe);return{drawCalls:i.info.render.calls,triangles:i.info.render.triangles,textures:i.info.memory.textures,renderPx:`${W.x}\xD7${W.y}`,pixelRatio:+i.getPixelRatio().toFixed(2),shadowMap:a}},setPixelRatio:xs,hotspots:v,stops:li,renderer:i}}var Hp=new URLSearchParams(location.search),wc=Hp.has("capture"),Xa=document.documentElement;wc&&Xa.classList.add("capture");Xa.lang||(Xa.lang="en");var Wa=[{nav:"Studio",title:"The studio",text:"One creative partner. Every next step."},{nav:"Websites",title:"Give your business a presence.",text:"Websites from $1,250, live in about 72 hours."},{nav:"Process",title:"From idea to online.",text:"Less back and forth. More forward."},{nav:"Ads & video",title:"Stop the scroll.",text:"Cinematic and UGC ads from $129 an ad."},{nav:"Automation",title:"Make the work work for you.",text:"Lead capture, follow-up, payments, AI agents."},{nav:"Launch",title:"Your next chapter.",text:"Business Cards and the $2,499 Launch Bundle."}],gt=r=>document.getElementById(r),Mr=document.querySelector(".world"),ou=gt("world-canvas"),su=gt("world-fade"),Sr=gt("hero-card"),lu=gt("scroll-hint"),cu=gt("loader"),Tc=gt("loader-fill"),br=matchMedia("(prefers-reduced-motion: reduce)").matches;function Sc(){Tc.style.width="100%",setTimeout(()=>cu.classList.add("done"),250)}setTimeout(()=>cu.classList.add("done"),8e3);var vs=gt("menu-btn"),Ri=gt("mobile-nav");function ja(r,{focusButton:e=!1}={}){Ri.hidden=!r,vs.setAttribute("aria-expanded",String(r)),vs.textContent=r?"Close":"Menu",r?Ri.querySelector("a")?.focus():e&&vs.focus()}vs.addEventListener("click",()=>ja(Ri.hidden));Ri.addEventListener("click",r=>{r.target.closest("a")&&ja(!1)});document.addEventListener("click",r=>{!Ri.hidden&&!Ri.contains(r.target)&&r.target!==vs&&ja(!1)});(function(){let e=gt("business-cards");if(!e)return;let t=[...e.querySelectorAll(".bcard")],n=t.length,i=t.map(w=>w.querySelector(".bc-face")),s=gt("cards-dots"),a=()=>Math.max(1,e.offsetHeight-window.innerHeight),o=w=>Math.min(n-1,Math.max(0,(w-.06)/.88*(n-1))),l=w=>window.scrollTo({top:e.offsetTop+(.06+w/(n-1)*.88)*a()+2,behavior:br?"auto":"smooth"}),c=t.map((w,C)=>{let G=document.createElement("button");return G.type="button",G.setAttribute("aria-label",`Show card ${C+1}: ${w.dataset.title}`),G.addEventListener("click",()=>l(C)),s.appendChild(G),G}),h=0,d=-1,u=0,p=!1,m=0;function y(w=performance.now()){u=0;let C=Math.min(1,Math.max(0,(window.scrollY-e.offsetTop)/a())),G=o(C),F=m?Math.min(.25,(w-m)/1e3):1/60;m=w,h=br?G:h+(G-h)*(1-Math.exp(-12*F)),Math.abs(G-h)<.001&&(h=G),t.forEach((H,k)=>{let Y=k-h,X=Math.abs(Y);H.style.setProperty("--d",Y.toFixed(3)),H.style.setProperty("--ad",Math.min(3,X).toFixed(3)),H.style.zIndex=String(100-Math.round(X*10)),H.style.visibility=X>3.5?"hidden":"visible",H.classList.toggle("active",X<.5);let ee=X<1.5;H.style.pointerEvents=ee?"":"none",i[k].tabIndex=ee?0:-1});let q=Math.round(h);q!==d&&(d=q,gt("bc-count").textContent=`${String(q+1).padStart(2,"0")} / ${String(n).padStart(2,"0")}`,gt("bc-title").textContent=t[q].dataset.title,gt("bc-desc").textContent=t[q].dataset.desc,c.forEach((H,k)=>{H.classList.toggle("active",k===q),H.toggleAttribute("aria-current",k===q)})),p&&h!==G?u=requestAnimationFrame(y):m=0}let v=()=>{u||(u=requestAnimationFrame(y))},f=gt("bc-lightbox"),_=gt("bc-lb-media"),x=null;function M(w){let C=t[w];_.replaceChildren(C.querySelector(".bc-face").firstElementChild.cloneNode(!0)),_.style.setProperty("--ar",getComputedStyle(C).getPropertyValue("--ar")),gt("bc-lb-title").textContent=C.dataset.title,gt("bc-lb-desc").textContent=C.dataset.desc,x=C.querySelector(".bc-face"),f.hidden=!1,gt("bc-lb-close").focus()}function T(){f.hidden||(f.hidden=!0,x?.focus())}t.forEach((w,C)=>w.querySelector(".bc-face").addEventListener("click",()=>C===d?M(C):l(C))),gt("bc-lb-close").addEventListener("click",T),f.addEventListener("click",w=>{w.target===f&&T()}),document.addEventListener("keydown",w=>{f.hidden||(w.key==="Escape"&&T(),w.key==="Tab"&&(w.preventDefault(),f.querySelector(w.shiftKey?"#bc-lb-close":".bc-lb-text .pill").focus()))}),new IntersectionObserver(w=>{p=w[w.length-1].isIntersecting,p&&v()}).observe(e),window.addEventListener("scroll",()=>{p&&v()},{passive:!0}),window.addEventListener("resize",v),y(),window.__pcCards=()=>({index:d,position:+h.toFixed(3),count:n})})();async function kp(){let r=new Image;r.src="/assets/experience/logo-mark.3db18278b5.webp";try{await r.decode()}catch{return null}let e=document.createElement("canvas");return e.width=r.naturalWidth,e.height=r.naturalHeight,e.getContext("2d").drawImage(r,0,0),e}async function Gp(){let r=["300 40px Inter","400 40px Inter","500 40px Inter","600 40px Inter",'italic 400 40px "Instrument Serif"',"300 40px Fraunces"];await Promise.all(r.map(e=>document.fonts.load(e).catch(()=>{})))}Tc.style.width="25%";var[Vp]=await Promise.all([kp(),Gp()]);Tc.style.width="60%";var Wp=matchMedia("(max-width: 640px)").matches||(navigator.hardwareConcurrency||8)<=4,Dt=null;try{Dt=ru(ou,{logo:Vp,lowPower:Wp,capture:wc})}catch(r){console.warn("3D world unavailable, showing the static page instead:",r.message)}function au(){Xa.classList.add("no-webgl"),lu.hidden=!0,Sc()}var bc=[];function Ec(){bc.forEach(r=>{r.classList.remove("open"),r.querySelector("button").setAttribute("aria-expanded","false")})}document.addEventListener("keydown",r=>{r.key==="Escape"&&(Ri.hidden||ja(!1,{focusButton:!0}),Ec())});if(!Dt)au();else{let n=function(H){let k=Mr.offsetTop+H/Dt.stops*t();window.scrollTo({top:k,behavior:br?"auto":"smooth"})},o=function(){let H=window.innerWidth,k=window.innerHeight;if(s&&H===s&&Math.abs(k-a)<160&&matchMedia("(pointer: coarse)").matches)return;s=H,a=k;let Y=s<=640||s<=1024&&a>s,X=a<=520&&s>a;Dt.resize(s,a,Y?{shiftY:a*.16}:{shiftX:X?Math.min(150,s*.18):Math.min(210,s*.14)})},M=function(H){if(y&&(m=m*.92+Math.min(100,H-y)*.08),y=H,!(H-x<3e3||H-v<1e3)){if(v=H,f=m>26?f+1:0,_=m<14?_+1:0,f>=3&&p>u())p=Math.max(u(),p*.88),f=0;else if(_>=2&&p<h())p=Math.min(h(),p*1.12),_=0;else return;Dt.setPixelRatio(p)}},q=function(H,k){let Y=G(),X=Y*Dt.stops,ee=C===null?0:Math.min(.1,Math.max(0,H-C));C=H,T=k?T+(X-T)*(1-Math.exp(-k*ee)):X,Math.abs(X-T)<.001&&(T=X),Dt.update(H),Dt.setProgress(T),Dt.render();let te=Math.min(1,Math.max(0,(Y-.94)/.06));su.style.opacity=te,Sr.style.opacity=1-Math.min(1,Math.max(0,(T-(Dt.stops-.75))/.45)),Sr.style.visibility=Sr.style.opacity==="0"?"hidden":"visible",lu.style.opacity=T>.25?0:1;let ne=Math.min(Wa.length-1,Math.round(T));if(ne!==w){let Ne=w===-1;w=ne,gt("chapter-num").textContent="0"+(ne+1),gt("chapter-title").textContent=Wa[ne].title,gt("chapter-text").textContent=Wa[ne].text;let le=gt("chapter");Ne||(le.classList.remove("swap"),le.offsetWidth,le.classList.add("swap")),e.forEach((he,Ae)=>{he.classList.toggle("active",Ae===ne),he.toggleAttribute("aria-current",Ae===ne)}),r.scrollWidth>r.clientWidth&&r.scrollTo({left:e[ne].offsetLeft-16,behavior:br?"auto":"smooth"})}let fe=Sr.getBoundingClientRect(),be=18;Dt.hotspots.forEach((Ne,le)=>{let he=bc[le],Ae=Math.abs(T-Ne.scene)<.3&&T<=Dt.stops-.6,Re=!1,R=null;if(Ae){R=Dt.project(Ne.pos);let P=R.x>fe.left-be&&R.x<fe.right+be&&R.y>fe.top-be&&R.y<fe.bottom+be;Re=!R.behind&&!P&&R.x>16&&R.x<s-16&&R.y>76&&R.y<a-64}if(!Re){he.style.opacity=0,he.style.pointerEvents="none",he.style.visibility="hidden",he.classList.contains("open")&&Ec();return}he.style.visibility="visible",he.style.opacity=1-Math.abs(T-Ne.scene)/.3,he.style.pointerEvents="auto",he.style.transform=`translate3d(${R.x.toFixed(1)}px, ${R.y.toFixed(1)}px, 0)`;let S=he.lastElementChild,B=S.offsetWidth||210,$=Math.min(R.x+20,s-10-B);S.style.left=`${Math.round(Math.max(10,$)-R.x)}px`,he.classList.toggle("flip-y",R.y<150)})};ou.addEventListener("webglcontextlost",H=>{H.preventDefault(),au()});let r=gt("chapters"),e=Wa.map((H,k)=>{let Y=document.createElement("button");return Y.type="button",Y.innerHTML=`0${k+1}<span>${H.nav}</span>`,Y.setAttribute("aria-label",`Go to chapter ${k+1}: ${H.nav}`),Y.addEventListener("click",()=>n(k)),r.appendChild(Y),Y}),t=()=>Mr.offsetHeight-a,i=gt("hotspots");Dt.hotspots.forEach((H,k)=>{let Y=document.createElement("div");Y.className="hs",Y.innerHTML=`<button type="button" aria-expanded="false" aria-controls="hs-tip-${k}" aria-label="${H.title}">+</button><div class="tip" id="hs-tip-${k}" role="tooltip"><b>${H.title}</b>${H.text}</div>`;let X=Y.querySelector("button");X.addEventListener("click",()=>{let ee=Y.classList.contains("open");Ec(),ee||(Y.classList.add("open"),X.setAttribute("aria-expanded","true"))}),i.appendChild(Y),bc.push(Y)});let s=0,a=0;o(),window.addEventListener("resize",o);let l=3840*2160,c=()=>window.devicePixelRatio||1,h=()=>Math.max(1,Math.min(c(),3,Math.sqrt(l/(s*a)))),d=matchMedia("(pointer: coarse)").matches,u=()=>Math.min(h(),Math.max(1,c()*(d?.5:.7))),p=h(),m=16,y=0,v=0,f=0,_=0,x=performance.now();Dt.setPixelRatio(p),window.addEventListener("resize",()=>{p=Math.min(Math.max(p,u()),h()),Dt.setPixelRatio(p)});let T=0,w=-1,C=null,G=()=>Math.min(1,Math.max(0,(window.scrollY-Mr.offsetTop)/t())),F=()=>G()*Dt.stops;if(window.__pcStats=()=>({...Dt.stats(),progress:+T.toFixed(3),target:+F().toFixed(3)}),wc)window.__pc={span:()=>({top:Mr.offsetTop,span:t(),welcome:gt("welcome").offsetTop,viewport:a}),frame(H,k){window.scrollTo(0,H),q(k,0)}},q(0,0),Sc(),window.__pcReady=!0;else{let H=performance.now(),k=!0;new IntersectionObserver(X=>{k=X[X.length-1].isIntersecting,!k&&window.scrollY>Mr.offsetTop&&(su.style.opacity=1,Sr.style.opacity=0,Sr.style.visibility="hidden")}).observe(Mr);let Y=X=>{requestAnimationFrame(Y);try{k?(q(br?0:Math.max(0,X-H)/1e3,br?0:7),M(X)):y=0}catch(ee){console.error(ee)}};requestAnimationFrame(Y),Sc()}}
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
