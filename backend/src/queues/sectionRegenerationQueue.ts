import { Queue } from "bullmq";
import { getBullMQConnection } from "../cache/bullmqConnection";

let _queue: Queue | null = null;

export function getSectionRegenerationQueue(): Queue {
	if (!_queue) {
		_queue = new Queue("section-regeneration", {
			connection: getBullMQConnection(),
		});
	}
	return _queue;
}
