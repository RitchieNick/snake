//? hooks
import { 
	useState,
	useCallback,
	useEffect
} from "react";


function App() {

	//? directions
	const snakeDirections = ["UP", "DOWN", "LEFT", "RIGHT"];

    //? determines snake length
	//? defaults to 3
    const [snakeLength, setSnakeLength] = useState(3);

	//? determines snake speed
	//? defaults to 250ms
	const [snakeSpeed, setSnakeSpeed] = useState(100);

	//? determines snake direction
	//? defaults to a random direction
	const [snakeDirection, setSnakeDirection] = useState(snakeDirections[Math.floor(Math.random() * 4)]);

	//? board
	const [board, setBoard] = useState(Array(50).fill(Array(50).fill(0)));

	//? apple
	const [apple, setApple] = useState(null);

	//? snake
	const [snake, setSnake] = useState(null);

	//? define how a cell gets its background color
	const getBackgroundColor = useCallback((x, y) => {
		const snakeSet = new Set(snake?.map(segment => `${segment.x},${segment.y}`));
		if (x === apple?.x && y === apple?.y) {
			return "#ff0000"
		}else if(snakeSet.has(`${x},${y}`)){
			return "#000"
		}else{
			return (x - 1 * 50 + y) % 2 === 0 ? '#368352' : '#4fb54a'
		}
	}, [apple, snake])

	//? get random coordinates for apple
	const getRandomCoordinates = useCallback(() => {
		let x = Math.floor(Math.random() * 50);	
		let y = Math.floor(Math.random() * 50);
		while(apple?.x === x && apple?.y === y){
			x = Math.floor(Math.random() * 50);
			y = Math.floor(Math.random() * 50);
		}
		return { x, y }
	}, [apple])

	//? game over
	const gameOver = useCallback(() => {
		alert("Game Over");
		initializeGame();
	}, [snakeDirections, getRandomCoordinates])

	//? initialize the game
	const initializeGame = useCallback(() => {
		setSnakeLength(3);
		setSnakeSpeed(100);
		setSnakeDirection(snakeDirections[Math.floor(Math.random() * 4)]);
		setApple(getRandomCoordinates());
		setSnake(null);
	}, [snakeDirections, getRandomCoordinates])

	//? start the game
	const startGame = useCallback(() => {
		//? set the apple initial coordinates
		const appleX = Math.floor(Math.random() * 50);
		const appleY = Math.floor(Math.random() * 50);
		setApple({ x: appleX, y: appleY });	
		
		//? set the snake initial coordinates
		const headX = Math.floor(Math.random() * 30 + 10);
		const headY = Math.floor(Math.random() * 30 + 10);
		let body = []
		if(snakeDirection == "UP"){
			body = [
				{ x: headX, y: headY },
				{ x: headX, y: headY + 1 },
				{ x: headX, y: headY + 2 },
			]
		}else if (snakeDirection == "DOWN"){
			body = [
				{ x: headX, y: headY },
				{ x: headX, y: headY - 1 },
				{ x: headX, y: headY - 2 },
			]
		}else if (snakeDirection == "LEFT"){
			body = [
				{ x: headX, y: headY },
				{ x: headX + 1, y: headY },
				{ x: headX + 2, y: headY },
			]
		}else if (snakeDirection == "RIGHT"){
			body = [
				{ x: headX, y: headY },
				{ x: headX - 1, y: headY },
				{ x: headX - 2, y: headY },
			]
		}
		setSnake(body);
	}, [snakeDirection])

	//? check if snake collides with itself
	const snakeCollision = useCallback(() => {
		// if the snake has two of the same x and y on different indeces it has collided
		// the first index of the snake is outside the board the snake has collided
		return snake.some((segment, index) => {
			return (
				snake.findIndex((segment2) => segment2.x === segment.x && segment2.y === segment.y) !== index ||
				segment.x < 0 || segment.x >= 50 || segment.y < 0 || segment.y >= 50
			)
		})
	}, [snake])

	//? start the game
	useEffect(() => {
		startGame();
	}, []);

	//? move snake
	useEffect(() => {
		const tickRate = setTimeout(() => {
			let newSnake = snake.length == snakeLength ? [...snake].slice(0, -1) : [...snake];
			
			if(snakeDirection === "UP") newSnake.unshift({ x: snake[0].x, y: snake[0].y - 1 })
			if(snakeDirection === "DOWN") newSnake.unshift({ x: snake[0].x, y: snake[0].y + 1 })
			if(snakeDirection === "LEFT") newSnake.unshift({ x: snake[0].x - 1, y: snake[0].y })
			if(snakeDirection === "RIGHT") newSnake.unshift({ x: snake[0].x + 1, y: snake[0].y })

			if(snakeCollision()){
				gameOver();
				return;
			}

			setSnake(newSnake)
		}, snakeSpeed)
		
		return () => clearTimeout(tickRate);
	}, [snake, snakeDirection, snakeSpeed]);

	//? change snake direction
	useEffect(() => {
		const handleKeyDown = (e) => {
			if(e.key === "ArrowUp" && snakeDirection !== "DOWN"){
				setSnakeDirection("UP");
			}else if(e.key === "ArrowDown" && snakeDirection !== "UP"){
				setSnakeDirection("DOWN");
			}else if(e.key === "ArrowLeft" && snakeDirection !== "RIGHT"){
				setSnakeDirection("LEFT");
			}else if(e.key === "ArrowRight" && snakeDirection !== "LEFT"){
				setSnakeDirection("RIGHT");
			}
		}
		const detectMovement = window.addEventListener("keydown", handleKeyDown);
		return () => removeEventListener("keydown", detectMovement);
	}, [snakeDirection]);

	// //? check if snake eats apple
	useEffect(() => {
		if(snake && apple){
			if(snake?.[0]?.x === apple?.x && snake?.[0]?.y === apple?.y){
				setSnakeLength(snakeLength + 1);
				setApple(getRandomCoordinates());
				setSnakeSpeed(snakeSpeed * .9);
			}
		}
	}, [apple, snake, snakeLength, snakeSpeed, getRandomCoordinates]);

    return (
		<div
			className="boardContainer"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				width: "100vw",
			}}
		>
			<div
				className="board"
				style={{
					width: 750,
					height: 750,
					display: "flex",
					flexDirection: "column",
					gridTemplateColumns: 50,
					gridTemplateRows: 50,
					border: "5px solid #000",
				}}
			>
				{board.map((row, rowIndex) => {
					return(
						<div
							className="row"
							style={{
								display: "flex",
								flexDirection: "row",
								width: "100%",
								height: "100%",
							}}
							key={rowIndex}
						>
							{row.map((cell, cellIndex) => {
								return(
									<div
										key={`${rowIndex}-${cellIndex}`}
										className="cell"
										style={{
											height: '100%',
											width: '100%',
											backgroundColor: getBackgroundColor(cellIndex, rowIndex),
										}}
									/>
								)
							})}
						</div>
					)
				})}
			</div>
			<div>
				<h1>Snake Game</h1>
				<p>Score: {snakeLength - 3}</p>
				<button
					onClick={startGame}
				>
					play game
				</button>
			</div>
		</div>
	)
}

export default App;
