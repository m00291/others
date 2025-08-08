// worker.js for gradient computation and overlap search
self.onmessage = function(e) {
  const { type } = e.data;
  if (type === 'gradient') {
    const { grayArr, w, h } = e.data;
    const out = new Float32Array(w*h);
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        const xm1 = Math.max(0,x-1), xp1 = Math.min(w-1,x+1);
        const ym1 = Math.max(0,y-1), yp1 = Math.min(h-1,y+1);
        const a00 = grayArr[ym1*w + xm1], a01 = grayArr[ym1*w + x], a02 = grayArr[ym1*w + xp1];
        const a10 = grayArr[y*w + xm1],   a11 = grayArr[y*w + x],   a12 = grayArr[y*w + xp1];
        const a20 = grayArr[yp1*w + xm1], a21 = grayArr[yp1*w + x], a22 = grayArr[yp1*w + xp1];
        const gx = (a02 + 2*a12 + a22) - (a00 + 2*a10 + a20);
        const gy = (a20 + 2*a21 + a22) - (a00 + 2*a01 + a02);
        out[y*w + x] = Math.hypot(gx, gy);
      }
    }
    self.postMessage({ type: 'gradientResult', result: out }, [out.buffer]);
  } else if (type === 'overlap') {
    // Overlap search logic
    const { gradA, gradB, w, h, minS, maxS, maskCols } = e.data;
    let bestS = minS, bestScore = -Infinity, secondBest = -Infinity;
    const cols = [];
    for(let x=0;x<w;x++) if(maskCols[x]) cols.push(x);
    if(cols.length === 0){ for(let x=0;x<w;x++) cols.push(x); }
    const totalSteps = maxS - minS + 1;
    let lastPercent = -1;
    for(let s = minS; s <= maxS; s++){
      let dot = 0, sA = 0, sB = 0;
      const startA = h - s;
      for(let row=0; row<s; row++){
        const baseA = (startA + row) * w;
        const baseB = row * w;
        for(const x of cols){
          const a = gradA[baseA + x], b = gradB[baseB + x];
          dot += a*b; sA += a*a; sB += b*b;
        }
      }
      const denom = Math.sqrt(sA * sB) + 1e-12;
      const ncc = dot / denom;
      if(ncc > bestScore){ secondBest = bestScore; bestScore = ncc; bestS = s; }
      else if(ncc > secondBest){ secondBest = ncc; }
      // Progress update every 5% or last step
      const percent = Math.round(((s - minS + 1) / totalSteps) * 100);
      if (percent % 5 === 0 && percent !== lastPercent || s === maxS) {
        self.postMessage({ type: 'overlapProgress', percent });
        lastPercent = percent;
      }
    }
    self.postMessage({ type: 'overlapResult', result: { bestS, bestScore, secondBest } });
  }
};
