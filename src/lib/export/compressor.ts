/**
 * Binary search JPEG quality optimization to constrain photo file size under a target KB limit
 * (e.g., 240 KB for US State Dept online portal, 300 KB for India Passport portal).
 */
export async function compressImageToTargetKB(
  canvas: HTMLCanvasElement,
  targetKB: number = 240
): Promise<{ blob: Blob; quality: number; actualKB: number }> {
  const targetBytes = targetKB * 1024;
  let minQuality = 0.3;
  let maxQuality = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.92;

  // Try initial default quality
  const initialBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  if (initialBlob.size <= targetBytes) {
    return {
      blob: initialBlob,
      quality: 0.92,
      actualKB: Math.round(initialBlob.size / 1024),
    };
  }

  // Binary search iterations
  for (let i = 0; i < 7; i++) {
    const midQuality = (minQuality + maxQuality) / 2;
    const currentBlob = await canvasToBlob(canvas, 'image/jpeg', midQuality);

    if (currentBlob.size <= targetBytes) {
      bestBlob = currentBlob;
      bestQuality = midQuality;
      minQuality = midQuality; // try to get better visual quality while under targetBytes
    } else {
      maxQuality = midQuality; // file size too large, drop quality
    }
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, 'image/jpeg', 0.3);
    bestQuality = 0.3;
  }

  return {
    blob: bestBlob,
    quality: Math.round(bestQuality * 100) / 100,
    actualKB: Math.round(bestBlob.size / 1024),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob || new Blob([]));
      },
      type,
      quality
    );
  });
}
