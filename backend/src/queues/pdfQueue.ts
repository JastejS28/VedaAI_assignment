import { Queue } from "bullmq";
import { getBullMQConnection } from "../cache/bullmqConnection";

let _queue: Queue | null = null;

export function getPdfQueue(): Queue {
	if (!_queue) {
		_queue = new Queue("pdf-export", {
			connection: getBullMQConnection(),
		});
	}
	return _queue;
}
