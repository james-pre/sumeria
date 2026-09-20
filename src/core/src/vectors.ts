import type { Tuple } from 'utilium';

export class Vec3 {
	constructor(
		public x = 0,
		public y = x,
		public z = x
	) {}

	get data(): Tuple<number, 3> {
		return [this.x, this.y, this.z];
	}

	set data(value: Tuple<number, 3>) {
		this.x = value[0];
		this.y = value[1];
		this.z = value[2];
	}

	set(x: number, y: number = x, z: number = x): this {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	copyFrom(other: Vec3): this {
		return this.set(other.x, other.y, other.z);
	}

	clone(): Vec3 {
		return new Vec3(this.x, this.y, this.z);
	}

	add(other: Vec3): this {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	sub(other: Vec3): this {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	scale(factor: number): this {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;
		return this;
	}

	get length(): number {
		return Math.hypot(this.x, this.y, this.z);
	}

	/** Scales to unit length, leaving a zero vector alone. */
	normalize(): this {
		const { length } = this;
		return length ? this.scale(1 / length) : this;
	}

	distanceTo(other: Vec3): number {
		return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	/** Distance ignoring height, which is what ground-level gameplay actually cares about. */
	flatDistanceTo(other: Vec3): number {
		return Math.hypot(this.x - other.x, this.z - other.z);
	}
}

/** The shortest signed angle from `from` to `to`, in the range (-π, π]. */
export function angleDelta(from: number, to: number): number {
	const full = Math.PI * 2;
	return ((((to - from) % full) + full * 1.5) % full) - Math.PI;
}
