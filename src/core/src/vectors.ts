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
}
