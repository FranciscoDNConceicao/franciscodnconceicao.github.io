/** Bit's palette and the inverse kinematics shared by the arm in the hero and the plotter. */

export type Point = { x: number; y: number }

export const BIT = {
  lens: '#7cf4ff',
  bodyLight: '#7ec4ff',
  body: '#2f7ff0',
  steel: '#1a2a44',
}

export interface ArmPose {
  /** Absolute angle of the upper arm, in radians (SVG coordinates, y down). */
  shoulder: number
  elbow: Point
  /** Absolute angle of the forearm, in radians. */
  forearm: number
  wrist: Point
}

/**
 * Two-link inverse kinematics: the joint angles that put the wrist on `target`, or as close as the
 * arm can reach. `up` picks whichever elbow sits higher; `left-handed` always bends the same way,
 * like a SCARA robot, so the arm never flips while it draws.
 */
export function solveArm(
  base: Point,
  upper: number,
  fore: number,
  target: Point,
  elbow: 'up' | 'left-handed',
): ArmPose {
  const dx = target.x - base.x
  const dy = target.y - base.y
  const aim = Math.atan2(dy, dx)
  const dist = Math.min(upper + fore - 3, Math.max(Math.abs(upper - fore) + 12, Math.hypot(dx, dy)))
  const bend = Math.acos(Math.min(1, Math.max(-1, (upper ** 2 + dist ** 2 - fore ** 2) / (2 * upper * dist))))
  const elbowAt = (angle: number) => ({ x: base.x + upper * Math.cos(angle), y: base.y + upper * Math.sin(angle) })

  let shoulder = aim - bend
  // In SVG coordinates "up" is a smaller y.
  if (elbow === 'up' && elbowAt(aim + bend).y < elbowAt(aim - bend).y) shoulder = aim + bend

  const joint = elbowAt(shoulder)
  const reach = { x: base.x + dist * Math.cos(aim), y: base.y + dist * Math.sin(aim) }
  const forearm = Math.atan2(reach.y - joint.y, reach.x - joint.x)
  const wrist = { x: joint.x + fore * Math.cos(forearm), y: joint.y + fore * Math.sin(forearm) }
  return { shoulder, elbow: joint, forearm, wrist }
}
