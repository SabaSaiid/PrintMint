export function checkTilt(angleDeg: number): { isTilted: boolean; severity: 'good' | 'warning' | 'fail' } {
  const absAngle = Math.abs(angleDeg);

  if (absAngle <= 3) {
    return { isTilted: false, severity: 'good' };
  } else if (absAngle <= 7) {
    return { isTilted: true, severity: 'warning' };
  } else {
    return { isTilted: true, severity: 'fail' };
  }
}
