import { register, type EntityConstructor } from './Entity.js';

/** The entity type spawned for each connected client, set by {@link player}. */
export let playerType: EntityConstructor | null = null;

/** Class decorator marking the entity type spawned for each connected client. */
export function player<T extends EntityConstructor>(target: T, context: ClassDecoratorContext): T {
	if (context.kind !== 'class') throw new TypeError('Only an entity class can be the player');

	if (playerType && playerType !== target)
		throw new Error(`Can not make ${target.name} the player because ${playerType.name} already is`);

	register(target);
	playerType = target;
	return target;
}
