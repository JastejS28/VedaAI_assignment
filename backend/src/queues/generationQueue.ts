import { Queue } from "bullmq";
import { getBullMQConnection } from "../cache/bullmqConnection";

let _queue: Queue | null = null;

export function getGenerationQueue(): Queue {
	if (!_queue) {
		_queue = new Queue("assessment-generation", {
			connection: getBullMQConnection(),
		});
	}
	return _queue;
}
