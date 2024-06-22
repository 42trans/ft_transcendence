
class BaseGameState 
{
	constructor(PongApp) 
	{
		this.PongApp = PongApp;
	}
	
	enter() 
	{
		throw new Error("hth: Enter method must be implemented");
	}

	update() 
	{
		throw new Error("hth: Update method must be implemented");
	}

	render() 
	{
		throw new Error("hth: Render method must be implemented");
	}

	exit() 
	{
		throw new Error("hth: Exit method must be implemented");
	}
}

export default BaseGameState;
