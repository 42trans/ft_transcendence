import Pong from '../Pong'


class BaseGameState {
	constructor(Pong) {
		this.Pong = Pong;
	}
	enter() {
		throw new Error("Enter method must be implemented");
	}

	update() {
		throw new Error("Update method must be implemented");
	}

	render() {
		throw new Error("Render method must be implemented");
	}

	exit() {
		throw new Error("Exit method must be implemented");
	}
}

export default BaseGameState;
